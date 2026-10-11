'use client'

import { useActionState } from 'react'
import { createStaffUser } from '@/app/(app)/admin/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button id="create-staff-submit" type="submit" className="w-full" disabled={pending}>
      {pending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</> : 'Create Staff Account'}
    </Button>
  )
}

export default function NewStaffPage() {
  const [state, formAction, pending] = useActionState(createStaffUser, null)

  return (
    <div className="p-8 max-w-lg mx-auto animate-fade-in-up">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground">
          <Link href="/admin/staff">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Staff
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Create Staff Account</h1>
        <p className="text-muted-foreground text-sm mt-1">New accounts are confirmed immediately</p>
      </div>

      <Card className="border-border/60 bg-card/80">
        <CardContent className="pt-6">
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" name="full_name" placeholder="Dr. Jane Smith" required className="bg-input/60" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-email">Email</Label>
              <Input id="staff-email" name="email" type="email" placeholder="jane@carethread.health" required className="bg-input/60" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-password">Temporary Password</Label>
              <Input id="staff-password" name="password" type="password" placeholder="Min 8 characters" required className="bg-input/60" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-role">Role</Label>
              <Select name="role" required>
                <SelectTrigger id="staff-role" className="bg-input/60">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist</SelectItem>
                  <SelectItem value="lab_technician">Lab Technician</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {state.error}
              </div>
            )}

            <SubmitButton pending={pending} />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
