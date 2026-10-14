'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Loader2 } from 'lucide-react'

type PatientState = { error?: string; fieldErrors?: Record<string, string> } | null
type ActionFn = (state: PatientState, formData: FormData) => Promise<PatientState>

interface PatientFormProps {
  action: ActionFn
  defaultValues?: {
    name?: string
    dob?: string
    gender?: string
    phone?: string
    address?: string
    aadhaar_number?: string
    allergies?: string
  }
  submitLabel?: string
}

export function PatientForm({ action, defaultValues, submitLabel = 'Save Patient' }: PatientFormProps) {
  const [state, formAction, pending] = useActionState<PatientState, FormData>(action, null)

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="patient-name">Full Name *</Label>
          <Input
            id="patient-name"
            name="name"
            defaultValue={defaultValues?.name}
            placeholder="e.g. Meenakshi Sundaram"
            required
            className="bg-input/60"
          />
          {state?.fieldErrors?.name && (
            <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="patient-dob">Date of Birth *</Label>
          <Input
            id="patient-dob"
            name="dob"
            type="date"
            defaultValue={defaultValues?.dob}
            required
            className="bg-input/60"
          />
          {state?.fieldErrors?.dob && (
            <p className="text-xs text-destructive">{state.fieldErrors.dob}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="patient-gender">Gender</Label>
          <Select name="gender" defaultValue={defaultValues?.gender}>
            <SelectTrigger id="patient-gender" className="bg-input/60">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="patient-phone">Phone</Label>
          <Input
            id="patient-phone"
            name="phone"
            type="tel"
            defaultValue={defaultValues?.phone}
            placeholder="+91 98765 00000"
            className="bg-input/60"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="patient-aadhaar">Aadhaar Card Number (12 Digits)</Label>
          <Input
            id="patient-aadhaar"
            name="aadhaar_number"
            defaultValue={defaultValues?.aadhaar_number}
            placeholder="XXXX XXXX XXXX"
            maxLength={14}
            className="bg-input/60 font-mono"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="patient-address">Address</Label>
        <Input
          id="patient-address"
          name="address"
          defaultValue={defaultValues?.address}
          placeholder="e.g. Plot 14, 4th Main Road, Anna Nagar, Chennai"
          className="bg-input/60"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="patient-allergies">Known Allergies</Label>
        <Input
          id="patient-allergies"
          name="allergies"
          defaultValue={defaultValues?.allergies}
          placeholder="e.g. Penicillin, latex (leave blank if none)"
          className="bg-input/60"
        />
        <p className="text-xs text-muted-foreground">Separate multiple allergies with commas</p>
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {state.error}
        </div>
      )}

      <Button id="patient-form-submit" type="submit" className="w-full md:w-auto" disabled={pending}>
        {pending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : submitLabel}
      </Button>
    </form>
  )
}
