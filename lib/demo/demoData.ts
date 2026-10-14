export interface DemoUser {
  id: string
  email: string
  password?: string
  full_name: string
  role: 'admin' | 'receptionist' | 'doctor' | 'nurse' | 'patient' | 'pharmacist' | 'lab_technician'
  phone: string
  address: string
  aadhaar_number: string
  gov_reg_number?: string
  department?: string
  approval_status: 'approved' | 'pending' | 'rejected'
  created_at: string
}

export interface DemoPatient {
  id: string
  user_id: string | null
  name: string
  dob: string
  gender: string
  phone: string
  address: string
  aadhaar_number: string
  approval_status: 'approved' | 'pending' | 'rejected'
  allergies: string | null
  created_at: string
}

export interface DemoAppointment {
  id: string
  patient_id: string
  patient_name: string
  patient_phone: string
  doctor_id: string
  doctor_name: string
  department: string
  appointment_date: string
  appointment_time: string
  symptoms: string
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'
  doctor_notes?: string
  created_at: string
}

export interface MedicineOrderItem {
  drug: string
  dose: string
  quantity: number
  days?: number
  price: number
}

export interface DemoMedicineOrder {
  id: string
  patient_id: string
  patient_name: string
  items: MedicineOrderItem[]
  total_amount: number
  delivery_address: string
  phone: string
  status: 'order_placed' | 'confirmed' | 'dispensed' | 'out_for_delivery' | 'delivered' | 'cancelled'
  pharmacist_notes?: string
  created_at: string
}

export interface DemoFamilyMember {
  id: string
  patient_id: string
  name: string
  relationship: string
  dob: string
  phone?: string
  conditions: string[]
  notes?: string
  created_at: string
}

export const INITIAL_STAFF: DemoUser[] = [
  {
    id: 'user-admin-1',
    email: 'admin@carethread.health',
    full_name: 'Anitha Selvaraj',
    role: 'admin',
    phone: '+91 98401 00001',
    address: 'Hospital Executive Directorate, CareThread Medical Center, Anna Nagar, Chennai - 600040',
    aadhaar_number: '2345 6789 0123',
    gov_reg_number: 'ADM-TN-2015-001',
    department: 'Hospital Administration & Governance',
    approval_status: 'approved',
    created_at: '2024-01-01T09:00:00Z',
  },
  {
    id: 'user-doc-1',
    email: 'doctor@carethread.health',
    full_name: 'Dr. Senthil Nathan',
    role: 'doctor',
    phone: '+91 98401 00002',
    address: 'Suite 402, Doctors Enclave, Anna Nagar West, Chennai - 600040',
    aadhaar_number: '3456 7890 1234',
    gov_reg_number: 'TMC-2018-847291',
    department: 'Cardiology',
    approval_status: 'approved',
    created_at: '2024-01-10T10:00:00Z',
  },
  {
    id: 'user-nurse-1',
    email: 'nurse@carethread.health',
    full_name: 'Kavitha Murugan',
    role: 'nurse',
    phone: '+91 98401 00003',
    address: 'Block C, Nursing Quarters, CareThread Medical Center, Chennai - 600040',
    aadhaar_number: '4567 8901 2345',
    gov_reg_number: 'TNC-2020-44912',
    department: 'Intensive Care Unit (ICU)',
    approval_status: 'approved',
    created_at: '2024-02-01T08:30:00Z',
  },
  {
    id: 'user-rec-1',
    email: 'reception@carethread.health',
    full_name: 'Balaji Raman',
    role: 'receptionist',
    phone: '+91 98401 00004',
    address: 'Patient Intake & Registration Desk, CareThread, Chennai - 600040',
    aadhaar_number: '5678 9012 3456',
    gov_reg_number: 'CT-REC-2022-091',
    department: 'Patient Intake & Reception',
    approval_status: 'approved',
    created_at: '2024-02-15T09:15:00Z',
  },
  {
    id: 'user-pharma-1',
    email: 'pharmacist@carethread.health',
    full_name: 'Priya Natarajan',
    role: 'pharmacist',
    phone: '+91 98401 00005',
    address: 'Ground Floor, CareThread Central Dispensary, Chennai - 600040',
    aadhaar_number: '6789 0123 4567',
    gov_reg_number: 'TNPC-2019-10822',
    department: 'Clinical Pharmacy & Dispensing',
    approval_status: 'approved',
    created_at: '2024-03-01T11:00:00Z',
  },
  {
    id: 'user-lab-1',
    email: 'lab@carethread.health',
    full_name: 'Vignesh Loganathan',
    role: 'lab_technician',
    phone: '+91 98401 00006',
    address: 'Diagnostic Wing, Level 2, CareThread, Chennai - 600040',
    aadhaar_number: '7890 1234 5678',
    gov_reg_number: 'NABL-2021-9923',
    department: 'Pathology & Diagnostic Lab',
    approval_status: 'approved',
    created_at: '2024-03-05T10:45:00Z',
  },
  {
    id: 'user-pending-doc',
    email: 'dr.aravind@carethread.health',
    full_name: 'Dr. Aravind Swaminathan',
    role: 'doctor',
    phone: '+91 98401 88990',
    address: '15 Rajaji Salai, Kilpauk, Chennai',
    aadhaar_number: '8901 2345 6789',
    gov_reg_number: 'TMC-2023-994102',
    department: 'Orthopedics',
    approval_status: 'pending',
    created_at: '2024-04-10T14:20:00Z',
  },
  {
    id: 'user-pending-nurse',
    email: 'ananya.nurse@carethread.health',
    full_name: 'Ananya Ramesh',
    role: 'nurse',
    phone: '+91 98401 77665',
    address: '7 Gandhi Road, Mylapore, Chennai',
    aadhaar_number: '9012 3456 7890',
    gov_reg_number: 'TNC-2022-81729',
    department: 'General Ward & Triage',
    approval_status: 'pending',
    created_at: '2024-04-11T09:10:00Z',
  },
  {
    id: 'user-patient-1',
    email: 'patient1@carethread.health',
    full_name: 'Meenakshi Sundaram',
    role: 'patient',
    phone: '+91 98401 22341',
    address: 'Plot 14, 4th Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040',
    aadhaar_number: '5432 8901 2345',
    approval_status: 'approved',
    created_at: '2024-01-15T09:00:00Z',
  },
]

export const INITIAL_PATIENTS: DemoPatient[] = [
  {
    id: 'pat-emma-1',
    user_id: 'user-patient-1',
    name: 'Meenakshi Sundaram',
    dob: '1988-03-15',
    gender: 'female',
    phone: '+91 98401 22341',
    address: 'Plot 14, 4th Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040',
    aadhaar_number: '5432 8901 2345',
    approval_status: 'approved',
    allergies: 'Penicillin, Shellfish',
    created_at: '2024-01-15T09:00:00Z',
  },
  {
    id: 'pat-james-2',
    user_id: null,
    name: 'Sundaram Ramasamy (Spouse)',
    dob: '1984-07-22',
    gender: 'male',
    phone: '+91 98401 22342',
    address: 'Plot 14, 4th Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040',
    aadhaar_number: '6543 9012 3456',
    approval_status: 'approved',
    allergies: null,
    created_at: '2024-01-16T11:30:00Z',
  },
  {
    id: 'pat-sophie-3',
    user_id: null,
    name: 'Kayalvizhi Sundaram (Child)',
    dob: '2016-11-08',
    gender: 'female',
    phone: '+91 98401 22341',
    address: 'Plot 14, 4th Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040',
    aadhaar_number: '7654 0123 4567',
    approval_status: 'approved',
    allergies: 'Latex',
    created_at: '2024-01-16T11:35:00Z',
  },
  {
    id: 'pat-liam-4',
    user_id: null,
    name: 'Muthukumar Palanisamy',
    dob: '1962-01-30',
    gender: 'male',
    phone: '+91 94432 88123',
    address: '28 Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu - 641012',
    aadhaar_number: '9876 2345 6789',
    approval_status: 'approved',
    allergies: 'Aspirin, Ibuprofen',
    created_at: '2024-02-01T14:10:00Z',
  },
]

export const INITIAL_FAMILY_MEMBERS: DemoFamilyMember[] = [
  {
    id: 'fam-mem-1',
    patient_id: 'pat-emma-1',
    name: 'Sundaram Ramasamy',
    relationship: 'Spouse',
    dob: '1984-07-22',
    phone: '+91 98401 22342',
    conditions: ['Hypertension (Stage 1)', 'Mild Asthma'],
    notes: 'Takes Telmisartan 40mg daily; uses Salbutamol inhaler PRN.',
    created_at: '2024-02-01T10:00:00Z',
  },
  {
    id: 'fam-mem-2',
    patient_id: 'pat-emma-1',
    name: 'Kayalvizhi Sundaram',
    relationship: 'Daughter (Ward)',
    dob: '2016-11-08',
    phone: '+91 98401 22341',
    conditions: ['Seasonal Allergic Rhinitis'],
    notes: 'Mild dust mite allergy; pediatric vaccinations up to date.',
    created_at: '2024-02-01T10:05:00Z',
  },
  {
    id: 'fam-mem-3',
    patient_id: 'pat-emma-1',
    name: 'Kalyani Ramasamy',
    relationship: 'Mother-in-law',
    dob: '1958-04-12',
    phone: '+91 94441 55670',
    conditions: ['Type 2 Diabetes Mellitus', 'Osteoarthritis'],
    notes: 'Monitors fasting blood sugar; regular knee physiotherapy.',
    created_at: '2024-02-05T12:00:00Z',
  },
]

export const INITIAL_APPOINTMENTS: DemoAppointment[] = [
  {
    id: 'apt-001',
    patient_id: 'pat-emma-1',
    patient_name: 'Meenakshi Sundaram',
    patient_phone: '+91 98401 22341',
    doctor_id: 'user-doc-1',
    doctor_name: 'Dr. Senthil Nathan',
    department: 'Cardiology',
    appointment_date: '2026-10-16',
    appointment_time: '10:30 AM',
    symptoms: 'Mild palpitations after light exertion, follow-up on respiratory symptoms.',
    status: 'confirmed',
    doctor_notes: 'Confirmed. Please bring BP log from the last 3 days.',
    created_at: '2026-10-11T18:00:00Z',
  },
  {
    id: 'apt-002',
    patient_id: 'pat-james-2',
    patient_name: 'Sundaram Ramasamy',
    patient_phone: '+91 98401 22342',
    doctor_id: 'user-doc-1',
    doctor_name: 'Dr. Senthil Nathan',
    department: 'Cardiology',
    appointment_date: '2026-10-17',
    appointment_time: '02:00 PM',
    symptoms: 'Routine blood pressure review & ECG checkup.',
    status: 'confirmed',
    doctor_notes: 'Confirmed. Please bring recent BP log and morning fasting lipid panel.',
    created_at: '2026-10-10T12:00:00Z',
  },
  {
    id: 'apt-003',
    patient_id: 'pat-liam-4',
    patient_name: 'Muthukumar Palanisamy',
    patient_phone: '+91 94432 88123',
    doctor_id: 'user-doc-1',
    doctor_name: 'Dr. Senthil Nathan',
    department: 'Cardiology',
    appointment_date: '2026-10-18',
    appointment_time: '11:00 AM',
    symptoms: 'Chest tightness when climbing stairs, radiating to left shoulder.',
    status: 'pending',
    created_at: '2026-10-11T19:20:00Z',
  },
]

export const INITIAL_ORDERS: DemoMedicineOrder[] = [
  {
    id: 'ord-1001',
    patient_id: 'pat-emma-1',
    patient_name: 'Meenakshi Sundaram',
    items: [
      { drug: 'Atorvastatin', dose: '20mg', quantity: 30, days: 30, price: 240 },
      { drug: 'Metoprolol Tartrate', dose: '50mg', quantity: 60, days: 30, price: 180 },
      { drug: 'Vitamin D3 (Cholecalciferol)', dose: '60,000 IU', quantity: 4, days: 28, price: 120 },
    ],
    total_amount: 540,
    delivery_address: 'Plot 14, 4th Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040',
    phone: '+91 98401 22341',
    status: 'dispensed',
    pharmacist_notes: 'Packed and verified by Pharmacist Priya Natarajan. Dispatched via Express Care Courier.',
    created_at: '2026-10-10T14:30:00Z',
  },
  {
    id: 'ord-1002',
    patient_id: 'pat-emma-1',
    patient_name: 'Meenakshi Sundaram',
    items: [
      { drug: 'Paracetamol', dose: '650mg', quantity: 15, days: 5, price: 45 },
      { drug: 'Cetirizine Hydrochloride', dose: '10mg', quantity: 10, days: 10, price: 35 },
    ],
    total_amount: 80,
    delivery_address: 'Plot 14, 4th Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040',
    phone: '+91 98401 22341',
    status: 'order_placed',
    created_at: '2026-10-11T20:15:00Z',
  },
]

export const AVAILABLE_MEDICINES = [
  { id: 'm-1', drug: 'Atorvastatin', dose: '20mg', category: 'Cardiovascular', price: 240, desc: 'Cholesterol lowering statin' },
  { id: 'm-2', drug: 'Metoprolol Tartrate', dose: '50mg', category: 'Cardiovascular', price: 180, desc: 'Beta-blocker for heart rate & BP' },
  { id: 'm-3', drug: 'Telmisartan', dose: '40mg', category: 'Hypertension', price: 160, desc: 'Angiotensin receptor blocker' },
  { id: 'm-4', drug: 'Metformin Hydrochloride', dose: '500mg', category: 'Diabetes', price: 110, desc: 'First-line anti-hyperglycemic' },
  { id: 'm-5', drug: 'Amoxicillin + Clavulanic Acid', dose: '625mg', category: 'Antibiotics', price: 290, desc: 'Broad spectrum antibacterial' },
  { id: 'm-6', drug: 'Pantoprazole Sodium', dose: '40mg', category: 'Gastroenterology', price: 95, desc: 'Proton pump inhibitor for acidity' },
  { id: 'm-7', drug: 'Montelukast + Levocetirizine', dose: '10mg / 5mg', category: 'Respiratory / Allergy', price: 145, desc: 'Allergic rhinitis & airway control' },
  { id: 'm-8', drug: 'Vitamin D3 (Cholecalciferol)', dose: '60,000 IU', category: 'Supplements', price: 120, desc: 'Weekly bone & immune strength' },
  { id: 'm-9', drug: 'Paracetamol', dose: '650mg', category: 'Analgesics / Antipyretic', price: 45, desc: 'Fever & pain relief' },
]

export const DEPARTMENTS = [
  { id: 'cardiology', name: 'Cardiology', icon: 'HeartPulse', desc: 'Heart rhythm, chest discomfort, blood pressure & vascular care' },
  { id: 'orthopedics', name: 'Orthopedics', icon: 'Activity', desc: 'Bones, joints, arthritis, sports injuries & spine therapy' },
  { id: 'general_medicine', name: 'General Medicine', icon: 'Stethoscope', desc: 'Fevers, infections, metabolic health & primary consultations' },
  { id: 'dermatology', name: 'Dermatology', icon: 'Sparkles', desc: 'Skin rashes, eczema, allergies, acne & hair health' },
  { id: 'pediatrics', name: 'Pediatrics', icon: 'Baby', desc: 'Child health, immunizations, infant growth & pediatric wellness' },
  { id: 'neurology', name: 'Neurology', icon: 'Brain', desc: 'Migraines, neuropathy, vertigo, seizures & sleep disturbances' },
  { id: 'ent', name: 'ENT (Otolaryngology)', icon: 'Headphones', desc: 'Ear pain, hearing, sinusitis, tonsillitis & throat care' },
]

export const DAILY_HEALTH_TIPS = [
  {
    id: 1,
    title: 'Optimal Cellular Hydration',
    category: 'Daily Habit',
    icon: '💧',
    tip: 'Drink 2.5 to 3 liters of water across your day. Begin your morning with 1 full glass before coffee or tea to jumpstart glomerular filtration and mental clarity.',
  },
  {
    id: 2,
    title: 'The 20-20-20 Vision Rule',
    category: 'Preventive Ergonomics',
    icon: '👁️',
    tip: 'Every 20 minutes spent looking at a computer or phone screen, look at an object at least 20 feet away for 20 seconds. This relieves ciliary muscle spasm and dry eye syndrome.',
  },
  {
    id: 3,
    title: 'Post-Meal Walking for Glucose Stability',
    category: 'Metabolic Health',
    icon: '🚶',
    tip: 'A gentle 10 to 15-minute walk after lunch or dinner stimulates GLUT4 glucose uptake in skeletal muscle without demanding high insulin secretion, blunting postprandial blood sugar spikes.',
  },
  {
    id: 4,
    title: 'Anti-Inflammatory Deep Sleep Hygiene',
    category: 'Rest & Recovery',
    icon: '🌙',
    tip: 'Aim for 7 to 8 hours of sleep in a cool (18-20°C), dark room. Discontinue screen time 45 minutes before sleep to safeguard endogenous melatonin release and restorative slow-wave sleep.',
  },
  {
    id: 5,
    title: 'Know Your Blood Pressure Baseline',
    category: 'Cardiovascular Care',
    icon: '❤️',
    tip: 'A resting reading below 120/80 mmHg is optimal. Track your readings once monthly; early detection of pre-hypertension protects renal microvasculature and cardiac muscle.',
  },
  {
    id: 6,
    title: 'Gut Microbiome & Fiber Diversity',
    category: 'Nutrition',
    icon: '🥗',
    tip: 'Aim for 30 diverse plant foods weekly (legumes, leafy greens, berries, seeds, whole grains). Prebiotic fiber feeds Bifidobacteria which produce gut-protective short-chain fatty acids (SCFAs).',
  },
]
