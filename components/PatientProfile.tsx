'use client'

import { useState } from 'react'
import type { Database } from '@/types/database'
import { VitalsForm } from '@/components/VitalsForm'
import { VisitForm } from '@/components/VisitForm'
import { MedicineCycleTable } from '@/components/MedicineCycleTable'
import { FamilyPanel, type FamilyData } from '@/components/FamilyPanel'
import { SummaryCard } from '@/components/SummaryCard'
import { RealtimeSubscriber } from '@/components/RealtimeSubscriber'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  HeartPulse,
  Stethoscope,
  Pill,
  Users,
  Sparkles,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  Calendar,
  Activity,
  Thermometer,
  Weight,
  User,
  CheckCircle2,
} from 'lucide-react'

type Patient = Database['public']['Tables']['patients']['Row']
type Visit = Database['public']['Tables']['visits']['Row'] & {
  profiles?: { full_name: string } | null
}
type Vital = Database['public']['Tables']['vitals']['Row'] & {
  profiles?: { full_name: string } | null
}
type MedicineCycle = Database['public']['Tables']['medicine_cycles']['Row']
type Summary = Database['public']['Tables']['summaries']['Row']

interface PatientProfileProps {
  patient: Patient
  visits: Visit[]
  vitals: Vital[]
  cycles: MedicineCycle[]
  familyData: FamilyData
  summaries: Summary[]
  userRole: 'doctor' | 'nurse' | 'admin' | 'receptionist' | 'patient'
}

const CURRENT_YEAR = 2026

function getAge(dob: string) {
  const year = parseInt(dob.split('-')[0], 10)
  return isNaN(year) ? null : CURRENT_YEAR - year
}

export function PatientProfile({
  patient,
  visits,
  vitals,
  cycles,
  familyData,
  summaries,
  userRole,
}: PatientProfileProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const latestVital = vitals[0] || null
  const latestVisit = visits[0] || null

  const age = patient.dob ? getAge(patient.dob) : null

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Top Header Banner ── */}
      <div className="rounded-xl border border-border bg-card/60 backdrop-blur p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-foreground">{patient.name}</h1>
                <Badge variant="outline" className="text-xs">
                  {age !== null ? `${age} yrs` : 'Age N/A'}
                </Badge>
                {patient.gender && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {patient.gender}
                  </Badge>
                )}
                <RealtimeSubscriber patientId={patient.id} />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary/70" />
                  DOB: {patient.dob}
                </span>
                {patient.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-primary/70" />
                    {patient.phone}
                  </span>
                )}
                {patient.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary/70" />
                    {patient.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick clinical action buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            {(userRole === 'doctor' || userRole === 'nurse') && (
              <VitalsForm patientId={patient.id} />
            )}
            {userRole === 'doctor' && (
              <VisitForm patientId={patient.id} />
            )}
          </div>
        </div>

        {/* Allergies Highlight Callout */}
        <div className="mt-5 pt-4 border-t border-border flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Allergies:
          </div>
          {patient.allergies ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {patient.allergies}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              No known drug or environmental allergies recorded
            </span>
          )}
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/40 p-1 border border-border rounded-xl">
          <TabsTrigger value="overview" className="gap-2 text-xs sm:text-sm">
            <Activity className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="visits" className="gap-2 text-xs sm:text-sm">
            <Stethoscope className="w-4 h-4" />
            Visits ({visits.length})
          </TabsTrigger>
          <TabsTrigger value="medicines" className="gap-2 text-xs sm:text-sm">
            <Pill className="w-4 h-4" />
            Medicines ({cycles.length})
          </TabsTrigger>
          <TabsTrigger value="family" className="gap-2 text-xs sm:text-sm">
            <Users className="w-4 h-4" />
            Family & History
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2 text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Summary
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: OVERVIEW ── */}
        <TabsContent value="overview" className="space-y-6 pt-4">
          {/* Latest Vitals Snapshot Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">Latest Vital Signs</h3>
                {latestVital && (
                  <span className="text-xs text-muted-foreground">
                    Recorded {new Date(latestVital.recorded_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              {(userRole === 'doctor' || userRole === 'nurse') && (
                <VitalsForm
                  patientId={patient.id}
                  trigger={
                    <Button variant="ghost" size="xs" className="h-7 text-xs text-primary gap-1">
                      Update Vitals
                    </Button>
                  }
                />
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Blood Pressure</span>
                    <HeartPulse className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-xl font-bold text-foreground mt-1">
                    {latestVital?.bp_systolic && latestVital?.bp_diastolic
                      ? `${latestVital.bp_systolic}/${latestVital.bp_diastolic}`
                      : '—'}
                    <span className="text-xs font-normal text-muted-foreground ml-1">mmHg</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Pulse</span>
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <p className="text-xl font-bold text-foreground mt-1">
                    {latestVital?.pulse ? latestVital.pulse : '—'}
                    <span className="text-xs font-normal text-muted-foreground ml-1">bpm</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Temperature</span>
                    <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="text-xl font-bold text-foreground mt-1">
                    {latestVital?.temp_c ? latestVital.temp_c : '—'}
                    <span className="text-xs font-normal text-muted-foreground ml-1">°C</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Weight</span>
                    <Weight className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-xl font-bold text-foreground mt-1">
                    {latestVital?.weight_kg ? latestVital.weight_kg : '—'}
                    <span className="text-xs font-normal text-muted-foreground ml-1">kg</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Previews: Latest Visit & Active Medications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Latest Visit Preview */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-sm text-foreground">Most Recent Visit</h4>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setActiveTab('visits')}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  View All
                </Button>
              </div>

              {latestVisit ? (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-sm">
                      {latestVisit.diagnosis}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(latestVisit.visit_date).toLocaleDateString()}
                    </span>
                  </div>
                  {latestVisit.symptoms && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      <span className="font-medium text-foreground/80">Symptoms:</span>{' '}
                      {latestVisit.symptoms}
                    </p>
                  )}
                  {latestVisit.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      <span className="font-medium text-foreground/80">Notes:</span>{' '}
                      {latestVisit.notes}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground/70 pt-1">
                    Attending: Dr. {latestVisit.profiles?.full_name || 'Staff Clinician'}
                  </p>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No clinical visits recorded yet.
                </div>
              )}
            </div>

            {/* Active Meds Preview */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-sm text-foreground">Active Medications</h4>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setActiveTab('medicines')}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Manage
                </Button>
              </div>

              {cycles.filter((c) => c.status === 'active').length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No active medication cycles.
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  {cycles
                    .filter((c) => c.status === 'active')
                    .slice(0, 3)
                    .map((cycle) => (
                      <div
                        key={cycle.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/20 text-xs"
                      >
                        <div>
                          <p className="font-medium text-foreground">{cycle.drug}</p>
                          <p className="text-muted-foreground">
                            {cycle.dose} • {cycle.frequency}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                          Active
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 2: VISITS ── */}
        <TabsContent value="visits" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground text-base">Clinical Encounters</h3>
              <p className="text-xs text-muted-foreground">
                Documented patient visits, symptoms, diagnoses, and treatment plans.
              </p>
            </div>
            {userRole === 'doctor' && <VisitForm patientId={patient.id} />}
          </div>

          {visits.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              No clinical encounters recorded yet. Click &quot;New Clinical Visit&quot; to log the first visit.
            </div>
          ) : (
            <div className="space-y-3">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  className="rounded-xl border border-border bg-card p-5 space-y-3 hover:border-border/80 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-base">
                          {visit.diagnosis}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          Confirmed
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Dr. {visit.profiles?.full_name || 'Staff Clinician'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(visit.visit_date).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </div>
                  </div>

                  {visit.symptoms && (
                    <div className="rounded-lg bg-muted/30 p-3 text-xs space-y-1">
                      <span className="font-medium text-foreground">Symptoms & Complaints:</span>
                      <p className="text-muted-foreground">{visit.symptoms}</p>
                    </div>
                  )}

                  {visit.notes && (
                    <div className="text-xs space-y-1">
                      <span className="font-medium text-foreground">Clinical Notes & Plan:</span>
                      <p className="text-muted-foreground leading-relaxed">{visit.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── TAB 3: MEDICINES ── */}
        <TabsContent value="medicines" className="pt-4">
          <MedicineCycleTable
            patientId={patient.id}
            cycles={cycles}
            userRole={userRole}
          />
        </TabsContent>

        {/* ── TAB 4: FAMILY & HISTORY ── */}
        <TabsContent value="family" className="pt-4">
          <FamilyPanel
            patientId={patient.id}
            data={familyData}
            userRole={userRole}
          />
        </TabsContent>

        {/* ── TAB 5: AI SUMMARY ── */}
        <TabsContent value="summary" className="pt-4">
          <SummaryCard patientId={patient.id} initialSummaries={summaries} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
