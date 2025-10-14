import { createClient } from '@/lib/supabase/client'

export interface Notification {
  id: string
  user_id: string
  type: 'mention' | 'reply' | 'follow' | 'achievement' | 'event_reminder' | 'partner_message'
  title: string
  message?: string
  link?: string
  is_read: boolean
  metadata: Record<string, any>
  created_at: string
}

export async function getNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createClient()
  
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)
  
  if (error) throw error
  return count || 0
}

export async function markAsRead(notificationId: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
  
  if (error) throw error
}

export async function markAllAsRead(userId: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
  
  if (error) throw error
}

export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message?: string,
  link?: string,
  metadata?: Record<string, any>
): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      link,
      metadata: metadata || {}
    })
  
  if (error) throw error
}

export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
) {
  const supabase = createClient()
  
  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new as Notification)
      }
    )
    .subscribe()
  
  return channel
}




