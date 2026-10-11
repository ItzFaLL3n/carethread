import 'server-only'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

import type { User } from '@supabase/supabase-js'

export type Role = 'admin' | 'receptionist' | 'doctor' | 'nurse' | 'patient' | 'pharmacist' | 'lab_technician'

/**
 * Call at the top of every protected page, layout or server action.
 * Supports active session cookie with Supabase fallback.
 */
export async function requireRole(allowed: Role[]) {
  const cookieStore = await cookies()
  const activeUserCookie = cookieStore.get('carethread_active_user')?.value
  const supabase = await createClient()

  if (activeUserCookie) {
    try {
      const activeUser = JSON.parse(decodeURIComponent(activeUserCookie))
      if (!allowed.includes(activeUser.role as Role)) {
        redirect('/forbidden')
      }
      return {
        supabase,
        user: { id: activeUser.id, email: activeUser.email } as unknown as User,
        role: activeUser.role as Role,
        fullName: (activeUser.full_name || activeUser.fullName || 'User') as string,
      }
    } catch {
      // Fallback to Supabase auth
    }
  }

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Supabase unreachable or placeholder
  }

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || !allowed.includes(profile.role as Role)) {
    redirect('/forbidden')
  }

  return { supabase, user: user as User, role: profile.role as Role, fullName: profile.full_name }
}
