import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase.types'

export interface DashboardStats {
  modulesCompleted: number
  totalModules: number
  discussionPosts: number
  upcomingEvents: number
  partnerCheckins: number
  totalCheckins: number
  progress: number
  timeSpentLearning: number
  reflectionsSubmitted: number
  booksRead: number
  totalBooks: number
  daysActive: number
}

export interface ActivityItem {
  id: string
  type: 'module' | 'discussion' | 'reflection' | 'book' | 'event'
  title: string
  description: string
  timestamp: string
  icon?: string
}

/**
 * Get comprehensive dashboard statistics for a user
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = createClient()

  try {
    // Get modules progress
    const { data: moduleProgress } = await supabase
      .from('user_progress')
      .select('module_id, completion_percentage')
      .eq('user_id', userId)

    const { data: allModules } = await supabase
      .from('modules')
      .select('id')
      .eq('is_published', true)

    const completedModules = moduleProgress?.filter(m => m.completion_percentage >= 100).length || 0
    const totalModules = allModules?.length || 8

    // Get discussion posts count
    const { count: discussionCount } = await supabase
      .from('discussion_posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId)

    // Get upcoming events
    const now = new Date().toISOString()
    const { count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('event_date', now)

    // Get partner check-ins (from discussions or partner activity)
    const { count: checkinCount } = await supabase
      .from('discussion_posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId)
      .like('thread_id', '%partner%') // This is a simple approximation

    // Get reflections submitted (from lesson completions with reflections)
    const { data: reflections } = await supabase
      .from('lesson_completions')
      .select('reflection_text')
      .eq('user_id', userId)
      .not('reflection_text', 'is', null)

    const reflectionsCount = reflections?.filter(r => r.reflection_text && r.reflection_text.trim().length > 0).length || 0

    // Get books read (from user_progress where book_id is not null)
    const { data: booksProgress } = await supabase
      .from('user_progress')
      .select('book_id, completion_percentage')
      .eq('user_id', userId)
      .not('book_id', 'is', null)

    const { data: allBooks } = await supabase
      .from('books')
      .select('id')

    const booksCompleted = booksProgress?.filter(b => b.completion_percentage >= 100).length || 0
    const totalBooks = allBooks?.length || 8

    // Calculate overall progress (average of module completion)
    const avgProgress = moduleProgress && moduleProgress.length > 0
      ? Math.round(moduleProgress.reduce((sum, m) => sum + (m.completion_percentage || 0), 0) / totalModules)
      : 0

    // Calculate time spent learning (sum of video watch time and estimated reading time)
    const { data: videoProgress } = await supabase
      .from('video_progress')
      .select('watched_duration')
      .eq('user_id', userId)

    const totalVideoTime = videoProgress?.reduce((sum, v) => sum + (v.watched_duration || 0), 0) || 0
    const timeSpentHours = Math.round(totalVideoTime / 3600) // Convert seconds to hours

    // Calculate days active (count distinct days with any activity)
    const { data: progressDays } = await supabase
      .from('user_progress')
      .select('updated_at')
      .eq('user_id', userId)

    const { data: postDays } = await supabase
      .from('discussion_posts')
      .select('created_at')
      .eq('author_id', userId)

    const allActivityDates = [
      ...(progressDays?.map(p => new Date(p.updated_at).toDateString()) || []),
      ...(postDays?.map(p => new Date(p.created_at).toDateString()) || [])
    ]
    const uniqueDays = new Set(allActivityDates).size

    return {
      modulesCompleted: completedModules,
      totalModules,
      discussionPosts: discussionCount || 0,
      upcomingEvents: eventsCount || 0,
      partnerCheckins: checkinCount || 0,
      totalCheckins: 32, // 8 months * 4 weeks = 32 weekly check-ins
      progress: avgProgress,
      timeSpentLearning: timeSpentHours,
      reflectionsSubmitted: reflectionsCount,
      booksRead: booksCompleted,
      totalBooks,
      daysActive: uniqueDays || 1
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    // Return default values on error
    return {
      modulesCompleted: 0,
      totalModules: 8,
      discussionPosts: 0,
      upcomingEvents: 0,
      partnerCheckins: 0,
      totalCheckins: 32,
      progress: 0,
      timeSpentLearning: 0,
      reflectionsSubmitted: 0,
      booksRead: 0,
      totalBooks: 8,
      daysActive: 1
    }
  }
}

/**
 * Get recent activity feed for a user
 */
export async function getRecentActivity(userId: string, limit = 10): Promise<ActivityItem[]> {
  const supabase = createClient()
  const activities: ActivityItem[] = []

  try {
    // Get recent lesson completions
    const { data: lessonCompletions } = await supabase
      .from('lesson_completions')
      .select(`
        id,
        completed_at,
        lessons!inner(title, modules!inner(title))
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(5)

    lessonCompletions?.forEach(completion => {
      activities.push({
        id: completion.id,
        type: 'module',
        title: 'Completed Lesson',
        description: `${(completion as any).lessons?.title || 'Lesson'}`,
        timestamp: completion.completed_at || new Date().toISOString(),
        icon: 'BookOpen'
      })
    })

    // Get recent discussion posts
    const { data: posts } = await supabase
      .from('discussion_posts')
      .select(`
        id,
        created_at,
        content,
        threads!inner(title)
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    posts?.forEach(post => {
      activities.push({
        id: post.id,
        type: 'discussion',
        title: 'Posted in Discussion',
        description: (post as any).threads?.title || 'Discussion',
        timestamp: post.created_at,
        icon: 'MessageSquare'
      })
    })

    // Get recent book progress
    const { data: bookProgress } = await supabase
      .from('user_progress')
      .select(`
        id,
        updated_at,
        completion_percentage,
        books!inner(title)
      `)
      .eq('user_id', userId)
      .not('book_id', 'is', null)
      .gte('completion_percentage', 100)
      .order('updated_at', { ascending: false })
      .limit(3)

    bookProgress?.forEach(progress => {
      activities.push({
        id: progress.id,
        type: 'book',
        title: 'Completed Book',
        description: (progress as any).books?.title || 'Book',
        timestamp: progress.updated_at,
        icon: 'BookOpen'
      })
    })

    // Sort all activities by timestamp and limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }
}

/**
 * Get upcoming events for the user
 */
export async function getUpcomingEvents(limit = 5) {
  const supabase = createClient()

  try {
    const now = new Date().toISOString()
    
    const { data: events } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        event_date,
        event_type,
        location,
        is_virtual,
        meeting_link
      `)
      .gte('event_date', now)
      .order('event_date', { ascending: true })
      .limit(limit)

    return events || []
  } catch (error) {
    console.error('Error fetching upcoming events:', error)
    return []
  }
}




