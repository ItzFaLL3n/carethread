'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { createFamilyHistory, type ActionResult } from '@/app/(app)/clinical/actions'
import type { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  ShieldAlert,
  Dna,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Phone,
  Home,
} from 'lucide-react'

type FamilyHistory = Database['public']['Tables']['family_history']['Row']

export interface FamilyMemberInfo {
  id: string
  patient_id: string
  name: string
  dob: string
  gender: string | null
  phone: string | null
  is_emergency_contact: boolean
}

export interface RelationshipInfo {
  id: string
  related_patient_id: string
  related_name: string
  relationship: string
}

export interface FamilyData {
  family?: {
    id: string
    name: string
    address: string | null
    phone: string | null
  } | null
  members: FamilyMemberInfo[]
  relationships: RelationshipInfo[]
  history: FamilyHistory[]
}

interface FamilyPanelProps {
  patientId: string
  data: FamilyData
  userRole: 'doctor' | 'nurse' | 'admin' | 'receptionist' | 'patient'
  onRefresh?: () => void
}

export function FamilyPanel({ patientId, data, userRole, onRefresh }: FamilyPanelProps) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    createFamilyHistory,
    null
  )

  const canAddHistory = userRole === 'doctor'

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
      onRefresh?.()
      const timer = setTimeout(() => {
        setOpen(false)
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [state, onRefresh])

  return (
    <div className="space-y-6">
      {/* ── Household Section ── */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground text-base">
              {data.family ? `${data.family.name} Household` : 'Household Family'}
            </h3>
          </div>
          {data.family?.phone && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="w-3.5 h-3.5" />
              <span>{data.family.phone}</span>
            </div>
          )}
        </div>

        {data.family?.address && (
          <p className="text-xs text-muted-foreground mb-4">
            <span className="font-medium text-foreground">Address:</span> {data.family.address}
          </p>
        )}

        {data.members.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            This patient is not currently registered in a household family unit.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.members.map((member) => {
              const isCurrent = member.patient_id === patientId
              return (
                <div
                  key={member.id}
                  className={`p-3 rounded-md border text-sm transition-colors ${
                    isCurrent
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border/60 bg-muted/20 hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground flex items-center gap-1.5">
                        {member.name}
                        {isCurrent && (
                          <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.2 rounded">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        DOB: {member.dob} {member.gender ? `• ${member.gender}` : ''}
                      </p>
                    </div>
                    {member.is_emergency_contact && (
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20 shrink-0 flex items-center gap-1"
                      >
                        <ShieldAlert className="w-3 h-3" />
                        Emergency
                      </Badge>
                    )}
                  </div>
                  {member.phone && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {member.phone}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Kinship Relationships Section ── */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground text-base">Kinship Relationships</h3>
        </div>

        {data.relationships.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No specific kinship relationships (e.g. parent, guardian, sibling) linked yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {data.relationships.map((rel) => (
              <div
                key={rel.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-sm"
              >
                <span className="text-muted-foreground capitalize font-medium text-xs bg-muted px-2 py-0.5 rounded">
                  {rel.relationship}
                </span>
                <span className="text-foreground font-medium">{rel.related_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Hereditary / Family Medical History Section ── */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Dna className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground text-base">Hereditary Medical History</h3>
          </div>

          {canAddHistory && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  Add Condition
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Dna className="w-5 h-5 text-primary" />
                    Record Family Medical History
                  </DialogTitle>
                </DialogHeader>

                <form ref={formRef} action={formAction} className="space-y-4 pt-2">
                  <input type="hidden" name="patient_id" value={patientId} />

                  {state?.error && (
                    <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{state.error}</span>
                    </div>
                  )}

                  {state?.success && (
                    <div className="flex items-center gap-2 p-3 text-sm text-primary bg-primary/10 rounded-md border border-primary/20">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Condition saved!</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="condition">
                      Medical Condition <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="condition"
                      name="condition"
                      placeholder="e.g. Type 2 Diabetes, Hypertension, Coronary Artery Disease"
                      required
                    />
                    {state?.fieldErrors?.condition && (
                      <p className="text-xs text-destructive">{state.fieldErrors.condition}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="relative">Relative</Label>
                    <Input
                      id="relative"
                      name="relative"
                      placeholder="e.g. Maternal Grandfather, Father, Mother"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="notes">Clinical Notes</Label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={2}
                      placeholder="e.g. Early onset diagnosed at age 45"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setOpen(false)}
                      disabled={pending}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={pending}>
                      {pending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        'Save Condition'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {data.history.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No family medical history recorded for this patient.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-lg border border-border/80 bg-muted/20 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm">
                    {item.condition}
                  </span>
                  {item.relative && (
                    <Badge variant="secondary" className="text-xs">
                      {item.relative}
                    </Badge>
                  )}
                </div>
                {item.notes && (
                  <p className="text-xs text-muted-foreground pt-1">{item.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
