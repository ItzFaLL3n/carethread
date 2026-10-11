import { requireRole } from '@/lib/auth/requireRole'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { UserPlus, Search } from 'lucide-react'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function PatientsListPage({ searchParams }: Props) {
  const { supabase } = await requireRole(['admin', 'receptionist'])
  const { q } = await searchParams

  let query = supabase
    .from('patients')
    .select('id, name, dob, gender, phone, created_at')
    .order('created_at', { ascending: false })

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  const { data: patients } = await query.limit(50)

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground text-sm mt-1">{patients?.length ?? 0} results</p>
        </div>
        <Button asChild>
          <Link href="/receptionist/patients/new">
            <UserPlus className="w-4 h-4 mr-2" />
            Register Patient
          </Link>
        </Button>
      </div>

      {/* Search */}
      <form method="GET" className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="patient-search"
            name="q"
            defaultValue={q}
            placeholder="Search by name…"
            className="pl-9 bg-input/60"
          />
        </div>
      </form>

      <Card className="border-border/60 bg-card/80">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/60">
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">DOB</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Gender</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Registered</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {patients?.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-foreground">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(p.dob).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground capitalize">{p.gender ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{p.phone ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/receptionist/patients/${p.id}`}>View</Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {(!patients || patients.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-sm">
                    {q ? `No patients matching "${q}"` : 'No patients registered yet.'}
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
