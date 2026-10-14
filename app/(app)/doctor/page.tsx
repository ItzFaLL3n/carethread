import { requireRole } from '@/lib/auth/requireRole'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, Stethoscope, ChevronRight, Activity, ArrowRight, ShieldCheck, CalendarCheck, Clock } from 'lucide-react'
import { getAllAppointments, findUserById } from '@/lib/demo/store'
import { DoctorAppointmentsManager } from '@/components/DoctorAppointmentsManager'

export default async function DoctorDashboard() {
  const { supabase, fullName, user } = await requireRole(['doctor', 'admin'])

  // Fetch count and recent visits from Supabase or defaults
  let patientCount = 10
  let recentVisits: Array<{ id: string; patient_id: string; visit_date: string; diagnosis: string; symptoms: string | null; patients: { name: string } | null }> = []

  try {
    const { count } = await supabase.from('patients').select('*', { count: 'exact', head: true })
    if (count !== null) patientCount = count

    const { data } = await supabase
      .from('visits')
      .select('id, patient_id, visit_date, diagnosis, symptoms, patients (name)')
      .eq('doctor_id', user.id)
      .order('visit_date', { ascending: false })
      .limit(6)
    if (data) recentVisits = data as typeof recentVisits
  } catch {
    // Demo fallback
  }

  // Fetch appointments for this doctor
  const appointments = getAllAppointments()
  const pendingCount = appointments.filter((a) => a.status === 'pending').length
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length

  const doctorProfile = findUserById(user.id) || {
    id: user.id,
    full_name: fullName,
    role: 'doctor',
    gov_reg_number: 'TMC-2018-847291',
    department: 'Cardiology',
    phone: '+91 98401 00002',
    address: 'Suite 402, Doctors Enclave, Anna Nagar West, Chennai - 600040',
    aadhaar_number: '3456 7890 1234',
    approval_status: 'approved',
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in-up space-y-10">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#E6E6DC]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#767676]">
              Clinical Attending Physician
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Gov Reg: {doctorProfile.gov_reg_number}
            </span>
          </div>
          <h1 className="text-[32px] font-bold text-[#1F1F1F] leading-[40px] tracking-[-0.025em]">
            {doctorProfile.full_name}
          </h1>
          <p className="text-[14px] text-[#767676] mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Specialty: <strong className="text-[#1F1F1F]">{doctorProfile.department}</strong></span>
            <span>•</span>
            <span>Aadhaar: <span className="font-mono">{doctorProfile.aadhaar_number}</span></span>
            <span>•</span>
            <span>Phone: {doctorProfile.phone}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            asChild
            className="rounded-full bg-[#1F1F1F] hover:bg-[#333] text-white text-[13px] font-semibold px-5 h-10"
          >
            <Link href="/doctor/patients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Patient Directory
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Appointments Card */}
        <Card className="border-[#E6E6DC] rounded-2xl bg-[#1F1F1F] text-white shadow-[0_8px_24px_-4px_rgba(31,31,31,0.12)]">
          <CardContent className="pt-6 pb-6 px-6">
            <div className="flex items-start justify-between mb-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#A3A3A3]">
                Appointment Requests
              </p>
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <p className="stat-md text-white mb-1">{pendingCount}</p>
            <p className="text-[12px] text-amber-300 font-medium">Awaiting physician acceptance</p>
          </CardContent>
        </Card>

        {/* Confirmed Appointments Card */}
        <Card className="border-[#E6E6DC] rounded-2xl bg-white hover:shadow-[0_4px_16px_-4px_rgba(31,31,31,0.08)] transition-shadow">
          <CardContent className="pt-6 pb-6 px-6">
            <div className="flex items-start justify-between mb-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#767676]">
                Confirmed Consultations
              </p>
              <div className="w-9 h-9 rounded-xl bg-[#F4F4F4] flex items-center justify-center">
                <CalendarCheck className="w-4 h-4 text-[#1F1F1F]" />
              </div>
            </div>
            <p className="stat-md text-[#1F1F1F] mb-1">{confirmedCount}</p>
            <p className="text-[12px] text-[#767676]">Scheduled with verified patients</p>
          </CardContent>
        </Card>

        {/* Total Patients Card */}
        <Card className="border-[#E6E6DC] rounded-2xl bg-white hover:shadow-[0_4px_16px_-4px_rgba(31,31,31,0.08)] transition-shadow">
          <CardContent className="pt-6 pb-6 px-6">
            <div className="flex items-start justify-between mb-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#767676]">
                Patients in Care Network
              </p>
              <div className="w-9 h-9 rounded-xl bg-[#F4F4F4] flex items-center justify-center">
                <Users className="w-4 h-4 text-[#1F1F1F]" />
              </div>
            </div>
            <p className="stat-md text-[#1F1F1F] mb-1">{patientCount}</p>
            <p className="text-[12px] text-[#767676]">Registered with full medical records</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Section: Interactive Appointment Acceptance Manager */}
      <DoctorAppointmentsManager
        initialAppointments={appointments}
        doctorId={user.id}
        doctorName={doctorProfile.full_name}
      />

      {/* Consultations History */}
      <Card className="border-[#E6E6DC] rounded-2xl bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E6E6DC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#1F1F1F]" />
            <span className="text-[15px] font-semibold text-[#1F1F1F]">Clinical Consultations Log</span>
          </div>
          <Button
            asChild
            variant="ghost"
            className="text-[12px] text-[#767676] hover:text-[#1F1F1F] h-8 px-3 rounded-full"
          >
            <Link href="/doctor/patients" className="flex items-center gap-1">
              All records <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {recentVisits.length > 0 ? (
          <div className="divide-y divide-[#E6E6DC]">
            {recentVisits.map((v) => (
              <div key={v.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#F6F7ED] transition-colors">
                <div>
                  <p className="text-[14px] font-semibold text-[#1F1F1F]">{v.patients?.name ?? 'Unknown patient'}</p>
                  <p className="text-[12px] text-[#767676] mt-0.5">{v.diagnosis ?? 'General consultation'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-[#767676]">{new Date(v.visit_date).toLocaleDateString()}</span>
                  <Button asChild size="sm" variant="outline" className="h-7 text-[11px] rounded-full">
                    <Link href={`/doctor/patients/${v.patient_id}`}>View Chart</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-10 text-center text-[13px] text-[#767676]">
            All consultations up to date. Incoming appointment requests are listed above for review.
          </div>
        )}
      </Card>
    </div>
  )
}
