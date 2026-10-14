import { requireRole } from '@/lib/auth/requireRole'
import { Card, CardContent } from '@/components/ui/card'
import { ShieldCheck, Pill, Package, Truck, CheckCircle2 } from 'lucide-react'
import { getAllMedicineOrders, findUserById } from '@/lib/demo/store'
import { PharmacistOrdersManager } from '@/components/PharmacistOrdersManager'

export default async function PharmacistDashboard() {
  const { user, fullName } = await requireRole(['pharmacist', 'admin'])

  const pharmacistProfile = findUserById(user.id) || {
    id: user.id,
    full_name: fullName,
    role: 'pharmacist',
    gov_reg_number: 'TNPC-2019-10822',
    department: 'Clinical Pharmacy & Dispensing',
    phone: '+91 98401 00005',
    aadhaar_number: '6789 0123 4567',
  }

  const orders = getAllMedicineOrders()
  const pendingOrders = orders.filter((o) => o.status === 'order_placed' || o.status === 'confirmed').length
  const dispensedOrders = orders.filter((o) => o.status === 'dispensed' || o.status === 'out_for_delivery').length
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in-up space-y-10">
      {/* Header */}
      <div className="border-b border-[#E6E6DC] pb-6">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#767676]">
            Hospital Central Dispensary & Pharmacy
          </p>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Gov Reg: {pharmacistProfile.gov_reg_number}
          </span>
        </div>
        <h1 className="text-[32px] font-bold text-[#1F1F1F] leading-[40px] tracking-[-0.025em]">
          {pharmacistProfile.full_name}&apos;s Pharmacy Station
        </h1>
        <p className="text-[14px] text-[#767676] mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>Department: <strong className="text-[#1F1F1F]">{pharmacistProfile.department}</strong></span>
          <span>•</span>
          <span>Aadhaar: <span className="font-mono">{pharmacistProfile.aadhaar_number}</span></span>
        </p>
      </div>

      {/* Stat deck */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E6E6DC] rounded-2xl bg-[#1F1F1F] text-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#A3A3A3]">
                Orders Pending Fulfillment
              </p>
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Pill className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="stat-md text-white mb-1">{pendingOrders}</p>
            <p className="text-[12px] text-amber-300">Requires prescription check & packaging</p>
          </CardContent>
        </Card>

        <Card className="border-[#E6E6DC] rounded-2xl bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#767676]">
                Dispensed & En Route
              </p>
              <div className="w-8 h-8 rounded-xl bg-[#F4F4F4] flex items-center justify-center">
                <Truck className="w-4 h-4 text-[#1F1F1F]" />
              </div>
            </div>
            <p className="stat-md text-[#1F1F1F] mb-1">{dispensedOrders}</p>
            <p className="text-[12px] text-[#767676]">Dispatched via courier</p>
          </CardContent>
        </Card>

        <Card className="border-[#E6E6DC] rounded-2xl bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#767676]">
                Successfully Delivered
              </p>
              <div className="w-8 h-8 rounded-xl bg-[#F4F4F4] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="stat-md text-[#1F1F1F] mb-1">{deliveredOrders}</p>
            <p className="text-[12px] text-[#767676]">Completed patient orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders fulfillment queue */}
      <PharmacistOrdersManager initialOrders={orders} />
    </div>
  )
}
