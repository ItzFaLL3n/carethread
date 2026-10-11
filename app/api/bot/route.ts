import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { DAILY_HEALTH_TIPS, DEPARTMENTS } from '@/lib/demo/demoData'

interface TriageResult {
  department: string
  doctorName: string
  urgency: 'Routine' | 'Moderate' | 'Urgent' | 'Emergency'
  explanation: string
  advice: string[]
}

function evaluateSymptomsRuleBased(query: string): TriageResult {
  const lower = query.toLowerCase()

  if (lower.includes('chest') || lower.includes('heart') || lower.includes('palpitat') || lower.includes('breathless') || lower.includes('bp') || lower.includes('blood pressure')) {
    const isEmergency = lower.includes('severe') || lower.includes('crushing') || lower.includes('radiat') || lower.includes('arm') || lower.includes('faint')
    return {
      department: 'Cardiology',
      doctorName: 'Dr. Carol Chen (MD, Cardiology)',
      urgency: isEmergency ? 'Emergency' : 'Urgent',
      explanation: 'Your described symptoms relate to cardiovascular function and thoracic hemodynamics. Evaluation by a cardiologist with an electrocardiogram (ECG) and vitals assessment is recommended.',
      advice: [
        'Rest in a comfortable upright seated position.',
        'Avoid strenuous exertion and caffeine immediately.',
        isEmergency ? '⚠️ If chest tightness is crushing or radiating to your left arm or jaw, seek immediate Emergency Room care.' : 'Book a priority consultation for ECG and blood pressure checkup.',
      ],
    }
  }

  if (lower.includes('knee') || lower.includes('joint') || lower.includes('bone') || lower.includes('back pain') || lower.includes('spine') || lower.includes('fractur') || lower.includes('sprain') || lower.includes('stiff')) {
    return {
      department: 'Orthopedics',
      doctorName: 'Dr. Arun Kumar (MS, Orthopedics)',
      urgency: 'Moderate',
      explanation: 'These symptoms point to musculoskeletal strain, joint inflammation, or ligamentous involvement.',
      advice: [
        'Apply R.I.C.E protocol (Rest, Ice pack application for 15 mins, Compression, Elevation) if acute swelling is present.',
        'Avoid heavy lifting or high-impact stress on the affected joint.',
        'An orthopedic physical examination or X-ray will pinpoint joint cartilage or disc involvement.',
      ],
    }
  }

  if (lower.includes('rash') || lower.includes('skin') || lower.includes('itch') || lower.includes('redness') || lower.includes('allergy') || lower.includes('hives') || lower.includes('acne') || lower.includes('eczema')) {
    return {
      department: 'Dermatology',
      doctorName: 'Dr. Meera Sen (MD, Dermatology)',
      urgency: 'Routine',
      explanation: 'Your cutaneous symptoms suggest dermal hypersensitivity, contact dermatitis, or an allergic inflammatory reaction.',
      advice: [
        'Avoid scratching or applying harsh soaps or scented cosmetics to the irritated area.',
        'Keep the area cool and moisturized with fragrance-free calamine or plain barrier cream.',
        'Consult a dermatologist for targeted topical therapy or allergy testing.',
      ],
    }
  }

  if (lower.includes('child') || lower.includes('baby') || lower.includes('kid') || lower.includes('infant') || lower.includes('toddler')) {
    return {
      department: 'Pediatrics',
      doctorName: 'Dr. Ananya Rao (MD, Pediatrics)',
      urgency: 'Moderate',
      explanation: 'Pediatric physiological parameters require dedicated evaluation suited for developing children.',
      advice: [
        'Monitor temperature regularly using a digital thermometer.',
        'Ensure gentle hydration with oral electrolyte fluids and small frequent sips.',
        'Schedule a pediatric consultation to evaluate milestones and appropriate dosage.',
      ],
    }
  }

  if (lower.includes('headache') || lower.includes('migraine') || lower.includes('dizz') || lower.includes('numb') || lower.includes('tingl') || lower.includes('vertigo')) {
    return {
      department: 'Neurology',
      doctorName: 'Dr. Siddharth Verma (DM, Neurology)',
      urgency: 'Moderate',
      explanation: 'Neuro-vascular headaches, vestibular disturbances, or peripheral nerve signals should be reviewed.',
      advice: [
        'Rest in a quiet, dimmed room and maintain adequate hydration.',
        'Track headache onset, duration, and visual or sensory triggers in a log.',
        'A neurological consultation will evaluate cranial nerves and vascular perfusion.',
      ],
    }
  }

  if (lower.includes('ear') || lower.includes('throat') || lower.includes('sinus') || lower.includes('nose') || lower.includes('cough') && lower.includes('throat')) {
    return {
      department: 'ENT (Otolaryngology)',
      doctorName: 'Dr. Rajesh Patel (MS, ENT)',
      urgency: 'Routine',
      explanation: 'Upper respiratory and otolaryngological manifestations indicate localized mucosal irritation or infection.',
      advice: [
        'Warm saline gargles twice daily soothe pharyngeal mucosal tissue.',
        'Steam inhalation aids sinus drainage and relieves Eustachian tube pressure.',
        'Consult an ENT specialist for otoscopy or sinus evaluation.',
      ],
    }
  }

  // Default General Medicine
  return {
    department: 'General Medicine',
    doctorName: 'Dr. Carol Chen / Internal Medicine Team',
    urgency: lower.includes('fever') || lower.includes('vomit') ? 'Moderate' : 'Routine',
    explanation: 'Your symptoms are best evaluated through a comprehensive primary internal medicine assessment.',
    advice: [
      'Record your vitals (temperature, pulse, blood pressure).',
      'Stay hydrated with warm broths, oral rehydration solutions, or water.',
      'Book a general physician consultation for an accurate differential diagnosis and laboratory workup if needed.',
    ],
  }
}

export async function POST(req: Request) {
  try {
    const { message, isDailyTipRequest } = await req.json()

    // Random daily tip
    const randomTip = DAILY_HEALTH_TIPS[Math.floor(Math.random() * DAILY_HEALTH_TIPS.length)]

    if (isDailyTipRequest || !message || message.trim().toLowerCase().includes('daily tip') || message.trim().toLowerCase().includes('health tip')) {
      return NextResponse.json({
        greeting: 'Hello! Dr. Thread here with today’s clinical wellness reminder 🩺',
        reply: `Here is today's recommended medical wellness habit for you:\n\n**${randomTip.icon} ${randomTip.title} (${randomTip.category})**\n${randomTip.tip}\n\nConsistent small lifestyle habits are the most powerful form of preventive medicine! How else can I help you today?`,
        dailyTip: randomTip,
        department: null,
      })
    }

    const triage = evaluateSymptomsRuleBased(message)

    let doctorReply = ''

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
        const prompt = `You are Dr. Thread, an empathetic, clinical AI Doctor at CareThread Medical Center.
A patient says: "${message}".
Our clinical triage suggests the department: ${triage.department} (Doctor: ${triage.doctorName}, Urgency: ${triage.urgency}).
Write a friendly, professional 3-4 sentence response:
1. Warm greeting like a physician ("Hello! I'm Dr. Thread...", "Thank you for reaching out...").
2. Validate their symptom with empathetic clinical understanding.
3. Clearly recommend booking an appointment with the ${triage.department} department (specifying ${triage.doctorName}).
4. Mention 1 key self-care guidance step.
Keep it concise, reassuring, and do not use generic AI disclaimers at the start.`

        const res = await ai.models.generateContent({
          model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
          contents: prompt,
        })

        if (res.text) {
          doctorReply = res.text
        }
      } catch (err) {
        console.warn('Gemini triage fallback:', err)
      }
    }

    if (!doctorReply) {
      doctorReply = `Hello there! I'm Dr. Thread. 🩺\n\nBased on the symptoms you've described ("${message.slice(0, 80)}${message.length > 80 ? '…' : ''}"), this appears most consistent with issues handled by our **${triage.department}** team.\n\n${triage.explanation}\n\nI strongly suggest scheduling a consultation with **${triage.doctorName}** in our ${triage.department} Department for proper diagnostic confirmation.\n\nKey care steps while you wait:\n${triage.advice.map((a) => `• ${a}`).join('\n')}`
    }

    return NextResponse.json({
      greeting: 'Dr. Thread (CareThread Clinical AI)',
      reply: doctorReply,
      department: triage.department,
      doctorName: triage.doctorName,
      urgency: triage.urgency,
      advice: triage.advice,
      dailyTip: randomTip,
      action: {
        label: `Book with ${triage.department} Specialist`,
        department: triage.department,
      },
    })
  } catch (error: unknown) {
    console.error('Chatbot error:', error)
    return NextResponse.json({
      error: 'Doctor assistant encountered a processing issue.',
    }, { status: 500 })
  }
}
