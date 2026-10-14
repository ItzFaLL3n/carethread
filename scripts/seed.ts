/**
 * CareThread Seed Script
 * Resets existing database records and seeds authentic Tamil Indian staff, patients, families,
 * clinical encounters, appointments, vitals, medicine cycles, and orders.
 *
 * Run:
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

// ─── Staff seed users (Tamil Indian Profiles) ──────────────────────────────
const STAFF = [
  {
    email: 'admin@carethread.health',
    password: 'Admin1234!',
    full_name: 'Anitha Selvaraj',
    role: 'admin' as const,
    phone: '+91 98401 00001',
    address: 'Hospital Executive Directorate, CareThread Medical Center, Anna Nagar, Chennai - 600040',
    aadhaar_number: '2345 6789 0123',
    gov_reg_number: 'ADM-TN-2015-001',
    department: 'Hospital Administration & Governance',
  },
  {
    email: 'reception@carethread.health',
    password: 'Recept1234!',
    full_name: 'Balaji Raman',
    role: 'receptionist' as const,
    phone: '+91 98401 00004',
    address: 'Patient Intake & Registration Desk, CareThread, Chennai - 600040',
    aadhaar_number: '5678 9012 3456',
    gov_reg_number: 'CT-REC-2022-091',
    department: 'Patient Intake & Front Office',
  },
  {
    email: 'doctor@carethread.health',
    password: 'Doctor1234!',
    full_name: 'Dr. Senthil Nathan',
    role: 'doctor' as const,
    phone: '+91 98401 00002',
    address: 'Suite 402, Doctors Enclave, Anna Nagar West, Chennai - 600040',
    aadhaar_number: '3456 7890 1234',
    gov_reg_number: 'TMC-2018-847291',
    department: 'Cardiology & Internal Medicine',
  },
  {
    email: 'nurse@carethread.health',
    password: 'Nurse1234!',
    full_name: 'Kavitha Murugan',
    role: 'nurse' as const,
    phone: '+91 98401 00003',
    address: 'Block C, Nursing Quarters, CareThread Medical Center, Chennai - 600040',
    aadhaar_number: '4567 8901 2345',
    gov_reg_number: 'TNC-2020-44912',
    department: 'Intensive Care Unit (ICU) & Triage',
  },
  {
    email: 'pharmacist@carethread.health',
    password: 'Pharma1234!',
    full_name: 'Priya Natarajan',
    role: 'pharmacist' as const,
    phone: '+91 98401 00005',
    address: 'Ground Floor, CareThread Central Dispensary, Chennai - 600040',
    aadhaar_number: '6789 0123 4567',
    gov_reg_number: 'TNPC-2019-10822',
    department: 'Clinical Pharmacy & Dispensing',
  },
  {
    email: 'lab@carethread.health',
    password: 'Lab1234!',
    full_name: 'Vignesh Loganathan',
    role: 'lab_technician' as const,
    phone: '+91 98401 00006',
    address: 'Diagnostic Wing, Level 2, CareThread, Chennai - 600040',
    aadhaar_number: '7890 1234 5678',
    gov_reg_number: 'NABL-2021-9923',
    department: 'Pathology & Diagnostic Laboratory',
  },
  {
    email: 'patient1@carethread.health',
    password: 'Patient1234!',
    full_name: 'Meenakshi Sundaram',
    role: 'patient' as const,
    phone: '+91 98401 22341',
    address: 'Plot 14, 4th Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040',
    aadhaar_number: '5432 8901 2345',
    gov_reg_number: undefined,
    department: undefined,
  },
] as const

// ─── Fake patients (Authentic Tamil Indian Names & Profiles) ───────────────
const PATIENTS = [
  {
    name: 'Meenakshi Sundaram',
    dob: '1988-03-15',
    gender: 'female',
    phone: '+91 98401 22341',
    address: 'Plot 14, 4th Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040',
    aadhaar_number: '5432 8901 2345',
    allergies: 'Penicillin, Shellfish',
  },
  {
    name: 'Sundaram Ramasamy',
    dob: '1984-07-22',
    gender: 'male',
    phone: '+91 98401 22342',
    address: 'Plot 14, 4th Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040',
    aadhaar_number: '6543 9012 3456',
    allergies: null,
  },
  {
    name: 'Kayalvizhi Sundaram',
    dob: '2016-11-08',
    gender: 'female',
    phone: '+91 98401 22341',
    address: 'Plot 14, 4th Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040',
    aadhaar_number: '7654 0123 4567',
    allergies: 'Latex',
  },
  {
    name: 'Kalyani Ramasamy',
    dob: '1958-04-12',
    gender: 'female',
    phone: '+91 94441 55670',
    address: 'Plot 14, 4th Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040',
    aadhaar_number: '8765 1234 5678',
    allergies: 'Codeine',
  },
  {
    name: 'Muthukumar Palanisamy',
    dob: '1962-01-30',
    gender: 'male',
    phone: '+91 94432 88123',
    address: '28 Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu - 641012',
    aadhaar_number: '9876 2345 6789',
    allergies: 'Aspirin, Ibuprofen',
  },
  {
    name: 'Revathi Muthukumar',
    dob: '1966-06-17',
    gender: 'female',
    phone: '+91 94432 88124',
    address: '28 Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu - 641012',
    aadhaar_number: '3210 9876 5432',
    allergies: null,
  },
  {
    name: 'Karthik Muthukumar',
    dob: '1994-09-03',
    gender: 'male',
    phone: '+91 98422 66781',
    address: '28 Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu - 641012',
    aadhaar_number: '4321 0987 6543',
    allergies: null,
  },
  {
    name: 'Dharani Saravanan',
    dob: '1996-12-25',
    gender: 'female',
    phone: '+91 97909 33210',
    address: '12 North Veli Street, Madurai, Tamil Nadu - 625001',
    aadhaar_number: '5432 1098 7654',
    allergies: 'Sulfa drugs',
  },
  {
    name: 'Subramanian Natarajan',
    dob: '1952-05-18',
    gender: 'male',
    phone: '+91 94421 77890',
    address: '55 Thillai Nagar 11th Cross, Tiruchirappalli, Tamil Nadu - 620018',
    aadhaar_number: '6543 2109 8765',
    allergies: null,
  },
  {
    name: 'Iniyan Ilango',
    dob: '2018-08-14',
    gender: 'male',
    phone: '+91 98405 11982',
    address: '7 Kamarajar Salai, RS Puram, Coimbatore, Tamil Nadu - 641002',
    aadhaar_number: '7654 3210 9876',
    allergies: 'Peanuts',
  },
]

async function createOrFindUser(
  email: string,
  password: string,
  fullName: string,
  role: string
): Promise<string> {
  const { data: list } = await admin.auth.admin.listUsers()
  const existing = list?.users?.find((u) => u.email === email)
  if (existing) {
    console.log(`  ↩  ${email} exists (${fullName})`)
    await admin.auth.admin.updateUserById(existing.id, {
      user_metadata: { full_name: fullName, role },
    })
    return existing.id
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  })
  if (error) throw new Error(`Failed to create ${email}: ${error.message}`)
  return data.user.id
}

async function seed() {
  console.log('\n🌱  Seeding CareThread with Tamil Indian Clinical Data...\n')

  // 1. Clear previous records from child to parent
  console.log('  🧹  Clearing existing test records from database...')
  await admin.from('medicine_orders').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await admin.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await admin.from('summaries').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await admin.from('vitals').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await admin.from('medicine_cycles').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await admin.from('visits').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await admin.from('family_history').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await admin.from('patient_relationships').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await admin.from('family_members').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await admin.from('families').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await admin.from('patients').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // 2. Create staff users and profiles
  console.log('\n  👤  Setting up staff accounts:')
  const userIds: Record<string, string> = {}
  for (const s of STAFF) {
    const id = await createOrFindUser(s.email, s.password, s.full_name, s.role)
    userIds[s.role] = id

    const { error } = await admin.from('profiles').upsert({
      id,
      full_name: s.full_name,
      role: s.role,
      phone: s.phone,
      address: s.address,
      aadhaar_number: s.aadhaar_number,
      gov_reg_number: s.gov_reg_number,
      department: s.department,
      approval_status: 'approved',
    })
    if (error) console.warn(`  ⚠  Profile upsert for ${s.email}: ${error.message}`)
    else console.log(`  ✓  ${s.role.padEnd(14)}: ${s.full_name} (${s.email})`)
  }

  // 3. Create patients
  console.log('\n  🏥  Creating Tamil Indian Patient Records:')
  const patientIds: string[] = []
  for (const p of PATIENTS) {
    const { data, error } = await admin
      .from('patients')
      .insert({
        ...p,
        approval_status: 'approved',
        created_by: userIds.receptionist,
      })
      .select('id')
      .single()

    if (error) {
      console.warn(`  ⚠  Patient ${p.name}: ${error.message}`)
    } else {
      patientIds.push(data.id)
      console.log(`  ✓  Patient: ${p.name.padEnd(24)} | Aadhaar: ${p.aadhaar_number}`)
    }
  }

  // 4. Link patient portal account to first patient (Meenakshi Sundaram)
  if (patientIds[0] && userIds.patient) {
    await admin.from('patients').update({ user_id: userIds.patient }).eq('id', patientIds[0])
    await admin.from('profiles').upsert({
      id: userIds.patient,
      full_name: 'Meenakshi Sundaram',
      role: 'patient',
      phone: '+91 98401 22341',
      address: 'Plot 14, 4th Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040',
      aadhaar_number: '5432 8901 2345',
      approval_status: 'approved',
    })
    console.log(`\n  ✓  Linked Patient Portal account → Meenakshi Sundaram (patient1@carethread.health)`)
  }

  // 5. Create Family 1: Sundaram Family (Anna Nagar West, Chennai)
  // Members: Meenakshi (0), Sundaram (1), Kayalvizhi (2), Kalyani (3)
  if (patientIds.length >= 4) {
    const { data: family } = await admin
      .from('families')
      .insert({
        name: 'Sundaram Household',
        address: 'Plot 14, 4th Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040',
        phone: '+91 98401 22341',
      })
      .select('id')
      .single()

    if (family) {
      await admin.from('family_members').insert([
        { family_id: family.id, patient_id: patientIds[1], is_emergency_contact: true },  // Sundaram
        { family_id: family.id, patient_id: patientIds[0], is_emergency_contact: true },  // Meenakshi
        { family_id: family.id, patient_id: patientIds[2], is_emergency_contact: false }, // Kayalvizhi (Daughter)
        { family_id: family.id, patient_id: patientIds[3], is_emergency_contact: false }, // Kalyani (Mother)
      ])

      // Relationships (triggers insert inverse relationships)
      // Sundaram is guardian of Kayalvizhi
      await admin.from('patient_relationships').insert({
        patient_id: patientIds[2],         // Kayalvizhi
        related_patient_id: patientIds[1], // Sundaram
        relationship: 'guardian',
      })
      // Meenakshi & Sundaram are spouses
      await admin.from('patient_relationships').insert({
        patient_id: patientIds[0],         // Meenakshi
        related_patient_id: patientIds[1], // Sundaram
        relationship: 'spouse',
      })
      // Kalyani is parent of Sundaram
      await admin.from('patient_relationships').insert({
        patient_id: patientIds[1],         // Sundaram
        related_patient_id: patientIds[3], // Kalyani
        relationship: 'parent',
      })

      console.log(`  ✓  Family: Sundaram Household (Meenakshi, Sundaram, Kayalvizhi, Kalyani)`)
    }
  }

  // 6. Create Family 2: Palanisamy Household (Gandhipuram, Coimbatore)
  // Members: Muthukumar (4), Revathi (5), Karthik (6)
  if (patientIds.length >= 7) {
    const { data: family2 } = await admin
      .from('families')
      .insert({
        name: 'Palanisamy-Muthukumar Household',
        address: '28 Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu - 641012',
        phone: '+91 94432 88123',
      })
      .select('id')
      .single()

    if (family2) {
      await admin.from('family_members').insert([
        { family_id: family2.id, patient_id: patientIds[4], is_emergency_contact: true },  // Muthukumar
        { family_id: family2.id, patient_id: patientIds[5], is_emergency_contact: false }, // Revathi
        { family_id: family2.id, patient_id: patientIds[6], is_emergency_contact: false }, // Karthik
      ])

      await admin.from('patient_relationships').insert([
        { patient_id: patientIds[4], related_patient_id: patientIds[5], relationship: 'spouse' },
        { patient_id: patientIds[6], related_patient_id: patientIds[4], relationship: 'child' },
      ])

      console.log(`  ✓  Family: Palanisamy Household (Muthukumar, Revathi, Karthik)`)
    }
  }

  // 7. Seed clinical encounters / visits
  const doctorId = userIds.doctor
  if (doctorId && patientIds.length > 0) {
    console.log('\n  🩺  Seeding Clinical Visits:')
    const visitRows = [
      {
        patient_id: patientIds[0],
        doctor_id: doctorId,
        visit_date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        symptoms: 'Persistent dry cough for 5 days, low-grade evening fever, sore throat and fatigue.',
        diagnosis: 'Acute Tracheobronchitis & Viral Upper Respiratory Tract Infection',
        notes: 'Lungs clear on auscultation, no wheeze. Prescribed Amoxicillin + Clavulanate 625mg, warm saline gargling, and rest. Review in 5 days if symptoms persist.',
      },
      {
        patient_id: patientIds[4],
        doctor_id: doctorId,
        visit_date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        symptoms: 'Substernal chest tightness when brisk walking, resolving after resting. Occasional shortness of breath.',
        diagnosis: 'Stable Coronary Artery Disease (CAD) - Class II Angina',
        notes: 'Resting 12-lead ECG showed sinus rhythm with mild T-wave inversion in V4-V6. ECHO scheduled. Advised low salt diet, avoid sudden physical exertion, take Telmisartan and Atorvastatin regularly.',
      },
    ]

    for (const v of visitRows) {
      await admin.from('visits').insert(v)
    }
    console.log(`  ✓  Recorded visits for Meenakshi Sundaram & Muthukumar Palanisamy`)

    // 8. Seed vitals (Nurse Kavitha Murugan)
    const nurseId = userIds.nurse
    if (nurseId) {
      await admin.from('vitals').insert([
        {
          patient_id: patientIds[0],
          recorded_by: nurseId,
          bp_systolic: 118,
          bp_diastolic: 76,
          pulse: 72,
          temp_c: 37.1,
          weight_kg: 62.5,
          recorded_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        },
        {
          patient_id: patientIds[0],
          recorded_by: nurseId,
          bp_systolic: 116,
          bp_diastolic: 74,
          pulse: 68,
          temp_c: 36.6,
          weight_kg: 62.3,
          recorded_at: new Date().toISOString(),
        },
        {
          patient_id: patientIds[4],
          recorded_by: nurseId,
          bp_systolic: 138,
          bp_diastolic: 86,
          pulse: 78,
          temp_c: 36.8,
          weight_kg: 76.0,
          recorded_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        },
      ])
      console.log(`  ✓  Seeded vital sign telemetry logs`)
    }

    // 9. Seed medicine cycles
    await admin.from('medicine_cycles').insert([
      {
        patient_id: patientIds[0],
        prescribed_by: doctorId,
        drug: 'Amoxicillin + Clavulanic Acid',
        dose: '625mg',
        frequency: '3x daily after meals',
        start_date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
        end_date: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: 'active',
      },
      {
        patient_id: patientIds[0],
        prescribed_by: doctorId,
        drug: 'Pantoprazole Sodium',
        dose: '40mg',
        frequency: '1x daily morning before food',
        start_date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
        end_date: new Date(Date.now() + 11 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: 'active',
      },
      {
        patient_id: patientIds[4],
        prescribed_by: doctorId,
        drug: 'Telmisartan',
        dose: '40mg',
        frequency: '1x daily morning after breakfast',
        start_date: '2026-01-10',
        status: 'active',
      },
      {
        patient_id: patientIds[4],
        prescribed_by: doctorId,
        drug: 'Atorvastatin',
        dose: '20mg',
        frequency: '1x daily at bedtime',
        start_date: '2026-01-10',
        status: 'active',
      },
      {
        patient_id: patientIds[4],
        prescribed_by: doctorId,
        drug: 'Metoprolol Tartrate',
        dose: '50mg',
        frequency: '1x daily morning',
        start_date: '2026-01-10',
        status: 'active',
      },
    ])
    console.log(`  ✓  Seeded active medicine cycles`)

    // 10. Seed family medical history
    await admin.from('family_history').insert([
      {
        patient_id: patientIds[0],
        condition: 'Bronchial Asthma',
        relative: 'Mother (Kalyani)',
        notes: 'Adult-onset allergic asthma triggered by dust and cold weather',
        recorded_by: doctorId,
      },
      {
        patient_id: patientIds[4],
        condition: 'Coronary Artery Disease & Diabetes',
        relative: 'Father (Palanisamy)',
        notes: 'Suffered myocardial infarction at age 60; managed with oral hypoglycemics',
        recorded_by: doctorId,
      },
      {
        patient_id: patientIds[1],
        condition: 'Essential Hypertension',
        relative: 'Father (Ramasamy)',
        notes: 'Diagnosed at age 48, maintained on anti-hypertensives',
        recorded_by: doctorId,
      },
    ])
    console.log(`  ✓  Seeded family medical histories`)

    // 11. Seed Appointments
    const today = new Date()
    const tomorrow = new Date(today.getTime() + 24 * 3600 * 1000).toISOString().split('T')[0]
    const nextWeek = new Date(today.getTime() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0]

    await admin.from('appointments').insert([
      {
        patient_id: patientIds[0],
        doctor_id: doctorId,
        department: 'Cardiology',
        appointment_date: tomorrow,
        appointment_time: '10:30 AM',
        symptoms: 'Follow-up for mild chest palpitations and blood pressure check.',
        status: 'confirmed',
        doctor_notes: 'Confirmed. Please bring BP log from the last 3 days.',
      },
      {
        patient_id: patientIds[4],
        doctor_id: doctorId,
        department: 'Cardiology',
        appointment_date: nextWeek,
        appointment_time: '02:30 PM',
        symptoms: 'Scheduled 2D Echocardiogram review and exertion tolerance test.',
        status: 'confirmed',
        doctor_notes: 'Scheduled for echo room 3.',
      },
      {
        patient_id: patientIds[7],
        doctor_id: doctorId,
        department: 'General Medicine',
        appointment_date: tomorrow,
        appointment_time: '11:15 AM',
        symptoms: 'Recurring headaches and allergic skin flare-ups.',
        status: 'pending',
      },
    ])
    console.log(`  ✓  Seeded clinical appointments`)

    // 12. Seed Medicine Orders
    await admin.from('medicine_orders').insert([
      {
        patient_id: patientIds[0],
        items: [
          { drug: 'Atorvastatin', dose: '20mg', quantity: 30, days: 30, price: 240 },
          { drug: 'Metoprolol Tartrate', dose: '50mg', quantity: 60, days: 30, price: 180 },
          { drug: 'Vitamin D3 (Cholecalciferol)', dose: '60,000 IU', quantity: 4, days: 28, price: 120 },
        ],
        total_amount: 540,
        delivery_address: 'Plot 14, 4th Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040',
        phone: '+91 98401 22341',
        status: 'dispensed',
        pharmacist_notes: 'Verified by Pharmacist Priya Natarajan. Dispatched via Express Medical Courier.',
      },
      {
        patient_id: patientIds[4],
        items: [
          { drug: 'Telmisartan', dose: '40mg', quantity: 30, days: 30, price: 160 },
          { drug: 'Pantoprazole Sodium', dose: '40mg', quantity: 30, days: 30, price: 95 },
          { drug: 'Paracetamol', dose: '650mg', quantity: 15, days: 5, price: 45 },
        ],
        total_amount: 300,
        delivery_address: '28 Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu - 641012',
        phone: '+91 94432 88123',
        status: 'order_placed',
      },
    ])
    console.log(`  ✓  Seeded medicine orders`)
  }

  console.log('\n✅  Database seeding complete with Tamil Indian data!\n')
  console.log('Seeded Staff Logins:')
  for (const s of STAFF) {
    console.log(`  ${s.role.padEnd(16)} | ${s.full_name.padEnd(22)} | ${s.email.padEnd(30)} / ${s.password}`)
  }
  console.log()
}

seed().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})
