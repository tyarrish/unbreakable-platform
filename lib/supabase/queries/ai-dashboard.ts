import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase.types'

type DashboardContent = Database['public']['Tables']['dashboard_content']['Row']
type DashboardContentInsert = Database['public']['Tables']['dashboard_content']['Insert']
type UserActivitySnapshot = Database['public']['Tables']['user_activity_snapshot']['Row']
type EngagementFlag = Database['public']['Tables']['engagement_flags']['Row']
type EngagementFlagInsert = Database['public']['Tables']['engagement_flags']['Insert']
type ProgramSetting = Database['public']['Tables']['program_settings']['Row']

/**
 * Community context for AI generation
 */
export interface CommunityContext {
  programState: {
    currentWeek: number
    currentModule: string
    moduleId: string | null
  }
  discussions: Array<{
    id: string
    title: string
    content: string
    author_name: string
    created_at: string
    response_count: number
  }>
  activeUsers: number
  totalUsers: number
  upcomingEvents: Array<{
    id: string
    title: string
    start_time: string
    location?: string
    description?: string
  }>
}

/**
 * Gather all context needed for AI dashboard generation
 */
export async function gatherCommunityContext(): Promise<CommunityContext> {
  const supabase = createClient()

  // Get program state
  const { data: weekSetting } = await supabase
    .from('program_settings')
    .select('setting_value')
    .eq('setting_key', 'current_week')
    .single()

  const { data: moduleSetting } = await supabase
    .from('program_settings')
    .select('setting_value')
    .eq('setting_key', 'current_module')
    .single()

  const currentWeek = (weekSetting?.setting_value as any)?.week || 1
  const currentModule =
    (moduleSetting?.setting_value as any)?.title || 'Month 1: Personal Leadership Foundations'
  const moduleId = (moduleSetting?.setting_value as any)?.module_id || null

  // Get recent discussions (past 48 hours)
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  const { data: discussions } = await supabase
    .from('discussion_threads')
    .select(
      `
      id,
      title,
      content_html,
      created_at,
      created_by,
      profiles!discussion_threads_created_by_fkey(full_name),
      posts:discussion_posts(count)
    `
    )
    .gte('created_at', twoDaysAgo)
    .order('created_at', { ascending: false })
    .limit(20)

  const formattedDiscussions =
    discussions?.map((d: any) => ({
      id: d.id,
      title: d.title,
      content: d.content_html || '',
      author_name: d.profiles?.full_name || 'Unknown',
      created_at: d.created_at,
      response_count: d.posts?.[0]?.count || 0,
    })) || []

  // Get engagement metrics
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .contains('roles', ['participant'])
    .eq('is_active', true)

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: activeUserIds } = await supabase
    .from('user_activity_snapshot')
    .select('user_id')
    .gte('snapshot_date', sevenDaysAgo)
    .gt('logins_count', 0)

  const uniqueActiveUsers = new Set(activeUserIds?.map((u) => u.user_id) || []).size

  // Get upcoming events (next 3)
  const { data: events } = await supabase
    .from('events')
    .select('id, title, start_time, location, description')
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(3)

  return {
    programState: {
      currentWeek,
      currentModule,
      moduleId,
    },
    discussions: formattedDiscussions,
    activeUsers: uniqueActiveUsers,
    totalUsers: totalUsers || 0,
    upcomingEvents: (events as any) || [],
  }
}

/**
 * Get user activity metrics for a specific user
 */
export async function getUserActivityMetrics(userId: string) {
  const supabase = createClient()

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const sevenDaysAgoDate = sevenDaysAgo.toISOString().split('T')[0]

  const { data: snapshots } = await supabase
    .from('user_activity_snapshot')
    .select('*')
    .eq('user_id', userId)
    .gte('snapshot_date', sevenDaysAgoDate)
    .order('snapshot_date', { ascending: false })

  if (!snapshots || snapshots.length === 0) {
    return {
      daysActive: 0,
      posts: 0,
      responses: 0,
      lastPartnerInteraction: null,
      modulesCompleted: 0,
    }
  }

  const daysActive = snapshots.filter((s) => (s.logins_count || 0) > 0).length
  const posts = snapshots.reduce((sum, s) => sum + (s.posts_count || 0), 0)
  const responses = snapshots.reduce((sum, s) => sum + (s.responses_count || 0), 0)
  const modulesCompleted = Math.max(...snapshots.map((s) => s.modules_completed || 0))
  const lastPartnerInteraction = snapshots[0]?.last_partner_interaction

  return {
    daysActive,
    posts,
    responses,
    lastPartnerInteraction,
    modulesCompleted,
  }
}

/**
 * Get all users' activity metrics for batch processing
 */
export async function getAllUsersActivityMetrics() {
  const supabase = createClient()

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const sevenDaysAgoDate = sevenDaysAgo.toISOString().split('T')[0]

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .contains('roles', ['participant'])
    .eq('is_active', true)

  if (!profiles) return []

  const { data: snapshots } = await supabase
    .from('user_activity_snapshot')
    .select('*')
    .gte('snapshot_date', sevenDaysAgoDate)
    .order('snapshot_date', { ascending: false })

  const userMetrics = profiles.map((profile) => {
    const userSnapshots = snapshots?.filter((s) => s.user_id === profile.id) || []
    const daysActive = userSnapshots.filter((s) => (s.logins_count || 0) > 0).length
    const posts = userSnapshots.reduce((sum, s) => sum + (s.posts_count || 0), 0)
    const responses = userSnapshots.reduce((sum, s) => sum + (s.responses_count || 0), 0)
    const modulesCompleted = Math.max(
      ...userSnapshots.map((s) => s.modules_completed || 0),
      0
    )
    const lastPartnerInteraction = userSnapshots[0]?.last_partner_interaction || null

    return {
      userId: profile.id,
      userName: profile.full_name || profile.email,
      daysActive,
      posts,
      responses,
      modulesCompleted,
      lastPartnerInteraction,
    }
  })

  return userMetrics
}

/**
 * Save generated dashboard content
 */
export async function saveDashboardContent(
  contentType: 'hero_message' | 'cohort_activity' | 'practice_actions' | 'full_dashboard',
  content: any,
  generationContext?: any
): Promise<string | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('dashboard_content')
    .insert({
      content_type: contentType,
      content: content,
      generation_context: generationContext || null,
      approved: false,
      active: false,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error saving dashboard content:', error)
    return null
  }

  return data?.id || null
}

/**
 * Get active approved dashboard content
 */
export async function getActiveDashboardContent(): Promise<DashboardContent | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('dashboard_content')
    .select('*')
    .eq('active', true)
    .eq('approved', true)
    .eq('content_type', 'full_dashboard')
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching active dashboard content:', error)
    return null
  }

  return data
}

/**
 * Get pending dashboard content for admin review
 */
export async function getPendingDashboardContent(): Promise<DashboardContent[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('dashboard_content')
    .select('*')
    .eq('approved', false)
    .order('generated_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching pending dashboard content:', error)
    return []
  }

  return data || []
}

/**
 * Approve dashboard content and set as active
 */
export async function approveDashboardContent(contentId: string, userId: string): Promise<boolean> {
  const supabase = createClient()

  // First, deactivate all current active content
  await supabase
    .from('dashboard_content')
    .update({ active: false })
    .eq('active', true)

  // Then approve and activate the new content
  const { error } = await supabase
    .from('dashboard_content')
    .update({
      approved: true,
      approved_by: userId,
      approved_at: new Date().toISOString(),
      active: true,
    })
    .eq('id', contentId)

  if (error) {
    console.error('Error approving dashboard content:', error)
    return false
  }

  return true
}

/**
 * Create engagement flag
 */
export async function createEngagementFlag(
  flag: Omit<EngagementFlagInsert, 'id' | 'created_at'>
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.from('engagement_flags').insert(flag)

  if (error) {
    console.error('Error creating engagement flag:', error)
    return false
  }

  return true
}

/**
 * Get engagement flags with filters
 */
export async function getEngagementFlags(
  flagType?: 'red' | 'yellow' | 'green',
  resolved?: boolean
): Promise<EngagementFlag[]> {
  const supabase = createClient()

  let query = supabase
    .from('engagement_flags')
    .select(
      `
      *,
      profiles!engagement_flags_user_id_fkey(full_name, email)
    `
    )
    .order('created_at', { ascending: false })

  if (flagType) {
    query = query.eq('flag_type', flagType)
  }

  if (resolved !== undefined) {
    query = query.eq('resolved', resolved)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching engagement flags:', error)
    return []
  }

  return data || []
}

/**
 * Resolve engagement flag
 */
export async function resolveEngagementFlag(
  flagId: string,
  userId: string,
  notes?: string
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('engagement_flags')
    .update({
      resolved: true,
      resolved_by: userId,
      resolved_at: new Date().toISOString(),
      resolved_notes: notes || null,
    })
    .eq('id', flagId)

  if (error) {
    console.error('Error resolving engagement flag:', error)
    return false
  }

  return true
}

/**
 * Update program settings
 */
export async function updateProgramSetting(
  key: string,
  value: any,
  userId: string
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('program_settings')
    .upsert({
      setting_key: key,
      setting_value: value,
      updated_by: userId,
    })

  if (error) {
    console.error('Error updating program setting:', error)
    return false
  }

  return true
}

