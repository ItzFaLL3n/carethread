'use client'

import { useActionState, useEffect, useState } from 'react'
import {
  addFamilyMember,
  removeFamilyMember,
  createPatientRelationship,
  type ActionResult,
} from '@/app/(app)/receptionist/family-actions'
import type { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Users,
  UserPlus,
  ShieldAlert,
  Loader2,
  AlertCircle,
  Trash2,
  Link as LinkIcon,
  Phone,
  Calendar,
} from 'lucide-react'

type Patient = Database['public']['Tables']['patients']['Row']
type RelationshipType = Database['public']['Enums']['relationship_type']

interface MemberItem {
  id: string
  patient_id: string
  is_emergency_contact: boolean
  patient: {
    name: string
    dob: string
    gender: string | null
    phone: string | null
  }
}

interface RelationshipItem {
  id: string
  patient_id: string
  related_patient_id: string
  relationship: string
  patient_name: string
  related_name: string
}

interface FamilyDetailManagerProps {
  familyId: string
  members: MemberItem[]
  allAvailablePatients: Patient[]
  relationships: RelationshipItem[]
}

const relationshipOptions: { value: RelationshipType; label: string }[] = [
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'guardian', label: 'Legal Guardian' },
  { value: 'ward', label: 'Ward / Dependent' },
  { value: 'other', label: 'Other Relative' },
]

export function FamilyDetailManager({
  familyId,
  members,
  allAvailablePatients,
  relationships,
}: FamilyDetailManagerProps) {
  // Add Member State
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [addState, addAction, addPending] = useActionState<ActionResult, FormData>(
    addFamilyMember,
    null
  )

  // Link Relationship State
  const [relOpen, setRelOpen] = useState(false)
  const [relState, relAction, relPending] = useActionState<ActionResult, FormData>(
    createPatientRelationship,
    null
  )

  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (addState?.success) {
      const timer = setTimeout(() => {
        setAddMemberOpen(false)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [addState])

  useEffect(() => {
    if (relState?.success) {
      const timer = setTimeout(() => {
        setRelOpen(false)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [relState])

  async function handleRemove(memberId: string) {
    if (!confirm('Remove this patient from this family unit?')) return
    setRemovingId(memberId)
    await removeFamilyMember(memberId, familyId)
    setRemovingId(null)
  }

  // Filter available patients to those not already in this family
  const unassignedPatients = allAvailablePatients.filter(
    (p) => !members.some((m) => m.patient_id === p.id)
  )

  return (
    <div className="space-y-6">
      {/* ── Active Members Card ── */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Family Household Members ({members.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Patients currently assigned to this household
            </p>
          </div>

          <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <UserPlus className="w-4 h-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  Add Patient to Family
                </DialogTitle>
              </DialogHeader>

              <form action={addAction} className="space-y-4 pt-2">
                <input type="hidden" name="family_id" value={familyId} />

                {addState?.error && (
                  <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{addState.error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="patient_id">
                    Select Patient <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="patient_id"
                    name="patient_id"
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">— Choose a registered patient —</option>
                    {unassignedPatients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (DOB: {p.dob})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_emergency_contact"
                    name="is_emergency_contact"
                    value="true"
                    className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                  />
                  <Label htmlFor="is_emergency_contact" className="text-sm font-normal cursor-pointer">
                    Designate as Primary Emergency Contact for this household
                  </Label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAddMemberOpen(false)}
                    disabled={addPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={addPending}>
                    {addPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        Adding…
                      </>
                    ) : (
                      'Add Member'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {members.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
            No patients added to this family yet. Click &quot;Add Member&quot; to link patients.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {members.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{m.patient.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      DOB: {m.patient.dob}
                    </p>
                    {m.patient.phone && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {m.patient.phone}
                      </p>
                    )}
                  </div>

                  {m.is_emergency_contact && (
                    <Badge
                      variant="outline"
                      className="bg-amber-500/10 text-amber-300 border-amber-500/20 text-[10px] gap-1 shrink-0"
                    >
                      <ShieldAlert className="w-3 h-3" />
                      Emergency
                    </Badge>
                  )}
                </div>

                <div className="pt-2 border-t border-border/50 flex justify-end">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleRemove(m.id)}
                    disabled={removingId === m.id}
                    className="text-xs text-destructive hover:bg-destructive/10 h-6 px-2 gap-1"
                  >
                    {removingId === m.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Kinship Relationships Card ── */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-primary" />
              Kinship Relationships
            </h2>
            <p className="text-xs text-muted-foreground">
              Define parental, guardian, and sibling connections between family members. (Database
              automatically synchronizes the inverse relationship!)
            </p>
          </div>

          {members.length >= 2 && (
            <Dialog open={relOpen} onOpenChange={setRelOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <LinkIcon className="w-4 h-4" />
                  Link Relationship
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-primary" />
                    Link Kinship Connection
                  </DialogTitle>
                </DialogHeader>

                <form action={relAction} className="space-y-4 pt-2">
                  <input type="hidden" name="family_id" value={familyId} />

                  {relState?.error && (
                    <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{relState.error}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="patient_id">Primary Patient</Label>
                    <select
                      id="patient_id"
                      name="patient_id"
                      required
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">— Select Patient —</option>
                      {members.map((m) => (
                        <option key={m.patient_id} value={m.patient_id}>
                          {m.patient.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="relationship">Relationship To Related Patient</Label>
                    <select
                      id="relationship"
                      name="relationship"
                      required
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {relationshipOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-muted-foreground">
                      Example: If patient A is &quot;parent&quot; to patient B, the system automatically creates the &quot;child&quot; link.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="related_patient_id">Related Patient</Label>
                    <select
                      id="related_patient_id"
                      name="related_patient_id"
                      required
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">— Select Related Patient —</option>
                      {members.map((m) => (
                        <option key={m.patient_id} value={m.patient_id}>
                          {m.patient.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRelOpen(false)}
                      disabled={relPending}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={relPending}>
                      {relPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          Linking…
                        </>
                      ) : (
                        'Save Relationship'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {relationships.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
            No kinship relationships defined for members in this household yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relationships.map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{r.patient_name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 capitalize">
                    is {r.relationship} of
                  </span>
                  <span className="font-semibold text-foreground">{r.related_name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
