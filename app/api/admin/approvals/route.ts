import { NextResponse } from 'next/server'
import { getAllUsers, updateApprovalStatus } from '@/lib/demo/store'

export async function GET() {
  const users = getAllUsers()
  return NextResponse.json({ users })
}

export async function POST(req: Request) {
  try {
    const { userId, status } = await req.json()
    if (!userId || !status) {
      return NextResponse.json({ error: 'Missing userId or status' }, { status: 400 })
    }

    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updated = updateApprovalStatus(userId, status)
    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `User ${updated.full_name} (${updated.role}) has been ${status}.`,
      user: updated,
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 })
  }
}
