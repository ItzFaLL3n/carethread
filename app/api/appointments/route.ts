import { NextResponse } from 'next/server'
import {
  getAllAppointments,
  getAppointmentsForDoctor,
  getAppointmentsForPatient,
  createAppointment,
  updateAppointmentStatus,
} from '@/lib/demo/store'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const doctorId = searchParams.get('doctorId')
  const patientId = searchParams.get('patientId')

  if (doctorId) {
    return NextResponse.json({ appointments: getAppointmentsForDoctor(doctorId) })
  }
  if (patientId) {
    return NextResponse.json({ appointments: getAppointmentsForPatient(patientId) })
  }
  return NextResponse.json({ appointments: getAllAppointments() })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action } = body

    if (action === 'create') {
      const {
        patient_id,
        patient_name,
        patient_phone,
        doctor_id,
        doctor_name,
        department,
        appointment_date,
        appointment_time,
        symptoms,
      } = body

      if (!patient_name || !department || !appointment_date || !appointment_time || !symptoms) {
        return NextResponse.json({ error: 'Please fill in all appointment details.' }, { status: 400 })
      }

      const appointment = createAppointment({
        patient_id: patient_id || 'pat-emma-1',
        patient_name: patient_name || 'Patient',
        patient_phone: patient_phone || '+91 98401 22341',
        doctor_id: doctor_id || 'user-doc-1',
        doctor_name: doctor_name || 'Dr. Senthil Nathan',
        department,
        appointment_date,
        appointment_time,
        symptoms,
      })

      return NextResponse.json({
        success: true,
        message: 'Appointment booked successfully! It is pending doctor confirmation.',
        appointment,
      })
    }

    if (action === 'accept' || action === 'confirm') {
      const { appointment_id, doctor_notes } = body
      if (!appointment_id) {
        return NextResponse.json({ error: 'Missing appointment_id' }, { status: 400 })
      }

      const updated = updateAppointmentStatus(
        appointment_id,
        'confirmed',
        doctor_notes || 'Confirmed by attending physician. Please arrive 10 minutes prior.'
      )

      return NextResponse.json({
        success: true,
        message: 'Appointment accepted and confirmed for patient.',
        appointment: updated,
      })
    }

    if (action === 'update-status') {
      const { appointment_id, status, notes } = body
      const updated = updateAppointmentStatus(appointment_id, status, notes)
      return NextResponse.json({ success: true, appointment: updated })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 })
  }
}
