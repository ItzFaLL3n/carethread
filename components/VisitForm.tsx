'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { createVisit, type ActionResult } from '@/app/(app)/clinical/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Stethoscope, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

interface VisitFormProps {
  patientId: string
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function VisitForm({ patientId, trigger, onSuccess }: VisitFormProps) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    createVisit,
    null
  )

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
      onSuccess?.()
      const timer = setTimeout(() => {
        setOpen(false)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [state, onSuccess])

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-1.5">
            <Stethoscope className="w-4 h-4" />
            New Clinical Visit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="w-5 h-5 text-primary" />
            Record Clinical Encounter
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
              <span>Visit recorded successfully!</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="visit_date">Visit Date & Time</Label>
            <Input
              id="visit_date"
              name="visit_date"
              type="datetime-local"
              defaultValue={`${todayStr}T10:00`}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="symptoms">Symptoms & Presenting Complaint</Label>
            <textarea
              id="symptoms"
              name="symptoms"
              rows={2}
              placeholder="e.g. Persistent dry cough for 5 days, mild fatigue, low fever"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="diagnosis">
              Diagnosis <span className="text-destructive">*</span>
            </Label>
            <Input
              id="diagnosis"
              name="diagnosis"
              placeholder="e.g. Acute upper respiratory tract infection"
              required
            />
            {state?.fieldErrors?.diagnosis && (
              <p className="text-xs text-destructive">{state.fieldErrors.diagnosis}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Clinical Notes & Treatment Plan</Label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="e.g. Recommended rest, increased hydration, prescribe supportive medications. Follow-up in 1 week if not improving."
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
                'Save Visit'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
