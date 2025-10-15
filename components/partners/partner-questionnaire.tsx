'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase/client'
import { Users, Target, MessageCircle, Clock, MapPin } from 'lucide-react'
import { toast } from 'sonner'

interface PartnerQuestionnaireProps {
  userId: string
  onComplete: () => void
}

export function PartnerQuestionnaire({ userId, onComplete }: PartnerQuestionnaireProps) {
  const [experienceLevel, setExperienceLevel] = useState('')
  const [industry, setIndustry] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [currentRole, setCurrentRole] = useState('')
  const [goals, setGoals] = useState<string[]>([])
  const [primaryFocus, setPrimaryFocus] = useState('')
  const [communicationStyle, setCommunicationStyle] = useState('')
  const [timeZone, setTimeZone] = useState('')
  const [preferredCheckInDay, setPreferredCheckInDay] = useState('')
  const [availability, setAvailability] = useState<string[]>([])
  const [partnerPreference, setPartnerPreference] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const supabase = createClient()

  const goalOptions = [
    'Improve delegation skills',
    'Enhance communication',
    'Build strategic thinking',
    'Develop team culture',
    'Navigate conflict better',
    'Increase self-awareness',
    'Manage stress/burnout',
    'Lead through change',
  ]

  const availabilityOptions = [
    'Weekday mornings',
    'Weekday afternoons',
    'Weekday evenings',
    'Weekend mornings',
    'Weekend afternoons',
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!experienceLevel || !communicationStyle || goals.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const responses = {
        experience_level: experienceLevel,
        industry,
        team_size: teamSize,
        current_role: currentRole,
        goals,
        primary_focus: primaryFocus,
        communication_style: communicationStyle,
        time_zone: timeZone,
        preferred_checkin_day: preferredCheckInDay,
        availability,
        partner_preference: partnerPreference,
        additional_info: additionalInfo,
      }

      // Save to questionnaire table
      const { error: questionnaireError } = await (supabase as any)
        .from('partner_questionnaire')
        .upsert({
          user_id: userId,
          responses,
          completed: true,
          submitted_at: new Date().toISOString()
        })

      if (questionnaireError) throw questionnaireError

      // Update profile with key fields
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .update({
          experience_level: experienceLevel,
          industry,
          team_size: teamSize,
          goals: primaryFocus,
          interests: goals,
          time_zone: timeZone,
          communication_style: communicationStyle,
          matching_preferences: { partner_preference: partnerPreference },
          availability_preferences: { preferred_day: preferredCheckInDay, times: availability },
        })
        .eq('id', userId)

      if (profileError) throw profileError

      toast.success('Questionnaire completed! You\'ll be matched with a partner soon.')
      onComplete()
    } catch (error: any) {
      console.error('Error submitting questionnaire:', error)
      toast.error(error.message || 'Failed to submit questionnaire')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-0 shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-rogue-gold/10 rounded-lg">
              <Users className="h-6 w-6 text-rogue-gold" />
            </div>
          </div>
          <CardTitle className="text-2xl">Partner Matching Questionnaire</CardTitle>
          <CardDescription className="text-base">
            Help us find the perfect accountability partner for your leadership journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Leadership Context */}
          <div className="space-y-4">
            <h3 className="font-semibold text-rogue-forest flex items-center gap-2">
              <Target className="h-4 w-4 text-rogue-gold" />
              Your Leadership Context
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level *</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger id="experienceLevel">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emerging">Emerging Leader</SelectItem>
                    <SelectItem value="mid-level">Mid-Level Leader</SelectItem>
                    <SelectItem value="senior">Senior Leader</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamSize">Team Size</Label>
                <Select value={teamSize} onValueChange={setTeamSize}>
                  <SelectTrigger id="teamSize">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Contributor</SelectItem>
                    <SelectItem value="2-10">2-10 people</SelectItem>
                    <SelectItem value="11-50">11-50 people</SelectItem>
                    <SelectItem value="51-200">51-200 people</SelectItem>
                    <SelectItem value="200+">200+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry/Sector</Label>
                <Input
                  id="industry"
                  placeholder="e.g., Tech, Healthcare, Education"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentRole">Current Role</Label>
                <Input
                  id="currentRole"
                  placeholder="e.g., Director of Operations"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Goals & Focus */}
          <div className="space-y-4">
            <h3 className="font-semibold text-rogue-forest">Program Goals</h3>

            <div className="space-y-3">
              <Label>What do you want to improve most? (Select all that apply) *</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                {goalOptions.map((goal) => (
                  <label key={goal} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={goals.includes(goal)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setGoals([...goals, goal])
                        } else {
                          setGoals(goals.filter(g => g !== goal))
                        }
                      }}
                      className="rounded border-rogue-sage/30 text-rogue-forest focus:ring-rogue-gold"
                    />
                    <span className="text-sm text-rogue-slate">{goal}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryFocus">Primary Focus Area</Label>
              <Textarea
                id="primaryFocus"
                placeholder="What's your #1 leadership development priority?"
                value={primaryFocus}
                onChange={(e) => setPrimaryFocus(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Communication Preferences */}
          <div className="space-y-4">
            <h3 className="font-semibold text-rogue-forest flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-rogue-copper" />
              Communication Preferences
            </h3>

            <div className="space-y-2">
              <Label htmlFor="communicationStyle">Communication Style *</Label>
              <Select value={communicationStyle} onValueChange={setCommunicationStyle}>
                <SelectTrigger id="communicationStyle">
                  <SelectValue placeholder="Select your style..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct & Candid</SelectItem>
                  <SelectItem value="supportive">Warm & Supportive</SelectItem>
                  <SelectItem value="collaborative">Collaborative & Brainstorming</SelectItem>
                  <SelectItem value="reflective">Reflective & Thoughtful</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeZone">Time Zone</Label>
                <Input
                  id="timeZone"
                  placeholder="e.g., PST, EST, GMT"
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredDay">Preferred Check-in Day</Label>
                <Select value={preferredCheckInDay} onValueChange={setPreferredCheckInDay}>
                  <SelectTrigger id="preferredDay">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Best Times for Calls (Select all that apply)</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                {availabilityOptions.map((time) => (
                  <label key={time} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={availability.includes(time)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAvailability([...availability, time])
                        } else {
                          setAvailability(availability.filter(t => t !== time))
                        }
                      }}
                      className="rounded border-rogue-sage/30 text-rogue-forest focus:ring-rogue-gold"
                    />
                    <span className="text-sm text-rogue-slate">{time}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Partner Preferences */}
          <div className="space-y-4">
            <h3 className="font-semibold text-rogue-forest">Partner Preferences</h3>

            <div className="space-y-2">
              <Label htmlFor="partnerPreference">Preferred Partner Type</Label>
              <Select value={partnerPreference} onValueChange={setPartnerPreference}>
                <SelectTrigger id="partnerPreference">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="similar">Similar experience level & industry</SelectItem>
                  <SelectItem value="complementary">Complementary skills & perspectives</SelectItem>
                  <SelectItem value="no-preference">No preference</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Anything Else We Should Know?</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Specific needs, preferences, or information that would help with partner matching..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-rogue-sage/20">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-rogue-gold to-rogue-copper"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Complete Questionnaire'}
            </Button>
            <p className="text-xs text-rogue-slate text-center mt-2">
              This helps us match you with the best accountability partner
            </p>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

