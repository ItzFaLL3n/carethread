import { requireRole } from '@/lib/auth/requireRole'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Users, HeartPulse, Pill, ChevronRight, Activity, ArrowRight } from 'lucide-react'

export default async function NurseDashboard() {
  const { supabase, fullName } = await requireRole(['nurse', 'admin'])

  const { count: patientCount } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })

  const { count: activeMedsCount } = await supabase
    .from('medicine_cycles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { data: recentVitals } = await supabase
    .from('vitals')
    .select('id, patient_id, bp_systolic, bp_diastolic, pulse, temp_c, weight_kg, recorded_at, patients (name)')
    .order('recorded_at', { ascending: false })
    .limit(6)

  const firstName = fullName.split(' ')[0]

  type VitalRow = {
    id: string
    patient_id: string
    bp_systolic: number | null
    bp_diastolic: number | null
    pulse: number | null
    temp_c: number | null
    weight_kg: number | null
    recorded_at: string
    patients: { name: string } | null
  }

  const statCards = [
    { label: 'Total Patients', value: patientCount ?? 0, icon: Users, inverted: true, link: '/nurse/patients', linkLabel: 'View Patients' },
    { label: 'Active Prescriptions', value: activeMedsCount ?? 0, icon: Pill, inverted: false, sub: 'Across all records' },
    { label: 'Vitals Logged', value: recentVitals?.length ?? 0, icon: HeartPulse, inverted: false, sub: 'Recent readings' },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#767676] mb-2">
            Nursing Station
          </p>
          <h1 className="text-[32px] font-bold text-[#1F1F1F] leading-[40px] tracking-[-0.025em]">
            {firstName}&apos;s Station
          </h1>
          <p className="text-[15px] text-[#767676] mt-2 leading-[22px]">
            Vital signs monitoring, medication tracking, and nursing rounds.
          </p>
        </div>
        <Button
          asChild
          className="rounded-full bg-[#1F1F1F] hover:bg-[#333] text-white text-[13px] font-semibold px-5 h-10 shrink-0"
        >
          <Link href="/nurse/patients" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Patient Station
          </Link>
        </Button>
      </div>

      {/* Stat deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <Card
              key={s.label}
              className={`border-[#E6E6DC] rounded-2xl transition-all duration-200 ${
                s.inverted
                  ? 'bg-[#1F1F1F] shadow-[0_8px_24px_-4px_rgba(31,31,31,0.12)]'
                  : 'bg-white hover:shadow-[0_4px_16px_-4px_rgba(31,31,31,0.08)]'
              }`}
            >
              <CardContent className="pt-6 pb-6 px-6">
                <div className="flex items-start justify-between mb-4">
                  <p className={`text-[12px] font-semibold uppercase tracking-[0.06em] ${s.inverted ? 'text-[#A3A3A3]' : 'text-[#767676]'}`}>
                    {s.label}
                  </p>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.inverted ? 'bg-white/10' : 'bg-[#F4F4F4]'}`}>
                    <Icon className={`w-4 h-4 ${s.inverted ? 'text-white' : 'text-[#1F1F1F]'}`} />
                  </div>
                </div>
                <p className={`stat-md mb-1 ${s.inverted ? 'text-white' : 'text-[#1F1F1F]'}`}>{s.value}</p>
                {s.link ? (
                  <Button asChild variant="ghost" className="mt-2 -ml-1 p-0 h-auto text-[12px] text-[#A3A3A3] hover:text-white gap-1 font-medium">
                    <Link href={s.link} className="flex items-center gap-1">
                      {s.linkLabel} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                ) : (
                  <p className={`text-[12px] ${s.inverted ? 'text-[#A3A3A3]' : 'text-[#767676]'}`}>{s.sub}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent vitals stream */}
      <Card className="border-[#E6E6DC] rounded-2xl bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E6E6DC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#1F1F1F]" />
            <span className="text-[15px] font-semibold text-[#1F1F1F]">Recent Vital Sign Readings</span>
          </div>
          <Button
            asChild
            variant="ghost"
            className="text-[12px] text-[#767676] hover:text-[#1F1F1F] h-8 px-3 rounded-full"
          >
            <Link href="/nurse/patients">Patient Station</Link>
          </Button>
        </div>

        {recentVitals && recentVitals.length > 0 ? (
          <div className="divide-y divide-[#E6E6DC]">
            {(recentVitals as unknown as VitalRow[]).map((v) => (
              <div
                key={v.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F6F7ED] transition-colors group"
              >
                <div className="space-y-1.5">
                  <Link
                    href={`/nurse/patients/${v.patient_id}`}
                    className="text-[14px] font-semibold text-[#1F1F1F] hover:text-[#474746] transition-colors flex items-center gap-1.5"
                  >
                    {v.patients?.name ?? 'Unknown Patient'}
                    <ChevronRight className="w-3.5 h-3.5 text-[#A3A3A3] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <div className="flex flex-wrap items-center gap-2">
                    {v.bp_systolic && v.bp_diastolic && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#EDEDE5] text-[#5D5F58]">
                        BP {v.bp_systolic}/{v.bp_diastolic}
                      </span>
                    )}
                    {v.pulse && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#EDEDE5] text-[#5D5F58]">
                        ♥ {v.pulse} bpm
                      </span>
                    )}
                    {v.temp_c && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#EDEDE5] text-[#5D5F58]">
                        {v.temp_c}°C
                      </span>
                    )}
                    {v.weight_kg && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#EDEDE5] text-[#5D5F58]">
                        {v.weight_kg} kg
                      </span>
                    )}
                  </div>
                </div>
                <Badge className="bg-[#EDEDE5] text-[#5D5F58] border-0 text-[11px] font-semibold px-3 py-1 rounded-full self-start sm:self-center shrink-0">
                  {new Date(v.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' '}
                  {new Date(v.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F4F4F4] flex items-center justify-center mx-auto mb-3">
              <HeartPulse className="w-5 h-5 text-[#A3A3A3]" />
            </div>
            <p className="text-[14px] text-[#767676]">No vital sign recordings yet.</p>
          </div>
        )}
      </Card>
    </div>
  )
}
