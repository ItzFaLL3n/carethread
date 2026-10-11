import {
  DemoUser,
  DemoPatient,
  DemoAppointment,
  DemoMedicineOrder,
  DemoFamilyMember,
  INITIAL_STAFF,
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_ORDERS,
  INITIAL_FAMILY_MEMBERS,
} from './demoData'

// In-memory global store that persists across requests within the process
declare global {
  // eslint-disable-next-line no-var
  var __carethread_store__: {
    users: DemoUser[]
    patients: DemoPatient[]
    appointments: DemoAppointment[]
    orders: DemoMedicineOrder[]
    familyMembers: DemoFamilyMember[]
  } | undefined
}

function getStore() {
  if (!global.__carethread_store__) {
    global.__carethread_store__ = {
      users: [...INITIAL_STAFF],
      patients: [...INITIAL_PATIENTS],
      appointments: [...INITIAL_APPOINTMENTS],
      orders: [...INITIAL_ORDERS],
      familyMembers: [...INITIAL_FAMILY_MEMBERS],
    }
  }
  return global.__carethread_store__
}

// ─── User & Registration Store Functions ──────────────────────────────────

export function getAllUsers(): DemoUser[] {
  return getStore().users
}

export function findUserByCredentials(identifier: string): DemoUser | undefined {
  const store = getStore()
  const clean = identifier.trim().toLowerCase().replace(/\s+/g, '')

  return store.users.find((u) => {
    const emailMatch = u.email.toLowerCase() === identifier.trim().toLowerCase()
    const phoneMatch = u.phone.replace(/[\s+-]/g, '') === identifier.replace(/[\s+-]/g, '')
    const aadhaarMatch = u.aadhaar_number.replace(/\s+/g, '') === clean
    return emailMatch || phoneMatch || aadhaarMatch
  })
}

export function findUserById(id: string): DemoUser | undefined {
  return getStore().users.find((u) => u.id === id)
}

export interface RegisterPatientParams {
  name: string
  dob: string
  gender: string
  phone: string
  address: string
  aadhaar_number: string
  email: string
  password?: string
  allergies?: string
}

export function registerPatient(params: RegisterPatientParams): { user: DemoUser; patient: DemoPatient } {
  const store = getStore()
  const userId = `user-pat-${Date.now()}`
  const patientId = `pat-${Date.now()}`

  const newUser: DemoUser = {
    id: userId,
    email: params.email,
    password: params.password,
    full_name: params.name,
    role: 'patient',
    phone: params.phone,
    address: params.address,
    aadhaar_number: params.aadhaar_number,
    approval_status: 'pending', // Pending Admin Acceptance
    created_at: new Date().toISOString(),
  }

  const newPatient: DemoPatient = {
    id: patientId,
    user_id: userId,
    name: params.name,
    dob: params.dob,
    gender: params.gender,
    phone: params.phone,
    address: params.address,
    aadhaar_number: params.aadhaar_number,
    approval_status: 'pending',
    allergies: params.allergies || null,
    created_at: new Date().toISOString(),
  }

  store.users.unshift(newUser)
  store.patients.unshift(newPatient)

  return { user: newUser, patient: newPatient }
}

export interface RegisterStaffParams {
  role: 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'lab_technician'
  full_name: string
  gov_reg_number: string
  department: string
  phone: string
  address: string
  aadhaar_number: string
  email: string
  password?: string
}

export function registerStaff(params: RegisterStaffParams): DemoUser {
  const store = getStore()
  const userId = `user-staff-${Date.now()}`

  const newStaff: DemoUser = {
    id: userId,
    email: params.email,
    password: params.password,
    full_name: params.full_name,
    role: params.role,
    gov_reg_number: params.gov_reg_number,
    department: params.department,
    phone: params.phone,
    address: params.address,
    aadhaar_number: params.aadhaar_number,
    approval_status: 'pending', // Pending Admin Acceptance
    created_at: new Date().toISOString(),
  }

  store.users.unshift(newStaff)
  return newStaff
}

export function updateApprovalStatus(userId: string, status: 'approved' | 'rejected'): DemoUser | undefined {
  const store = getStore()
  const user = store.users.find((u) => u.id === userId)
  if (user) {
    user.approval_status = status
    // Also update matching patient record if exists
    const patient = store.patients.find((p) => p.user_id === userId)
    if (patient) {
      patient.approval_status = status
    }
  }
  return user
}

// ─── Patients Store Functions ─────────────────────────────────────────────

export function getAllPatients(): DemoPatient[] {
  return getStore().patients
}

export function getPatientById(id: string): DemoPatient | undefined {
  return getStore().patients.find((p) => p.id === id)
}

export function getPatientByUserId(userId: string): DemoPatient | undefined {
  return getStore().patients.find((p) => p.user_id === userId)
}

// ─── Appointments Store Functions ─────────────────────────────────────────

export function getAllAppointments(): DemoAppointment[] {
  return getStore().appointments
}

export function getAppointmentsForDoctor(doctorId: string): DemoAppointment[] {
  return getStore().appointments.filter((a) => a.doctor_id === doctorId || a.doctor_id === 'user-doc-1')
}

export function getAppointmentsForPatient(patientId: string): DemoAppointment[] {
  return getStore().appointments.filter((a) => a.patient_id === patientId)
}

export interface CreateAppointmentParams {
  patient_id: string
  patient_name: string
  patient_phone: string
  doctor_id: string
  doctor_name: string
  department: string
  appointment_date: string
  appointment_time: string
  symptoms: string
}

export function createAppointment(params: CreateAppointmentParams): DemoAppointment {
  const store = getStore()
  const newApt: DemoAppointment = {
    id: `apt-${Date.now()}`,
    ...params,
    status: 'pending',
    created_at: new Date().toISOString(),
  }
  store.appointments.unshift(newApt)
  return newApt
}

export function updateAppointmentStatus(
  appointmentId: string,
  status: 'confirmed' | 'rejected' | 'completed' | 'cancelled',
  doctorNotes?: string
): DemoAppointment | undefined {
  const store = getStore()
  const apt = store.appointments.find((a) => a.id === appointmentId)
  if (apt) {
    apt.status = status
    if (doctorNotes) apt.doctor_notes = doctorNotes
  }
  return apt
}

// ─── Medicine Orders Store Functions ──────────────────────────────────────

export function getAllMedicineOrders(): DemoMedicineOrder[] {
  return getStore().orders
}

export function getOrdersForPatient(patientId: string): DemoMedicineOrder[] {
  return getStore().orders.filter((o) => o.patient_id === patientId)
}

export interface PlaceMedicineOrderParams {
  patient_id: string
  patient_name: string
  items: Array<{ drug: string; dose: string; quantity: number; price: number; days?: number }>
  total_amount: number
  delivery_address: string
  phone: string
}

export function placeMedicineOrder(params: PlaceMedicineOrderParams): DemoMedicineOrder {
  const store = getStore()
  const newOrder: DemoMedicineOrder = {
    id: `ord-${Date.now()}`,
    ...params,
    status: 'order_placed',
    created_at: new Date().toISOString(),
  }
  store.orders.unshift(newOrder)
  return newOrder
}

export function updateOrderStatus(
  orderId: string,
  status: DemoMedicineOrder['status'],
  pharmacistNotes?: string
): DemoMedicineOrder | undefined {
  const store = getStore()
  const ord = store.orders.find((o) => o.id === orderId)
  if (ord) {
    ord.status = status
    if (pharmacistNotes) ord.pharmacist_notes = pharmacistNotes
  }
  return ord
}

// ─── Family Members & History Store Functions ─────────────────────────────

export function getFamilyMembers(patientId: string): DemoFamilyMember[] {
  return getStore().familyMembers.filter((m) => m.patient_id === patientId)
}

export interface AddFamilyMemberParams {
  patient_id: string
  name: string
  relationship: string
  dob: string
  phone?: string
  conditions: string[]
  notes?: string
}

export function addFamilyMember(params: AddFamilyMemberParams): DemoFamilyMember {
  const store = getStore()
  const newMem: DemoFamilyMember = {
    id: `fam-mem-${Date.now()}`,
    ...params,
    created_at: new Date().toISOString(),
  }
  store.familyMembers.push(newMem)
  return newMem
}
