'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Shield,
  ShieldCheck,
  User,
  XCircle,
  Building2,
  Stethoscope,
  Pill,
  FlaskConical,
  Phone,
  MapPin,
} from 'lucide-react'
import { DemoUser } from '@/lib/demo/demoData'

interface AdminApprovalsManagerProps {
  initialUsers: DemoUser[]
}

export function AdminApprovalsManager({ initialUsers }: AdminApprovalsManagerProps) {
  const [users, setUsers] = useState<DemoUser[]>(initialUsers)
  const [filter, setFilter] = useState<'pending' | 'staff' | 'all'>('pending')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [feedback, setFeedback] = useState<{ id: string; msg: string; type: 'success' | 'error' } | null>(null)

  // Fetch live users from the API so newly registered users show without a page reload
  const fetchUsers = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/admin/approvals', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } finally {
      setRefreshing(false)
    }
  }, [])

  // Refresh on mount to pick up any registrations that happened before admin opened the page
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const pendingUsers = users.filter((u) => u.approval_status === 'pending')

  const filtered = users.filter((u) => {
    if (filter === 'pending') return u.approval_status === 'pending'
    if (filter === 'staff') return u.role !== 'patient'
    return true
  })

  async function handleApprove(userId: string) {
    setLoadingId(userId)
    setFeedback(null)

    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: 'approved' }),
      })

      const data = await res.json()
      if (res.ok) {
        setFeedback({ id: userId, msg: 'Registration approved & credentials activated!', type: 'success' })
        // Re-fetch to get definitive server state
        await fetchUsers()
      } else {
        setFeedback({ id: userId, msg: data.error || 'Failed to approve', type: 'error' })
      }
    } catch {
      setFeedback({ id: userId, msg: 'Error approving registration', type: 'error' })
    } finally {
      setLoadingId(null)
    }
  }

  async function handleReject(userId: string) {
    setLoadingId(userId)
    setFeedback(null)

    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: 'rejected' }),
      })

      if (res.ok) {
        setFeedback({ id: userId, msg: 'Registration rejected.', type: 'success' })
        await fetchUsers()
      }
    } catch {
      setFeedback({ id: userId, msg: 'Error rejecting registration', type: 'error' })
    } finally {
      setLoadingId(null)
    }
  }

  const roleIcons: Record<string, React.ReactNode> = {
    admin: <Building2 className="w-4 h-4 text-white" />,
    doctor: <Stethoscope className="w-4 h-4 text-white" />,
    nurse: <Shield className="w-4 h-4 text-white" />,
    receptionist: <User className="w-4 h-4 text-white" />,
    pharmacist: <Pill className="w-4 h-4 text-white" />,
    lab_technician: <FlaskConical className="w-4 h-4 text-white" />,
    patient: <User className="w-4 h-4 text-white" />,
  }

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-bold text-[#1F1F1F]">Automated Registration Approvals</h2>
            {pendingUsers.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                {pendingUsers.length} Pending Acceptance
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#767676] mt-0.5">
            Admin verification queue for newly registered staff credentials & patients.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Refresh button */}
          <Button
            size="sm"
            variant="outline"
            onClick={fetchUsers}
            disabled={refreshing}
            className="rounded-full border-[#E6E6DC] bg-white hover:bg-[#F4F4F4] text-[#1F1F1F] h-8 px-3 text-[12px] font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <div className="flex gap-1.5 p-1 bg-[#EDEDE5] rounded-xl border border-[#E6E6DC]">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                filter === 'pending' ? 'bg-white text-[#1F1F1F] shadow-sm' : 'text-[#767676] hover:text-[#1F1F1F]'
              }`}
            >
              Pending ({pendingUsers.length})
            </button>
            <button
              onClick={() => setFilter('staff')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                filter === 'staff' ? 'bg-white text-[#1F1F1F] shadow-sm' : 'text-[#767676] hover:text-[#1F1F1F]'
              }`}
            >
              Staff Accounts
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                filter === 'all' ? 'bg-white text-[#1F1F1F] shadow-sm' : 'text-[#767676] hover:text-[#1F1F1F]'
              }`}
            >
              All Registered ({users.length})
            </button>
          </div>
        </div>
      </div>

      {/* Registrations List */}
      <div className="space-y-4">
        {filtered.map((u) => {
          const isLoading = loadingId === u.id
          const hasFeedback = feedback?.id === u.id

          return (
            <Card
              key={u.id}
              className={`border rounded-2xl bg-white shadow-sm overflow-hidden transition-all ${
                u.approval_status === 'pending' ? 'border-amber-300 ring-1 ring-amber-100' : 'border-[#E6E6DC]'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                  {/* Left: User Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1F1F1F] flex items-center justify-center shrink-0">
                        {roleIcons[u.role] || <User className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[17px] font-bold text-[#1F1F1F] leading-tight">{u.full_name}</h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDEDE5] text-[#5D5F58] capitalize">
                            Role: {u.role.replace(/_/g, ' ')}
                          </span>
                          {u.department && (
                            <span className="text-[11px] text-[#767676]">
                              ({u.department})
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[#767676] mt-0.5">{u.email}</p>
                      </div>
                    </div>

                    {/* Government & Aadhaar Identifiers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pt-2 text-[13px] text-[#5D5F58]">
                      {u.gov_reg_number && (
                        <p className="flex items-center gap-1.5 font-medium">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Gov Reg No:</span>
                          <strong className="text-[#1F1F1F] font-mono">{u.gov_reg_number}</strong>
                        </p>
                      )}
                      <p className="flex items-center gap-1.5">
                        <span className="text-[#767676]">Aadhaar (UIDAI):</span>
                        <strong className="text-[#1F1F1F] font-mono">{u.aadhaar_number}</strong>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#A3A3A3] shrink-0" />
                        <span>Phone: {u.phone}</span>
                      </p>
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#A3A3A3] shrink-0" />
                        <span>{u.address}</span>
                      </p>
                    </div>

                    <p className="text-[11px] text-[#A3A3A3]">
                      Submitted: {new Date(u.created_at).toLocaleString()}
                    </p>
                  </div>

                  {/* Right: Approval Actions */}
                  <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                        u.approval_status === 'approved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : u.approval_status === 'rejected'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-amber-50 text-amber-900 border-amber-300'
                      }`}
                    >
                      {u.approval_status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {u.approval_status === 'pending' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      {u.approval_status === 'rejected' && <XCircle className="w-3.5 h-3.5 text-red-600" />}
                      {u.approval_status === 'pending' ? 'Awaiting Acceptance' : u.approval_status.toUpperCase()}
                    </span>

                    {/* Action buttons if pending */}
                    {u.approval_status === 'pending' && (
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          size="sm"
                          disabled={isLoading}
                          onClick={() => handleApprove(u.id)}
                          className="rounded-full bg-[#1F1F1F] hover:bg-[#333] text-white text-[12px] font-semibold h-8 px-4"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            '✓ Approve & Activate'
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isLoading}
                          onClick={() => handleReject(u.id)}
                          className="rounded-full text-[12px] h-8 text-[#BA1A1A] border-red-200 hover:bg-red-50"
                        >
                          Decline
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
            No registrations in this category. All current applications are processed.
          </div>
        )}
      </div>
    </div>
  )
}
