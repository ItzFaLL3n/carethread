import { requireRole } from '@/lib/auth/requireRole'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Home, Plus, Search, ChevronRight, Phone, MapPin, Users } from 'lucide-react'

interface Props {
  searchParams: Promise<{ q?: string }>
}

interface RawFamilyWithMembers {
  id: string
  name: string
  address: string | null
  phone: string | null
  created_at: string
  family_members: {
    id: string
    removed_at: string | null
  }[] | null
}

export default async function FamiliesPage({ searchParams }: Props) {
  const { q } = await searchParams
  const { supabase } = await requireRole(['receptionist', 'admin'])

  let query = supabase
    .from('families')
    .select('id, name, address, phone, created_at, family_members (id, removed_at)')
    .order('name', { ascending: true })

  if (q && q.trim()) {
    query = query.ilike('name', `%${q.trim()}%`)
  }

  const { data: rawFamilies } = await query

  const typedFamilies = (rawFamilies || []) as unknown as RawFamilyWithMembers[]
  const families = typedFamilies.map((f) => ({
    id: f.id,
    name: f.name,
    address: f.address,
    phone: f.phone,
    created_at: f.created_at,
    activeMembersCount: (f.family_members || []).filter((m) => !m.removed_at).length,
  }))

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Family Households</h1>
          <p className="text-sm text-muted-foreground">
            Manage household units, link family members, and assign emergency contacts.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/receptionist/families/new">
            <Plus className="w-4 h-4" />
            Create Family Unit
          </Link>
        </Button>
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
                placeholder="Search families by surname or household name…"
                className="pl-9 bg-background"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
            {q && (
              <Button variant="ghost" asChild>
                <Link href="/receptionist/families">Clear</Link>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Families List */}
      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-3.5 text-left font-medium">Family / Household</th>
                <th className="px-6 py-3.5 text-left font-medium">Contact Phone</th>
                <th className="px-6 py-3.5 text-left font-medium">Address</th>
                <th className="px-6 py-3.5 text-left font-medium">Members</th>
                <th className="px-6 py-3.5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {families.map((fam) => (
                <tr
                  key={fam.id}
                  className="hover:bg-muted/30 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/receptionist/families/${fam.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        <Home className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {fam.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {fam.phone ? (
                      <span className="flex items-center gap-1.5 text-xs">
                        <Phone className="w-3.5 h-3.5" />
                        {fam.phone}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {fam.address ? (
                      <span className="flex items-center gap-1.5 text-xs line-clamp-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {fam.address}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded">
                      <Users className="w-3 h-3 text-primary" />
                      {fam.activeMembersCount} {fam.activeMembersCount === 1 ? 'member' : 'members'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" asChild className="gap-1">
                      <Link href={`/receptionist/families/${fam.id}`}>
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}

              {families.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm">
                    {q ? `No families matching "${q}"` : 'No family units registered yet.'}
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
