'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  HeartPulse,
  Home,
  Loader2,
  MapPin,
  Pill,
  Plus,
  ShieldCheck,
  Stethoscope,
  Truck,
  User,
  Users,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import {
  AVAILABLE_MEDICINES,
  DEPARTMENTS,
  DemoAppointment,
  DemoFamilyMember,
  DemoMedicineOrder,
  DemoPatient,
  DemoUser,
} from '@/lib/demo/demoData'
import { DoctorChatbot } from '@/components/DoctorChatbot'

interface PatientPortalClientProps {
  currentUser: DemoUser | { id: string; email: string; full_name?: string }
  initialPatient: DemoPatient
  allVisiblePatients: DemoPatient[]
  initialAppointments: DemoAppointment[]
  initialOrders: DemoMedicineOrder[]
  initialFamilyMembers: DemoFamilyMember[]
}

export function PatientPortalClient({
  currentUser,
  initialPatient,
  allVisiblePatients,
  initialAppointments,
  initialOrders,
  initialFamilyMembers,
}: PatientPortalClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'family' | 'orders' | 'appointments' | 'doctor-ai'>('overview')
  const [patient, setPatient] = useState<DemoPatient>(initialPatient)
  const [appointments, setAppointments] = useState<DemoAppointment[]>(initialAppointments)
  const [orders, setOrders] = useState<DemoMedicineOrder[]>(initialOrders)
  const [familyMembers, setFamilyMembers] = useState<DemoFamilyMember[]>(initialFamilyMembers)

  // Booking appointment form state
  const [bookDept, setBookDept] = useState('Cardiology')
  const [bookDoctor, setBookDoctor] = useState('Dr. Carol Chen (MD, MCI-2018-847291)')
  const [bookDate, setBookDate] = useState('2026-10-14')
  const [bookTime, setBookTime] = useState('10:30 AM')
  const [bookSymptoms, setBookSymptoms] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null)

  // Online Medicine Order form state
  const [selectedMeds, setSelectedMeds] = useState<Array<{ drug: string; dose: string; quantity: number; price: number; days: number }>>([
    { drug: 'Atorvastatin', dose: '20mg', quantity: 30, price: 240, days: 30 },
  ])
  const [deliveryAddress, setDeliveryAddress] = useState(patient.address || '42 Lotus Boulevard, Sector 100, Noida, UP')
  const [orderPhone, setOrderPhone] = useState(patient.phone || '+91 98765 01010')
  const [orderingLoading, setOrderingLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null)

  // Add Family Member form state
  const [isAddFamilyOpen, setIsAddFamilyOpen] = useState(false)
  const [famName, setFamName] = useState('')
  const [famRelation, setFamRelation] = useState('Spouse')
  const [famDob, setFamDob] = useState('1985-06-15')
  const [famPhone, setFamPhone] = useState('')
  const [famConditions, setFamConditions] = useState('')
  const [famNotes, setFamNotes] = useState('')
  const [famLoading, setFamLoading] = useState(false)
  const [famSuccess, setFamSuccess] = useState<string | null>(null)

  // Refresh lists periodically or when tabs change
  useEffect(() => {
    async function loadData() {
      try {
        const [aptsRes, ordsRes, famRes] = await Promise.all([
          fetch(`/api/appointments?patientId=${patient.id}`),
          fetch(`/api/orders?patientId=${patient.id}`),
          fetch(`/api/family?patientId=${patient.id}`),
        ])
        if (aptsRes.ok) {
          const aptsData = await aptsRes.json()
          if (aptsData.appointments) setAppointments(aptsData.appointments)
        }
        if (ordsRes.ok) {
          const ordsData = await ordsRes.json()
          if (ordsData.orders) setOrders(ordsData.orders)
        }
        if (famRes.ok) {
          const famData = await famRes.json()
          if (famData.members) setFamilyMembers(famData.members)
        }
      } catch (err) {
        console.warn('Sync error:', err)
      }
    }
    loadData()
  }, [patient.id, activeTab])

  // Handle department pre-fill from Dr. Thread Chatbot
  function handleSelectDepartmentFromBot(dept: string) {
    setBookDept(dept)
    setActiveTab('appointments')
    setBookSymptoms((prev) => prev ? prev : `Referred by Dr. Thread AI for ${dept} symptoms.`)
  }

  // Handle Appointment Submit
  async function handleBookAppointment(e: React.FormEvent) {
    e.preventDefault()
    setBookingLoading(true)
    setBookingSuccess(null)

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          patient_id: patient.id,
          patient_name: patient.name,
          patient_phone: patient.phone,
          doctor_id: 'user-doc-1',
          doctor_name: bookDoctor,
          department: bookDept,
          appointment_date: bookDate,
          appointment_time: bookTime,
          symptoms: bookSymptoms,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setBookingSuccess('Appointment requested! Attending physician will review and accept shortly.')
        setAppointments((prev) => [data.appointment, ...prev])
        setBookSymptoms('')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setBookingLoading(false)
    }
  }

  // Handle Medicine Order Submit
  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault()
    if (selectedMeds.length === 0) return
    setOrderingLoading(true)
    setOrderSuccess(null)

    const total = selectedMeds.reduce((acc, item) => acc + item.price, 0)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          patient_id: patient.id,
          patient_name: patient.name,
          items: selectedMeds,
          total_amount: total,
          delivery_address: deliveryAddress,
          phone: orderPhone,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setOrderSuccess(`Order placed! Reference #${data.order.id}. Pharmacy is packing your medications.`)
        setOrders((prev) => [data.order, ...prev])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setOrderingLoading(false)
    }
  }

  // Handle Adding Family Member
  async function handleAddFamily(e: React.FormEvent) {
    e.preventDefault()
    setFamLoading(true)
    setFamSuccess(null)

    try {
      const conditionsList = famConditions
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)

      const res = await fetch('/api/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patient.id,
          name: famName,
          relationship: famRelation,
          dob: famDob,
          phone: famPhone,
          conditions: conditionsList,
          notes: famNotes,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setFamSuccess(`${famName} has been added to your family medical history.`)
        setFamilyMembers((prev) => [...prev, data.member])
        setFamName('')
        setFamConditions('')
        setFamNotes('')
        setIsAddFamilyOpen(false)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFamLoading(false)
    }
  }

  // Add medicine to cart
  function addMedToCart(med: typeof AVAILABLE_MEDICINES[0]) {
    if (selectedMeds.some((m) => m.drug === med.drug)) return
    setSelectedMeds((prev) => [
      ...prev,
      { drug: med.drug, dose: med.dose, quantity: 30, price: med.price, days: 30 },
    ])
  }

  function removeMedFromCart(drug: string) {
    setSelectedMeds((prev) => prev.filter((m) => m.drug !== drug))
  }

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto animate-fade-in-up">
      {/* Patient Header Card */}
      <div className="bg-[#1F1F1F] rounded-3xl p-6 lg:p-8 text-white mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[22px] font-bold text-white shrink-0">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-[26px] font-bold text-white tracking-tight leading-tight">{patient.name}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Aadhaar Verified
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-white/80">
                  {patient.gender}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[13px] text-[#A3A3A3]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Born {new Date(patient.dob).toLocaleDateString()}
                </span>
                <span className="font-mono text-white/90">
                  UIDAI: {patient.aadhaar_number}
                </span>
                <span>Phone: {patient.phone}</span>
              </div>
              {patient.address && (
                <p className="text-[12px] text-[#767676] mt-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#A3A3A3]" />
                  {patient.address}
                </p>
              )}
            </div>
          </div>

          {/* Dependent Switcher */}
          {allVisiblePatients.length > 1 && (
            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl shrink-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A3A3A3] mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-white" />
                Family Records
              </p>
              <div className="flex flex-wrap gap-1.5">
                {allVisiblePatients.map((vp) => (
                  <button
                    key={vp.id}
                    onClick={() => setPatient(vp)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                      vp.id === patient.id
                        ? 'bg-white text-[#1F1F1F] font-semibold shadow-sm'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {vp.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 border-b border-[#E6E6DC]">
        {[
          { id: 'overview', label: 'Clinical Overview', icon: Activity },
          { id: 'family', label: 'Family & Medical History', icon: Users, badge: familyMembers.length },
          { id: 'appointments', label: 'Fix Appointment', icon: Calendar, badge: appointments.length },
          { id: 'orders', label: 'Order Medicines Online', icon: Pill, badge: orders.length },
          { id: 'doctor-ai', label: 'Dr. Thread AI Assistant', icon: Stethoscope, isSpecial: true },
        ].map((t) => {
          const Icon = t.icon
          const isActive = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#1F1F1F] text-white shadow-sm'
                  : 'bg-white text-[#767676] hover:bg-[#EDEDE5] hover:text-[#1F1F1F] border border-[#E6E6DC]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#767676]'}`} />
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#EDEDE5] text-[#5D5F58]'
                  }`}
                >
                  {t.badge}
                </span>
              )}
              {t.isSpecial && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          )
        })}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 1: CLINICAL OVERVIEW */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Allergies Alert */}
          {patient.allergies && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wider text-amber-800">Verified Allergies</p>
                <p className="text-[14px] font-medium mt-0.5">{patient.allergies}</p>
                <p className="text-[11px] text-amber-700 mt-1">Cross-checked before dispensing online medications.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Prescriptions Preview */}
            <Card className="border-[#E6E6DC] rounded-2xl bg-white shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-[16px] font-bold flex items-center gap-2">
                  <Pill className="w-4 h-4 text-[#1F1F1F]" />
                  Active Medications
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('orders')}
                  className="rounded-full text-[11px] h-7 border-[#E6E6DC]"
                >
                  Order Refill Online
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { drug: 'Atorvastatin', dose: '20mg once daily', status: 'Active Cycle' },
                  { drug: 'Metoprolol Tartrate', dose: '50mg twice daily', status: 'Active Cycle' },
                  { drug: 'Vitamin D3 (Cholecalciferol)', dose: '60,000 IU weekly', status: 'Active Cycle' },
                ].map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#F6F7ED] border border-[#E6E6DC]">
                    <div>
                      <p className="text-[13px] font-bold text-[#1F1F1F]">{m.drug}</p>
                      <p className="text-[11px] text-[#767676]">{m.dose}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      {m.status}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Appointments Preview */}
            <Card className="border-[#E6E6DC] rounded-2xl bg-white shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-[16px] font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1F1F1F]" />
                  Upcoming Consultations
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('appointments')}
                  className="rounded-full text-[11px] h-7 border-[#E6E6DC]"
                >
                  Book New
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {appointments.slice(0, 2).map((a) => (
                  <div key={a.id} className="p-3.5 rounded-xl bg-[#F6F7ED] border border-[#E6E6DC]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-bold text-[#1F1F1F]">{a.doctor_name}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          a.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {a.status === 'confirmed' ? 'Doctor Confirmed' : 'Pending Doctor Acceptance'}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#5D5F58] flex items-center gap-2">
                      <span>Dept: {a.department}</span>
                      <span>•</span>
                      <span>{a.appointment_date} at {a.appointment_time}</span>
                    </p>
                    <p className="text-[11px] text-[#767676] mt-1.5 italic">&quot;{a.symptoms}&quot;</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 2: FAMILY MEMBERS AND MEDICAL HISTORY */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'family' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-bold text-[#1F1F1F]">Family Members & Medical History</h2>
              <p className="text-[13px] text-[#767676] mt-0.5">
                Track hereditary conditions, dependent records, and family health histories.
              </p>
            </div>
            <Button
              onClick={() => setIsAddFamilyOpen(true)}
              className="rounded-full bg-[#1F1F1F] hover:bg-[#333] text-white text-[13px] font-semibold h-9 px-4 shrink-0 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Family Member
            </Button>
          </div>

          {famSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[13px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {famSuccess}
            </div>
          )}

          {/* Add Family Member Modal / Form */}
          {isAddFamilyOpen && (
            <Card className="border-[#1F1F1F] rounded-2xl bg-white shadow-md p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E6E6DC]">
                <h3 className="text-[16px] font-bold text-[#1F1F1F]">Record Family Member & Medical History</h3>
                <button onClick={() => setIsAddFamilyOpen(false)} className="text-[#767676] hover:text-[#1F1F1F]">
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddFamily} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="fm-name" className="text-[12px] font-semibold">Full Name *</Label>
                    <Input
                      id="fm-name"
                      placeholder="e.g. Eleanor Wilson"
                      value={famName}
                      onChange={(e) => setFamName(e.target.value)}
                      required
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="fm-rel" className="text-[12px] font-semibold">Relationship *</Label>
                    <select
                      id="fm-rel"
                      value={famRelation}
                      onChange={(e) => setFamRelation(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#E6E6DC] rounded-xl text-[13px]"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Child">Child (Son / Daughter)</option>
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Sibling">Sibling (Brother / Sister)</option>
                      <option value="Guardian">Guardian / Ward</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="fm-dob" className="text-[12px] font-semibold">Date of Birth</Label>
                    <Input
                      id="fm-dob"
                      type="date"
                      value={famDob}
                      onChange={(e) => setFamDob(e.target.value)}
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="fm-phone" className="text-[12px] font-semibold">Contact Phone (Optional)</Label>
                    <Input
                      id="fm-phone"
                      placeholder="+91 98765 00000"
                      value={famPhone}
                      onChange={(e) => setFamPhone(e.target.value)}
                      className="h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="fm-cond" className="text-[12px] font-semibold">
                    Known Medical Conditions / Diseases (Comma separated)
                  </Label>
                  <Input
                    id="fm-cond"
                    placeholder="e.g. Hypertension, Type 2 Diabetes, Mild Asthma, Glaucoma"
                    value={famConditions}
                    onChange={(e) => setFamConditions(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                  <p className="text-[11px] text-[#767676]">
                    These are shared with attending physicians during consultations.
                  </p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="fm-notes" className="text-[12px] font-semibold">Additional Clinical Notes</Label>
                  <Input
                    id="fm-notes"
                    placeholder="e.g. Taking regular BP medication, knee replacement in 2021"
                    value={famNotes}
                    onChange={(e) => setFamNotes(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddFamilyOpen(false)} className="rounded-full">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={famLoading} className="rounded-full bg-[#1F1F1F] text-white">
                    {famLoading ? 'Saving…' : 'Save Family Member'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Family Members Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {familyMembers.map((m) => (
              <Card key={m.id} className="border-[#E6E6DC] rounded-2xl bg-white hover:shadow-sm transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-[16px] font-bold text-[#1F1F1F]">{m.name}</CardTitle>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDEDE5] text-[#5D5F58]">
                        {m.relationship}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#F6F7ED] flex items-center justify-center text-[12px] font-bold text-[#1F1F1F]">
                      {m.name.charAt(0)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 text-[12px] space-y-2">
                  <p className="text-[#767676]">Born: {new Date(m.dob).toLocaleDateString()}</p>
                  {m.phone && <p className="text-[#767676]">Phone: {m.phone}</p>}

                  <div className="pt-2 border-t border-[#E6E6DC]">
                    <p className="font-semibold text-[#1F1F1F] mb-1.5">Recorded Conditions:</p>
                    <div className="flex flex-wrap gap-1">
                      {m.conditions && m.conditions.length > 0 ? (
                        m.conditions.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-red-50 text-red-700 border border-red-200"
                          >
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-[#A3A3A3] italic">No chronic illnesses recorded</span>
                      )}
                    </div>
                  </div>

                  {m.notes && (
                    <p className="text-[11px] text-[#5D5F58] italic pt-1 bg-[#F6F7ED] p-2 rounded-lg">
                      {m.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 3: FIX / BOOK APPOINTMENT */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'appointments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-6">
            <Card className="border-[#E6E6DC] rounded-3xl bg-white shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-[20px] font-bold text-[#1F1F1F]">Fix Appointment with Doctor</h2>
                <p className="text-[13px] text-[#767676] mt-1">
                  Select your medical department, doctor, and preferred time slot.
                </p>
              </div>

              {bookingSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[13px] mb-5 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Request Received</p>
                    <p className="mt-0.5">{bookingSuccess}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="apt-dept" className="text-[13px] font-semibold text-[#1F1F1F]">
                    Hospital Department *
                  </Label>
                  <select
                    id="apt-dept"
                    value={bookDept}
                    onChange={(e) => setBookDept(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-[#E6E6DC] rounded-xl text-[14px] font-medium"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} — {d.desc.slice(0, 45)}…
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="apt-doc" className="text-[13px] font-semibold text-[#1F1F1F]">
                    Attending Physician *
                  </Label>
                  <select
                    id="apt-doc"
                    value={bookDoctor}
                    onChange={(e) => setBookDoctor(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-[#E6E6DC] rounded-xl text-[14px]"
                  >
                    <option value="Dr. Carol Chen (MD, Cardiology - MCI-2018-847291)">
                      Dr. Carol Chen (MD, MCI-2018-847291)
                    </option>
                    <option value="Dr. Arun Kumar (MS, Orthopedics - MCI-2023-994102)">
                      Dr. Arun Kumar (MS, MCI-2023-994102)
                    </option>
                    <option value="Dr. Meera Sen (MD, Dermatology - MCI-2019-108221)">
                      Dr. Meera Sen (MD, Dermatology)
                    </option>
                    <option value="Dr. Siddharth Verma (DM, Neurology - MCI-2017-772910)">
                      Dr. Siddharth Verma (DM, Neurology)
                    </option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="apt-date" className="text-[13px] font-semibold text-[#1F1F1F]">
                      Consultation Date *
                    </Label>
                    <Input
                      id="apt-date"
                      type="date"
                      value={bookDate}
                      onChange={(e) => setBookDate(e.target.value)}
                      required
                      className="h-11 rounded-xl text-[14px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="apt-time" className="text-[13px] font-semibold text-[#1F1F1F]">
                      Time Slot *
                    </Label>
                    <select
                      id="apt-time"
                      value={bookTime}
                      onChange={(e) => setBookTime(e.target.value)}
                      className="w-full h-11 px-3 bg-white border border-[#E6E6DC] rounded-xl text-[14px]"
                    >
                      <option value="09:00 AM">09:00 AM (Morning)</option>
                      <option value="10:30 AM">10:30 AM (Morning)</option>
                      <option value="11:45 AM">11:45 AM (Morning)</option>
                      <option value="02:00 PM">02:00 PM (Afternoon)</option>
                      <option value="04:30 PM">04:30 PM (Evening)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="apt-sym" className="text-[13px] font-semibold text-[#1F1F1F]">
                    Describe Symptoms / Reason for Visit *
                  </Label>
                  <textarea
                    id="apt-sym"
                    rows={3}
                    placeholder="e.g. Mild palpitations and shortness of breath after climbing stairs…"
                    value={bookSymptoms}
                    onChange={(e) => setBookSymptoms(e.target.value)}
                    required
                    className="w-full p-3 bg-white border border-[#E6E6DC] rounded-xl text-[14px] focus:outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full h-11 bg-[#1F1F1F] hover:bg-[#333] text-white font-semibold rounded-full text-[14px] transition-colors"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting Appointment…
                    </>
                  ) : (
                    'Fix Appointment with Doctor'
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Appointments List */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-[18px] font-bold text-[#1F1F1F]">Your Scheduled Appointments</h3>
            <div className="space-y-3">
              {appointments.map((a) => (
                <Card key={a.id} className="border-[#E6E6DC] rounded-2xl bg-white shadow-sm overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#767676]">
                          {a.department} Department
                        </span>
                        <h4 className="text-[16px] font-bold text-[#1F1F1F] mt-0.5">{a.doctor_name}</h4>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                          a.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                      >
                        {a.status === 'confirmed' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Confirmed by Doctor
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Pending Doctor Acceptance
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[13px] text-[#5D5F58] py-2 border-y border-[#E6E6DC]/60 my-2">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {a.appointment_date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {a.appointment_time}
                      </span>
                    </div>

                    <p className="text-[12px] text-[#767676] italic">
                      Chief Complaint: &quot;{a.symptoms}&quot;
                    </p>

                    {a.doctor_notes && (
                      <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-[12px] text-emerald-900">
                        <span className="font-semibold block mb-0.5">Doctor’s Note:</span>
                        {a.doctor_notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {appointments.length === 0 && (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#E6E6DC] text-[#767676]">
                  No appointments booked yet. Fill the form to schedule your consultation.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 4: ORDER MEDICINE ONLINE */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Pharmacy Catalog & Cart */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-[#E6E6DC] rounded-3xl bg-white shadow-sm p-6">
              <div className="mb-5">
                <h2 className="text-[20px] font-bold text-[#1F1F1F]">Order Medicines Online</h2>
                <p className="text-[13px] text-[#767676] mt-1">
                  Dispensed directly from CareThread Central Pharmacy with Aadhaar-linked prescription verification.
                </p>
              </div>

              {orderSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[13px] mb-5 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Order Placed Successfully</p>
                    <p className="mt-0.5">{orderSuccess}</p>
                  </div>
                </div>
              )}

              {/* Medicine Catalog */}
              <div className="space-y-2.5">
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#767676]">Hospital Pharmacy Catalog</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AVAILABLE_MEDICINES.map((m) => {
                    const isAdded = selectedMeds.some((x) => x.drug === m.drug)
                    return (
                      <div
                        key={m.id}
                        className="p-3 rounded-2xl border border-[#E6E6DC] bg-[#F6F7ED] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-[13px] font-bold text-[#1F1F1F] leading-tight">{m.drug}</span>
                            <span className="text-[13px] font-bold text-[#1F1F1F] shrink-0">₹{m.price}</span>
                          </div>
                          <p className="text-[11px] text-[#767676] mt-0.5">{m.dose} • {m.category}</p>
                          <p className="text-[11px] text-[#5D5F58] mt-1 line-clamp-1">{m.desc}</p>
                        </div>
                        <Button
                          size="sm"
                          variant={isAdded ? 'secondary' : 'outline'}
                          onClick={() => (isAdded ? removeMedFromCart(m.drug) : addMedToCart(m))}
                          className="mt-3 h-7 text-[11px] rounded-full w-full"
                        >
                          {isAdded ? '✓ Added in Order' : '+ Add to Order'}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Selected Items & Order Form */}
              <form onSubmit={handlePlaceOrder} className="mt-6 pt-6 border-t border-[#E6E6DC] space-y-4">
                <p className="text-[13px] font-bold text-[#1F1F1F]">Selected Medications for Delivery</p>
                <div className="space-y-2">
                  {selectedMeds.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-[#F6F7ED] rounded-xl text-[13px]">
                      <div>
                        <span className="font-semibold text-[#1F1F1F]">{item.drug}</span>
                        <span className="text-[#767676] ml-2">({item.dose} - {item.days} days supply)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">₹{item.price}</span>
                        <button
                          type="button"
                          onClick={() => removeMedFromCart(item.drug)}
                          className="text-[#BA1A1A] text-[12px] hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  {selectedMeds.length === 0 && (
                    <p className="text-[12px] text-[#BA1A1A]">Please select at least one medication from the catalog above.</p>
                  )}
                </div>

                <div className="pt-2 flex justify-between items-center text-[15px] font-bold border-t border-[#E6E6DC]">
                  <span>Total Amount (Estimated):</span>
                  <span>₹{selectedMeds.reduce((acc, m) => acc + m.price, 0)}</span>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <Label htmlFor="del-addr" className="text-[12px] font-semibold">Home Delivery Address *</Label>
                    <Input
                      id="del-addr"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      required
                      className="h-10 rounded-xl text-[13px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="del-phone" className="text-[12px] font-semibold">Contact Phone *</Label>
                    <Input
                      id="del-phone"
                      value={orderPhone}
                      onChange={(e) => setOrderPhone(e.target.value)}
                      required
                      className="h-10 rounded-xl text-[13px]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={orderingLoading || selectedMeds.length === 0}
                  className="w-full h-11 bg-[#1F1F1F] hover:bg-[#333] text-white font-semibold rounded-full text-[14px]"
                >
                  {orderingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing Order…
                    </>
                  ) : (
                    'Confirm Online Medicine Order'
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Orders Tracking Stream */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-[18px] font-bold text-[#1F1F1F]">Your Medicine Orders</h3>
            <div className="space-y-3">
              {orders.map((o) => (
                <Card key={o.id} className="border-[#E6E6DC] rounded-2xl bg-white shadow-sm overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-[#767676]">Order #{o.id}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                          o.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.status === 'out_for_delivery'
                            ? 'bg-blue-100 text-blue-800'
                            : o.status === 'dispensed'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {o.items?.map((item, i) => (
                        <p key={i} className="text-[13px] text-[#1F1F1F]">
                          • <span className="font-semibold">{item.drug}</span> ({item.dose}) × {item.quantity} units
                        </p>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[#E6E6DC] flex items-center justify-between text-[12px] text-[#767676]">
                      <span>Delivery: {o.delivery_address.slice(0, 30)}…</span>
                      <span className="font-bold text-[#1F1F1F]">₹{o.total_amount}</span>
                    </div>

                    {o.pharmacist_notes && (
                      <p className="text-[11px] bg-[#F6F7ED] p-2 rounded-lg text-[#5D5F58] italic">
                        Pharmacist: {o.pharmacist_notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}

              {orders.length === 0 && (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#E6E6DC] text-[#767676]">
                  No orders placed yet. Select medicines from the catalog to order delivery.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 5: DR. THREAD AI ASSISTANT EMBEDDED */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'doctor-ai' && (
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <h2 className="text-[20px] font-bold text-[#1F1F1F]">Dr. Thread — Virtual Clinical Assistant</h2>
            <p className="text-[13px] text-[#767676] mt-0.5">
              Ask about symptoms to receive instant department referrals and daily health guidelines.
            </p>
          </div>
          <DoctorChatbot embedded={true} onBookAppointmentWithDepartment={handleSelectDepartmentFromBot} />
        </div>
      )}

      {/* Floating Doctor Chatbot available on any tab */}
      {activeTab !== 'doctor-ai' && (
        <DoctorChatbot embedded={false} onBookAppointmentWithDepartment={handleSelectDepartmentFromBot} />
      )}
    </div>
  )
}
