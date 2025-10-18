'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Upload, Loader2 } from 'lucide-react'
import type { User } from '@/types/index.types'

interface EnhancedProfileFormProps {
  user: User & {
    city?: string
    state?: string
    country?: string
    goals?: string
    interests?: string[]
    linkedin_url?: string
    twitter_url?: string
    experience_level?: string
    industry?: string
    team_size?: string
    time_zone?: string
    communication_style?: string
  }
}

export function EnhancedProfileForm({ user }: EnhancedProfileFormProps) {
  // Basic Info
  const [fullName, setFullName] = useState(user.full_name || '')
  const [bio, setBio] = useState(user.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '')
  
  // Professional
  const [experienceLevel, setExperienceLevel] = useState(user.experience_level || '')
  const [industry, setIndustry] = useState(user.industry || '')
  const [teamSize, setTeamSize] = useState(user.team_size || '')
  const [goals, setGoals] = useState(user.goals || '')
  
  // Communication
  const [communicationStyle, setCommunicationStyle] = useState(user.communication_style || '')
  const [linkedinUrl, setLinkedinUrl] = useState(user.linkedin_url || '')
  
  // New onboarding fields
  const [employer, setEmployer] = useState(user.employer || '')
  const [currentRole, setCurrentRole] = useState(user.current_role || '')
  const [foodPreferences, setFoodPreferences] = useState(user.food_preferences || '')
  const [allergies, setAllergies] = useState(user.allergies || '')
  
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          full_name: fullName,
          bio: bio || null,
          experience_level: experienceLevel || null,
          industry: industry || null,
          team_size: teamSize || null,
          goals: goals || null,
          communication_style: communicationStyle || null,
          linkedin_url: linkedinUrl || null,
          employer: employer || null,
          current_role: currentRole || null,
          food_preferences: foodPreferences || null,
          allergies: allergies || null,
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated successfully!')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setIsUploadingAvatar(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await (supabase as any)
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(data.publicUrl)
      toast.success('Avatar updated!')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar')
      console.error(error)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const initials = (fullName || user.email)
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Profile</CardTitle>
          <CardDescription className="text-base">
            Update your information to help connect with your cohort
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} alt={fullName} />
                  <AvatarFallback className="text-2xl bg-rogue-forest text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploadingAvatar}
                    onClick={() => document.getElementById('avatar')?.click()}
                  >
                    {isUploadingAvatar ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</>
                    ) : (
                      <><Upload className="mr-2 h-4 w-4" />Upload Avatar</>
                    )}
                  </Button>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <p className="text-xs text-rogue-slate mt-1">JPG, PNG. Max 5MB.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled className="bg-rogue-sage/5" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your cohort about yourself..."
                  rows={4}
                />
              </div>

            </TabsContent>

            {/* Professional Tab */}
            <TabsContent value="professional" className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employer">Employer / Organization</Label>
                  <Input
                    id="employer"
                    value={employer}
                    onChange={(e) => setEmployer(e.target.value)}
                    placeholder="Company or organization name"
                  />
                  <p className="text-xs text-rogue-slate">Visible on your profile</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentRole">Current Role / Title</Label>
                  <Input
                    id="currentRole"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    placeholder="Your job title"
                  />
                  <p className="text-xs text-rogue-slate">Visible on your profile</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Leadership Experience Level</Label>
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

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry/Sector</Label>
                  <Input
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="Tech, Healthcare, Education..."
                  />
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

              <div className="space-y-2">
                <Label htmlFor="goals">Leadership Development Goals</Label>
                <Textarea
                  id="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="What do you want to achieve through this program?"
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="communicationStyle">Communication Style</Label>
                <Select value={communicationStyle} onValueChange={setCommunicationStyle}>
                  <SelectTrigger id="communicationStyle">
                    <SelectValue placeholder="Select your preferred style..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct & Candid</SelectItem>
                    <SelectItem value="supportive">Warm & Supportive</SelectItem>
                    <SelectItem value="collaborative">Collaborative</SelectItem>
                    <SelectItem value="reflective">Reflective & Thoughtful</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-rogue-slate">
                  How you prefer to communicate with your partner
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              {/* Dietary Information */}
              <div className="border-t border-rogue-sage/20 pt-6">
                <div className="bg-rogue-sage/10 border border-rogue-sage/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-rogue-slate">
                    🔒 <strong>Private Information:</strong> Dietary information is kept confidential and only used for planning in-person events. It will not be displayed on your public profile.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foodPreferences">Food Preferences</Label>
                  <Input
                    id="foodPreferences"
                    value={foodPreferences}
                    onChange={(e) => setFoodPreferences(e.target.value)}
                    placeholder="e.g., Vegetarian, Vegan, Pescatarian"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies & Dietary Restrictions</Label>
                  <Textarea
                    id="allergies"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="List any food allergies or restrictions"
                    rows={3}
                  />
                  <p className="text-xs text-rogue-slate">
                    Important for in-person events and catering
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex gap-3 pt-6 border-t border-rogue-sage/20">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

