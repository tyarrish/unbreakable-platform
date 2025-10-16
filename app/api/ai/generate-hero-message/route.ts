import { NextRequest, NextResponse } from 'next/server'
import { gatherCommunityContext } from '@/lib/supabase/queries/ai-dashboard'
import { generateHeroMessage } from '@/lib/ai/generators/hero-message'
import { extractThemesFromDiscussions, determineEngagementLevel } from '@/lib/ai/analyzers/themes'

/**
 * Manual endpoint: Generate hero message on demand
 * For testing and manual regeneration
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add admin authentication here
    
    const context = await gatherCommunityContext()
    const themes = extractThemesFromDiscussions(
      context.discussions.map(d => ({
        title: d.title,
        content: d.content,
      }))
    )
    const engagementLevel = determineEngagementLevel(
      context.activeUsers,
      context.totalUsers
    )

    const heroMessage = await generateHeroMessage({
      currentWeek: context.programState.currentWeek,
      currentModule: context.programState.currentModule,
      activeMembersThisWeek: context.activeUsers,
      totalMembers: context.totalUsers,
      discussionThemes: themes,
      nextEvent: context.upcomingEvents[0]?.title || null,
      engagementLevel,
      userName: '{firstName}', // Placeholder for testing
    })

    return NextResponse.json({
      success: true,
      heroMessage,
      context: {
        week: context.programState.currentWeek,
        module: context.programState.currentModule,
        themes,
        engagementLevel,
      },
    })
  } catch (error: any) {
    console.error('Error generating hero message:', error)
    return NextResponse.json(
      { error: 'Failed to generate hero message', details: error.message },
      { status: 500 }
    )
  }
}

