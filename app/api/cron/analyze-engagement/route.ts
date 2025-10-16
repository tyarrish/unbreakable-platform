import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeEngagement } from '@/lib/ai/analyzers/engagement'
import { createEngagementFlag } from '@/lib/supabase/queries/ai-dashboard'
import type { UserEngagementData } from '@/lib/ai/analyzers/engagement'

/**
 * Cron job endpoint: Analyze user engagement and create flags
 * Runs at 6am daily via Vercel Cron (after dashboard generation)
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

    console.log('Starting engagement analysis...')

    const supabase = await createClient()

    // Get all active members
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'member')
      .eq('is_active', true)

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ success: true, message: 'No users to analyze' })
    }

    console.log('Analyzing', profiles.length, 'users')

    // Get activity snapshots for past 14 days
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgoDate = fourteenDaysAgo.toISOString().split('T')[0]

    const { data: snapshots } = await supabase
      .from('user_activity_snapshot')
      .select('*')
      .gte('snapshot_date', fourteenDaysAgoDate)
      .order('snapshot_date', { ascending: false })

    // Build user engagement data
    const userEngagementData: UserEngagementData[] = profiles.map((profile) => {
      const userSnapshots = snapshots?.filter((s) => s.user_id === profile.id) || []
      
      // Split into past week and previous week
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const pastWeekSnapshots = userSnapshots.filter(
        (s) => new Date(s.snapshot_date) >= sevenDaysAgo
      )
      const previousWeekSnapshots = userSnapshots.filter(
        (s) => new Date(s.snapshot_date) < sevenDaysAgo
      )

      const loginsPastWeek = pastWeekSnapshots.filter((s) => (s.logins_count || 0) > 0).length
      const loginsPreviousWeek = previousWeekSnapshots.filter((s) => (s.logins_count || 0) > 0).length
      const postsPastWeek = pastWeekSnapshots.reduce((sum, s) => sum + (s.posts_count || 0), 0)
      const postsPreviousWeek = previousWeekSnapshots.reduce(
        (sum, s) => sum + (s.posts_count || 0),
        0
      )
      const responsesPastWeek = pastWeekSnapshots.reduce(
        (sum, s) => sum + (s.responses_count || 0),
        0
      )

      const lastLogin = pastWeekSnapshots[0]?.last_login || null
      const lastPartnerInteraction = pastWeekSnapshots[0]?.last_partner_interaction || null

      return {
        userId: profile.id,
        userName: profile.full_name || profile.email,
        email: profile.email,
        lastLogin,
        loginsPastWeek,
        loginsPreviousWeek,
        postsPastWeek,
        postsPreviousWeek,
        responsesPastWeek,
        lastPartnerInteraction,
      }
    })

    // Analyze engagement patterns
    const flags = await analyzeEngagement(userEngagementData)
    console.log('Engagement analysis complete:', flags.length, 'flags generated')

    // Save flags to database
    let savedCount = 0
    for (const flag of flags) {
      const success = await createEngagementFlag({
        user_id: flag.userId,
        flag_type: flag.flagType,
        flag_reason: flag.reason,
        context: flag.context,
      })
      if (success) savedCount++
    }

    console.log('Saved', savedCount, 'engagement flags')

    return NextResponse.json({
      success: true,
      stats: {
        usersAnalyzed: profiles.length,
        flagsGenerated: flags.length,
        flagsSaved: savedCount,
        breakdown: {
          red: flags.filter((f) => f.flagType === 'red').length,
          yellow: flags.filter((f) => f.flagType === 'yellow').length,
          green: flags.filter((f) => f.flagType === 'green').length,
        },
      },
    })
  } catch (error: any) {
    console.error('Error analyzing engagement:', error)
    return NextResponse.json(
      {
        error: 'Failed to analyze engagement',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

