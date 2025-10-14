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

  // Check if user exists in auth.users (but not in profiles - orphaned auth user)
  const { data: authUsers, error: listError } = await adminClient.auth.admin.listUsers()
  
  if (listError) {
    console.error('Error listing users:', listError)
    return { error: 'Failed to check for existing users. Ensure SUPABASE_SERVICE_ROLE_KEY is set.' }
  }

  const existingAuthUser = authUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
  
  if (existingAuthUser) {
    console.log(`Found orphaned auth user for ${email} (ID: ${existingAuthUser.id}), attempting to delete...`)
    
    // Delete the orphaned auth user so we can send a fresh invite
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(existingAuthUser.id)
    
    if (deleteError) {
      console.error('Error deleting orphaned auth user:', deleteError)
      return { 
        error: `Cannot send invite - orphaned user exists (ID: ${existingAuthUser.id}). ` +
               `Please delete them manually from Supabase Dashboard > Authentication > Users. ` +
               `Error: ${deleteError.message}` 
      }
    }
    
    console.log(`Successfully deleted orphaned auth user for ${email}`)
    
    // Wait a moment for the deletion to propagate
    await new Promise(resolve => setTimeout(resolve, 1000))
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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
    const redirectUrl = siteUrl 
      ? `https://${siteUrl.replace(/^https?:\/\//, '')}/accept-invite`
      : 'http://localhost:3000/accept-invite'
    
    console.log(`Attempting to send invite to ${email} with role ${role}`)
    console.log(`Redirect URL will be: ${redirectUrl}`)
    
    const { data: inviteData, error: emailError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName,
        role,
        invite_id: invite.id,
      },
      redirectTo: redirectUrl,
    })

    if (emailError) {
      console.error('Invite email error:', emailError)
      console.error('Full error object:', JSON.stringify(emailError, null, 2))
      
      // If invite fails, delete the invite record
      await (supabase as any)
        .from('invites')
        .delete()
        .eq('id', invite.id)
      
      // Provide helpful error message based on the error
      if (emailError.message?.includes('User not allowed') || emailError.message?.includes('not allowed')) {
        return { 
          error: `User already exists in authentication system. Please go to Supabase Dashboard > Authentication > Users and manually delete the user with email: ${email}, then try again.` 
        }
      }
      
      return { error: `Failed to send invite: ${emailError.message}` }
    }

    console.log('Invite sent successfully to:', email, 'User ID:', inviteData?.user?.id)

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

