'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { UserRole } from '@/types/index.types'

/**
 * Send an invite to a new user (server action)
 * Uses admin API to send proper invite email
 */
export async function sendUserInvite(email: string, fullName: string, role: UserRole) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  // Check if user exists in profiles
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, is_active')
    .eq('email', email)
    .single() as any

  if (existingProfile) {
    if (existingProfile.is_active) {
      return { error: 'User with this email already exists and is active' }
    } else {
      return { error: 'User with this email exists but is deactivated. Reactivate them instead of sending a new invite.' }
    }
  }

  // Check if there's a pending invite
  const { data: existingInvite } = await (supabase as any)
    .from('invites')
    .select('id')
    .eq('email', email)
    .eq('status', 'pending')
    .single()

  if (existingInvite) {
    return { error: 'An invite has already been sent to this email' }
  }

  // Get current user ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Generate a secure random invite token
    const inviteToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    console.log(`Generated invite token for ${email}`)

    // Create invite record with our custom token
    const { data: invite, error: inviteError } = await (supabase as any)
      .from('invites')
      .insert({
        email,
        full_name: fullName,
        role,
        invited_by: user.id,
        invite_token: inviteToken,
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Invite insert error:', inviteError)
      return { error: inviteError.message }
    }

    // Construct the invite link with our custom token
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
    
    let inviteUrl: string
    if (siteUrl) {
      const cleanDomain = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
      inviteUrl = `https://${cleanDomain}/accept-invite?token=${inviteToken}`
    } else {
      inviteUrl = `http://localhost:3000/accept-invite?token=${inviteToken}`
    }
    
    console.log(`Created invite for ${email}`)
    console.log(`Invite URL: ${inviteUrl}`)

    revalidatePath('/admin/users')
    return { 
      success: true, 
      invite,
      inviteUrl // Return the URL so UI can display it
    }
  } catch (error: any) {
    console.error('Unexpected error sending invite:', error)
    return { error: error.message || 'Failed to send invite' }
  }
}

/**
 * Delete user from both auth and database (server action)
 */
export async function deleteUserCompletely(userId: string, userEmail: string) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  // Prevent self-deletion
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id === userId) {
    return { error: 'Cannot delete your own account' }
  }

  try {
    // Delete from profiles first (will cascade to related records)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
      return { error: profileError.message }
    }

    // Delete from auth.users using admin client
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)
    
    if (authError) {
      console.error('Error deleting auth user:', authError)
      // Profile is already deleted, so just log the error but don't fail
      console.warn('Profile deleted but auth user cleanup failed:', authError)
    }

    // Clean up any pending invites for this email
    await (supabase as any)
      .from('invites')
      .delete()
      .eq('email', userEmail)

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error deleting user:', error)
    return { error: error.message || 'Failed to delete user' }
  }
}

/**
 * Delete a pending invite (server action)
 */
export async function deletePendingInvite(inviteId: string, email: string) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  try {
    // Delete the invite record
    await (supabase as any)
      .from('invites')
      .delete()
      .eq('id', inviteId)

    // Check if there's an orphaned auth user and clean it up
    const { data: authUsers } = await adminClient.auth.admin.listUsers()
    const orphanedAuthUser = authUsers?.users?.find(u => u.email === email)
    
    if (orphanedAuthUser) {
      console.log(`Cleaning up orphaned auth user for ${email}`)
      await adminClient.auth.admin.deleteUser(orphanedAuthUser.id)
    }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting invite:', error)
    return { error: error.message || 'Failed to delete invite' }
  }
}

/**
 * Manual cleanup of orphaned auth user by email (server action)
 * Use this when auto-cleanup fails
 */
export async function cleanupOrphanedAuthUser(email: string) {
  const adminClient = createAdminClient()

  try {
    console.log(`Manual cleanup requested for email: ${email}`)
    
    const { data: authUsers, error: listError } = await adminClient.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return { error: `Failed to list users: ${listError.message}` }
    }

    const orphanedUser = authUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (!orphanedUser) {
      return { error: `No auth user found with email: ${email}` }
    }

    console.log(`Found auth user ID: ${orphanedUser.id} for email: ${email}`)
    
    // Attempt to delete
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(orphanedUser.id)
    
    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return { error: `Failed to delete user: ${deleteError.message}` }
    }

    console.log(`Successfully deleted orphaned auth user: ${email}`)
    return { success: true, message: `Cleaned up orphaned user: ${email}. You can now send a new invite.` }
    
  } catch (error: any) {
    console.error('Unexpected error cleaning up user:', error)
    return { error: error.message || 'Failed to cleanup user' }
  }
}

