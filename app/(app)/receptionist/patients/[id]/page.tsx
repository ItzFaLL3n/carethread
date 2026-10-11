import { requireRole } from '@/lib/auth/requireRole'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PatientForm } from '@/components/PatientForm'
import { updatePatient } from '@/app/(app)/receptionist/actions'
import Link from 'next/link'
import { ArrowLeft, Phone, MapPin, AlertTriangle, Calendar } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PatientDetailPage({ params }: Props) {
  const { id } = await params
  const { supabase } = await requireRole(['admin', 'receptionist'])

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  if (!patient) notFound()

  const boundUpdatePatient = updatePatient.bind(null, patient.id)

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in-up">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground">
          <Link href="/receptionist/patients">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Patients
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center text-xl font-bold text-primary">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{patient.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(patient.dob).toLocaleDateString()}
                </span>
                {patient.gender && (
                  <Badge variant="outline" className="capitalize text-xs">{patient.gender}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info cards */}
        <div className="lg:col-span-1 space-y-4">
          {patient.phone && (
            <Card className="border-border/60 bg-card/80">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{patient.phone}</span>
                </div>
              </CardContent>
            </Card>
          )}
          {patient.address && (
            <Card className="border-border/60 bg-card/80">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-foreground">{patient.address}</span>
                </div>
              </CardContent>
            </Card>
          )}
          {patient.allergies && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3 text-sm">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-destructive uppercase tracking-wider mb-1">Allergies</p>
                    <span className="text-foreground">{patient.allergies}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2">
          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Edit Patient Details</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientForm
                action={boundUpdatePatient}
                defaultValues={{
                  name: patient.name,
                  dob: patient.dob,
                  gender: patient.gender ?? undefined,
                  phone: patient.phone ?? undefined,
                  address: patient.address ?? undefined,
                  allergies: patient.allergies ?? undefined,
                }}
                submitLabel="Save Changes"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
