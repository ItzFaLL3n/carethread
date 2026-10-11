import { requireRole } from '@/lib/auth/requireRole'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Search, ChevronRight, Stethoscope, AlertTriangle } from 'lucide-react'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function DoctorPatientsPage({ searchParams }: Props) {
  const { q } = await searchParams
  const { supabase } = await requireRole(['doctor', 'admin'])

  let query = supabase
    .from('patients')
    .select('id, name, dob, gender, phone, allergies, created_at')
    .order('name', { ascending: true })

  if (q && q.trim()) {
    query = query.ilike('name', `%${q.trim()}%`)
  }

  const { data: patients } = await query

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clinical Patient Directory</h1>
          <p className="text-sm text-muted-foreground">
            Search patient records, review clinical charts, and document encounters.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <form method="GET" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={q ?? ''}
                placeholder="Search patient by name…"
                className="pl-9 bg-background"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
            {q && (
              <Button variant="ghost" asChild>
                <Link href="/doctor/patients">Clear</Link>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-3.5 text-left font-medium">Patient</th>
                <th className="px-6 py-3.5 text-left font-medium">DOB / Age</th>
                <th className="px-6 py-3.5 text-left font-medium">Gender</th>
                <th className="px-6 py-3.5 text-left font-medium">Allergies</th>
                <th className="px-6 py-3.5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {patients?.map((patient) => {
                const birthYear = new Date(patient.dob).getFullYear()
                const age = new Date().getFullYear() - birthYear

                return (
                  <tr
                    key={patient.id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/doctor/patients/${patient.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {patient.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {patient.name}
                          </p>
                          {patient.phone && (
                            <p className="text-xs text-muted-foreground">{patient.phone}</p>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {patient.dob}{' '}
                      <span className="text-xs text-muted-foreground/70">({age}y)</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground capitalize">
                      {patient.gender || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {patient.allergies ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          {patient.allergies}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" asChild className="gap-1">
                        <Link href={`/doctor/patients/${patient.id}`}>
                          <Stethoscope className="w-3.5 h-3.5 text-primary" />
                          <span>Open Chart</span>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                )
              })}

              {(!patients || patients.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm">
                    {q ? `No patients matching "${q}"` : 'No patients found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
