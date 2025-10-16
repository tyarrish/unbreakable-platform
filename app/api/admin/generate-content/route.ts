import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { gatherCommunityContext, getAllUsersActivityMetrics } from '@/lib/supabase/queries/ai-dashboard'
import { generateHeroMessage } from '@/lib/ai/generators/hero-message'
import { curateActivityFeed } from '@/lib/ai/generators/activity-feed'
import { generateBatchPracticeActions } from '@/lib/ai/generators/practice-actions'
import { extractThemesFromDiscussions, determineEngagementLevel } from '@/lib/ai/analyzers/themes'

/**
 * Admin endpoint: Manually trigger dashboard content generation
 * Same logic as the cron job, but requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes((profile as { role: string }).role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('Manual dashboard generation triggered by:', user.email)

    // 1. Gather community context
    const context = await gatherCommunityContext()
    console.log('Community context gathered')

    // 2. Extract discussion themes
    const themes = extractThemesFromDiscussions(
      context.discussions.map((d) => ({
        title: d.title,
        content: d.content,
      }))
    )

    // 3. Determine engagement level
    const engagementLevel = determineEngagementLevel(context.activeUsers, context.totalUsers)

    // 4. Generate hero message
    const heroMessage = await generateHeroMessage({
      currentWeek: context.programState.currentWeek,
      currentModule: context.programState.currentModule,
      activeMembersThisWeek: context.activeUsers,
      totalMembers: context.totalUsers,
      discussionThemes: themes,
      nextEvent: context.upcomingEvents[0]?.title || null,
      engagementLevel,
      userName: '{firstName}', // Placeholder to be replaced per user
    })

    // 5. Curate activity feed
    const activityFeed = await curateActivityFeed(context.discussions)

    // 6. Get all users' activity metrics
    const userMetrics = await getAllUsersActivityMetrics()

    // 7. Generate personalized practice actions for all users
    const userContexts = userMetrics.map((user) => ({
      userId: user.userId,
      userName: user.userName,
      daysActiveThisWeek: user.daysActive,
      postsThisWeek: user.posts,
      responsesToOthers: user.responses,
      modulesCompleted: user.modulesCompleted,
      lastPartnerInteraction: user.lastPartnerInteraction,
      currentWeek: context.programState.currentWeek,
      currentModule: context.programState.currentModule,
      nextEvent: context.upcomingEvents[0]?.title || null,
    }))

    const practiceActions = await generateBatchPracticeActions(userContexts)

    // 8. Save full dashboard content using service role
    const dashboardContent = {
      heroMessage,
      activityFeed,
      practiceActions,
      programState: context.programState,
      upcomingEvents: context.upcomingEvents,
      communityStats: {
        activeUsers: context.activeUsers,
        totalUsers: context.totalUsers,
        engagementLevel,
      },
    }

    // Use service role client to bypass RLS policies
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { data, error } = await supabaseAdmin
      .from('dashboard_content')
      .insert({
        content_type: 'full_dashboard',
        content: dashboardContent,
        generation_context: {
          discussionCount: context.discussions.length,
          themes,
          generatedAt: new Date().toISOString(),
          triggeredBy: 'manual',
        },
        approved: false,
        active: false,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error saving dashboard content:', error)
      throw new Error('Failed to save dashboard content')
    }

    const contentId = data?.id

    console.log('Dashboard content saved with ID:', contentId)

    return NextResponse.json({
      success: true,
      contentId,
      stats: {
        heroMessage: heroMessage.substring(0, 50) + '...',
        activityFeedItems: activityFeed.length,
        usersWithActions: Object.keys(practiceActions).length,
        themes,
      },
    })
  } catch (error: any) {
    console.error('Error generating dashboard content:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate dashboard content',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

