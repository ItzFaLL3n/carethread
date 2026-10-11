'use server'

import { requireRole } from '@/lib/auth/requireRole'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export type ActionResult = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string>
} | null

// ─── Visits ────────────────────────────────────────────────────────────────
const visitSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  visit_date: z.string().optional(),
  symptoms: z.string().optional(),
  diagnosis: z.string().min(2, 'Diagnosis must be at least 2 characters'),
  notes: z.string().optional(),
})

export async function createVisit(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, user } = await requireRole(['doctor'])

  const raw = {
    patient_id: formData.get('patient_id') as string,
    visit_date: (formData.get('visit_date') as string) || undefined,
    symptoms: (formData.get('symptoms') as string) || undefined,
    diagnosis: formData.get('diagnosis') as string,
    notes: (formData.get('notes') as string) || undefined,
  }

  const parsed = visitSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    parsed.error.issues.forEach((issue) => {
      if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message
    })
    return { fieldErrors }
  }

  const { error } = await supabase.from('visits').insert({
    patient_id: parsed.data.patient_id,
    doctor_id: user.id,
    visit_date: parsed.data.visit_date || new Date().toISOString(),
    symptoms: parsed.data.symptoms || null,
    diagnosis: parsed.data.diagnosis,
    notes: parsed.data.notes || null,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/doctor/patients/${parsed.data.patient_id}`)
  revalidatePath(`/nurse/patients/${parsed.data.patient_id}`)
  return { success: true }
}

// ─── Vitals ────────────────────────────────────────────────────────────────
const vitalsSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  bp_systolic: z.coerce.number().int().min(40).max(300).optional().nullable(),
  bp_diastolic: z.coerce.number().int().min(20).max(200).optional().nullable(),
  pulse: z.coerce.number().int().min(30).max(250).optional().nullable(),
  temp_c: z.coerce.number().min(30).max(45).optional().nullable(),
  weight_kg: z.coerce.number().min(1).max(500).optional().nullable(),
})

export async function createVitals(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, user } = await requireRole(['doctor', 'nurse'])

  const raw = {
    patient_id: formData.get('patient_id') as string,
    bp_systolic: formData.get('bp_systolic') || null,
    bp_diastolic: formData.get('bp_diastolic') || null,
    pulse: formData.get('pulse') || null,
    temp_c: formData.get('temp_c') || null,
    weight_kg: formData.get('weight_kg') || null,
  }

  const parsed = vitalsSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    parsed.error.issues.forEach((issue) => {
      if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message
    })
    return { fieldErrors }
  }

  const { error } = await supabase.from('vitals').insert({
    patient_id: parsed.data.patient_id,
    recorded_by: user.id,
    bp_systolic: parsed.data.bp_systolic,
    bp_diastolic: parsed.data.bp_diastolic,
    pulse: parsed.data.pulse,
    temp_c: parsed.data.temp_c,
    weight_kg: parsed.data.weight_kg,
    recorded_at: new Date().toISOString(),
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/doctor/patients/${parsed.data.patient_id}`)
  revalidatePath(`/nurse/patients/${parsed.data.patient_id}`)
  return { success: true }
}

// ─── Medicine Cycles ───────────────────────────────────────────────────────
const medicineCycleSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  drug: z.string().min(2, 'Drug name is required'),
  dose: z.string().min(1, 'Dose is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional().nullable(),
})

export async function createMedicineCycle(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, user } = await requireRole(['doctor'])

  const raw = {
    patient_id: formData.get('patient_id') as string,
    drug: formData.get('drug') as string,
    dose: formData.get('dose') as string,
    frequency: formData.get('frequency') as string,
    start_date: formData.get('start_date') as string,
    end_date: (formData.get('end_date') as string) || null,
  }

  const parsed = medicineCycleSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    parsed.error.issues.forEach((issue) => {
      if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message
    })
    return { fieldErrors }
  }

  const { error } = await supabase.from('medicine_cycles').insert({
    patient_id: parsed.data.patient_id,
    prescribed_by: user.id,
    drug: parsed.data.drug,
    dose: parsed.data.dose,
    frequency: parsed.data.frequency,
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date || null,
    status: 'active',
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/doctor/patients/${parsed.data.patient_id}`)
  revalidatePath(`/nurse/patients/${parsed.data.patient_id}`)
  return { success: true }
}

export async function updateMedicineCycleStatus(
  cycleId: string,
  patientId: string,
  status: 'active' | 'completed' | 'stopped'
): Promise<{ success?: boolean; error?: string }> {
  const { supabase } = await requireRole(['doctor', 'nurse'])

  const { error } = await supabase
    .from('medicine_cycles')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', cycleId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/doctor/patients/${patientId}`)
  revalidatePath(`/nurse/patients/${patientId}`)
  return { success: true }
}

// ─── Family Medical History ────────────────────────────────────────────────
const familyHistorySchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  condition: z.string().min(2, 'Condition is required'),
  relative: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export async function createFamilyHistory(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, user } = await requireRole(['doctor'])

  const raw = {
    patient_id: formData.get('patient_id') as string,
    condition: formData.get('condition') as string,
    relative: (formData.get('relative') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }

  const parsed = familyHistorySchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    parsed.error.issues.forEach((issue) => {
      if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message
    })
    return { fieldErrors }
  }

  const { error } = await supabase.from('family_history').insert({
    patient_id: parsed.data.patient_id,
    condition: parsed.data.condition,
    relative: parsed.data.relative,
    notes: parsed.data.notes,
    recorded_by: user.id,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/doctor/patients/${parsed.data.patient_id}`)
  return { success: true }
}
