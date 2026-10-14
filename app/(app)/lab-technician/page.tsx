'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Activity,
  Plus,
  Loader2,
  FileText,
} from 'lucide-react'

interface LabTestItem {
  id: string
  patientName: string
  testName: string
  orderedBy: string
  sampleStatus: 'collected' | 'processing' | 'completed'
  resultValue?: string
  referenceRange?: string
  notes?: string
  date: string
}

export default function LabTechnicianDashboard() {
  const [tests, setTests] = useState<LabTestItem[]>([
    {
      id: 'lab-01',
      patientName: 'Meenakshi Sundaram',
      testName: 'Lipid Profile (Fasting)',
      orderedBy: 'Dr. Senthil Nathan (Cardiology)',
      sampleStatus: 'completed',
      resultValue: 'Cholesterol: 185 mg/dL, HDL: 52 mg/dL, LDL: 104 mg/dL',
      referenceRange: 'Total < 200 mg/dL',
      notes: 'Optimal lipid ratios. Patient complied with 12h fasting.',
      date: '2026-10-10',
    },
    {
      id: 'lab-02',
      patientName: 'Sundaram Ramasamy',
      testName: 'HbA1c & Fasting Glucose',
      orderedBy: 'Dr. Senthil Nathan (Cardiology)',
      sampleStatus: 'processing',
      resultValue: 'Pending analyzer output',
      referenceRange: '< 5.7% (Normal)',
      date: '2026-10-11',
    },
    {
      id: 'lab-03',
      patientName: 'Muthukumar Palanisamy',
      testName: 'Complete Blood Count (CBC) with Platelets',
      orderedBy: 'Internal Medicine Team',
      sampleStatus: 'collected',
      referenceRange: 'Standard adult hematology',
      date: '2026-10-12',
    },
  ])

  const [activeTestId, setActiveTestId] = useState<string | null>(null)
  const [resultInput, setResultInput] = useState('')
  const [notesInput, setNotesInput] = useState('')
  const [updating, setUpdating] = useState(false)

  function completeTest(testId: string) {
    if (!resultInput.trim()) return
    setUpdating(true)
    setTimeout(() => {
      setTests((prev) =>
        prev.map((t) =>
          t.id === testId
            ? { ...t, sampleStatus: 'completed', resultValue: resultInput, notes: notesInput }
            : t
        )
      )
      setResultInput('')
      setNotesInput('')
      setActiveTestId(null)
      setUpdating(false)
    }, 400)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in-up space-y-10">
      {/* Header */}
      <div className="border-b border-[#E6E6DC] pb-6">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#767676]">
            Pathology & Diagnostic Laboratory Wing
          </p>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified NABL Accreditation: NABL-2021-9923
          </span>
        </div>
        <h1 className="text-[32px] font-bold text-[#1F1F1F] leading-[40px] tracking-[-0.025em]">
          Vignesh Loganathan&apos;s Laboratory Station
        </h1>
        <p className="text-[14px] text-[#767676] mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>Senior Clinical Lab Technologist</span>
          <span>•</span>
          <span>Aadhaar: <span className="font-mono">7890 1234 5678</span></span>
          <span>•</span>
          <span>Phone: +91 98401 00006</span>
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E6E6DC] rounded-2xl bg-[#1F1F1F] text-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#A3A3A3]">
                Samples In Processing
              </p>
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <p className="stat-md text-white mb-1">
              {tests.filter((t) => t.sampleStatus !== 'completed').length}
            </p>
            <p className="text-[12px] text-amber-300">Requires assay run & report entry</p>
          </CardContent>
        </Card>

        <Card className="border-[#E6E6DC] rounded-2xl bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#767676]">
                Reports Completed Today
              </p>
              <div className="w-8 h-8 rounded-xl bg-[#F4F4F4] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="stat-md text-[#1F1F1F] mb-1">
              {tests.filter((t) => t.sampleStatus === 'completed').length}
            </p>
            <p className="text-[12px] text-[#767676]">Transmitted to attending physicians</p>
          </CardContent>
        </Card>

        <Card className="border-[#E6E6DC] rounded-2xl bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#767676]">
                Analyzer Calibration
              </p>
              <div className="w-8 h-8 rounded-xl bg-[#F4F4F4] flex items-center justify-center">
                <Activity className="w-4 h-4 text-[#1F1F1F]" />
              </div>
            </div>
            <p className="stat-md text-[#1F1F1F] mb-1">99.8%</p>
            <p className="text-[12px] text-[#767676]">Spectrometry & Automated Hemogram</p>
          </CardContent>
        </Card>
      </div>

      {/* Tests Queue */}
      <div className="space-y-4">
        <h2 className="text-[20px] font-bold text-[#1F1F1F]">Patient Diagnostic Work Orders</h2>
        <div className="space-y-3">
          {tests.map((test) => (
            <Card key={test.id} className="border-[#E6E6DC] rounded-2xl bg-white shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#1F1F1F] text-white flex items-center justify-center">
                        <FlaskConical className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-[16px] font-bold text-[#1F1F1F] leading-tight">{test.testName}</h3>
                        <p className="text-[12px] text-[#767676] mt-0.5">
                          Patient: <strong className="text-[#1F1F1F]">{test.patientName}</strong> • Ordered by: {test.orderedBy}
                        </p>
                      </div>
                    </div>

                    {test.resultValue && (
                      <div className="p-3 bg-[#F6F7ED] rounded-xl text-[13px] border border-[#E6E6DC]">
                        <p className="font-semibold text-[#1F1F1F]">Diagnostic Findings:</p>
                        <p className="font-mono text-[13px] text-[#1F1F1F] mt-0.5">{test.resultValue}</p>
                        {test.referenceRange && (
                          <p className="text-[11px] text-[#767676] mt-1">Ref Range: {test.referenceRange}</p>
                        )}
                        {test.notes && <p className="text-[12px] text-[#5D5F58] mt-1 italic">&quot;{test.notes}&quot;</p>}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold capitalize border ${
                        test.sampleStatus === 'completed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-900 border-amber-200'
                      }`}
                    >
                      {test.sampleStatus === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {test.sampleStatus}
                    </span>

                    {test.sampleStatus !== 'completed' && activeTestId !== test.id && (
                      <Button
                        size="sm"
                        onClick={() => setActiveTestId(test.id)}
                        className="rounded-full bg-[#1F1F1F] hover:bg-[#333] text-white text-[12px] font-semibold h-8 px-4"
                      >
                        Enter Lab Results
                      </Button>
                    )}

                    {activeTestId === test.id && (
                      <div className="w-full sm:w-[280px] space-y-2 mt-2 bg-[#F6F7ED] p-3 rounded-xl border border-[#E6E6DC]">
                        <Input
                          placeholder="Measured values (e.g. Glucose 98 mg/dL)"
                          value={resultInput}
                          onChange={(e) => setResultInput(e.target.value)}
                          className="h-8 text-[12px] bg-white rounded-lg"
                        />
                        <Input
                          placeholder="Technician observation"
                          value={notesInput}
                          onChange={(e) => setNotesInput(e.target.value)}
                          className="h-8 text-[12px] bg-white rounded-lg"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={updating || !resultInput.trim()}
                            onClick={() => completeTest(test.id)}
                            className="flex-1 rounded-full bg-[#1F1F1F] text-white text-[11px] h-7"
                          >
                            {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save & Publish Report'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveTestId(null)}
                            className="rounded-full text-[11px] h-7"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
