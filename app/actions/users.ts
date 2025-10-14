'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { UserRole } from '@/types/index.types'

/**
 * Send an invite to a new user (server action)
 * Uses admin API to send proper invite email
 */
export async function sendUserInvite(email: string, fullName: string, role: UserRole) {
  const supabase = await createClient()

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

  // Check if user exists in auth.users (but not in profiles - orphaned auth user)
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const existingAuthUser = authUsers?.users?.find(u => u.email === email)
  
  if (existingAuthUser) {
    // Delete the orphaned auth user so we can send a fresh invite
    const { error: deleteError } = await supabase.auth.admin.deleteUser(existingAuthUser.id)
    if (deleteError) {
      console.error('Error deleting orphaned auth user:', deleteError)
      return { error: 'Cannot send invite - please contact support to clean up this email address' }
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
    // Create invite record
    const { data: invite, error: inviteError } = await (supabase as any)
      .from('invites')
      .insert({
        email,
        full_name: fullName,
        role,
        invited_by: user.id,
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Invite insert error:', inviteError)
      return { error: inviteError.message }
    }

    // Use Supabase Admin API to invite user by email
    // This requires service role key which is only available server-side
    const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName,
        role,
        invite_id: invite.id,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/accept-invite`,
    })

    if (emailError) {
      console.error('Invite email error:', emailError)
      
      // If invite fails, delete the invite record
      await (supabase as any)
        .from('invites')
        .delete()
        .eq('id', invite.id)
      
      return { error: emailError.message }
    }

    revalidatePath('/admin/users')
    return { success: true, invite }
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

    // Delete from auth.users
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    
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

  try {
    // Delete the invite record
    await (supabase as any)
      .from('invites')
      .delete()
      .eq('id', inviteId)

    // Check if there's an orphaned auth user and clean it up
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const orphanedAuthUser = authUsers?.users?.find(u => u.email === email)
    
    if (orphanedAuthUser) {
      await supabase.auth.admin.deleteUser(orphanedAuthUser.id)
    }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting invite:', error)
    return { error: error.message || 'Failed to delete invite' }
  }
}

