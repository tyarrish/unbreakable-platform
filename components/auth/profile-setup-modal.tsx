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
import { uploadBookCover } from '@/lib/utils/upload-book-cover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Upload, User } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileSetupModalProps {
  open: boolean
  onClose: () => void
  userId: string
  userName: string
  userEmail: string
}

export function ProfileSetupModal({ open, onClose, userId, userName, userEmail }: ProfileSetupModalProps) {
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

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

      // Update profile
      const { error: updateError } = await (supabase as any)
        .from('profiles')
        .update({
          bio: bio || null,
          avatar_url: finalAvatarUrl || null,
        })
        .eq('id', userId)

      if (updateError) throw updateError

      // Mark profile as completed
      await markProfileComplete(userId)

      toast.success('Profile setup complete!')
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

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Welcome to Rogue Leadership Training Experience! Let's set up your profile to help you get the most out of your journey.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isLoading}
            className="flex-1"
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : 'Complete Setup'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

