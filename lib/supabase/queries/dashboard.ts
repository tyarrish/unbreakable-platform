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
    // Get all modules
    const { data: allModules } = await supabase
      .from('modules')
      .select('id')
      .eq('is_published', true)

    const totalModules = allModules?.length || 8

    // Get lesson progress to calculate module completion
    const { data: lessonProgress } = await supabase
      .from('lesson_progress')
      .select('lesson_id, status')
      .eq('user_id', userId) as any

    const completedLessons = lessonProgress?.filter((lp: any) => lp.status === 'completed').length || 0
    
    // Estimate modules completed (8 lessons per module)
    const completedModules = Math.floor(completedLessons / 8)

    // Get discussion posts count
    const { count: discussionCount } = await supabase
      .from('discussion_posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId)

    // Get upcoming events (fixed column name from event_date to start_time)
    const now = new Date().toISOString()
    const { count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('start_time', now)

    // Get partner check-ins (from discussions or partner activity)
    const { count: checkinCount } = await supabase
      .from('discussion_posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId)
      .like('thread_id', '%partner%') // This is a simple approximation

    // Get reflections submitted (from lesson_progress with reflections)
    const { data: reflections } = await supabase
      .from('lesson_progress')
      .select('reflection')
      .eq('user_id', userId)
      .not('reflection', 'is', null) as any

    const reflectionsCount = reflections?.filter((r: any) => r.reflection && r.reflection.trim().length > 0).length || 0

    // Get books read (from reading_progress)
    const { data: booksProgress } = await supabase
      .from('reading_progress')
      .select('status')
      .eq('user_id', userId) as any

    const { data: allBooks } = await supabase
      .from('books')
      .select('id')

    const booksCompleted = booksProgress?.filter((b: any) => b.status === 'finished').length || 0
    const totalBooks = allBooks?.length || 8

    // Calculate overall progress based on completed lessons
    const totalLessonsEstimate = totalModules * 8 // 8 lessons per module
    const avgProgress = totalLessonsEstimate > 0
      ? Math.round((completedLessons / totalLessonsEstimate) * 100)
      : 0

    // Calculate time spent learning (sum from lesson_progress)
    const { data: timeProgress } = await supabase
      .from('lesson_progress')
      .select('time_spent_minutes')
      .eq('user_id', userId) as any

    const totalMinutes = timeProgress?.reduce((sum: number, lp: any) => sum + (lp.time_spent_minutes || 0), 0) || 0
    const timeSpentHours = Math.round(totalMinutes / 60)

    // Calculate days active (count distinct days with any activity)
    const { data: progressDays } = await supabase
      .from('lesson_progress')
      .select('updated_at')
      .eq('user_id', userId) as any

    const { data: postDays } = await supabase
      .from('discussion_posts')
      .select('created_at')
      .eq('author_id', userId) as any

    const allActivityDates = [
      ...(progressDays?.map((p: any) => new Date(p.updated_at).toDateString()) || []),
      ...(postDays?.map((p: any) => new Date(p.created_at).toDateString()) || [])
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
    // Get recent completed lessons
    const { data: lessonCompletions } = await supabase
      .from('lesson_progress')
      .select('id, updated_at, lesson_id, lessons(title, module_id, modules(title))')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .limit(5) as any

    lessonCompletions?.forEach((completion: any) => {
      activities.push({
        id: completion.id,
        type: 'module',
        title: 'Completed Lesson',
        description: completion.lessons?.title || 'Lesson',
        timestamp: completion.updated_at || new Date().toISOString(),
        icon: 'BookOpen'
      })
    })

    // Get recent discussion posts
    const { data: posts } = await supabase
      .from('discussion_posts')
      .select('id, created_at, content, thread_id, discussion_threads(title)')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .limit(5) as any

    posts?.forEach((post: any) => {
      activities.push({
        id: post.id,
        type: 'discussion',
        title: 'Posted in Discussion',
        description: post.discussion_threads?.title || 'Discussion',
        timestamp: post.created_at,
        icon: 'MessageSquare'
      })
    })

    // Get recent finished books
    const { data: bookProgress } = await supabase
      .from('reading_progress')
      .select('id, finished_at, book_id, books(title)')
      .eq('user_id', userId)
      .eq('status', 'finished')
      .not('finished_at', 'is', null)
      .order('finished_at', { ascending: false })
      .limit(3) as any

    bookProgress?.forEach((progress: any) => {
      activities.push({
        id: progress.id,
        type: 'book',
        title: 'Completed Book',
        description: progress.books?.title || 'Book',
        timestamp: progress.finished_at || progress.updated_at,
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
        start_time,
        end_time,
        event_type,
        location_type,
        location_address,
        zoom_link,
        is_required
      `)
      .gte('start_time', now)
      .order('start_time', { ascending: true })
      .limit(limit)

    return events || []
  } catch (error) {
    console.error('Error fetching upcoming events:', error)
    return []
  }
}




