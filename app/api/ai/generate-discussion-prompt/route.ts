import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { generateDiscussionPrompt } from '@/lib/ai/generators/discussion-prompt'
import { extractThemesFromDiscussions } from '@/lib/ai/analyzers/themes'

/**
 * Generate AI discussion prompt for the cohort
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
      .select('roles')
      .eq('id', user.id)
      .single()

    if (!profile || !(profile as any)?.roles?.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
    const currentModule = (moduleSetting?.setting_value as any)?.title || 'Month 1: Personal Leadership Foundations'

    // Get recent discussions to extract themes
    const { data: discussions } = await supabase
      .from('discussion_threads')
      .select('title, content_html')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20)

    const themes = extractThemesFromDiscussions(
      discussions?.map(d => ({
        title: d.title,
        content: d.content_html || '',
      })) || []
    )

    // Find stuck discussions (high views, low responses)
    const { data: stuckThreads } = await supabase
      .from('discussion_threads')
      .select(`
        title,
        views_count,
        last_activity_at,
        posts:discussion_posts(count)
      `)
      .gte('views_count', 10)
      .order('views_count', { ascending: false })
      .limit(5)

    const stuckDiscussions = stuckThreads
      ?.filter((t: any) => (t.posts?.[0]?.count || 0) < 3)
      .map((t: any) => ({
        title: t.title,
        lastActivity: t.last_activity_at,
      })) || []

    // Get cohort size and activity
    const { count: totalMembers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .contains('roles', ['participant'])
      .eq('is_active', true)

    const { data: activeUsers } = await supabase
      .from('user_activity_snapshot')
      .select('user_id')
      .gte('snapshot_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .gt('logins_count', 0)

    const activeParticipants = new Set(activeUsers?.map(u => u.user_id) || []).size

    // Generate prompt
    const promptData = await generateDiscussionPrompt({
      currentWeek,
      currentModule,
      recentDiscussionThemes: themes,
      stuckDiscussions,
      cohortSize: totalMembers || 0,
      activeParticipants,
    })

    if (!promptData) {
      throw new Error('Failed to generate discussion prompt')
    }

    // Optionally save to database for tracking
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await supabaseAdmin.from('dashboard_content').insert({
      content_type: 'discussion_prompt',
      content: promptData,
      generation_context: {
        week: currentWeek,
        module: currentModule,
        themes,
      },
      approved: false,
      active: false,
    })

    return NextResponse.json({
      success: true,
      prompt: promptData,
    })
  } catch (error: any) {
    console.error('Error generating discussion prompt:', error)
    return NextResponse.json(
      { error: 'Failed to generate discussion prompt', details: error.message },
      { status: 500 }
    )
  }
}

