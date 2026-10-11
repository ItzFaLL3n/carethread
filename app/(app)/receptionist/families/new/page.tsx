'use client'

import { useActionState } from 'react'
import { createFamily, type ActionResult } from '@/app/(app)/receptionist/family-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Home, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

export default function NewFamilyPage() {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    createFamily,
    null
  )

  return (
    <div className="p-8 max-w-xl mx-auto space-y-4 animate-fade-in-up">
      <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-muted-foreground">
        <Link href="/receptionist/families">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Families
        </Link>
      </Button>

      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            Create Household Family Unit
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Register a household address and contact information to group related patients.
          </p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name">
                Family / Household Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Miller Family or Henderson Household"
                required
              />
              {state?.fieldErrors?.name && (
                <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Shared Contact Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="e.g. +1 555-0192"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Shared Physical Address</Label>
              <textarea
                id="address"
                name="address"
                rows={3}
                placeholder="e.g. 742 Evergreen Terrace, Springfield"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" asChild disabled={pending}>
                <Link href="/receptionist/families">Cancel</Link>
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Creating…
                  </>
                ) : (
                  'Create Family Unit'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
