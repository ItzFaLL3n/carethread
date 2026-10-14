import { requireRole } from '@/lib/auth/requireRole'
import { PatientPortalClient } from '@/components/PatientPortalClient'
import {
  getAllPatients,
  getAppointmentsForPatient,
  getOrdersForPatient,
  getFamilyMembers,
  findUserById,
} from '@/lib/demo/store'
import { DemoPatient } from '@/lib/demo/demoData'

export default async function PatientPortal({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams
  const { user } = await requireRole(['patient'])

  // Fetch from store or database
  const allPatients = getAllPatients()
  const activeUser = findUserById(user.id) || {
    id: user.id,
    email: user.email || 'patient1@carethread.health',
    full_name: 'Meenakshi Sundaram',
    role: 'patient',
    phone: '+91 98401 22341',
    address: 'Plot 14, 4th Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040',
    aadhaar_number: '5432 8901 2345',
    approval_status: 'approved',
    created_at: new Date().toISOString(),
  }

  let activePatient: DemoPatient =
    allPatients.find((pat) => pat.user_id === user.id) ||
    allPatients[0] || {
      id: 'pat-emma-1',
      user_id: user.id,
      name: 'Meenakshi Sundaram',
      dob: '1988-03-15',
      gender: 'female',
      phone: '+91 98401 22341',
      address: 'Plot 14, 4th Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040',
      aadhaar_number: '5432 8901 2345',
      approval_status: 'approved',
      allergies: 'Penicillin, Shellfish',
      created_at: new Date().toISOString(),
    }

  if (p) {
    const selected = allPatients.find((pat) => pat.id === p)
    if (selected) activePatient = selected
  }

  const appointments = getAppointmentsForPatient(activePatient.id)
  const orders = getOrdersForPatient(activePatient.id)
  const familyMembers = getFamilyMembers(activePatient.id)

  return (
    <PatientPortalClient
      currentUser={activeUser}
      initialPatient={activePatient}
      allVisiblePatients={allPatients.slice(0, 3)}
      initialAppointments={appointments}
      initialOrders={orders}
      initialFamilyMembers={familyMembers}
    />
  )
}
