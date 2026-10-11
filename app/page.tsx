import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Root route: redirect authenticated users to their dashboard,
 * everyone else to /login.
 */
export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const dashboardMap: Record<string, string> = {
    admin: '/admin',
    receptionist: '/receptionist',
    doctor: '/doctor',
    nurse: '/nurse',
    patient: '/patient',
    pharmacist: '/pharmacist',
    lab_technician: '/lab-technician',
  }

  redirect(dashboardMap[profile?.role ?? ''] ?? '/forbidden')
}
