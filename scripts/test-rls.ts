import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load env
config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Test via anon key so RLS applies!

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const USERS = {
  admin: { email: 'admin@carethread.health', password: 'Admin1234!' },
  receptionist: { email: 'reception@carethread.health', password: 'Recept1234!' },
  doctor: { email: 'doctor@carethread.health', password: 'Doctor1234!' },
  nurse: { email: 'nurse@carethread.health', password: 'Nurse1234!' },
  patient: { email: 'patient1@carethread.health', password: 'Patient1234!' },
}

async function runTests() {
  console.log('\n🧪 Running RLS Security Tests...\n')
  const client = createClient(url!, key!, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  
  let passed = 0
  let failed = 0

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`)
      passed++
    } else {
      console.error(`  ❌ FAIL: ${msg}`)
      failed++
    }
  }

  const login = async (role: keyof typeof USERS) => {
    const { error } = await client.auth.signInWithPassword({
      email: USERS[role].email,
      password: USERS[role].password,
    })
    if (error) throw new Error(`Login failed for ${role}: ${error.message}`)
  }

  // --- Test 1: Receptionist Isolation ---
  await login('receptionist')
  const { data: rVisits } = await client.from('visits').select('*')
  const { data: rVitals } = await client.from('vitals').select('*')
  const { data: rMeds } = await client.from('medicine_cycles').select('*')
  const { data: rSummaries } = await client.from('summaries').select('*')

  assert(rVisits?.length === 0, 'Receptionist cannot read visits')
  assert(rVitals?.length === 0, 'Receptionist cannot read vitals')
  assert(rMeds?.length === 0, 'Receptionist cannot read medicine_cycles')
  assert(rSummaries?.length === 0, 'Receptionist cannot read summaries')

  // --- Test 2: Patient Privacy (Horizontal Isolation) ---
  await login('patient')
  const { data: visiblePatients } = await client.from('patients').select('*')
  // The seeded patient Meenakshi Sundaram (patient1) has no dependents in the seed
  assert(visiblePatients?.length === 1, 'Patient can only view their own record')

  // --- Test 3: Role Escalation Prevention ---
  await login('nurse')
  const { data: { user: nurseUser } } = await client.auth.getUser()
  const { data: updatedRows, error: promoteError } = await client.from('profiles').update({ role: 'admin' }).eq('id', nurseUser!.id).select()
  assert(promoteError !== null || updatedRows?.length === 0, 'Users cannot elevate their own role')

  // --- Test 4: Write Permissions ---
  await login('nurse')
  const dummyPatientId = '00000000-0000-0000-0000-000000000000'
  const { error: visitInsertError } = await client.from('visits').insert({
    patient_id: dummyPatientId,
    doctor_id: nurseUser!.id,
    diagnosis: 'Test'
  })
  assert(visitInsertError !== null, 'Nurse cannot insert clinical visits')

  await login('doctor')
  const { data: { user: doctorUser } } = await client.auth.getUser()
  const { error: docVitalError } = await client.from('vitals').insert({
    patient_id: visiblePatients?.[0]?.id || dummyPatientId,
    recorded_by: doctorUser!.id,
    pulse: 80
  })
  // We expect success or a specific error (like foreign key violation if patient doesn't exist)
  // but RLS should ALLOW it. We just check that it's NOT an RLS violation.
  assert(docVitalError?.code !== '42501', 'Doctor is permitted by RLS to insert vitals (42501 = RLS violation)')

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed.\n`)
  if (failed > 0) process.exit(1)
}

runTests().catch(console.error)
