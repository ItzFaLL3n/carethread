import { requireRole } from '@/lib/auth/requireRole'
import { Sidebar } from '@/components/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // This layout covers all authenticated app routes.
  // Each child page calls requireRole() with its own allowed list.
  // Here we just ensure the session is valid and get user data for the shell.
  const allRoles = ['admin', 'receptionist', 'doctor', 'nurse', 'patient', 'pharmacist', 'lab_technician'] as const
  const { role, fullName } = await requireRole([...allRoles])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar role={role} fullName={fullName} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
