import { createClient } from '@/lib/supabase/client'

export interface UserEngagement {
  id: string
  user_id: string
  date: string
  login_count: number
  lessons_completed: number
  discussions_posted: number
  events_attended: number
  total_points: number
  streak_days: number
  created_at: string
  updated_at: string
}

export async function getTodayEngagement(userId: string): Promise<UserEngagement | null> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await (supabase
    .from('user_engagement')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()) as any
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateEngagement(
  userId: string,
  updates: Partial<Pick<UserEngagement, 'login_count' | 'lessons_completed' | 'discussions_posted' | 'events_attended' | 'total_points'>>
): Promise<void> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  
  // Get today's engagement
  const { data: existing } = await (supabase
    .from('user_engagement')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()) as any
  
  if (existing) {
    // Update existing record
    const { error } = await (supabase
      .from('user_engagement') as any)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
    
    if (error) throw error
  } else {
    // Create new record
    const { error } = await (supabase
      .from('user_engagement') as any)
      .insert({
        user_id: userId,
        date: today,
        login_count: updates.login_count || 0,
        lessons_completed: updates.lessons_completed || 0,
        discussions_posted: updates.discussions_posted || 0,
        events_attended: updates.events_attended || 0,
        total_points: updates.total_points || 0,
        streak_days: 1
      })
    
    if (error) throw error
  }
}

export async function incrementEngagementMetric(
  userId: string,
  metric: 'login_count' | 'lessons_completed' | 'discussions_posted' | 'events_attended'
): Promise<void> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  
  const { data: existing } = await (supabase
    .from('user_engagement')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()) as any
  
  if (existing) {
    const { error } = await (supabase
      .from('user_engagement') as any)
      .update({
        [metric]: existing[metric] + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
    
    if (error) throw error
  } else {
    const { error } = await (supabase
      .from('user_engagement') as any)
      .insert({
        user_id: userId,
        date: today,
        [metric]: 1,
        streak_days: 1
      })
    
    if (error) throw error
  }
}

export async function getCurrentStreak(userId: string): Promise<number> {
  const supabase = createClient()
  
  // Get all engagement records ordered by date desc
  const { data, error } = await (supabase
    .from('user_engagement')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(100)) as any
  
  if (error) throw error
  if (!data || data.length === 0) return 0
  
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < data.length; i++) {
    const engagementDate = new Date(data[i].date)
    engagementDate.setHours(0, 0, 0, 0)
    
    const expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - i)
    expectedDate.setHours(0, 0, 0, 0)
    
    if (engagementDate.getTime() === expectedDate.getTime()) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

export async function getEngagementHistory(
  userId: string,
  days: number = 30
): Promise<UserEngagement[]> {
  const supabase = createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data, error } = await (supabase
    .from('user_engagement')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false })) as any
  
  if (error) throw error
  return data || []
}

export async function getTotalEngagementStats(userId: string): Promise<{
  total_lessons: number
  total_discussions: number
  total_events: number
  total_points: number
  current_streak: number
  longest_streak: number
}> {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('user_engagement')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })) as any
  
  if (error) throw error
  
  const total_lessons = data?.reduce((sum: number, item: any) => sum + item.lessons_completed, 0) || 0
  const total_discussions = data?.reduce((sum: number, item: any) => sum + item.discussions_posted, 0) || 0
  const total_events = data?.reduce((sum: number, item: any) => sum + item.events_attended, 0) || 0
  const total_points = data?.reduce((sum: number, item: any) => sum + item.total_points, 0) || 0
  
  // Calculate longest streak
  let longest_streak = 0
  let current_consecutive = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < (data?.length || 0); i++) {
    const engagementDate = new Date(data![i].date)
    engagementDate.setHours(0, 0, 0, 0)
    
    const expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - i)
    expectedDate.setHours(0, 0, 0, 0)
    
    if (engagementDate.getTime() === expectedDate.getTime()) {
      current_consecutive++
      longest_streak = Math.max(longest_streak, current_consecutive)
    } else {
      current_consecutive = 0
    }
  }
  
  const current_streak = await getCurrentStreak(userId)
  
  return {
    total_lessons,
    total_discussions,
    total_events,
    total_points,
    current_streak,
    longest_streak
  }
}




