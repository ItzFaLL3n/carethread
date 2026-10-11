'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/requireRole'
import { z } from 'zod'
import { redirect } from 'next/navigation'

const createStaffSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'receptionist', 'doctor', 'nurse', 'pharmacist', 'lab_technician']),
  gov_reg_number: z.string().optional(),
  aadhaar_number: z.string().optional(),
  department: z.string().optional(),
})

export type StaffState = { error?: string; success?: boolean } | null

export async function createStaffUser(
  prevState: StaffState,
  formData: FormData
): Promise<StaffState> {
  // Only admin can call this
  const { supabase: userClient } = await requireRole(['admin'])

  const raw = {
    full_name: formData.get('full_name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    role: formData.get('role') as string,
  }

  const parsed = createStaffSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Validation failed' }
  }

  const admin = createAdminClient()

  // Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return { error: authError?.message ?? 'Failed to create auth user' }
  }

  // Insert profile
  const { error: profileError } = await userClient
    .from('profiles')
    .insert({
      id: authData.user.id,
      full_name: parsed.data.full_name,
      role: parsed.data.role,
    })

  if (profileError) {
    // Cleanup orphan auth user
    await admin.auth.admin.deleteUser(authData.user.id)
    return { error: profileError.message }
  }

  redirect('/admin/staff')
}

export async function createPatientPortalAccount(formData: FormData) {
  // Receptionist or admin can call this
  const { supabase: userClient } = await requireRole(['admin', 'receptionist'])

  const patientId = formData.get('patient_id') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!patientId || !email || !password) {
    return { error: 'All fields are required' }
  }

  const admin = createAdminClient()

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return { error: authError?.message ?? 'Failed to create account' }
  }

  // Create patient-role profile
  const { error: profileError } = await userClient
    .from('profiles')
    .insert({
      id: authData.user.id,
      full_name: '',  // filled from patient record
      role: 'patient',
    })

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id)
    return { error: profileError.message }
  }

  // Link auth user to patient record
  const { error: linkError } = await userClient
    .from('patients')
    .update({ user_id: authData.user.id })
    .eq('id', patientId)

  if (linkError) {
    await admin.auth.admin.deleteUser(authData.user.id)
    return { error: linkError.message }
  }

  return { success: true }
}
