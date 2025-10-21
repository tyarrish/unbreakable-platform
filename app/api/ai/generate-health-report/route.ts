import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateHealthReport } from '@/lib/ai/generators/health-report'
import { extractThemesFromDiscussions } from '@/lib/ai/analyzers/themes'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Generate and send weekly cohort health report
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
      .select('roles, email')
      .eq('id', user.id)
      .single()

    if (!profile || !(profile as any).roles?.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('Generating health report...')

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

    const weekNumber = (weekSetting?.setting_value as any)?.week || 1
    const moduleName = (moduleSetting?.setting_value as any)?.title || 'Month 1'

    // Get member count
    const { count: totalMembers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .contains('roles', ['participant'])
      .eq('is_active', true)

    // Get activity this week and last week
    const thisWeekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const lastWeekStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const { data: thisWeekActivity } = await supabase
      .from('user_activity_snapshot')
      .select('user_id')
      .gte('snapshot_date', thisWeekStart)
      .gt('logins_count', 0)

    const { data: lastWeekActivity } = await supabase
      .from('user_activity_snapshot')
      .select('user_id')
      .gte('snapshot_date', lastWeekStart)
      .lt('snapshot_date', thisWeekStart)
      .gt('logins_count', 0)

    const activeThisWeek = new Set(thisWeekActivity?.map(u => u.user_id) || []).size
    const activePreviousWeek = new Set(lastWeekActivity?.map(u => u.user_id) || []).size

    // Get discussion activity
    const { count: newDiscussions } = await supabase
      .from('discussion_threads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thisWeekStart)

    const { count: totalResponses } = await supabase
      .from('discussion_posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thisWeekStart)

    // Get top contributors (users with most posts this week)
    const { data: topPosters } = await supabase
      .from('user_activity_snapshot')
      .select('user_id, posts_count, profiles!user_activity_snapshot_user_id_fkey(full_name)')
      .gte('snapshot_date', thisWeekStart)
      .order('posts_count', { ascending: false })
      .limit(5)

    const topContributors = topPosters
      ?.filter((p: any) => p.posts_count > 0)
      .map((p: any) => ({
        name: p.profiles?.full_name || 'Unknown',
        posts: p.posts_count,
      })) || []

    // Get lurker count
    const { data: lurkerData } = await supabase
      .from('user_activity_snapshot')
      .select('user_id')
      .gte('snapshot_date', thisWeekStart)
      .gt('logins_count', 2)
      .eq('posts_count', 0)

    const lurkers = new Set(lurkerData?.map(u => u.user_id) || []).size

    // Get engagement flags
    const { data: redFlagData } = await supabase
      .from('engagement_flags')
      .select('user_id, flag_reason, profiles!engagement_flags_user_id_fkey(full_name)')
      .eq('flag_type', 'red')
      .eq('resolved', false)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const { data: yellowFlagData } = await supabase
      .from('engagement_flags')
      .select('user_id, flag_reason, profiles!engagement_flags_user_id_fkey(full_name)')
      .eq('flag_type', 'yellow')
      .eq('resolved', false)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const { data: greenFlagData } = await supabase
      .from('engagement_flags')
      .select('user_id, flag_reason, profiles!engagement_flags_user_id_fkey(full_name)')
      .eq('flag_type', 'green')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const redFlags = redFlagData?.map((f: any) => ({
      name: f.profiles?.full_name || 'Unknown',
      reason: f.flag_reason,
    })) || []

    const yellowFlags = yellowFlagData?.map((f: any) => ({
      name: f.profiles?.full_name || 'Unknown',
      reason: f.flag_reason,
    })) || []

    const greenFlags = greenFlagData?.map((f: any) => ({
      name: f.profiles?.full_name || 'Unknown',
      reason: f.flag_reason,
    })) || []

    // Get discussions
    const { data: recentDiscussions } = await supabase
      .from('discussion_threads')
      .select('title, content_html')
      .gte('created_at', thisWeekStart)
      .limit(10)

    const emergingThemes = extractThemesFromDiscussions(
      recentDiscussions?.map(d => ({
        title: d.title,
        content: d.content_html || '',
      })) || []
    )

    // Find stuck discussions
    const { data: stuckThreads } = await supabase
      .from('discussion_threads')
      .select(`
        title,
        views_count,
        posts:discussion_posts(count)
      `)
      .gte('views_count', 5)
      .order('views_count', { ascending: false })
      .limit(5)

    const stuckDiscussions = stuckThreads
      ?.filter((t: any) => (t.posts?.[0]?.count || 0) < 2)
      .map((t: any) => ({
        title: t.title,
        views: t.views_count,
        responses: t.posts?.[0]?.count || 0,
      })) || []

    // Generate report
    const reportHtml = await generateHealthReport({
      weekNumber,
      moduleName,
      totalMembers: totalMembers || 0,
      activeThisWeek,
      activePreviousWeek,
      newDiscussions: newDiscussions || 0,
      totalResponses: totalResponses || 0,
      topContributors,
      lurkers,
      redFlags,
      yellowFlags,
      greenFlags,
      emergingThemes,
      stuckDiscussions,
    })

    // Send email (optional - only if explicitly requested)
    const body = await request.json().catch(() => ({}))
    if (body.sendEmail && (profile as any).email) {
      try {
        await resend.emails.send({
          from: 'Building the Unbreakable <noreply@unbreakable.com>',
          to: (profile as any).email,
          subject: `Week ${weekNumber} Cohort Health Report`,
          html: `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2c3e2d; font-size: 24px; margin-bottom: 20px;">
                Week ${weekNumber} Cohort Health Report
              </h1>
              ${reportHtml}
            </div>
          `,
        })
      } catch (emailError) {
        console.error('Error sending email:', emailError)
        // Don't fail the whole request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      report: reportHtml,
    })
  } catch (error: any) {
    console.error('Error generating health report:', error)
    return NextResponse.json(
      { error: 'Failed to generate health report', details: error.message },
      { status: 500 }
    )
  }
}

