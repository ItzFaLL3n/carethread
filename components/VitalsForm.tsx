'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { createVitals, type ActionResult } from '@/app/(app)/clinical/actions'
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
import { HeartPulse, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

interface VitalsFormProps {
  patientId: string
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function VitalsForm({ patientId, trigger, onSuccess }: VitalsFormProps) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    createVitals,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-1.5">
            <HeartPulse className="w-4 h-4" />
            Record Vitals
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <HeartPulse className="w-5 h-5 text-primary" />
            Record Patient Vitals
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
              <span>Vitals saved successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bp_systolic">Systolic BP (mmHg)</Label>
              <Input
                id="bp_systolic"
                name="bp_systolic"
                type="number"
                placeholder="120"
                min="40"
                max="300"
              />
              {state?.fieldErrors?.bp_systolic && (
                <p className="text-xs text-destructive">{state.fieldErrors.bp_systolic}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bp_diastolic">Diastolic BP (mmHg)</Label>
              <Input
                id="bp_diastolic"
                name="bp_diastolic"
                type="number"
                placeholder="80"
                min="20"
                max="200"
              />
              {state?.fieldErrors?.bp_diastolic && (
                <p className="text-xs text-destructive">{state.fieldErrors.bp_diastolic}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pulse">Pulse (bpm)</Label>
              <Input
                id="pulse"
                name="pulse"
                type="number"
                placeholder="72"
                min="30"
                max="250"
              />
              {state?.fieldErrors?.pulse && (
                <p className="text-xs text-destructive">{state.fieldErrors.pulse}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="temp_c">Temp (°C)</Label>
              <Input
                id="temp_c"
                name="temp_c"
                type="number"
                step="0.1"
                placeholder="37.0"
                min="30"
                max="45"
              />
              {state?.fieldErrors?.temp_c && (
                <p className="text-xs text-destructive">{state.fieldErrors.temp_c}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="weight_kg">Weight (kg)</Label>
              <Input
                id="weight_kg"
                name="weight_kg"
                type="number"
                step="0.1"
                placeholder="70.5"
                min="1"
                max="500"
              />
              {state?.fieldErrors?.weight_kg && (
                <p className="text-xs text-destructive">{state.fieldErrors.weight_kg}</p>
              )}
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
                'Save Vitals'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
