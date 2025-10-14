import { createClient } from '@/lib/supabase/client'

export interface ActivityItem {
  id: string
  user_id: string
  activity_type: 'lesson_completed' | 'discussion_post' | 'event_registered' | 'book_progress' | 'achievement_earned' | 'module_completed'
  title: string
  description?: string
  link?: string
  metadata: Record<string, any>
  created_at: string
  user?: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

export async function getActivityFeed(limit: number = 50, offset: number = 0): Promise<ActivityItem[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('activity_feed')
    .select(`
      *,
      user:profiles!activity_feed_user_id_fkey(
        id,
        full_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) throw error
  return data || []
}

export async function getUserActivity(userId: string, limit: number = 20): Promise<ActivityItem[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('activity_feed')
    .select(`
      *,
      user:profiles!activity_feed_user_id_fkey(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}

export async function getActivityByType(
  activityType: ActivityItem['activity_type'],
  limit: number = 20
): Promise<ActivityItem[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('activity_feed')
    .select(`
      *,
      user:profiles!activity_feed_user_id_fkey(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('activity_type', activityType)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}

export async function createActivity(
  userId: string,
  activityType: ActivityItem['activity_type'],
  title: string,
  description?: string,
  link?: string,
  metadata?: Record<string, any>
): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('activity_feed')
    .insert({
      user_id: userId,
      activity_type: activityType,
      title,
      description,
      link,
      metadata: metadata || {}
    })
  
  if (error) throw error
}

export function subscribeToActivityFeed(callback: (activity: ActivityItem) => void) {
  const supabase = createClient()
  
  const channel = supabase
    .channel('activity_feed')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_feed'
      },
      async (payload) => {
        // Fetch the user profile for the new activity
        const { data: user } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', (payload.new as ActivityItem).user_id)
          .single()
        
        callback({
          ...(payload.new as ActivityItem),
          user
        })
      }
    )
    .subscribe()
  
  return channel
}




