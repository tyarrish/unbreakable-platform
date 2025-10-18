import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { gatherCommunityContext, getAllUsersActivityMetrics } from '@/lib/supabase/queries/ai-dashboard'

/**
 * Test endpoint: Check what data we're gathering for AI generation
 * Helps diagnose why generation might not be working
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .single()

    if (!profile || !(profile as any)?.roles?.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Gather context
    const context = await gatherCommunityContext()
    const userMetrics = await getAllUsersActivityMetrics()

    // Check what content exists
    const { data: existingContent, count } = await supabase
      .from('dashboard_content')
      .select('*', { count: 'exact' })
      .order('generated_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      success: true,
      diagnostics: {
        context: {
          programState: context.programState,
          discussionsCount: context.discussions.length,
          discussionSample: context.discussions.slice(0, 2).map(d => ({
            title: d.title,
            author: d.author_name,
          })),
          activeUsers: context.activeUsers,
          totalUsers: context.totalUsers,
          upcomingEvents: context.upcomingEvents.length,
        },
        users: {
          totalUsers: userMetrics.length,
          sampleUser: userMetrics[0] || null,
        },
        existingContent: {
          totalRecords: count,
          latestRecords: existingContent?.map(c => ({
            id: c.id,
            type: c.content_type,
            approved: c.approved,
            active: c.active,
            generated_at: c.generated_at,
          })),
        },
      },
    })
  } catch (error: any) {
    console.error('Diagnostic error:', error)
    return NextResponse.json(
      {
        error: 'Diagnostic failed',
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}

