import { requireRole } from '@/lib/auth/requireRole'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Users, Activity, Clock, ShieldCheck, UserCheck } from 'lucide-react'
import { getAllUsers, getAllPatients } from '@/lib/demo/store'
import { AdminApprovalsManager } from '@/components/AdminApprovalsManager'

export default async function AdminDashboard() {
  await requireRole(['admin'])

  const users = getAllUsers()
  const patients = getAllPatients()

  const pendingCount = users.filter((u) => u.approval_status === 'pending').length
  const staffCount = users.filter((u) => u.role !== 'patient').length

  const stats = [
    {
      label: 'Pending Registrations',
      value: pendingCount,
      icon: Clock,
      sub: 'Awaiting admin acceptance',
      inverted: pendingCount > 0,
      highlightColor: pendingCount > 0 ? 'text-amber-400' : 'text-emerald-400',
    },
    {
      label: 'Total Staff Accounts',
      value: staffCount,
      icon: Shield,
      sub: 'Doctors, Nurses, Pharmacists, Lab Techs',
      inverted: false,
    },
    {
      label: 'Registered Patients',
      value: patients.length,
      icon: Users,
      sub: 'Aadhaar-verified hospital profiles',
      inverted: false,
    },
    {
      label: 'Security & Compliance',
      value: 'Online',
      icon: Activity,
      sub: 'ABDM & Medical Council Integrated',
      inverted: false,
      isText: true,
    },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in-up space-y-10">
      {/* Page header */}
      <div className="border-b border-[#E6E6DC] pb-6">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#767676]">
            Hospital Central Administration
          </p>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Automated Intake Enabled
          </span>
        </div>
        <h1 className="text-[32px] font-bold text-[#1F1F1F] leading-[40px] tracking-[-0.025em]">
          System Administration & Approvals
        </h1>
        <p className="text-[15px] text-[#767676] mt-1.5 leading-[22px]">
          Review incoming staff credentials (with Gov Reg numbers) and patient registrations. One-click activate accounts.
        </p>
      </div>

      {/* Stat deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card
              key={s.label}
              className={`border-[#E6E6DC] rounded-2xl transition-all duration-200 ${
                s.inverted
                  ? 'bg-[#1F1F1F] text-white shadow-[0_8px_24px_-4px_rgba(31,31,31,0.12)]'
                  : 'bg-white hover:shadow-[0_4px_16px_-4px_rgba(31,31,31,0.08)]'
              }`}
            >
              <CardContent className="pt-6 pb-6 px-6">
                <div className="flex items-start justify-between mb-3">
                  <p className={`text-[12px] font-semibold uppercase tracking-[0.06em] ${s.inverted ? 'text-[#A3A3A3]' : 'text-[#767676]'}`}>
                    {s.label}
                  </p>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.inverted ? 'bg-white/10' : 'bg-[#F4F4F4]'}`}>
                    <Icon className={`w-4 h-4 ${s.inverted ? 'text-white' : 'text-[#1F1F1F]'}`} />
                  </div>
                </div>
                <p className={`stat-md mb-1 ${s.inverted ? 'text-white' : 'text-[#1F1F1F]'}`}>
                  {s.isText ? (
                    <span className="flex items-center gap-2 text-[22px]">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      {s.value}
                    </span>
                  ) : (
                    s.value
                  )}
                </p>
                <p className={`text-[12px] ${s.inverted ? 'text-[#A3A3A3]' : 'text-[#767676]'}`}>{s.sub}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Approvals Manager Component */}
      <AdminApprovalsManager initialUsers={users} />
    </div>
  )
}
