import { requireRole } from '@/lib/auth/requireRole'
import { getAllUsers } from '@/lib/demo/store'
import { AdminApprovalsManager } from '@/components/AdminApprovalsManager'

export default async function AdminApprovalsPage() {
  await requireRole(['admin'])
  const users = getAllUsers()

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in-up space-y-6">
      <AdminApprovalsManager initialUsers={users} />
    </div>
  )
}
