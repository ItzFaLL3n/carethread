'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Activity,
  Bot,
  Calendar,
  ChevronDown,
  HeartPulse,
  Lightbulb,
  MessageSquare,
  Send,
  Sparkles,
  Stethoscope,
  X,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'

interface Message {
  id: string
  sender: 'doctor' | 'patient'
  text: string
  timestamp: string
  department?: string
  doctorName?: string
  urgency?: 'Routine' | 'Moderate' | 'Urgent' | 'Emergency'
  advice?: string[]
  dailyTip?: {
    title: string
    category: string
    icon: string
    tip: string
  }
}

interface DoctorChatbotProps {
  onBookAppointmentWithDepartment?: (department: string) => void
  embedded?: boolean
}

export function DoctorChatbot({ onBookAppointmentWithDepartment, embedded = false }: DoctorChatbotProps) {
  const [isOpen, setIsOpen] = useState(embedded)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'doctor',
      text: "Hello! 👋 I'm Dr. Thread, your virtual clinical assistant at CareThread Medical Center. How are you feeling today?\n\nTell me about any symptoms you're having, and I'll recommend the proper specialist department or share our daily evidence-based healthcare tips!",
      timestamp: 'Just now',
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  async function sendMessage(textToSend?: string, isTip = false) {
    const text = textToSend || input
    if (!text.trim() && !isTip) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'patient',
      text: isTip ? 'Could you share today’s daily health tip?' : text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, isDailyTipRequest: isTip }),
      })

      const data = await res.json()

      const doctorMsg: Message = {
        id: `doc-${Date.now()}`,
        sender: 'doctor',
        text: data.reply || 'Thank you for reaching out. Please consult a physician.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        department: data.department,
        doctorName: data.doctorName,
        urgency: data.urgency,
        advice: data.advice,
        dailyTip: data.dailyTip,
      }

      setMessages((prev) => [...prev, doctorMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `doc-err-${Date.now()}`,
          sender: 'doctor',
          text: 'I apologize, but I am momentarily experiencing network delay. For urgent symptoms, please book a direct consultation with our General Medicine department.',
          timestamp: 'Just now',
          department: 'General Medicine',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    { label: '💡 Daily Health Tip', isTip: true },
    { label: 'Chest pain & palpitations', query: 'I have chest discomfort and racing heart palpitations' },
    { label: 'Knee joint ache & swelling', query: 'My knee joint aches and feels swollen when walking' },
    { label: 'Red itchy skin rash', query: 'I developed an itchy red rash across my arms' },
    { label: 'Fever & sore throat', query: 'I have a high fever, chills, and painful sore throat' },
  ]

  // Embedded mode (e.g. inside a page)
  if (embedded) {
    return (
      <div className="flex flex-col h-[650px] bg-white rounded-2xl border border-[#E6E6DC] shadow-sm overflow-hidden">
        {/* Doctor Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1F1F1F] text-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#1F1F1F]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-white leading-none">Dr. Thread, MD</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI Physician
                </span>
              </div>
              <p className="text-[12px] text-[#A3A3A3] mt-0.5 leading-none">
                Symptom Analysis & Department Guidance
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => sendMessage('', true)}
            className="text-[12px] text-white/80 hover:text-white hover:bg-white/10 rounded-full h-8 px-3"
          >
            <Lightbulb className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            Daily Tip
          </Button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#F6F7ED]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'patient' ? 'items-end' : 'items-start'}`}
            >
              {m.sender === 'doctor' && (
                <div className="flex items-center gap-1.5 mb-1 text-[11px] font-medium text-[#767676]">
                  <Stethoscope className="w-3 h-3 text-[#1F1F1F]" />
                  <span>Dr. Thread</span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-[22px] ${
                  m.sender === 'patient'
                    ? 'bg-[#1F1F1F] text-white rounded-br-none'
                    : 'bg-white text-[#1F1F1F] border border-[#E6E6DC] shadow-sm rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {/* Urgency and Department Recommendation Badge */}
                {m.department && (
                  <div className="mt-3 pt-3 border-t border-[#E6E6DC]">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#1F1F1F] text-white">
                        <HeartPulse className="w-3 h-3" />
                        Dept: {m.department}
                      </span>
                      {m.urgency && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            m.urgency === 'Emergency'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : m.urgency === 'Urgent'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {m.urgency} Priority
                        </span>
                      )}
                    </div>

                    {onBookAppointmentWithDepartment && (
                      <Button
                        size="sm"
                        onClick={() => onBookAppointmentWithDepartment(m.department!)}
                        className="mt-2 w-full rounded-full bg-[#1F1F1F] hover:bg-[#333] text-white text-[12px] font-semibold h-8 flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Fix Appointment with {m.department} Specialist
                      </Button>
                    )}
                  </div>
                )}

                {/* Daily Tip Card if attached */}
                {m.dailyTip && (
                  <div className="mt-3 p-3 bg-[#EDEDE5] rounded-xl border border-[#E6E6DC] text-[12px]">
                    <div className="flex items-center gap-2 font-semibold text-[#1F1F1F] mb-1">
                      <span className="text-[16px]">{m.dailyTip.icon}</span>
                      <span>{m.dailyTip.title}</span>
                    </div>
                    <p className="text-[#5D5F58] leading-relaxed">{m.dailyTip.tip}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-[12px] text-[#767676] bg-white px-3 py-2 rounded-xl border border-[#E6E6DC] w-fit">
              <Activity className="w-3.5 h-3.5 animate-spin text-[#1F1F1F]" />
              Dr. Thread is analyzing your clinical symptoms…
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-3 bg-white border-t border-[#E6E6DC] overflow-x-auto flex gap-2 shrink-0">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => (p.isTip ? sendMessage('', true) : sendMessage(p.query))}
              className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-[#EDEDE5] text-[#1F1F1F] hover:bg-[#E6E6DC] whitespace-nowrap transition-colors shrink-0"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
          className="p-3 bg-white border-t border-[#E6E6DC] flex gap-2 items-center"
        >
          <Input
            placeholder="Describe your symptoms (e.g. sharp headache, chest heaviness, fever)…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 h-10 bg-[#F6F7ED] border-[#E6E6DC] rounded-xl text-[13px]"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-10 px-4 rounded-xl bg-[#1F1F1F] hover:bg-[#333] text-white shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    )
  }

  // Floating Popover mode
  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#1F1F1F] text-white shadow-[0_12px_28px_rgba(0,0,0,0.25)] hover:bg-[#333] transition-all transform hover:scale-[1.02] border border-white/20 group"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#1F1F1F]" />
          </div>
          <div className="text-left">
            <p className="text-[13px] font-bold leading-tight">Dr. Thread (AI Doctor)</p>
            <p className="text-[11px] text-[#A3A3A3] leading-tight">Check Symptoms & Daily Tips</p>
          </div>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-32px)] h-[580px] max-h-[calc(100vh-60px)] flex flex-col bg-white rounded-3xl border border-[#E6E6DC] shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#1F1F1F] text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#1F1F1F]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-[14px] font-bold text-white leading-none">Dr. Thread</h4>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-300">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-[#A3A3A3] mt-0.5 leading-none">Clinical Symptom Advisor</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => sendMessage('', true)}
                className="text-[11px] text-white/80 hover:text-white hover:bg-white/10 rounded-full h-7 px-2.5"
                title="Daily health tip"
              >
                <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Tip
              </Button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F6F7ED]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'patient' ? 'items-end' : 'items-start'}`}
              >
                {m.sender === 'doctor' && (
                  <span className="text-[10px] font-medium text-[#767676] mb-1">Dr. Thread • {m.timestamp}</span>
                )}
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-[20px] ${
                    m.sender === 'patient'
                      ? 'bg-[#1F1F1F] text-white rounded-br-none'
                      : 'bg-white text-[#1F1F1F] border border-[#E6E6DC] shadow-sm rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Recommendation action */}
                  {m.department && (
                    <div className="mt-2.5 pt-2.5 border-t border-[#E6E6DC]">
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1F1F1F] text-white">
                          <HeartPulse className="w-2.5 h-2.5" />
                          {m.department}
                        </span>
                        {m.urgency && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              m.urgency === 'Emergency'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : m.urgency === 'Urgent'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {m.urgency}
                          </span>
                        )}
                      </div>

                      {onBookAppointmentWithDepartment && (
                        <Button
                          size="sm"
                          onClick={() => {
                            onBookAppointmentWithDepartment(m.department!)
                            setIsOpen(false)
                          }}
                          className="w-full rounded-full bg-[#1F1F1F] hover:bg-[#333] text-white text-[11px] font-semibold h-7 flex items-center justify-center gap-1"
                        >
                          <Calendar className="w-3 h-3" />
                          Fix Appointment Now
                        </Button>
                      )}
                    </div>
                  )}

                  {m.dailyTip && (
                    <div className="mt-2 p-2.5 bg-[#EDEDE5] rounded-xl border border-[#E6E6DC] text-[11px]">
                      <div className="flex items-center gap-1.5 font-semibold text-[#1F1F1F] mb-1">
                        <span>{m.dailyTip.icon}</span>
                        <span>{m.dailyTip.title}</span>
                      </div>
                      <p className="text-[#5D5F58]">{m.dailyTip.tip}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-[11px] text-[#767676] bg-white px-3 py-1.5 rounded-xl border border-[#E6E6DC] w-fit">
                <Activity className="w-3 h-3 animate-spin text-[#1F1F1F]" />
                Dr. Thread is typing…
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-white border-t border-[#E6E6DC] flex gap-1.5 overflow-x-auto shrink-0">
            {quickPrompts.slice(0, 4).map((p, idx) => (
              <button
                key={idx}
                type="button"
                disabled={loading}
                onClick={() => (p.isTip ? sendMessage('', true) : sendMessage(p.query))}
                className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#EDEDE5] text-[#1F1F1F] hover:bg-[#E6E6DC] whitespace-nowrap transition-colors shrink-0"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
            className="p-2.5 bg-white border-t border-[#E6E6DC] flex gap-2 items-center shrink-0"
          >
            <Input
              placeholder="Ask Dr. Thread about symptoms…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 h-9 bg-[#F6F7ED] border-[#E6E6DC] rounded-xl text-[12px]"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-9 px-3 rounded-xl bg-[#1F1F1F] hover:bg-[#333] text-white shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}
    </>
  )
}
