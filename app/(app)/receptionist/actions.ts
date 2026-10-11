'use server'

import { requireRole } from '@/lib/auth/requireRole'
import { z } from 'zod'
import { redirect } from 'next/navigation'

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  aadhaar_number: z.string().optional(),
  allergies: z.string().optional(),
})

type PatientState = { error?: string; fieldErrors?: Record<string, string> } | null

export async function createPatient(state: PatientState, formData: FormData): Promise<PatientState> {
  const { supabase, user } = await requireRole(['admin', 'receptionist'])

  const raw = {
    name: formData.get('name') as string,
    dob: formData.get('dob') as string,
    gender: (formData.get('gender') as string) || undefined,
    phone: (formData.get('phone') as string) || undefined,
    address: (formData.get('address') as string) || undefined,
    aadhaar_number: (formData.get('aadhaar_number') as string) || undefined,
    allergies: (formData.get('allergies') as string) || undefined,
  }

  const parsed = patientSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    parsed.error.issues.forEach((e) => {
      if (e.path[0]) fieldErrors[e.path[0] as string] = e.message
    })
    return { fieldErrors }
  }

  const { data, error } = await supabase.from('patients').insert({
    ...parsed.data,
    created_by: user.id,
  }).select('id').single()

  if (error) {
    return { error: error.message }
  }

  redirect(`/receptionist/patients/${data.id}`)
}

export async function updatePatient(
  patientId: string,
  state: PatientState,
  formData: FormData
): Promise<PatientState> {
  const { supabase } = await requireRole(['admin', 'receptionist'])

  const raw = {
    name: formData.get('name') as string,
    dob: formData.get('dob') as string,
    gender: (formData.get('gender') as string) || undefined,
    phone: (formData.get('phone') as string) || undefined,
    address: (formData.get('address') as string) || undefined,
    allergies: (formData.get('allergies') as string) || undefined,
  }

  const parsed = patientSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    parsed.error.issues.forEach((e) => {
      if (e.path[0]) fieldErrors[e.path[0] as string] = e.message
    })
    return { fieldErrors }
  }

  const { error } = await supabase
    .from('patients')
    .update(parsed.data)
    .eq('id', patientId)

  if (error) return { error: error.message }

  redirect(`/receptionist/patients/${patientId}`)
}
