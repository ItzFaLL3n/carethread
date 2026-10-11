import { NextResponse } from 'next/server'
import { getFamilyMembers, addFamilyMember } from '@/lib/demo/store'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get('patientId') || 'pat-emma-1'
  return NextResponse.json({ members: getFamilyMembers(patientId) })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { patient_id, name, relationship, dob, phone, conditions, notes } = body

    if (!name || !relationship) {
      return NextResponse.json({ error: 'Name and relationship are required.' }, { status: 400 })
    }

    const member = addFamilyMember({
      patient_id: patient_id || 'pat-emma-1',
      name,
      relationship,
      dob: dob || '1990-01-01',
      phone,
      conditions: Array.isArray(conditions) ? conditions : conditions ? [conditions] : [],
      notes,
    })

    return NextResponse.json({
      success: true,
      message: 'Family member and medical history recorded successfully.',
      member,
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 })
  }
}
