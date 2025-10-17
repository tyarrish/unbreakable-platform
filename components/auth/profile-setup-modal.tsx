'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { markProfileComplete } from '@/lib/supabase/queries/users'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Upload, User as UserIcon, Briefcase, Utensils } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileSetupModalProps {
  open: boolean
  onClose: () => void
  userId: string
  userName: string
  userEmail: string
}

export function ProfileSetupModal({ open, onClose, userId, userName, userEmail }: ProfileSetupModalProps) {
  // Step tracking
  const [step, setStep] = useState(1)
  
  // Personal Info
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  
  // Professional Info
  const [employer, setEmployer] = useState('')
  const [currentRole, setCurrentRole] = useState('')
  
  // Dietary Info
  const [foodPreferences, setFoodPreferences] = useState('')
  const [allergies, setAllergies] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const totalSteps = 3

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }

      setAvatarFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit() {
    setIsLoading(true)

    try {
      let finalAvatarUrl = avatarUrl

      // Upload avatar if selected
      if (avatarFile) {
        const fileName = `${userId}-${Date.now()}.${avatarFile.name.split('.').pop()}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, avatarFile)

        if (uploadError) {
          console.error('Avatar upload error:', uploadError)
          toast.error('Failed to upload avatar')
        } else {
          const { data } = supabase.storage
            .from('uploads')
            .getPublicUrl(filePath)
          
          finalAvatarUrl = data.publicUrl
        }
      }

      // Update profile with all information
      const { error: updateError } = await (supabase as any)
        .from('profiles')
        .update({
          bio: bio || null,
          avatar_url: finalAvatarUrl || null,
          employer: employer || null,
          current_role: currentRole || null,
          food_preferences: foodPreferences || null,
          allergies: allergies || null,
        })
        .eq('id', userId)

      if (updateError) throw updateError

      // Mark profile as completed
      await markProfileComplete(userId)

      toast.success('Profile setup complete! Welcome to the cohort.')
      onClose()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSkip() {
    try {
      await markProfileComplete(userId)
      toast.success('You can complete your profile later in Settings')
      onClose()
    } catch (error: any) {
      console.error('Error skipping profile setup:', error)
      toast.error('Failed to skip setup')
    }
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  function nextStep() {
    if (step < totalSteps) setStep(step + 1)
  }

  function prevStep() {
    if (step > 1) setStep(step - 1)
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Complete Your Profile ({step}/{totalSteps})</DialogTitle>
          <DialogDescription>
            Help us get to know you better to create the best cohort experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <>
              <div className="flex items-center gap-2 text-sm text-rogue-slate mb-4">
                <UserIcon className="h-4 w-4" />
                <span>Personal Information</span>
              </div>

              {/* Avatar Upload */}
              <div className="space-y-3">
                <Label>Profile Picture (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarPreview || avatarUrl} alt={userName} />
                    <AvatarFallback className="bg-rogue-sage text-white text-xl">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      disabled={isLoading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </Button>
                    <p className="text-xs text-rogue-slate mt-1">
                      JPG, PNG or GIF. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a bit about yourself, your leadership experience, or what you hope to gain from this program..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  disabled={isLoading}
                  className="resize-none"
                />
                <p className="text-xs text-rogue-slate">
                  This will be visible to other cohort members
                </p>
              </div>
            </>
          )}

          {/* Step 2: Professional Info */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-2 text-sm text-rogue-slate mb-4">
                <Briefcase className="h-4 w-4" />
                <span>Professional Background</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employer">Employer / Organization</Label>
                <Input
                  id="employer"
                  placeholder="Company or organization name"
                  value={employer}
                  onChange={(e) => setEmployer(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-rogue-slate">
                  This will be visible on your profile
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentRole">Current Role / Title</Label>
                <Input
                  id="currentRole"
                  placeholder="Your job title or position"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-rogue-slate">
                  Helps cohort members understand your leadership context
                </p>
              </div>
            </>
          )}

          {/* Step 3: Dietary Info */}
          {step === 3 && (
            <>
              <div className="flex items-center gap-2 text-sm text-rogue-slate mb-4">
                <Utensils className="h-4 w-4" />
                <span>Dietary Information</span>
              </div>

              <div className="bg-rogue-sage/10 border border-rogue-sage/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-rogue-slate">
                  🔒 This information is kept private and only used for planning in-person events and catering.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="foodPreferences">Food Preferences (Optional)</Label>
                <Input
                  id="foodPreferences"
                  placeholder="e.g., Vegetarian, Vegan, Pescatarian, None"
                  value={foodPreferences}
                  onChange={(e) => setFoodPreferences(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies & Restrictions (Optional)</Label>
                <Textarea
                  id="allergies"
                  placeholder="e.g., Peanuts, Shellfish, Gluten, Dairy, etc."
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  rows={3}
                  disabled={isLoading}
                  className="resize-none"
                />
                <p className="text-xs text-rogue-slate">
                  Important for in-person events - not visible to other members
                </p>
              </div>
            </>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-1 mb-2">
          {[...Array(totalSteps)].map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i + 1 <= step ? 'bg-rogue-gold' : 'bg-rogue-sage/20'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isLoading}
              className="flex-1"
            >
              Back
            </Button>
          )}
          
          {step < totalSteps ? (
            <>
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={isLoading}
                className="flex-1"
              >
                Skip All
              </Button>
              <Button
                onClick={nextStep}
                disabled={isLoading}
                className="flex-1"
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={isLoading}
                className="flex-1"
              >
                Skip
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Saving...' : 'Complete Setup'}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
