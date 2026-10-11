import { requireRole } from '@/lib/auth/requireRole'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FamilyDetailManager } from '@/components/FamilyDetailManager'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, Phone, MapPin } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function FamilyDetailPage({ params }: Props) {
  const { id } = await params
  const { supabase } = await requireRole(['receptionist', 'admin'])

  // Fetch family record
  const { data: family } = await supabase
    .from('families')
    .select('*')
    .eq('id', id)
    .single()

  if (!family) notFound()

  // Fetch active family members
  const { data: rawMembers } = await supabase
    .from('family_members')
    .select('id, patient_id, is_emergency_contact, patients (id, name, dob, gender, phone)')
    .eq('family_id', id)
    .is('removed_at', null)

  interface RawFamilyMember {
    id: string
    patient_id: string
    is_emergency_contact: boolean
    patients: {
      id: string
      name: string
      dob: string
      gender: string | null
      phone: string | null
    } | null
  }

  interface FormattedRelationship {
    id: string
    patient_id: string
    related_patient_id: string
    relationship: string
    patient_name: string
    related_name: string
  }

  const typedMembers = (rawMembers || []) as unknown as RawFamilyMember[]
  const members = typedMembers.map((m) => ({
    id: m.id,
    patient_id: m.patient_id,
    is_emergency_contact: m.is_emergency_contact,
    patient: {
      name: m.patients?.name || 'Unknown',
      dob: m.patients?.dob || '',
      gender: m.patients?.gender || null,
      phone: m.patients?.phone || null,
    },
  }))

  // Fetch all patients for member addition dropdown
  const { data: allPatients } = await supabase
    .from('patients')
    .select('*')
    .order('name', { ascending: true })

  // Member patient IDs
  const memberPatientIds = members.map((m) => m.patient_id)

  // Fetch relationships among members
  let relationships: FormattedRelationship[] = []
  if (memberPatientIds.length > 0) {
    const { data: rawRel } = await supabase
      .from('patient_relationships')
      .select('id, patient_id, related_patient_id, relationship')
      .in('patient_id', memberPatientIds)
      .in('related_patient_id', memberPatientIds)

    const patientMap = new Map((allPatients || []).map((p) => [p.id, p.name]))

    relationships =
      rawRel?.map((r) => ({
        id: r.id,
        patient_id: r.patient_id,
        related_patient_id: r.related_patient_id,
        relationship: r.relationship,
        patient_name: patientMap.get(r.patient_id) || 'Unknown',
        related_name: patientMap.get(r.related_patient_id) || 'Unknown',
      })) || []
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      {/* Back button */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-muted-foreground">
          <Link href="/receptionist/families">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Family Households
          </Link>
        </Button>
      </div>

      {/* Household Overview Header */}
      <div className="rounded-xl border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shrink-0">
            <Home className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{family.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
              {family.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  {family.phone}
                </span>
              )}
              {family.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {family.address}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Family Manager (Members + Relationships) */}
      <FamilyDetailManager
        familyId={family.id}
        members={members}
        allAvailablePatients={allPatients || []}
        relationships={relationships}
      />
    </div>
  )
}
