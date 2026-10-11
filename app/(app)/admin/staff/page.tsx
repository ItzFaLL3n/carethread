import { requireRole } from '@/lib/auth/requireRole'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'

const roleColors: Record<string, string> = {
  admin: 'bg-destructive/20 text-destructive border-destructive/30',
  receptionist: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  doctor: 'bg-primary/20 text-primary border-primary/30',
  nurse: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  pharmacist: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
  lab_technician: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
}

export default async function StaffListPage() {
  const { supabase } = await requireRole(['admin'])

  const { data: staff } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .neq('role', 'patient')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Accounts</h1>
          <p className="text-muted-foreground text-sm mt-1">{staff?.length ?? 0} staff members</p>
        </div>
        <Button asChild>
          <Link href="/admin/staff/new">
            <UserPlus className="w-4 h-4 mr-2" />
            New Staff Account
          </Link>
        </Button>
      </div>

      <Card className="border-border/60 bg-card/80">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/60">
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {staff?.map((member) => (
                <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary">
                        {member.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-foreground">{member.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${roleColors[member.role] ?? 'bg-muted text-muted-foreground'}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(member.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!staff || staff.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-muted-foreground text-sm">
                    No staff accounts yet. Create one to get started.
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
