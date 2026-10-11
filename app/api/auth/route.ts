import { NextResponse } from 'next/server'
import {
  findUserByCredentials,
  registerPatient,
  registerStaff,
  getAllUsers,
} from '@/lib/demo/store'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action } = body

    if (action === 'login') {
      const { identifier, password } = body
      if (!identifier) {
        return NextResponse.json({ error: 'Please enter your email, phone, or Aadhaar number.' }, { status: 400 })
      }

      const user = findUserByCredentials(identifier)
      if (!user) {
        return NextResponse.json({ error: 'No account found matching this identifier.' }, { status: 404 })
      }

      if (user.approval_status === 'pending') {
        return NextResponse.json({
          error: 'Your registration is awaiting Administrator approval. Please check back shortly.',
          pending: true,
        }, { status: 403 })
      }

      if (user.approval_status === 'rejected') {
        return NextResponse.json({
          error: 'Your registration was declined. Please contact the Hospital Administrator.',
        }, { status: 403 })
      }

      const dashboardMap: Record<string, string> = {
        admin: '/admin',
        receptionist: '/receptionist',
        doctor: '/doctor',
        nurse: '/nurse',
        patient: '/patient',
        pharmacist: '/pharmacist',
        lab_technician: '/lab-technician',
      }

      const res = NextResponse.json({
        success: true,
        user,
        redirectUrl: dashboardMap[user.role] ?? '/forbidden',
      })

      // Set session cookie
      res.cookies.set('carethread_active_user', encodeURIComponent(JSON.stringify(user)), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      })

      return res
    }

    if (action === 'demo-login') {
      const { role } = body
      const users = getAllUsers()
      const targetUser = users.find((u) => u.role === role && u.approval_status === 'approved')

      if (!targetUser) {
        return NextResponse.json({ error: `No active account for role: ${role}` }, { status: 404 })
      }

      const dashboardMap: Record<string, string> = {
        admin: '/admin',
        receptionist: '/receptionist',
        doctor: '/doctor',
        nurse: '/nurse',
        patient: '/patient',
        pharmacist: '/pharmacist',
        lab_technician: '/lab-technician',
      }

      const res = NextResponse.json({
        success: true,
        user: targetUser,
        redirectUrl: dashboardMap[targetUser.role] ?? '/forbidden',
      })

      res.cookies.set('carethread_active_user', encodeURIComponent(JSON.stringify(targetUser)), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      })

      return res
    }

    if (action === 'register-patient') {
      const { name, dob, gender, phone, address, aadhaar_number, email, password, allergies } = body
      if (!name || !dob || !phone || !aadhaar_number || !email) {
        return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 })
      }

      // Aadhaar format validation check (must be at least 12 digits)
      const cleanAadhaar = aadhaar_number.replace(/\s+/g, '')
      if (cleanAadhaar.length < 12) {
        return NextResponse.json({ error: 'Aadhaar number must contain 12 numeric digits.' }, { status: 400 })
      }

      const { user, patient } = registerPatient({
        name,
        dob,
        gender: gender || 'other',
        phone,
        address: address || 'CareThread Patient Registry',
        aadhaar_number,
        email,
        password: password || 'Default1234!',
        allergies,
      })

      return NextResponse.json({
        success: true,
        message: 'Patient registered successfully! Your registration is automized and has been submitted for Admin acceptance.',
        user,
        patient,
      })
    }

    if (action === 'register-staff') {
      const { role, full_name, gov_reg_number, department, phone, address, aadhaar_number, email, password } = body
      if (!role || !full_name || !gov_reg_number || !phone || !aadhaar_number || !email) {
        return NextResponse.json({ error: 'Please fill in all required fields including Government Registration Number.' }, { status: 400 })
      }

      const staff = registerStaff({
        role,
        full_name,
        gov_reg_number,
        department: department || 'Clinical Department',
        phone,
        address: address || 'Medical Staff Wing',
        aadhaar_number,
        email,
        password: password || 'Default1234!',
      })

      return NextResponse.json({
        success: true,
        message: `${role.toUpperCase()} registration submitted! Government Registration No. (${gov_reg_number}) verified. Awaiting Admin acceptance.`,
        user: staff,
      })
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  } catch (error: unknown) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 })
  }
}
