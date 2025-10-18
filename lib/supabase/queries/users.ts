import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/index.types'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole // Deprecated - use roles instead
  roles: UserRole[] // Array to support multiple roles
  avatar_url?: string
  is_active: boolean
  invited_by?: string
  profile_completed: boolean
  created_at: string
  deactivated_at?: string
}

export interface Invite {
  id: string
  email: string
  full_name: string
  role: UserRole
  invited_by: string
  status: 'pending' | 'accepted' | 'expired'
  expires_at: string
  accepted_at?: string
  created_at: string
}

interface UserFilters {
  role?: UserRole
  isActive?: boolean
  search?: string
}

/**
 * Get all users with optional filters
 */
export async function getUsers(filters?: UserFilters): Promise<UserProfile[]> {
  const supabase = createClient()
  
  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.role) {
    query = query.eq('role', filters.role)
  }

  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive)
  }

  if (filters?.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return data as any as UserProfile[]
}

/**
 * Send an invite to a new user
 */
export async function sendInvite(email: string, fullName: string, role: UserRole) {
  const supabase = createClient()

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  // Check if there's a pending invite
  const { data: existingInvite } = await supabase
    .from('invites')
    .select('id')
    .eq('email', email)
    .eq('status', 'pending')
    .single()

  if (existingInvite) {
    throw new Error('An invite has already been sent to this email')
  }

  // Get current user ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

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

  if (inviteError) throw inviteError

  // Use Supabase Admin API to invite user by email
  // This sends a proper invite email (not a confirmation email)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
  const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: fullName,
      role,
      invite_id: invite.id,
    },
    redirectTo: `${siteUrl}/accept-invite`,
  })

  if (emailError) {
    // If invite fails, delete the invite record
    await (supabase as any)
      .from('invites')
      .delete()
      .eq('id', invite.id)
    
    throw emailError
  }

  return invite
}

/**
 * Get all invites with optional status filter
 */
export async function getInvites(status?: 'pending' | 'accepted' | 'expired'): Promise<Invite[]> {
  const supabase = createClient()

  let query = supabase
    .from('invites')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Invite[]
}

/**
 * Update a user's role (deprecated - use updateUserRoles instead)
 */
export async function updateUserRole(userId: string, role: UserRole) {
  const supabase = createClient()

  // Prevent self-role change to avoid locking yourself out
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id === userId) {
    throw new Error('Cannot change your own role')
  }

  console.log('Updating user role:', { userId, role })

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ role, roles: [role], updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    console.error('Role update error:', error)
    throw error
  }

  console.log('Role updated successfully')
  
  // Verify the update
  const { data: updatedProfile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', userId)
    .single()
  
  console.log('Verified roles after update:', updatedProfile)
}

/**
 * Update a user's roles (supports multiple roles)
 */
export async function updateUserRoles(userId: string, roles: UserRole[]) {
  const supabase = createClient()

  // Prevent self-role change to avoid locking yourself out
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id === userId) {
    throw new Error('Cannot change your own roles')
  }

  if (roles.length === 0) {
    throw new Error('User must have at least one role')
  }

  console.log('Updating user roles:', { userId, roles })

  // Update both role (for backward compatibility) and roles
  const primaryRole = roles.includes('admin') ? 'admin' : roles.includes('facilitator') ? 'facilitator' : 'participant'

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ 
      role: primaryRole, // Keep single role for backward compatibility
      roles: roles, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', userId)

  if (error) {
    console.error('Roles update error:', error)
    throw error
  }

  console.log('Roles updated successfully')
  
  // Verify the update
  const { data: updatedProfile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', userId)
    .single()
  
  console.log('Verified roles after update:', updatedProfile)
}

/**
 * Deactivate a user account
 */
export async function deactivateUser(userId: string) {
  const supabase = createClient()

  // Prevent self-deactivation
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id === userId) {
    throw new Error('Cannot deactivate your own account')
  }

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ 
      is_active: false,
      deactivated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) throw error
}

/**
 * Reactivate a user account
 */
export async function reactivateUser(userId: string) {
  const supabase = createClient()

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ 
      is_active: true,
      deactivated_at: null
    })
    .eq('id', userId)

  if (error) throw error
}

/**
 * Delete a user account
 */
export async function deleteUser(userId: string) {
  const supabase = createClient()

  // Prevent self-deletion
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id === userId) {
    throw new Error('Cannot delete your own account')
  }

  // Note: This will cascade delete due to foreign key constraints
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (error) throw error
}

/**
 * Bulk deactivate multiple users
 */
export async function bulkDeactivateUsers(userIds: string[]) {
  const supabase = createClient()

  // Get current user to prevent self-deactivation
  const { data: { user } } = await supabase.auth.getUser()
  const filteredIds = userIds.filter(id => id !== user?.id)

  if (filteredIds.length === 0) {
    throw new Error('Cannot deactivate selected users')
  }

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ 
      is_active: false,
      deactivated_at: new Date().toISOString()
    })
    .in('id', filteredIds)

  if (error) throw error
}

/**
 * Validate an invite token
 */
export async function validateInvite(inviteId: string): Promise<Invite | null> {
  const supabase = createClient()

  const { data: invite, error } = await (supabase as any)
    .from('invites')
    .select('*')
    .eq('id', inviteId)
    .eq('status', 'pending')
    .single()

  if (error || !invite) return null

  // Check if expired
  const expiresAt = new Date(invite.expires_at)
  if (expiresAt < new Date()) {
    // Mark as expired
    await (supabase as any)
      .from('invites')
      .update({ status: 'expired' })
      .eq('id', inviteId)
    
    return null
  }

  return invite as Invite
}

/**
 * Validate an invite by token (new custom flow)
 */
export async function validateInviteByToken(token: string): Promise<Invite | null> {
  const supabase = createClient()

  const { data: invite, error } = await (supabase as any)
    .from('invites')
    .select('*')
    .eq('invite_token', token)
    .eq('status', 'pending')
    .single()

  if (error || !invite) {
    console.error('Invite not found for token:', error)
    return null
  }

  // Check if expired
  const expiresAt = new Date(invite.expires_at)
  if (expiresAt < new Date()) {
    // Mark as expired
    await (supabase as any)
      .from('invites')
      .update({ status: 'expired' })
      .eq('invite_token', token)
    
    console.log('Invite expired for token')
    return null
  }

  return invite as Invite
}

/**
 * Mark invite as accepted
 */
export async function acceptInvite(inviteId: string, userId: string) {
  const supabase = createClient()

  console.log('acceptInvite called with:', { inviteId, userId })

  const { error } = await (supabase as any)
    .from('invites')
    .update({ 
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('id', inviteId)

  if (error) {
    console.error('Error updating invite status:', error)
    throw error
  }

  console.log('Invite status updated to accepted')

  // Update profile with invited_by relationship
  const { data: invite } = await (supabase as any)
    .from('invites')
    .select('invited_by')
    .eq('id', inviteId)
    .single()

  if (invite?.invited_by) {
    await (supabase as any)
      .from('profiles')
      .update({ invited_by: invite.invited_by })
      .eq('id', userId)
    
    console.log('Profile invited_by relationship updated')
  }
}

/**
 * Mark user profile as completed
 */
export async function markProfileComplete(userId: string) {
  const supabase = createClient()

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ profile_completed: true })
    .eq('id', userId)

  if (error) throw error
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<UserProfile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data as any as UserProfile
}

