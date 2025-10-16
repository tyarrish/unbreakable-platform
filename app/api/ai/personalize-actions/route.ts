import { NextRequest, NextResponse } from 'next/server'
import { gatherCommunityContext, getUserActivityMetrics } from '@/lib/supabase/queries/ai-dashboard'
import { generatePracticeActions } from '@/lib/ai/generators/practice-actions'
import { createClient } from '@/lib/supabase/server'

/**
 * Manual endpoint: Generate personalized actions for a user
 * For testing and manual regeneration
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add admin authentication here
    
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const context = await gatherCommunityContext()
    const metrics = await getUserActivityMetrics(userId)

    const actions = await generatePracticeActions({
      userId,
      userName: profile.full_name || profile.email,
      daysActiveThisWeek: metrics.daysActive,
      postsThisWeek: metrics.posts,
      responsesToOthers: metrics.responses,
      modulesCompleted: metrics.modulesCompleted,
      lastPartnerInteraction: metrics.lastPartnerInteraction,
      currentWeek: context.programState.currentWeek,
      currentModule: context.programState.currentModule,
      nextEvent: context.upcomingEvents[0]?.title || null,
    })

    return NextResponse.json({
      success: true,
      actions,
      context: {
        userName: profile.full_name,
        metrics,
      },
    })
  } catch (error: any) {
    console.error('Error generating personalized actions:', error)
    return NextResponse.json(
      { error: 'Failed to generate personalized actions', details: error.message },
      { status: 500 }
    )
  }
}

