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

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    return { error: 'User with this email already exists' }
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

