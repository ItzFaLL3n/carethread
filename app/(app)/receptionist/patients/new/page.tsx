import { requireRole } from '@/lib/auth/requireRole'
import { PatientForm } from '@/components/PatientForm'
import { createPatient } from '@/app/(app)/receptionist/actions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewPatientPage() {
  await requireRole(['admin', 'receptionist'])

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground">
          <Link href="/receptionist/patients">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Patients
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Register New Patient</h1>
        <p className="text-muted-foreground text-sm mt-1">Fields marked * are required</p>
      </div>

      <Card className="border-border/60 bg-card/80">
        <CardContent className="pt-6">
          <PatientForm action={createPatient} submitLabel="Register Patient" />
        </CardContent>
      </Card>
    </div>
  )
}
