'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Sparkles, AlertTriangle, Loader2 } from 'lucide-react'
import type { Database } from '@/types/database'

type Summary = Database['public']['Tables']['summaries']['Row']

export function SummaryCard({
  patientId,
  initialSummaries
}: {
  patientId: string
  initialSummaries: Summary[]
}) {
  const [summaries, setSummaries] = useState(initialSummaries)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate summary')
      }

      const { summary } = await res.json()
      setSummaries([summary, ...summaries])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const latestSummary = summaries[0]

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Clinical Synthesis
          </h3>
          <p className="text-sm text-muted-foreground">
            Generate an AI-powered summary of the patient&apos;s entire clinical history.
          </p>
        </div>
        <Button onClick={generateSummary} disabled={loading} className="shrink-0 bg-primary/90 hover:bg-primary">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Synthesis...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate New Summary
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {latestSummary ? (
        <Card className="border-primary/20 shadow-sm animate-in fade-in-50 bg-card/60 backdrop-blur">
          <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-foreground">Latest Synthesis</CardTitle>
                <CardDescription>
                  Generated {new Date(latestSummary.created_at).toLocaleString()}
                </CardDescription>
              </div>
              <div className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-md border border-border/50">
                Model: {latestSummary.model}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {latestSummary.content}
            </div>
          </CardContent>
          <CardFooter className="bg-amber-500/10 border-t border-amber-500/20 py-3">
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              AI-generated summary. Verify with original clinical records before making medical decisions.
            </p>
          </CardFooter>
        </Card>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary/60" />
          </div>
          <p>No summaries generated yet.</p>
          <Button variant="outline" size="sm" onClick={generateSummary} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generate First Summary
          </Button>
        </div>
      )}
    </div>
  )
}
