import { NextRequest, NextResponse } from 'next/server'
import { gatherCommunityContext } from '@/lib/supabase/queries/ai-dashboard'
import { curateActivityFeed } from '@/lib/ai/generators/activity-feed'

/**
 * Manual endpoint: Curate activity feed on demand
 * For testing and manual regeneration
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add admin authentication here
    
    const context = await gatherCommunityContext()
    const activityFeed = await curateActivityFeed(context.discussions)

    return NextResponse.json({
      success: true,
      activityFeed,
      context: {
        totalDiscussions: context.discussions.length,
        selectedItems: activityFeed.length,
      },
    })
  } catch (error: any) {
    console.error('Error curating activity feed:', error)
    return NextResponse.json(
      { error: 'Failed to curate activity feed', details: error.message },
      { status: 500 }
    )
  }
}

