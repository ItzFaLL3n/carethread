/**
 * CareThread Seed Script
 * Creates one seeded user per role and ~10 fake patients with families.
 *
 * Run ONCE against your Supabase project:
 *   npm run seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Load env manually (tsx doesn't load Next.js env by default)
import { config } from 'dotenv'
config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient<Database>(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Staff seed users ──────────────────────────────────────────────────────
const STAFF = [
  { email: 'admin@carethread.health',       password: 'Admin1234!',       full_name: 'Alice Admin',        role: 'admin'        },
  { email: 'reception@carethread.health',   password: 'Recept1234!',      full_name: 'Bob Receptionist',   role: 'receptionist' },
  { email: 'doctor@carethread.health',      password: 'Doctor1234!',      full_name: 'Dr. Carol Chen',     role: 'doctor'       },
  { email: 'nurse@carethread.health',       password: 'Nurse1234!',       full_name: 'David Nurse',        role: 'nurse'        },
  { email: 'patient1@carethread.health',    password: 'Patient1234!',     full_name: 'Emma Patient',       role: 'patient'      },
] as const

// ─── Fake patients ─────────────────────────────────────────────────────────
const PATIENTS = [
  { name: 'Emma Wilson',    dob: '1988-03-15', gender: 'female', phone: '+1 555 0101', allergies: 'Penicillin' },
  { name: 'James Carter',   dob: '1975-07-22', gender: 'male',   phone: '+1 555 0102', allergies: null },
  { name: 'Sophie Brown',   dob: '2010-11-08', gender: 'female', phone: null,          allergies: 'Latex' },
  { name: 'Liam Johnson',   dob: '1960-01-30', gender: 'male',   phone: '+1 555 0104', allergies: 'Aspirin, Ibuprofen' },
  { name: 'Olivia Davis',   dob: '1995-06-17', gender: 'female', phone: '+1 555 0105', allergies: null },
  { name: 'Noah Martinez',  dob: '2015-09-03', gender: 'male',   phone: null,          allergies: null },
  { name: 'Ava Thompson',   dob: '1980-12-25', gender: 'female', phone: '+1 555 0107', allergies: 'Codeine' },
  { name: 'William White',  dob: '1950-04-12', gender: 'male',   phone: '+1 555 0108', allergies: null },
  { name: 'Isabella Harris',dob: '2002-08-19', gender: 'female', phone: '+1 555 0109', allergies: null },
  { name: 'Mason Clark',    dob: '1990-02-28', gender: 'male',   phone: '+1 555 0110', allergies: 'Sulfa drugs' },
]

async function createOrFindUser(email: string, password: string): Promise<string> {
  // Try to find existing user first
  const { data: list } = await admin.auth.admin.listUsers()
  const existing = list?.users?.find((u) => u.email === email)
  if (existing) {
    console.log(`  ↩  ${email} already exists`)
    return existing.id
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw new Error(`Failed to create ${email}: ${error.message}`)
  return data.user.id
}

async function seed() {
  console.log('\n🌱  Seeding CareThread...\n')

  // 1. Create staff users and profiles
  const userIds: Record<string, string> = {}
  for (const s of STAFF) {
    const id = await createOrFindUser(s.email, s.password)
    userIds[s.role] = id

    const { error } = await admin.from('profiles').upsert({
      id,
      full_name: s.full_name,
      role: s.role,
    })
    if (error) console.warn(`  ⚠  Profile upsert for ${s.email}: ${error.message}`)
    else console.log(`  ✓  ${s.role}: ${s.email}`)
  }

  // 2. Create patients
  const patientIds: string[] = []
  for (const p of PATIENTS) {
    const { data, error } = await admin.from('patients').insert({
      ...p,
      address: '123 Maple Street, Springfield',
      created_by: userIds.receptionist,
    }).select('id').single()

    if (error) {
      console.warn(`  ⚠  Patient ${p.name}: ${error.message}`)
    } else {
      patientIds.push(data.id)
      console.log(`  ✓  Patient: ${p.name}`)
    }
  }

  // 3. Link patient portal account to first patient (Emma Wilson)
  if (patientIds[0] && userIds.patient) {
    await admin.from('patients').update({ user_id: userIds.patient }).eq('id', patientIds[0])
    // Ensure profile exists for patient user
    await admin.from('profiles').upsert({
      id: userIds.patient,
      full_name: 'Emma Wilson',
      role: 'patient',
    })
    console.log(`  ✓  Linked patient portal → Emma Wilson`)
  }

  // 4. Create a family: Wilson-Carter (Liam is guardian of Sophie)
  if (patientIds.length >= 3) {
    const { data: family } = await admin.from('families').insert({
      name: 'Carter Family',
      address: '456 Oak Avenue, Springfield',
      phone: '+1 555 0200',
    }).select('id').single()

    if (family) {
      // Add members (James Carter and Sophie Brown)
      await admin.from('family_members').insert([
        { family_id: family.id, patient_id: patientIds[1], is_emergency_contact: true },
        { family_id: family.id, patient_id: patientIds[2], is_emergency_contact: false },
      ])

      // James is guardian of Sophie (trigger creates inverse ward relationship)
      await admin.from('patient_relationships').insert({
        patient_id: patientIds[2],      // Sophie
        related_patient_id: patientIds[1], // James
        relationship: 'guardian',
      })
      console.log(`  ✓  Family: Carter (James + Sophie with guardian relationship)`)
    }
  }

  // 5. Create a second family
  if (patientIds.length >= 6) {
    const { data: family2 } = await admin.from('families').insert({
      name: 'Johnson Family',
      address: '789 Pine Road, Springfield',
      phone: '+1 555 0300',
    }).select('id').single()

    if (family2) {
      await admin.from('family_members').insert([
        { family_id: family2.id, patient_id: patientIds[3], is_emergency_contact: true },
        { family_id: family2.id, patient_id: patientIds[4], is_emergency_contact: false },
        { family_id: family2.id, patient_id: patientIds[5], is_emergency_contact: false },
      ])
      await admin.from('patient_relationships').insert([
        { patient_id: patientIds[4], related_patient_id: patientIds[3], relationship: 'child' },
        { patient_id: patientIds[5], related_patient_id: patientIds[3], relationship: 'child' },
      ])
      console.log(`  ✓  Family: Johnson (Liam + Olivia + Noah)`)
    }
  }

  // 6. Seed a few visits for the doctor
  const doctorId = userIds.doctor
  if (doctorId && patientIds.length > 0) {
    const visitRows = [
      {
        patient_id: patientIds[0],
        doctor_id: doctorId,
        symptoms: 'Persistent cough, mild fever',
        diagnosis: 'Upper respiratory tract infection',
        notes: 'Prescribed rest and fluids. Follow up in 7 days if no improvement.',
      },
      {
        patient_id: patientIds[1],
        doctor_id: doctorId,
        symptoms: 'Chest tightness, shortness of breath on exertion',
        diagnosis: 'Stable angina – refer for cardiology review',
        notes: 'ECG ordered. Advised to avoid strenuous activity.',
      },
    ]
    for (const v of visitRows) {
      await admin.from('visits').insert(v)
    }
    console.log(`  ✓  Seeded visits`)

    // 7. Seed vitals
    const nurseId = userIds.nurse
    if (nurseId) {
      await admin.from('vitals').insert([
        {
          patient_id: patientIds[0],
          recorded_by: nurseId,
          bp_systolic: 120,
          bp_diastolic: 78,
          pulse: 72,
          temp_c: 36.8,
          weight_kg: 64.5,
          recorded_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        },
        {
          patient_id: patientIds[0],
          recorded_by: nurseId,
          bp_systolic: 118,
          bp_diastolic: 76,
          pulse: 70,
          temp_c: 36.7,
          weight_kg: 64.2,
          recorded_at: new Date().toISOString(),
        },
        {
          patient_id: patientIds[1],
          recorded_by: nurseId,
          bp_systolic: 138,
          bp_diastolic: 88,
          pulse: 82,
          temp_c: 37.1,
          weight_kg: 84.0,
          recorded_at: new Date().toISOString(),
        },
      ])
      console.log(`  ✓  Seeded sample vitals`)
    }

    // 8. Seed medicine cycles
    await admin.from('medicine_cycles').insert([
      {
        patient_id: patientIds[0],
        prescribed_by: doctorId,
        drug: 'Amoxicillin',
        dose: '500mg',
        frequency: '3x daily with food',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: 'active',
      },
      {
        patient_id: patientIds[1],
        prescribed_by: doctorId,
        drug: 'Lisinopril',
        dose: '10mg',
        frequency: '1x daily morning',
        start_date: '2026-01-15',
        status: 'active',
      },
      {
        patient_id: patientIds[1],
        prescribed_by: doctorId,
        drug: 'Atorvastatin',
        dose: '20mg',
        frequency: '1x daily bedtime',
        start_date: '2026-01-15',
        status: 'active',
      },
    ])
    console.log(`  ✓  Seeded medicine cycles`)

    // 9. Seed family medical history
    await admin.from('family_history').insert([
      {
        patient_id: patientIds[0],
        condition: 'Bronchial Asthma',
        relative: 'Mother',
        notes: 'Mild adult-onset asthma',
        recorded_by: doctorId,
      },
      {
        patient_id: patientIds[1],
        condition: 'Coronary Artery Disease',
        relative: 'Father',
        notes: 'Myocardial infarction at age 58',
        recorded_by: doctorId,
      },
    ])
    console.log(`  ✓  Seeded family medical history`)
  }

  console.log('\n✅  Seed complete!\n')
  console.log('Seeded logins:')
  for (const s of STAFF) {
    console.log(`  ${s.role.padEnd(14)} ${s.email}  /  ${s.password}`)
  }
  console.log()
}

seed().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})
