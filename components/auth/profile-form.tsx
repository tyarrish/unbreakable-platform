'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Upload, Loader2 } from 'lucide-react'
import type { User } from '@/types/index.types'
import { isValidImageType, isValidFileSize } from '@/lib/utils/validation'

interface ProfileFormProps {
  user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [fullName, setFullName] = useState(user.full_name || '')
  const [bio, setBio] = useState(user.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '')
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio: bio,
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated successfully!')
      router.refresh()
    } catch (error) {
      toast.error('Failed to update profile')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!isValidImageType(file)) {
      toast.error('Please upload a valid image file (JPEG, PNG, WebP, GIF)')
      return
    }

    if (!isValidFileSize(file, 5 * 1024 * 1024)) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setIsUploadingAvatar(true)

    try {
      // Delete old avatar if exists
      if (user.avatar_url) {
        const oldPath = user.avatar_url.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`])
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      toast.success('Avatar updated successfully!')
      router.refresh()
    } catch (error) {
      toast.error('Failed to upload avatar')
      console.error(error)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const initials = (user.full_name || user.email)
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your profile information and avatar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} alt={fullName || 'User'} />
              <AvatarFallback className="text-2xl bg-rogue-forest text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploadingAvatar}
                    onClick={() => document.getElementById('avatar')?.click()}
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Avatar
                      </>
                    )}
                  </Button>
                </div>
              </Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
              />
              <p className="text-xs text-rogue-slate">
                JPG, PNG, WebP or GIF. Max 5MB.
              </p>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-rogue-cream/50"
            />
            <p className="text-xs text-rogue-slate">
              Email cannot be changed. Contact an administrator if needed.
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself and your leadership journey..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
            <p className="text-xs text-rogue-slate">
              Share your background, leadership goals, and what you hope to gain from RLTE.
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading}
            >
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
        </form>
      </CardContent>
    </Card>
  )
}

