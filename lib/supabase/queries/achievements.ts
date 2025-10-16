import { createClient } from '@/lib/supabase/client'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string | null
  category: 'learning' | 'community' | 'consistency' | 'special'
  points: number
  requirements: Record<string, any> | null
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  achievement?: Achievement
}

export async function getAllAchievements(): Promise<Achievement[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('points', { ascending: true })
  
  if (error) throw error
  return (data as Achievement[]) || []
}

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
  
  if (error) throw error
  return (data as UserAchievement[]) || []
}

export async function awardAchievement(userId: string, achievementId: string): Promise<void> {
  const supabase = createClient()
  
  // Check if user already has this achievement
  const { data: existing } = await supabase
    .from('user_achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('achievement_id', achievementId)
    .single()
  
  if (existing) return // Already has this achievement
  
  const { error } = await (supabase
    .from('user_achievements') as any)
    .insert({
      user_id: userId,
      achievement_id: achievementId
    })
  
  if (error) throw error
  
  // Get achievement details for notification
  const { data: achievement } = await (supabase
    .from('achievements') as any)
    .select('*')
    .eq('id', achievementId)
    .single()
  
  if (achievement) {
    // Create notification
    await (supabase.from('notifications') as any).insert({
      user_id: userId,
      type: 'achievement',
      title: `Achievement Unlocked: ${achievement.name}!`,
      message: achievement.description,
      link: '/profile',
      metadata: { achievement_id: achievementId }
    })
    
    // Create activity
    await (supabase.from('activity_feed') as any).insert({
      user_id: userId,
      activity_type: 'achievement_earned',
      title: `Earned "${achievement.name}" achievement`,
      description: achievement.description,
      link: '/profile',
      metadata: { achievement_id: achievementId, icon: achievement.icon }
    })
  }
}

export async function getUserAchievementCount(userId: string): Promise<number> {
  const supabase = createClient()
  
  const { count, error } = await supabase
    .from('user_achievements')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  
  if (error) throw error
  return count || 0
}

export async function getTotalPoints(userId: string): Promise<number> {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('user_achievements')
    .select(`
      achievement:achievements(points)
    `)
    .eq('user_id', userId)) as any
  
  if (error) throw error
  
  const totalPoints = data?.reduce((sum: number, item: any) => {
    return sum + (item.achievement?.points || 0)
  }, 0) || 0
  
  return totalPoints
}

export async function getLeaderboard(limit: number = 10): Promise<Array<{
  user_id: string
  user: any
  total_points: number
  achievement_count: number
}>> {
  const supabase = createClient()
  
  // Get all users with their achievements
  const { data, error } = await (supabase
    .from('user_achievements')
    .select(`
      user_id,
      user:profiles!user_achievements_user_id_fkey(id, full_name, avatar_url),
      achievement:achievements(points)
    `)) as any
  
  if (error) throw error
  
  // Group by user and calculate totals
  const userMap = new Map<string, { user: any; total_points: number; achievement_count: number }>()
  
  data?.forEach((item: any) => {
    const userId = item.user_id
    const points = item.achievement?.points || 0
    
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        user: item.user,
        total_points: 0,
        achievement_count: 0
      })
    }
    
    const current = userMap.get(userId)!
    current.total_points += points
    current.achievement_count += 1
  })
  
  // Convert to array and sort
  const leaderboard = Array.from(userMap.entries())
    .map(([user_id, data]) => ({
      user_id,
      ...data
    }))
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, limit)
  
  return leaderboard
}




