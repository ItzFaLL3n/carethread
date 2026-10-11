'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Calendar,
  CheckCircle2,
  Clock,
  HeartPulse,
  Loader2,
  User,
  XCircle,
  AlertCircle,
  FileText,
  Phone,
} from 'lucide-react'
import { DemoAppointment } from '@/lib/demo/demoData'

interface DoctorAppointmentsManagerProps {
  initialAppointments: DemoAppointment[]
  doctorId: string
  doctorName: string
}

export function DoctorAppointmentsManager({
  initialAppointments,
  doctorId,
  doctorName,
}: DoctorAppointmentsManagerProps) {
  const [appointments, setAppointments] = useState<DemoAppointment[]>(initialAppointments)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all')
  const [activeNotes, setActiveNotes] = useState<Record<string, string>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ id: string; msg: string; type: 'success' | 'error' } | null>(null)

  const pendingCount = appointments.filter((a) => a.status === 'pending').length
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length

  const filtered = appointments.filter((a) => {
    if (filter === 'all') return true
    return a.status === filter
  })

  async function handleAccept(appointmentId: string) {
    setActionLoading(appointmentId)
    setFeedback(null)
    const customNote = activeNotes[appointmentId] || 'Appointment confirmed. Please arrive 10 minutes early.'

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept',
          appointment_id: appointmentId,
          doctor_notes: customNote,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === appointmentId ? { ...a, status: 'confirmed', doctor_notes: customNote } : a))
        )
        setFeedback({
          id: appointmentId,
          msg: 'Appointment confirmed! Patient has been notified on their portal.',
          type: 'success',
        })
      } else {
        setFeedback({ id: appointmentId, msg: data.error || 'Failed to accept', type: 'error' })
      }
    } catch {
      setFeedback({ id: appointmentId, msg: 'Error updating appointment status', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  async function handleUpdateStatus(appointmentId: string, status: 'completed' | 'rejected') {
    setActionLoading(appointmentId)
    setFeedback(null)

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-status',
          appointment_id: appointmentId,
          status,
        }),
      })

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === appointmentId ? { ...a, status } : a))
        )
        setFeedback({
          id: appointmentId,
          msg: status === 'completed' ? 'Marked as completed.' : 'Appointment declined.',
          type: 'success',
        })
      }
    } catch {
      setFeedback({ id: appointmentId, msg: 'Error updating status', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-5" id="appointments">
      {/* Header and Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-bold text-[#1F1F1F]">Patient Appointments Queue</h2>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                {pendingCount} Pending Acceptance
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#767676] mt-0.5">
            Review appointments requested by patients. Accept and add clinical preparation instructions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 p-1 bg-[#EDEDE5] rounded-xl border border-[#E6E6DC] shrink-0">
          {(['all', 'pending', 'confirmed', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all ${
                filter === tab ? 'bg-white text-[#1F1F1F] shadow-sm' : 'text-[#767676] hover:text-[#1F1F1F]'
              }`}
            >
              {tab === 'all' ? `All (${appointments.length})` : tab === 'pending' ? `Pending (${pendingCount})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filtered.map((apt) => {
          const isLoading = actionLoading === apt.id
          const hasFeedback = feedback?.id === apt.id

          return (
            <Card
              key={apt.id}
              className={`border rounded-2xl bg-white shadow-sm transition-all overflow-hidden ${
                apt.status === 'pending' ? 'border-amber-300 ring-1 ring-amber-100' : 'border-[#E6E6DC]'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Patient Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#1F1F1F] text-white flex items-center justify-center text-[13px] font-bold">
                        {apt.patient_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-[16px] font-bold text-[#1F1F1F] leading-tight">{apt.patient_name}</h3>
                        <p className="text-[12px] text-[#767676] flex items-center gap-2 mt-0.5">
                          <Phone className="w-3 h-3 text-[#A3A3A3]" />
                          {apt.patient_phone}
                          <span>•</span>
                          <span>Dept: {apt.department}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#5D5F58] pt-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#1F1F1F]" />
                        {apt.appointment_date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#1F1F1F]" />
                        {apt.appointment_time}
                      </span>
                    </div>

                    <div className="p-3 bg-[#F6F7ED] rounded-xl text-[13px] text-[#1F1F1F] mt-2">
                      <span className="font-semibold text-[#767676] text-[11px] uppercase tracking-wider block mb-0.5">
                        Patient Reported Symptoms / Chief Complaint:
                      </span>
                      <p className="italic font-medium">&quot;{apt.symptoms}&quot;</p>
                    </div>

                    {apt.doctor_notes && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[12px] text-emerald-900 mt-2">
                        <span className="font-semibold">Confirmed Instructions: </span>
                        {apt.doctor_notes}
                      </div>
                    )}
                  </div>

                  {/* Status & Doctor Action Buttons */}
                  <div className="flex flex-col items-start md:items-end gap-3 shrink-0 min-w-[220px]">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                        apt.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : apt.status === 'completed'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : apt.status === 'rejected'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-amber-50 text-amber-900 border-amber-300'
                      }`}
                    >
                      {apt.status === 'confirmed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {apt.status === 'pending' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      {apt.status === 'pending' ? 'Requires Acceptance' : apt.status.toUpperCase()}
                    </span>

                    {/* Pending Acceptance Action Form */}
                    {apt.status === 'pending' && (
                      <div className="w-full space-y-2 mt-1">
                        <Input
                          placeholder="Optional prep note (e.g. Bring fasting ECG)…"
                          value={activeNotes[apt.id] || ''}
                          onChange={(e) => setActiveNotes({ ...activeNotes, [apt.id]: e.target.value })}
                          className="h-8 text-[12px] bg-[#F6F7ED] rounded-lg"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={isLoading}
                            onClick={() => handleAccept(apt.id)}
                            className="flex-1 rounded-full bg-[#1F1F1F] hover:bg-[#333] text-white text-[12px] font-semibold h-8"
                          >
                            {isLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              '✓ Accept Appointment'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isLoading}
                            onClick={() => handleUpdateStatus(apt.id, 'rejected')}
                            className="rounded-full text-[12px] h-8 text-[#BA1A1A] border-red-200 hover:bg-red-50"
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Confirmed actions */}
                    {apt.status === 'confirmed' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={isLoading}
                          onClick={() => handleUpdateStatus(apt.id, 'completed')}
                          variant="outline"
                          className="rounded-full text-[12px] h-8 border-[#E6E6DC] text-[#1F1F1F]"
                        >
                          Mark Completed
                        </Button>
                      </div>
                    )}

                    {hasFeedback && (
                      <p
                        className={`text-[11px] font-medium ${
                          feedback?.type === 'success' ? 'text-emerald-700' : 'text-[#BA1A1A]'
                        }`}
                      >
                        {feedback?.msg}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filtered.length === 0 && (
          <div className="p-10 text-center bg-white rounded-2xl border border-[#E6E6DC] text-[#767676]">
            No appointments found in this view.
          </div>
        )}
      </div>
    </div>
  )
}
