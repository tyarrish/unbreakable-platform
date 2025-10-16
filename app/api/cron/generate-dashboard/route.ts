import { NextRequest, NextResponse } from 'next/server'
import { gatherCommunityContext, getAllUsersActivityMetrics, saveDashboardContent } from '@/lib/supabase/queries/ai-dashboard'
import { generateHeroMessage } from '@/lib/ai/generators/hero-message'
import { curateActivityFeed } from '@/lib/ai/generators/activity-feed'
import { generateBatchPracticeActions } from '@/lib/ai/generators/practice-actions'
import { extractThemesFromDiscussions, determineEngagementLevel } from '@/lib/ai/analyzers/themes'

/**
 * Cron job endpoint: Generate dashboard content daily
 * Runs at 5am daily via Vercel Cron
 * 
 * Vercel cron jobs automatically include the Authorization header:
 * Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret authorization
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
    
    if (authHeader !== expectedAuth) {
      console.error('Unauthorized cron request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting dashboard content generation...')

    // 1. Gather community context
    const context = await gatherCommunityContext()
    console.log('Community context gathered:', {
      discussions: context.discussions.length,
      activeUsers: context.activeUsers,
      totalUsers: context.totalUsers,
    })

    // 2. Extract discussion themes
    const themes = extractThemesFromDiscussions(
      context.discussions.map(d => ({
        title: d.title,
        content: d.content,
      }))
    )
    console.log('Discussion themes:', themes)

    // 3. Determine engagement level
    const engagementLevel = determineEngagementLevel(
      context.activeUsers,
      context.totalUsers
    )

    // 4. Generate hero message
    console.log('Generating hero message...')
    const heroMessage = await generateHeroMessage({
      currentWeek: context.programState.currentWeek,
      currentModule: context.programState.currentModule,
      activeMembersThisWeek: context.activeUsers,
      totalMembers: context.totalUsers,
      discussionThemes: themes,
      nextEvent: context.upcomingEvents[0]?.title || null,
      engagementLevel,
    })
    console.log('Hero message generated:', heroMessage)

    // 5. Curate activity feed
    console.log('Curating activity feed...')
    const activityFeed = await curateActivityFeed(context.discussions)
    console.log('Activity feed curated:', activityFeed.length, 'items')

    // 6. Get all users' activity metrics
    console.log('Fetching user activity metrics...')
    const userMetrics = await getAllUsersActivityMetrics()
    console.log('User metrics fetched for', userMetrics.length, 'users')

    // 7. Generate personalized practice actions for all users
    console.log('Generating personalized practice actions...')
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
    console.log('Practice actions generated for', Object.keys(practiceActions).length, 'users')

    // 8. Save full dashboard content
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

    const contentId = await saveDashboardContent(
      'full_dashboard',
      dashboardContent,
      {
        discussionCount: context.discussions.length,
        themes,
        generatedAt: new Date().toISOString(),
      }
    )

    if (!contentId) {
      throw new Error('Failed to save dashboard content')
    }

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

