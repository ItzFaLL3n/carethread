import { requireRole } from '@/lib/auth/requireRole'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Users, UserPlus, Clock, Home, Plus, ChevronRight, ArrowRight } from 'lucide-react'

export default async function ReceptionistDashboard() {
  const { supabase, fullName } = await requireRole(['receptionist', 'admin'])

  const { count: patientCount } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })

  const { count: familyCount } = await supabase
    .from('families')
    .select('*', { count: 'exact', head: true })

  const { data: recent } = await supabase
    .from('patients')
    .select('id, name, dob, created_at')
    .order('created_at', { ascending: false })
    .limit(6)

  const firstName = fullName.split(' ')[0]

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#767676] mb-2">
            Front Desk
          </p>
          <h1 className="text-[32px] font-bold text-[#1F1F1F] leading-[40px] tracking-[-0.025em]">
            Welcome, {firstName}
          </h1>
          <p className="text-[15px] text-[#767676] mt-2 leading-[22px]">
            Patient registrations, family units, and intake management.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            asChild
            variant="outline"
            className="rounded-full border-[#E6E6DC] bg-white hover:bg-[#F4F4F4] text-[#1F1F1F] text-[13px] font-semibold px-4 h-10"
          >
            <Link href="/receptionist/families/new" className="flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              New Family
            </Link>
          </Button>
          <Button
            asChild
            className="rounded-full bg-[#1F1F1F] hover:bg-[#333] text-white text-[13px] font-semibold px-4 h-10"
          >
            <Link href="/receptionist/patients/new" className="flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5" />
              Register Patient
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat deck */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Inverted — primary stat */}
        <Card className="border-[#E6E6DC] rounded-2xl bg-[#1F1F1F] shadow-[0_8px_24px_-4px_rgba(31,31,31,0.12)]">
          <CardContent className="pt-6 pb-6 px-6">
            <div className="flex items-start justify-between mb-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#A3A3A3]">Total Patients</p>
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="stat-md text-white mb-1">{patientCount ?? 0}</p>
            <Button asChild variant="ghost" className="mt-2 -ml-1 p-0 h-auto text-[12px] text-[#A3A3A3] hover:text-white gap-1 font-medium">
              <Link href="/receptionist/patients" className="flex items-center gap-1">
                Browse directory <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Family households */}
        <Card className="border-[#E6E6DC] rounded-2xl bg-white hover:shadow-[0_4px_16px_-4px_rgba(31,31,31,0.08)] transition-shadow">
          <CardContent className="pt-6 pb-6 px-6">
            <div className="flex items-start justify-between mb-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#767676]">Family Units</p>
              <div className="w-9 h-9 rounded-xl bg-[#F4F4F4] flex items-center justify-center">
                <Home className="w-4 h-4 text-[#1F1F1F]" />
              </div>
            </div>
            <p className="stat-md text-[#1F1F1F] mb-1">{familyCount ?? 0}</p>
            <Button asChild variant="ghost" className="mt-2 -ml-1 p-0 h-auto text-[12px] text-[#767676] hover:text-[#1F1F1F] gap-1 font-medium">
              <Link href="/receptionist/families" className="flex items-center gap-1">
                Manage families <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick actions card */}
        <Card className="border-[#E6E6DC] rounded-2xl bg-[#EDEDE5]">
          <CardContent className="pt-6 pb-6 px-6">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#767676] mb-1">Quick Intake</p>
            <p className="text-[15px] font-semibold text-[#1F1F1F] mb-5">Enrollment actions</p>
            <div className="space-y-2">
              <Button asChild size="sm" className="w-full rounded-full bg-[#1F1F1F] hover:bg-[#333] text-white text-[12px] font-semibold h-9">
                <Link href="/receptionist/patients/new">Add Patient</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="w-full rounded-full border-[#C4C7C7] bg-white hover:bg-[#F4F4F4] text-[#1F1F1F] text-[12px] font-semibold h-9">
                <Link href="/receptionist/families/new">Add Family</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent registrations */}
      <Card className="border-[#E6E6DC] rounded-2xl bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E6E6DC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1F1F1F]" />
            <span className="text-[15px] font-semibold text-[#1F1F1F]">Recently Registered Patients</span>
          </div>
          <Button asChild variant="ghost" className="text-[12px] text-[#767676] hover:text-[#1F1F1F] h-8 px-3 rounded-full">
            <Link href="/receptionist/patients">View All</Link>
          </Button>
        </div>

        {recent && recent.length > 0 ? (
          <div className="divide-y divide-[#E6E6DC]">
            {recent.map((p) => (
              <div
                key={p.id}
                className="px-6 py-3.5 flex items-center justify-between hover:bg-[#F6F7ED] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1F1F1F] flex items-center justify-center text-[12px] font-bold text-white shrink-0">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <Link
                      href={`/receptionist/patients/${p.id}`}
                      className="text-[14px] font-semibold text-[#1F1F1F] hover:text-[#474746] transition-colors flex items-center gap-1"
                    >
                      {p.name}
                      <ChevronRight className="w-3.5 h-3.5 text-[#A3A3A3] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                    <p className="text-[12px] text-[#767676]">DOB: {p.dob}</p>
                  </div>
                </div>
                <Badge className="bg-[#EDEDE5] text-[#5D5F58] border-0 text-[11px] font-semibold px-3 py-1 rounded-full">
                  {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F4F4F4] flex items-center justify-center mx-auto mb-3">
              <Users className="w-5 h-5 text-[#A3A3A3]" />
            </div>
            <p className="text-[14px] text-[#767676]">No patients registered yet.</p>
          </div>
        )}
      </Card>
    </div>
  )
}
