'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Radio } from 'lucide-react'

interface RealtimeSubscriberProps {
  patientId: string
}

export function RealtimeSubscriber({ patientId }: RealtimeSubscriberProps) {
  const router = useRouter()
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`patient-realtime-${patientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visits',
          filter: `patient_id=eq.${patientId}`,
        },
        () => {
          router.refresh()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vitals',
          filter: `patient_id=eq.${patientId}`,
        },
        () => {
          router.refresh()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medicine_cycles',
          filter: `patient_id=eq.${patientId}`,
        },
        () => {
          router.refresh()
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [patientId, router])

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
        connected
          ? 'bg-primary/10 text-primary border-primary/25'
          : 'bg-muted text-muted-foreground border-border'
      }`}
      title={
        connected
          ? 'Realtime sync active: updates from other clinicians will appear live'
          : 'Realtime connecting…'
      }
    >
      <span className="relative flex h-2 w-2">
        {connected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            connected ? 'bg-primary' : 'bg-muted-foreground'
          }`}
        ></span>
      </span>
      <span className="flex items-center gap-1">
        <Radio className="w-3 h-3" />
        {connected ? 'Live Sync' : 'Syncing'}
      </span>
    </div>
  )
}
