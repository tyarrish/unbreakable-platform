'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  submitCheckIn, 
  getWeeklyPrompt, 
  getPreviousWeekCheckIn,
  type CheckInData, 
  type WeeklyPrompt 
} from '@/lib/supabase/queries/partner-checkins'
import { Calendar, Sparkles, Target, Trophy, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface CheckInFormProps {
  userId: string
  partnerId: string
  weekNumber: number
  onComplete: () => void
}

export function CheckInForm({ userId, partnerId, weekNumber, onComplete }: CheckInFormProps) {
  const [prompt, setPrompt] = useState<WeeklyPrompt | null>(null)
  const [previousCheckIn, setPreviousCheckIn] = useState<any>(null)
  const [response, setResponse] = useState('')
  const [commitment, setCommitment] = useState('')
  const [wins, setWins] = useState('')
  const [challenges, setChallenges] = useState('')
  const [supportNeeded, setSupportNeeded] = useState('')
  const [reflection, setReflection] = useState('')
  const [lastWeekStatus, setLastWeekStatus] = useState<'completed' | 'partial' | 'missed'>('completed')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadPromptAndPrevious()
    loadDraft()
  }, [weekNumber])

  useEffect(() => {
    // Auto-save draft every 30 seconds
    const interval = setInterval(() => {
      saveDraft()
    }, 30000)

    return () => clearInterval(interval)
  }, [response, commitment, wins, challenges, supportNeeded, reflection])

  async function loadPromptAndPrevious() {
    const [promptData, prevCheckIn] = await Promise.all([
      getWeeklyPrompt(weekNumber),
      getPreviousWeekCheckIn(userId, weekNumber)
    ])

    setPrompt(promptData)
    setPreviousCheckIn(prevCheckIn)
  }

  function saveDraft() {
    if (!response && !commitment) return

    localStorage.setItem(`checkin-draft-${weekNumber}`, JSON.stringify({
      response,
      commitment,
      wins,
      challenges,
      supportNeeded,
      reflection,
      lastWeekStatus
    }))
  }

  function loadDraft() {
    const draft = localStorage.getItem(`checkin-draft-${weekNumber}`)
    if (draft) {
      try {
        const data = JSON.parse(draft)
        setResponse(data.response || '')
        setCommitment(data.commitment || '')
        setWins(data.wins || '')
        setChallenges(data.challenges || '')
        setSupportNeeded(data.supportNeeded || '')
        setReflection(data.reflection || '')
        setLastWeekStatus(data.lastWeekStatus || 'completed')
      } catch (error) {
        console.error('Error loading draft:', error)
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!response.trim() || !commitment.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const checkInData: CheckInData = {
        response,
        commitment,
        wins: wins || undefined,
        challenges: challenges || undefined,
        support_needed: supportNeeded || undefined,
        reflection: reflection || undefined,
        commitment_status: weekNumber > 1 ? lastWeekStatus : 'pending',
      }

      await submitCheckIn(userId, partnerId, weekNumber, prompt?.main_question || '', checkInData)

      // Clear draft
      localStorage.removeItem(`checkin-draft-${weekNumber}`)

      toast.success('Check-in submitted! Your partner will be notified.')
      onComplete()
    } catch (error: any) {
      console.error('Error submitting check-in:', error)
      toast.error(error.message || 'Failed to submit check-in')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!prompt) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-rogue-slate">Loading check-in prompt...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-rogue-gold/10 rounded-lg">
              <Calendar className="h-5 w-5 text-rogue-gold" />
            </div>
          </div>
          <CardTitle className="text-2xl">Week {weekNumber} Check-in</CardTitle>
          <CardDescription>Share your progress and commitments with your partner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Previous Week's Commitment Review */}
          {previousCheckIn && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Trophy className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 mb-2">Last Week's Commitment</h3>
                  <p className="text-sm text-orange-800 mb-3">"{previousCheckIn.commitment}"</p>
                  
                  <Label className="text-orange-900 mb-2 block">How did it go?</Label>
                  <div className="flex gap-2">
                    {[
                      { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700 border-green-300' },
                      { value: 'partial', label: 'Partially', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
                      { value: 'missed', label: 'Missed', color: 'bg-red-100 text-red-700 border-red-300' },
                    ].map(({ value, label, color }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setLastWeekStatus(value as any)}
                        className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                          lastWeekStatus === value ? color : 'bg-white text-rogue-slate border-rogue-sage/30'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Question */}
          <div className="space-y-2">
            <Label htmlFor="response" className="text-base font-semibold text-rogue-forest flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-rogue-gold" />
              {prompt.main_question}
            </Label>
            <Textarea
              id="response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              required
              className="resize-none"
            />
          </div>

          {/* This Week's Commitment */}
          <div className="space-y-2">
            <Label htmlFor="commitment" className="text-base font-semibold text-rogue-forest flex items-center gap-2">
              <Target className="h-4 w-4 text-rogue-copper" />
              {prompt.commitment_prompt}
            </Label>
            <Input
              id="commitment"
              value={commitment}
              onChange={(e) => setCommitment(e.target.value)}
              placeholder="Be specific..."
              required
            />
            <p className="text-xs text-rogue-slate">
              Make it specific and measurable so your partner can help you stay accountable
            </p>
          </div>

          {/* Wins (if week > 1) */}
          {weekNumber > 1 && (
            <div className="space-y-2">
              <Label htmlFor="wins" className="text-base font-semibold text-rogue-forest">
                Wins from Last Week
              </Label>
              <Textarea
                id="wins"
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                placeholder="Celebrate your progress..."
                rows={2}
                className="resize-none"
              />
            </div>
          )}

          {/* Challenges */}
          <div className="space-y-2">
            <Label htmlFor="challenges" className="text-base font-semibold text-rogue-forest">
              Challenges You're Facing
            </Label>
            <Textarea
              id="challenges"
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="What obstacles are in your way?"
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Support Needed */}
          <div className="space-y-2">
            <Label htmlFor="supportNeeded" className="text-base font-semibold text-rogue-forest">
              Support You Need
            </Label>
            <Textarea
              id="supportNeeded"
              value={supportNeeded}
              onChange={(e) => setSupportNeeded(e.target.value)}
              placeholder="How can your partner support you?"
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Module Reflection */}
          {prompt.reflection_prompt && (
            <div className="space-y-2">
              <Label htmlFor="reflection" className="text-base font-semibold text-rogue-forest">
                {prompt.reflection_prompt}
              </Label>
              <Textarea
                id="reflection"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Your reflection..."
                rows={3}
                className="resize-none"
              />
            </div>
          )}

          {/* Submit */}
          <div className="pt-4 border-t border-rogue-sage/20">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-rogue-gold to-rogue-copper"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Complete Check-in'}
            </Button>
            <p className="text-xs text-rogue-slate text-center mt-2">
              Your partner will be notified when you submit
            </p>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

