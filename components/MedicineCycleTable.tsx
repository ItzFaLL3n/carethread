'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import {
  createMedicineCycle,
  updateMedicineCycleStatus,
  type ActionResult,
} from '@/app/(app)/clinical/actions'
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
  Pill,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  Ban,
} from 'lucide-react'

type MedicineCycle = Database['public']['Tables']['medicine_cycles']['Row']

interface MedicineCycleTableProps {
  patientId: string
  cycles: MedicineCycle[]
  userRole: 'doctor' | 'nurse' | 'admin' | 'receptionist' | 'patient'
  onRefresh?: () => void
}

const statusVariants: Record<string, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-primary/15 text-primary border-primary/30',
  },
  completed: {
    label: 'Completed',
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  stopped: {
    label: 'Stopped',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
  },
}

export function MedicineCycleTable({
  patientId,
  cycles,
  userRole,
  onRefresh,
}: MedicineCycleTableProps) {
  const [open, setOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    createMedicineCycle,
    null
  )

  const canPrescribe = userRole === 'doctor'
  const canUpdateStatus = userRole === 'doctor' || userRole === 'nurse'

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

  async function handleStatusChange(
    cycleId: string,
    newStatus: 'active' | 'completed' | 'stopped'
  ) {
    setUpdatingId(cycleId)
    await updateMedicineCycleStatus(cycleId, patientId, newStatus)
    setUpdatingId(null)
    onRefresh?.()
  }

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground text-base">Medication Cycles</h3>
          <Badge variant="outline" className="ml-2">
            {cycles.length} Total
          </Badge>
        </div>

        {canPrescribe && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                Prescribe Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-primary" />
                  Prescribe New Medication
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
                    <span>Prescription recorded!</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="drug">
                    Drug Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="drug"
                    name="drug"
                    placeholder="e.g. Amoxicillin, Metformin, Lisinopril"
                    required
                  />
                  {state?.fieldErrors?.drug && (
                    <p className="text-xs text-destructive">{state.fieldErrors.drug}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="dose">
                      Dose <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="dose"
                      name="dose"
                      placeholder="e.g. 500mg, 10ml, 2 tablets"
                      required
                    />
                    {state?.fieldErrors?.dose && (
                      <p className="text-xs text-destructive">{state.fieldErrors.dose}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="frequency">
                      Frequency <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="frequency"
                      name="frequency"
                      placeholder="e.g. 3x daily with meals"
                      required
                    />
                    {state?.fieldErrors?.frequency && (
                      <p className="text-xs text-destructive">{state.fieldErrors.frequency}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="start_date">
                      Start Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      defaultValue={todayStr}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="end_date">End Date (optional)</Label>
                    <Input id="end_date" name="end_date" type="date" />
                  </div>
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
                      'Save Prescription'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {cycles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
          No medication cycles recorded yet for this patient.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Medication</th>
                <th className="px-4 py-3 text-left font-medium">Dose & Frequency</th>
                <th className="px-4 py-3 text-left font-medium">Duration</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                {canUpdateStatus && (
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cycles.map((cycle) => {
                const conf = statusVariants[cycle.status] ?? statusVariants.active
                const isBusy = updatingId === cycle.id

                return (
                  <tr key={cycle.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <Pill className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{cycle.drug}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {cycle.dose} — {cycle.frequency}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{cycle.start_date}</span>
                        {cycle.end_date ? <span>→ {cycle.end_date}</span> : <span>(ongoing)</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${conf.className}`}
                      >
                        {conf.label}
                      </span>
                    </td>
                    {canUpdateStatus && (
                      <td className="px-4 py-3 text-right">
                        {isBusy ? (
                          <Loader2 className="w-4 h-4 animate-spin ml-auto text-muted-foreground" />
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            {cycle.status !== 'completed' && (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleStatusChange(cycle.id, 'completed')}
                                className="h-6 text-xs px-2 gap-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                title="Mark Completed"
                              >
                                <Check className="w-3 h-3" />
                                Complete
                              </Button>
                            )}
                            {cycle.status === 'active' && (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleStatusChange(cycle.id, 'stopped')}
                                className="h-6 text-xs px-2 gap-1 text-destructive hover:bg-destructive/10"
                                title="Stop Prescription"
                              >
                                <Ban className="w-3 h-3" />
                                Stop
                              </Button>
                            )}
                            {cycle.status !== 'active' && (
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => handleStatusChange(cycle.id, 'active')}
                                className="h-6 text-xs px-2 text-primary hover:bg-primary/10"
                                title="Reactivate Prescription"
                              >
                                Reactivate
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
