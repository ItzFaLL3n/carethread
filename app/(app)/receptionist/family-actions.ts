'use server'

import { requireRole } from '@/lib/auth/requireRole'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { RelationshipType } from '@/types/database'

export type ActionResult = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string>
} | null

const familySchema = z.object({
  name: z.string().min(2, 'Family name must be at least 2 characters'),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
})

export async function createFamily(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { supabase } = await requireRole(['admin', 'receptionist'])

  const raw = {
    name: formData.get('name') as string,
    address: (formData.get('address') as string) || null,
    phone: (formData.get('phone') as string) || null,
  }

  const parsed = familySchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    parsed.error.issues.forEach((issue) => {
      if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message
    })
    return { fieldErrors }
  }

  const { data, error } = await supabase
    .from('families')
    .insert({
      name: parsed.data.name,
      address: parsed.data.address,
      phone: parsed.data.phone,
    })
    .select('id')
    .single()

  if (error) {
    return { error: error.message }
  }

  redirect(`/receptionist/families/${data.id}`)
}

export async function addFamilyMember(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { supabase } = await requireRole(['admin', 'receptionist'])

  const familyId = formData.get('family_id') as string
  const patientId = formData.get('patient_id') as string
  const isEmergency = formData.get('is_emergency_contact') === 'true'

  if (!familyId || !patientId) {
    return { error: 'Family and patient are required' }
  }

  // Check if patient already in active family
  const { data: existing } = await supabase
    .from('family_members')
    .select('id')
    .eq('patient_id', patientId)
    .is('removed_at', null)
    .maybeSingle()

  if (existing) {
    return { error: 'This patient is already an active member of a family.' }
  }

  const { error } = await supabase.from('family_members').insert({
    family_id: familyId,
    patient_id: patientId,
    is_emergency_contact: isEmergency,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/receptionist/families/${familyId}`)
  return { success: true }
}

export async function removeFamilyMember(
  memberId: string,
  familyId: string
): Promise<{ success?: boolean; error?: string }> {
  const { supabase } = await requireRole(['admin', 'receptionist'])

  // Soft-remove by setting removed_at
  const { error } = await supabase
    .from('family_members')
    .update({ removed_at: new Date().toISOString() })
    .eq('id', memberId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/receptionist/families/${familyId}`)
  return { success: true }
}

const relationshipSchema = z.object({
  patient_id: z.string().uuid(),
  related_patient_id: z.string().uuid(),
  relationship: z.enum([
    'parent',
    'child',
    'spouse',
    'sibling',
    'guardian',
    'ward',
    'other',
  ]),
})

export async function createPatientRelationship(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { supabase } = await requireRole(['admin', 'receptionist'])

  const raw = {
    patient_id: formData.get('patient_id') as string,
    related_patient_id: formData.get('related_patient_id') as string,
    relationship: formData.get('relationship') as RelationshipType,
  }

  if (raw.patient_id === raw.related_patient_id) {
    return { error: 'A patient cannot be related to themselves.' }
  }

  const parsed = relationshipSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid relationship data' }
  }

  const { error } = await supabase.from('patient_relationships').insert({
    patient_id: parsed.data.patient_id,
    related_patient_id: parsed.data.related_patient_id,
    relationship: parsed.data.relationship as RelationshipType,
  })

  if (error) {
    return { error: error.message }
  }

  const familyId = formData.get('family_id') as string
  if (familyId) {
    revalidatePath(`/receptionist/families/${familyId}`)
  }
  revalidatePath(`/receptionist/patients/${parsed.data.patient_id}`)
  return { success: true }
}
