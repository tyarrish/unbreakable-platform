import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import type { User } from '@/types/index.types'

/**
 * Get the current user from server components
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) return null
  
  const { data: profile } = await (supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()) as any
  
  if (!profile) return null
  
  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name || undefined,
    role: profile.role,
    avatar_url: profile.avatar_url || undefined,
    bio: profile.bio || undefined,
    learning_preferences: profile.learning_preferences || undefined,
    partner_id: profile.partner_id || undefined,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  const supabase = await createServerClient()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error || !profile) return null
  
  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name || undefined,
    role: profile.role,
    avatar_url: profile.avatar_url || undefined,
    bio: profile.bio || undefined,
    learning_preferences: profile.learning_preferences || undefined,
    partner_id: profile.partner_id || undefined,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  
  return data
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(userId: string, file: File) {
  const supabase = createBrowserClient()
  
  // Delete old avatar if exists
  const { data: oldProfile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', userId)
    .single()
  
  if (oldProfile?.avatar_url) {
    const oldPath = oldProfile.avatar_url.split('/').pop()
    if (oldPath) {
      await supabase.storage
        .from('avatars')
        .remove([`${userId}/${oldPath}`])
    }
  }
  
  // Upload new avatar
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${userId}/${fileName}`
  
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file)
  
  if (uploadError) throw uploadError
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)
  
  // Update profile
  await updateUserProfile(userId, { avatar_url: publicUrl })
  
  return publicUrl
}

/**
 * Sign out user
 */
export async function signOut() {
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

