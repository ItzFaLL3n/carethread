'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Activity,
  Users,
  UserPlus,
  HeartPulse,
  LogOut,
  LayoutDashboard,
  Shield,
  Home,
  ChevronRight,
} from 'lucide-react'

type Role = 'admin' | 'receptionist' | 'doctor' | 'nurse' | 'patient' | 'pharmacist' | 'lab_technician'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navByRole: Record<Role, NavItem[]> = {
  admin: [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { href: '/admin/approvals', label: 'Approvals & Reg', icon: <Shield className="w-[18px] h-[18px]" /> },
    { href: '/admin/staff', label: 'Staff Accounts', icon: <Users className="w-[18px] h-[18px]" /> },
  ],
  receptionist: [
    { href: '/receptionist', label: 'Dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { href: '/receptionist/patients', label: 'Patients', icon: <Users className="w-[18px] h-[18px]" /> },
    { href: '/receptionist/patients/new', label: 'Register Patient', icon: <UserPlus className="w-[18px] h-[18px]" /> },
    { href: '/receptionist/families', label: 'Families', icon: <Home className="w-[18px] h-[18px]" /> },
  ],
  doctor: [
    { href: '/doctor', label: 'Dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { href: '/doctor/patients', label: 'Patients', icon: <Users className="w-[18px] h-[18px]" /> },
  ],
  nurse: [
    { href: '/nurse', label: 'Dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { href: '/nurse/patients', label: 'Patients', icon: <Users className="w-[18px] h-[18px]" /> },
  ],
  patient: [
    { href: '/patient', label: 'My Record & Care', icon: <HeartPulse className="w-[18px] h-[18px]" /> },
  ],
  pharmacist: [
    { href: '/pharmacist', label: 'Pharmacy Dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
  ],
  lab_technician: [
    { href: '/lab-technician', label: 'Lab Diagnostics', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
  ],
}

const roleLabel: Record<Role, string> = {
  admin: 'Administrator',
  receptionist: 'Receptionist',
  doctor: 'Physician',
  nurse: 'Nursing Staff',
  patient: 'Patient Portal',
  pharmacist: 'Pharmacist',
  lab_technician: 'Lab Technician',
}

const roleBadgeColor: Record<Role, string> = {
  admin:          'bg-[#1F1F1F] text-white',
  receptionist:   'bg-[#EDEDE5] text-[#5D5F58]',
  doctor:         'bg-[#1F1F1F] text-white',
  nurse:          'bg-[#EDEDE5] text-[#5D5F58]',
  patient:        'bg-[#EDEDE5] text-[#5D5F58]',
  pharmacist:     'bg-[#EDEDE5] text-[#5D5F58]',
  lab_technician: 'bg-[#EDEDE5] text-[#5D5F58]',
}

interface SidebarProps {
  role: Role
  fullName: string
}

export function Sidebar({ role, fullName }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const navItems = navByRole[role] ?? []

  async function signOut() {
    document.cookie = 'carethread_active_user=; path=/; max-age=0'
    try {
      await supabase.auth.signOut()
    } catch {
      // Ignored
    }
    router.push('/login')
  }

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside className="flex flex-col h-full w-[240px] shrink-0 bg-sidebar border-r border-sidebar-border">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#1F1F1F] shadow-sm">
          <Activity className="w-[18px] h-[18px] text-white" />
        </div>
        <div>
          <span className="text-[15px] font-bold text-[#1F1F1F] tracking-tight leading-none">
            CareThread
          </span>
          <p className="text-[11px] text-[#767676] mt-0.5 leading-none">{roleLabel[role]}</p>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 group ${
                active
                  ? 'bg-[#1F1F1F] text-white shadow-sm'
                  : 'text-[#767676] hover:bg-[#F4F4F4] hover:text-[#1F1F1F]'
              }`}
            >
              <span className={`transition-colors ${active ? 'text-white' : 'text-[#A3A3A3] group-hover:text-[#1F1F1F]'}`}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 text-white/60" />}
            </Link>
          )
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User + sign out */}
      <div className="px-3 py-4 space-y-1">
        {/* User row */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-[#1F1F1F] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#1F1F1F] truncate leading-tight">{fullName}</p>
            <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${roleBadgeColor[role]}`}>
              {role}
            </span>
          </div>
        </div>

        <Button
          id="sign-out-btn"
          variant="ghost"
          className="w-full justify-start gap-3 text-[#767676] hover:text-[#1F1F1F] hover:bg-[#F4F4F4] text-[13px] px-3 h-9 rounded-xl"
          onClick={signOut}
        >
          <LogOut className="w-[15px] h-[15px]" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
