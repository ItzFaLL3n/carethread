import { requireRole } from '@/lib/auth/requireRole'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PatientProfile } from '@/components/PatientProfile'
import type { FamilyData, FamilyMemberInfo, RelationshipInfo } from '@/components/FamilyPanel'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

interface RawMemberRecord {
  id: string
  patient_id: string
  is_emergency_contact: boolean
  patients: {
    name: string
    dob: string
    gender: string | null
    phone: string | null
  } | null
}

interface RawRelationshipRecord {
  id: string
  relationship: string
  related_patient_id: string
  patients: {
    name: string
  } | null
}

export default async function DoctorPatientDetailPage({ params }: Props) {
  const { id } = await params
  const { supabase } = await requireRole(['doctor', 'admin'])

  // Fetch patient
  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  if (!patient) notFound()

  // Fetch visits
  const { data: rawVisits } = await supabase
    .from('visits')
    .select('*, profiles:doctor_id (full_name)')
    .eq('patient_id', id)
    .order('visit_date', { ascending: false })

  // Fetch vitals
  const { data: rawVitals } = await supabase
    .from('vitals')
    .select('*, profiles:recorded_by (full_name)')
    .eq('patient_id', id)
    .order('recorded_at', { ascending: false })

  // Fetch medicine cycles
  const { data: cycles } = await supabase
    .from('medicine_cycles')
    .select('*')
    .eq('patient_id', id)
    .order('created_at', { ascending: false })

  // Fetch family history
  const { data: history } = await supabase
    .from('family_history')
    .select('*')
    .eq('patient_id', id)
    .order('created_at', { ascending: false })

  // Fetch summaries
  const { data: summaries } = await supabase
    .from('summaries')
    .select('*')
    .eq('patient_id', id)
    .order('created_at', { ascending: false })

  // Fetch family membership
  const { data: activeMembership } = await supabase
    .from('family_members')
    .select('family_id, families (*)')
    .eq('patient_id', id)
    .is('removed_at', null)
    .maybeSingle()

  let familyMembersList: FamilyMemberInfo[] = []
  if (activeMembership?.family_id) {
    const { data: members } = await supabase
      .from('family_members')
      .select('id, patient_id, is_emergency_contact, patients (name, dob, gender, phone)')
      .eq('family_id', activeMembership.family_id)
      .is('removed_at', null)

    const rawMembers = (members || []) as unknown as RawMemberRecord[]
    familyMembersList = rawMembers.map((m) => ({
      id: m.id,
      patient_id: m.patient_id,
      name: m.patients?.name || 'Unknown',
      dob: m.patients?.dob || '',
      gender: m.patients?.gender || null,
      phone: m.patients?.phone || null,
      is_emergency_contact: m.is_emergency_contact,
    }))
  }

  // Fetch relationships
  const { data: rawRelationships } = await supabase
    .from('patient_relationships')
    .select('id, relationship, related_patient_id, patients!patient_relationships_related_patient_id_fkey (name)')
    .eq('patient_id', id)

  const typedRelationships = (rawRelationships || []) as unknown as RawRelationshipRecord[]
  const relationshipsList: RelationshipInfo[] = typedRelationships.map((r) => ({
    id: r.id,
    related_patient_id: r.related_patient_id,
    related_name: r.patients?.name || 'Related Patient',
    relationship: r.relationship,
  }))

  const familyRecord = activeMembership?.families
    ? {
        id: activeMembership.families.id,
        name: activeMembership.families.name,
        address: activeMembership.families.address,
        phone: activeMembership.families.phone,
      }
    : null

  const familyData: FamilyData = {
    family: familyRecord,
    members: familyMembersList,
    relationships: relationshipsList,
    history: history || [],
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-4">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-muted-foreground">
          <Link href="/doctor/patients">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Patient Directory
          </Link>
        </Button>
      </div>

      <PatientProfile
        patient={patient}
        visits={rawVisits || []}
        vitals={rawVitals || []}
        cycles={cycles || []}
        familyData={familyData}
        summaries={summaries || []}
        userRole="doctor"
      />
    </div>
  )
}
