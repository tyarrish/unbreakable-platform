import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: string // Deprecated - use roles instead
  roles: string[] // Array to support multiple roles
  avatar_url: string | null
  bio: string | null
  city: string | null
  state: string | null
  interests: string[] | null
  goals: string | null
  linkedin_url: string | null
  employer: string | null
  current_role: string | null
  created_at: string
  // NOTE: food_preferences and allergies are intentionally excluded - they are private
}

export interface UserFollow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

// Member Directory
export async function getAllMembers(limit: number = 50, offset: number = 0): Promise<UserProfile[]> {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)) as any
  
  if (error) throw error
  return data || []
}

export async function getFacilitators(): Promise<UserProfile[]> {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('profiles')
    .select('*')
    .contains('roles', ['facilitator'])
    .order('created_at', { ascending: true })) as any
  
  if (error) throw error
  return data || []
}

export async function searchMembers(query: string): Promise<UserProfile[]> {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('profiles')
    .select('*')
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,bio.ilike.%${query}%`)
    .limit(20)) as any
  
  if (error) throw error
  return data || []
}

export async function getMembersByLocation(city?: string, state?: string): Promise<UserProfile[]> {
  const supabase = createClient()
  
  let query = supabase.from('profiles').select('*')
  
  if (city) {
    query = query.ilike('city', `%${city}%`)
  }
  if (state) {
    query = query.ilike('state', `%${state}%`)
  }
  
  const { data, error } = await (query.limit(50)) as any
  
  if (error) throw error
  return data || []
}

export async function getMemberProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()) as any
  
  if (error) throw error
  return data
}

// Follow/Unfollow
export async function followUser(followerId: string, followingId: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await (supabase
    .from('user_follows') as any)
    .insert({
      follower_id: followerId,
      following_id: followingId
    })
  
  if (error) throw error
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await (supabase
    .from('user_follows') as any)
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
  
  if (error) throw error
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('user_follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single()) as any
  
  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

export async function getFollowers(userId: string): Promise<UserProfile[]> {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('user_follows')
    .select(`
      follower:profiles!user_follows_follower_id_fkey(*)
    `)
    .eq('following_id', userId)) as any
  
  if (error) throw error
  return data?.map((item: any) => item.follower).filter(Boolean) || []
}

export async function getFollowing(userId: string): Promise<UserProfile[]> {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('user_follows')
    .select(`
      following:profiles!user_follows_following_id_fkey(*)
    `)
    .eq('follower_id', userId)) as any
  
  if (error) throw error
  return data?.map((item: any) => item.following).filter(Boolean) || []
}

export async function getFollowerCount(userId: string): Promise<number> {
  const supabase = createClient()
  
  const { count, error } = await supabase
    .from('user_follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)
  
  if (error) throw error
  return count || 0
}

export async function getFollowingCount(userId: string): Promise<number> {
  const supabase = createClient()
  
  const { count, error } = await supabase
    .from('user_follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId)
  
  if (error) throw error
  return count || 0
}

// Update user profile location and interests
export async function updateUserLocation(
  userId: string,
  city?: string,
  state?: string
): Promise<void> {
  const supabase = createClient()
  
  const { error } = await (supabase
    .from('profiles') as any)
    .update({ city, state })
    .eq('id', userId)
  
  if (error) throw error
}

export async function updateUserInterests(userId: string, interests: string[]): Promise<void> {
  const supabase = createClient()
  
  const { error } = await (supabase
    .from('profiles') as any)
    .update({ interests })
    .eq('id', userId)
  
  if (error) throw error
}

export async function updateUserSocialLinks(
  userId: string,
  linkedinUrl?: string
): Promise<void> {
  const supabase = createClient()
  
  const { error } = await (supabase
    .from('profiles') as any)
    .update({ linkedin_url: linkedinUrl })
    .eq('id', userId)
  
  if (error) throw error
}




