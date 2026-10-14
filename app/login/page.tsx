'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Stethoscope,
  User,
  Building2,
  Pill,
  FlaskConical,
  Sparkles,
  Clock,
  ArrowRight,
} from 'lucide-react'

type TabMode = 'login' | 'register-patient' | 'register-staff'

export default function LoginPage() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TabMode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [pendingApproval, setPendingApproval] = useState(false)
  const [showPass, setShowPass] = useState(false)

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Patient registration form state
  const [patientName, setPatientName] = useState('')
  const [patientAadhaar, setPatientAadhaar] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [patientDob, setPatientDob] = useState('')
  const [patientGender, setPatientGender] = useState('female')
  const [patientAddress, setPatientAddress] = useState('')
  const [patientAllergies, setPatientAllergies] = useState('')
  const [patientEmail, setPatientEmail] = useState('')
  const [patientPassword, setPatientPassword] = useState('')

  // Staff registration form state
  const [staffRole, setStaffRole] = useState<'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'lab_technician'>('doctor')
  const [staffName, setStaffName] = useState('')
  const [staffGovReg, setStaffGovReg] = useState('')
  const [staffDept, setStaffDept] = useState('Cardiology')
  const [staffAadhaar, setStaffAadhaar] = useState('')
  const [staffPhone, setStaffPhone] = useState('')
  const [staffAddress, setStaffAddress] = useState('')
  const [staffEmail, setStaffEmail] = useState('')
  const [staffPassword, setStaffPassword] = useState('')

  // Format Aadhaar with spaces (XXXX XXXX XXXX)
  function formatAadhaarInput(val: string) {
    const raw = val.replace(/\D/g, '').slice(0, 12)
    const parts = raw.match(/.{1,4}/g)
    return parts ? parts.join(' ') : raw
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setPendingApproval(false)
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          identifier: loginIdentifier,
          password: loginPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.pending) {
          setPendingApproval(true)
        }
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      router.push(data.redirectUrl || '/patient')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error')
      setLoading(false)
    }
  }

  async function handleQuickDemoLogin(role: string) {
    setError(null)
    setSuccessMsg(null)
    setPendingApproval(false)
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'demo-login', role }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Demo login failed')
        setLoading(false)
        return
      }

      router.push(data.redirectUrl)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoading(false)
    }
  }

  async function handleRegisterPatient(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register-patient',
          name: patientName,
          aadhaar_number: patientAadhaar,
          phone: patientPhone,
          dob: patientDob,
          gender: patientGender,
          address: patientAddress,
          allergies: patientAllergies,
          email: patientEmail,
          password: patientPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      setSuccessMsg(data.message)
      setLoading(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration error')
      setLoading(false)
    }
  }

  async function handleRegisterStaff(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register-staff',
          role: staffRole,
          full_name: staffName,
          gov_reg_number: staffGovReg,
          department: staffDept,
          aadhaar_number: staffAadhaar,
          phone: staffPhone,
          address: staffAddress,
          email: staffEmail,
          password: staffPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Staff registration failed')
        setLoading(false)
        return
      }

      setSuccessMsg(data.message)
      setLoading(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration error')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F6F7ED]">
      {/* Left panel — branding and quick demo selector */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] shrink-0 flex-col justify-between p-12 bg-[#1F1F1F] text-white">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[17px] font-bold text-white tracking-tight leading-none block">CareThread</span>
              <span className="text-[11px] text-[#A3A3A3] tracking-wide uppercase mt-1 block">Unified Clinical Portal</span>
            </div>
          </div>

          {/* Heading */}
          <div className="mt-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-[11px] font-medium border border-white/10 mb-5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Aadhaar & Gov Medical Registry Integrated
            </div>
            <h2 className="text-[38px] font-bold text-white leading-[46px] tracking-[-0.03em] mb-4">
              Care delivery,<br />connected & compliant.
            </h2>
            <p className="text-[14px] text-[#A3A3A3] leading-[22px] max-w-[380px]">
              Complete role-based hospital records for Physicians, Nurses, Pharmacists, Lab Technicians, Receptionists, and Patients.
            </p>
          </div>

          {/* Role pills */}
          <div className="mt-8">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#767676] mb-3">Supported Roles</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Admin', icon: Building2 },
                { label: 'Physician', icon: Stethoscope },
                { label: 'Nursing', icon: Activity },
                { label: 'Pharmacist', icon: Pill },
                { label: 'Lab Tech', icon: FlaskConical },
                { label: 'Front Desk', icon: Building2 },
                { label: 'Patient Portal', icon: User },
              ].map((r) => {
                const Icon = r.icon
                return (
                  <span
                    key={r.label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white/5 text-white/80 border border-white/10"
                  >
                    <Icon className="w-3 h-3 text-[#A3A3A3]" />
                    {r.label}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick Demo Switcher */}
        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A3A3A3] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              1-Click Instant Demo Login
            </span>
          </div>
          <p className="text-[12px] text-[#767676] mb-3">
            Click any active account below to test dashboards instantly without typing passwords:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <button
              onClick={() => handleQuickDemoLogin('admin')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-left transition-colors border border-white/5 group"
            >
              <div>
                <p className="font-semibold text-white leading-tight">Admin</p>
                <p className="text-[10px] text-[#767676]">Anitha Selvaraj</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => handleQuickDemoLogin('doctor')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-left transition-colors border border-white/5 group"
            >
              <div>
                <p className="font-semibold text-white leading-tight">Doctor</p>
                <p className="text-[10px] text-[#767676]">Dr. Senthil Nathan</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => handleQuickDemoLogin('nurse')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-left transition-colors border border-white/5 group"
            >
              <div>
                <p className="font-semibold text-white leading-tight">Nurse</p>
                <p className="text-[10px] text-[#767676]">Kavitha Murugan</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => handleQuickDemoLogin('pharmacist')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-left transition-colors border border-white/5 group"
            >
              <div>
                <p className="font-semibold text-white leading-tight">Pharmacist</p>
                <p className="text-[10px] text-[#767676]">Priya Natarajan</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => handleQuickDemoLogin('lab_technician')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-left transition-colors border border-white/5 group"
            >
              <div>
                <p className="font-semibold text-white leading-tight">Lab Tech</p>
                <p className="text-[10px] text-[#767676]">Vignesh Loganathan</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => handleQuickDemoLogin('patient')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-left transition-colors border border-white/10 group"
            >
              <div>
                <p className="font-semibold text-emerald-400 leading-tight">Patient Portal</p>
                <p className="text-[10px] text-[#A3A3A3]">Meenakshi Sundaram</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Right panel — Form container */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 py-10 overflow-y-auto">
        <div className="w-full max-w-[500px] mx-auto animate-fade-in-up">
          {/* Mobile Header */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-[#1F1F1F] flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-[16px] font-bold text-[#1F1F1F]">CareThread</span>
          </div>

          {/* Tabs header */}
          <div className="flex p-1 bg-[#EDEDE5] rounded-2xl mb-8 border border-[#E6E6DC]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login')
                setError(null)
                setSuccessMsg(null)
              }}
              className={`flex-1 py-2 text-[13px] font-semibold rounded-xl transition-all duration-150 ${
                activeTab === 'login' ? 'bg-white text-[#1F1F1F] shadow-sm' : 'text-[#767676] hover:text-[#1F1F1F]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register-patient')
                setError(null)
                setSuccessMsg(null)
              }}
              className={`flex-1 py-2 text-[13px] font-semibold rounded-xl transition-all duration-150 ${
                activeTab === 'register-patient' ? 'bg-white text-[#1F1F1F] shadow-sm' : 'text-[#767676] hover:text-[#1F1F1F]'
              }`}
            >
              Patient Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register-staff')
                setError(null)
                setSuccessMsg(null)
              }}
              className={`flex-1 py-2 text-[13px] font-semibold rounded-xl transition-all duration-150 ${
                activeTab === 'register-staff' ? 'bg-white text-[#1F1F1F] shadow-sm' : 'text-[#767676] hover:text-[#1F1F1F]'
              }`}
            >
              Staff Sign Up
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className={`p-4 rounded-2xl mb-6 text-[13px] flex items-start gap-3 border ${
              pendingApproval
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-red-50 border-red-200 text-[#BA1A1A]'
            }`}>
              {pendingApproval ? (
                <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#BA1A1A] mt-0.5 shrink-0" />
              )}
              <div>
                <p className="font-semibold">{pendingApproval ? 'Awaiting Administrator Acceptance' : 'Authentication Error'}</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl mb-6 text-[13px] bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Application Received</p>
                <p className="mt-0.5">{successMsg}</p>
                <Button
                  onClick={() => {
                    setActiveTab('login')
                    setSuccessMsg(null)
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-3 rounded-full border-emerald-300 text-emerald-900 bg-white"
                >
                  Return to Sign In
                </Button>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* TAB 1: SIGN IN */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeTab === 'login' && (
            <div>
              <div className="mb-6">
                <h1 className="text-[28px] font-bold text-[#1F1F1F] tracking-tight">Welcome back</h1>
                <p className="text-[14px] text-[#767676] mt-1">
                  Sign in with your Email, Phone Number, or Aadhaar Card number.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-id" className="text-[13px] font-semibold text-[#1F1F1F]">
                    Email, Phone Number, or Aadhaar Number
                  </Label>
                  <Input
                    id="login-id"
                    placeholder="e.g. 5432 8901 2345 or +91 98765 01010"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    required
                    className="h-11 bg-white border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px]"
                  />
                  <p className="text-[11px] text-[#767676]">Supports registered 12-digit Aadhaar or Email</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="login-pass" className="text-[13px] font-semibold text-[#1F1F1F]">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-pass"
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="h-11 pr-11 bg-white border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#1F1F1F]"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#1F1F1F] hover:bg-[#333] text-white font-semibold text-[14px] rounded-full transition-colors mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying credentials…
                    </>
                  ) : (
                    'Sign in to Portal'
                  )}
                </Button>
              </form>

              {/* Mobile Quick Demo Chips */}
              <div className="mt-8 pt-6 border-t border-[#E6E6DC] lg:hidden">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#767676] mb-2.5">
                  1-Click Demo Login
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Admin', role: 'admin' },
                    { label: 'Doctor', role: 'doctor' },
                    { label: 'Nurse', role: 'nurse' },
                    { label: 'Pharmacist', role: 'pharmacist' },
                    { label: 'Lab Tech', role: 'lab_technician' },
                    { label: 'Patient', role: 'patient' },
                  ].map((d) => (
                    <button
                      key={d.role}
                      type="button"
                      onClick={() => handleQuickDemoLogin(d.role)}
                      className="px-3 py-1.5 rounded-full text-[12px] font-semibold bg-white border border-[#E6E6DC] text-[#1F1F1F] hover:bg-[#F4F4F4]"
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* TAB 2: PATIENT REGISTRATION */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeTab === 'register-patient' && (
            <div>
              <div className="mb-6">
                <h1 className="text-[26px] font-bold text-[#1F1F1F] tracking-tight">Patient Registration</h1>
                <p className="text-[14px] text-[#767676] mt-1">
                  Register with your Aadhaar identity. Registrations are automatically submitted for Admin review.
                </p>
              </div>

              <form onSubmit={handleRegisterPatient} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pat-name" className="text-[13px] font-semibold text-[#1F1F1F]">
                    Full Name (As on Aadhaar Card) *
                  </Label>
                  <Input
                    id="pat-name"
                    placeholder="e.g. Meenakshi Sundaram"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                    className="h-10 bg-white border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="pat-aadhaar" className="text-[13px] font-semibold text-[#1F1F1F]">
                      Aadhaar Number (12 Digits) *
                    </Label>
                    <Input
                      id="pat-aadhaar"
                      placeholder="XXXX XXXX XXXX"
                      value={patientAadhaar}
                      onChange={(e) => setPatientAadhaar(formatAadhaarInput(e.target.value))}
                      maxLength={14}
                      required
                      className="h-10 bg-white border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px] font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pat-phone" className="text-[13px] font-semibold text-[#1F1F1F]">
                      Phone Number *
                    </Label>
                    <Input
                      id="pat-phone"
                      type="tel"
                      placeholder="+91 98765 01010"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      required
                      className="h-10 bg-white border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="pat-dob" className="text-[13px] font-semibold text-[#1F1F1F]">
                      Date of Birth *
                    </Label>
                    <Input
                      id="pat-dob"
                      type="date"
                      value={patientDob}
                      onChange={(e) => setPatientDob(e.target.value)}
                      required
                      className="h-10 bg-white border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pat-gender" className="text-[13px] font-semibold text-[#1F1F1F]">
                      Gender
                    </Label>
                    <select
                      id="pat-gender"
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px] focus:outline-none"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pat-address" className="text-[13px] font-semibold text-[#1F1F1F]">
                    Residential Address *
                  </Label>
                  <Input
                    id="pat-address"
                    placeholder="e.g. 42 Lotus Boulevard, Sector 100, Noida, UP"
                    value={patientAddress}
                    onChange={(e) => setPatientAddress(e.target.value)}
                    required
                    className="h-10 bg-white border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pat-allergies" className="text-[13px] font-semibold text-[#1F1F1F]">
                    Known Allergies (Optional)
                  </Label>
                  <Input
                    id="pat-allergies"
                    placeholder="e.g. Penicillin, Shellfish (leave blank if none)"
                    value={patientAllergies}
                    onChange={(e) => setPatientAllergies(e.target.value)}
                    className="h-10 bg-white border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <Label htmlFor="pat-email" className="text-[13px] font-semibold text-[#1F1F1F]">
                      Account Email *
                    </Label>
                    <Input
                      id="pat-email"
                      type="email"
                      placeholder="you@email.com"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      required
                      className="h-10 bg-white border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pat-pass" className="text-[13px] font-semibold text-[#1F1F1F]">
                      Password *
                    </Label>
                    <Input
                      id="pat-pass"
                      type="password"
                      placeholder="Create password"
                      value={patientPassword}
                      onChange={(e) => setPatientPassword(e.target.value)}
                      required
                      className="h-10 bg-white border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#1F1F1F] hover:bg-[#333] text-white font-semibold text-[14px] rounded-full transition-colors mt-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting Registration…
                    </>
                  ) : (
                    'Submit Patient Registration'
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* TAB 3: STAFF REGISTRATION */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeTab === 'register-staff' && (
            <div>
              <div className="mb-6">
                <h1 className="text-[26px] font-bold text-[#1F1F1F] tracking-tight">Staff Registration</h1>
                <p className="text-[14px] text-[#767676] mt-1">
                  For Doctors, Nurses, Receptionists, Pharmacists, and Lab Technicians with Government Registration numbers.
                </p>
              </div>

              <form onSubmit={handleRegisterStaff} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="staff-role" className="text-[13px] font-semibold text-[#1F1F1F]">
                      Designated Role *
                    </Label>
                    <select
                      id="staff-role"
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value as typeof staffRole)}
                      className="w-full h-10 px-3 bg-white border border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px] focus:outline-none font-medium"
                    >
                      <option value="doctor">Doctor / Physician</option>
                      <option value="nurse">Nursing Staff</option>
                      <option value="receptionist">Receptionist / Front Desk</option>
                      <option value="pharmacist">Pharmacist</option>
                      <option value="lab_technician">Lab Technician</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="staff-dept" className="text-[13px] font-semibold text-[#1F1F1F]">
                      Department / Specialization *
                    </Label>
                    <Input
                      id="staff-dept"
                      placeholder="e.g. Cardiology, Pathology"
                      value={staffDept}
                      onChange={(e) => setStaffDept(e.target.value)}
                      required
                      className="h-10 bg-white border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="staff-name" className="text-[13px] font-semibold text-[#1F1F1F]">
                    Full Name & Title *
                  </Label>
                  <Input
                    id="staff-name"
                    placeholder="e.g. Dr. Rajesh Kumar or Priya Sharma"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    required
                    className="h-10 bg-white border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="staff-gov" className="text-[13px] font-semibold text-[#1F1F1F]">
                      Government Reg Number *
                    </Label>
                    <Input
                      id="staff-gov"
                      placeholder="e.g. MCI-2024-99812 or PCI-4412"
                      value={staffGovReg}
                      onChange={(e) => setStaffGovReg(e.target.value)}
                      required
                      className="h-10 bg-white border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px] font-mono"
                    />
                    <p className="text-[10px] text-[#767676]">MCI / SNC / PCI / NABL / State Council Reg No</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="staff-aadhaar" className="text-[13px] font-semibold text-[#1F1F1F]">
                      Aadhaar Number *
                    </Label>
                    <Input
                      id="staff-aadhaar"
                      placeholder="XXXX XXXX XXXX"
                      value={staffAadhaar}
                      onChange={(e) => setStaffAadhaar(formatAadhaarInput(e.target.value))}
                      maxLength={14}
                      required
                      className="h-10 bg-white border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="staff-phone" className="text-[13px] font-semibold text-[#1F1F1F]">
                      Contact Phone *
                    </Label>
                    <Input
                      id="staff-phone"
                      type="tel"
                      placeholder="+91 98765 00000"
                      value={staffPhone}
                      onChange={(e) => setStaffPhone(e.target.value)}
                      required
                      className="h-10 bg-white border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="staff-address" className="text-[13px] font-semibold text-[#1F1F1F]">
                      Clinic / Work Address *
                    </Label>
                    <Input
                      id="staff-address"
                      placeholder="e.g. CareThread Hospital Wing B"
                      value={staffAddress}
                      onChange={(e) => setStaffAddress(e.target.value)}
                      required
                      className="h-10 bg-white border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <Label htmlFor="staff-email" className="text-[13px] font-semibold text-[#1F1F1F]">
                      Staff Email *
                    </Label>
                    <Input
                      id="staff-email"
                      type="email"
                      placeholder="name@carethread.health"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      required
                      className="h-10 bg-white border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="staff-pass" className="text-[13px] font-semibold text-[#1F1F1F]">
                      Password *
                    </Label>
                    <Input
                      id="staff-pass"
                      type="password"
                      placeholder="Create staff password"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      required
                      className="h-10 bg-white border-[#E6E6DC] text-[#1F1F1F] rounded-xl text-[14px]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#1F1F1F] hover:bg-[#333] text-white font-semibold text-[14px] rounded-full transition-colors mt-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting Staff Credentials…
                    </>
                  ) : (
                    'Submit Staff Registration for Admin Acceptance'
                  )}
                </Button>
              </form>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#E6E6DC] flex items-center justify-between text-[11px] text-[#767676]">
            <span>Automated Hospital Intake System</span>
            <span>All Registrations Require Administrator Verification</span>
          </div>
        </div>
      </div>
    </div>
  )
}
