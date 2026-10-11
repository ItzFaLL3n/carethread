import { NextResponse } from 'next/server'
import {
  getAllMedicineOrders,
  getOrdersForPatient,
  placeMedicineOrder,
  updateOrderStatus,
} from '@/lib/demo/store'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get('patientId')

  if (patientId) {
    return NextResponse.json({ orders: getOrdersForPatient(patientId) })
  }
  return NextResponse.json({ orders: getAllMedicineOrders() })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action } = body

    if (action === 'create') {
      const { patient_id, patient_name, items, total_amount, delivery_address, phone } = body
      if (!items || items.length === 0 || !delivery_address || !phone) {
        return NextResponse.json({ error: 'Please provide items, address, and contact phone.' }, { status: 400 })
      }

      const order = placeMedicineOrder({
        patient_id: patient_id || 'pat-emma-1',
        patient_name: patient_name || 'Emma Wilson',
        items,
        total_amount: Number(total_amount) || 0,
        delivery_address,
        phone,
      })

      return NextResponse.json({
        success: true,
        message: 'Medicine order placed successfully! Hospital Pharmacy will process and dispense.',
        order,
      })
    }

    if (action === 'update-status') {
      const { order_id, status, notes } = body
      if (!order_id || !status) {
        return NextResponse.json({ error: 'Missing order_id or status' }, { status: 400 })
      }

      const updated = updateOrderStatus(order_id, status, notes)
      return NextResponse.json({ success: true, order: updated })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 })
  }
}
