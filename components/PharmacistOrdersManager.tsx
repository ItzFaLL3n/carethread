'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  Pill,
  Truck,
  MapPin,
  Phone,
  User,
} from 'lucide-react'
import { DemoMedicineOrder } from '@/lib/demo/demoData'

interface PharmacistOrdersManagerProps {
  initialOrders: DemoMedicineOrder[]
}

export function PharmacistOrdersManager({ initialOrders }: PharmacistOrdersManagerProps) {
  const [orders, setOrders] = useState<DemoMedicineOrder[]>(initialOrders)
  const [filter, setFilter] = useState<'all' | 'pending' | 'dispensed' | 'delivered'>('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})

  const filtered = orders.filter((o) => {
    if (filter === 'all') return true
    if (filter === 'pending') return o.status === 'order_placed' || o.status === 'confirmed'
    if (filter === 'dispensed') return o.status === 'dispensed' || o.status === 'out_for_delivery'
    if (filter === 'delivered') return o.status === 'delivered'
    return true
  })

  async function updateStatus(orderId: string, status: DemoMedicineOrder['status']) {
    setLoadingId(orderId)
    const pharmacistNote = notes[orderId] || `Status updated to ${status} by pharmacist Priya Sharma (PCI-2019-10822).`

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-status',
          order_id: orderId,
          status,
          notes: pharmacistNote,
        }),
      })

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status, pharmacist_notes: pharmacistNote } : o
          )
        )
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#1F1F1F]">Online Medicine Orders Fulfillment Queue</h2>
          <p className="text-[13px] text-[#767676] mt-0.5">
            Verify prescriptions, pack dosages, and dispatch medications ordered by patients.
          </p>
        </div>

        <div className="flex gap-1.5 p-1 bg-[#EDEDE5] rounded-xl border border-[#E6E6DC] shrink-0">
          {(['all', 'pending', 'dispensed', 'delivered'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all ${
                filter === tab ? 'bg-white text-[#1F1F1F] shadow-sm' : 'text-[#767676] hover:text-[#1F1F1F]'
              }`}
            >
              {tab === 'all' ? `All Orders (${orders.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((order) => {
          const isLoading = loadingId === order.id

          return (
            <Card key={order.id} className="border-[#E6E6DC] rounded-2xl bg-white shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Left Details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1F1F1F] text-white flex items-center justify-center">
                        <Pill className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[16px] font-bold text-[#1F1F1F] leading-tight">
                            {order.patient_name}
                          </h3>
                          <span className="font-mono text-[11px] text-[#767676]">#{order.id}</span>
                        </div>
                        <p className="text-[12px] text-[#767676] flex items-center gap-2 mt-0.5">
                          <Phone className="w-3 h-3 text-[#A3A3A3]" />
                          {order.phone}
                          <span>•</span>
                          <span>Ordered: {new Date(order.created_at).toLocaleString()}</span>
                        </p>
                      </div>
                    </div>

                    {/* Prescribed Items */}
                    <div className="p-3 bg-[#F6F7ED] rounded-xl border border-[#E6E6DC] space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#767676]">
                        Prescribed Medication Items:
                      </p>
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[13px] text-[#1F1F1F]">
                          <span className="font-medium">
                            • {item.drug} ({item.dose}) × {item.quantity} units ({item.days || 30} days)
                          </span>
                          <span className="font-bold">₹{item.price}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-[#E6E6DC] flex justify-between text-[13px] font-bold text-[#1F1F1F]">
                        <span>Total Billing:</span>
                        <span>₹{order.total_amount}</span>
                      </div>
                    </div>

                    <div className="text-[12px] text-[#5D5F58] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#A3A3A3] shrink-0" />
                      <span>Delivery Address: {order.delivery_address}</span>
                    </div>

                    {order.pharmacist_notes && (
                      <p className="text-[12px] bg-emerald-50 text-emerald-900 border border-emerald-100 p-2 rounded-lg italic">
                        Notes: {order.pharmacist_notes}
                      </p>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col items-start lg:items-end gap-3 shrink-0 min-w-[220px]">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold capitalize border ${
                        order.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : order.status === 'out_for_delivery'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : order.status === 'dispensed'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-amber-50 text-amber-900 border-amber-300'
                      }`}
                    >
                      {order.status === 'delivered' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {order.status === 'out_for_delivery' && <Truck className="w-3.5 h-3.5 text-blue-600" />}
                      {order.status.replace(/_/g, ' ')}
                    </span>

                    {/* Progress action buttons */}
                    <div className="w-full space-y-2 mt-2">
                      {order.status === 'order_placed' && (
                        <Button
                          size="sm"
                          disabled={isLoading}
                          onClick={() => updateStatus(order.id, 'confirmed')}
                          className="w-full rounded-full bg-[#1F1F1F] hover:bg-[#333] text-white text-[12px] font-semibold h-8"
                        >
                          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '✓ Verify Prescription'}
                        </Button>
                      )}

                      {order.status === 'confirmed' && (
                        <Button
                          size="sm"
                          disabled={isLoading}
                          onClick={() => updateStatus(order.id, 'dispensed')}
                          className="w-full rounded-full bg-[#1F1F1F] hover:bg-[#333] text-white text-[12px] font-semibold h-8"
                        >
                          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '💊 Dispense & Pack'}
                        </Button>
                      )}

                      {order.status === 'dispensed' && (
                        <Button
                          size="sm"
                          disabled={isLoading}
                          onClick={() => updateStatus(order.id, 'out_for_delivery')}
                          className="w-full rounded-full bg-blue-700 hover:bg-blue-800 text-white text-[12px] font-semibold h-8"
                        >
                          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '🚚 Out for Delivery'}
                        </Button>
                      )}

                      {order.status === 'out_for_delivery' && (
                        <Button
                          size="sm"
                          disabled={isLoading}
                          onClick={() => updateStatus(order.id, 'delivered')}
                          className="w-full rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-[12px] font-semibold h-8"
                        >
                          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '✓ Mark Delivered'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filtered.length === 0 && (
          <div className="p-10 text-center bg-white rounded-2xl border border-[#E6E6DC] text-[#767676]">
            No medicine orders in this queue.
          </div>
        )}
      </div>
    </div>
  )
}
