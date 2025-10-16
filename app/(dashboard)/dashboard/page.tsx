import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveDashboardContent, getUserActivityMetrics } from '@/lib/supabase/queries/ai-dashboard'
import { Container } from '@/components/layout/container'
import { DynamicHero } from '@/components/dashboard/dynamic-hero'
import { PracticeGrid } from '@/components/dashboard/practice-grid'
import { CohortActivity } from '@/components/dashboard/cohort-activity'
import { PracticeActions } from '@/components/dashboard/practice-actions'
import { JourneyContext } from '@/components/dashboard/journey-context'

export const revalidate = 300 // Revalidate every 5 minutes

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Get active AI-generated dashboard content
  const dashboardContent = await getActiveDashboardContent()

  // Get user's activity metrics for "Your Rhythm"
  const userMetrics = await getUserActivityMetrics(user.id)

  // Fallback content if no AI content is available yet
  const firstName = profile.full_name?.split(' ')[0] || 'Leader'
  const content = (dashboardContent?.content as any) || {
    heroMessage: `${firstName}. Welcome to the Rogue Leadership Training Experience. The work starts now.`,
    activityFeed: [],
    practiceActions: {},
    programState: {
      currentWeek: 1,
      currentModule: 'Month 1: Personal Leadership Foundations',
      moduleId: null,
    },
    upcomingEvents: [],
    communityStats: {
      activeUsers: 0,
      totalUsers: 0,
      engagementLevel: 'medium' as const,
    },
  }

  // Get personalized actions for this user
  const personalizedActions = content.practiceActions?.[user.id] || []

  // Get discussion count for "Live Conversations"
  const { count: discussionCount } = await supabase
    .from('discussion_threads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  // Get hottest discussion topic (most recent with activity)
  const { data: hottestDiscussionData } = await supabase
    .from('discussion_threads')
    .select('title')
    .order('last_activity_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const hottestTopic = (hottestDiscussionData as { title: string } | null)?.title

  // Get next upcoming event (if not in AI content)
  let nextEventData = content.upcomingEvents?.[0]
  if (!nextEventData) {
    const { data: upcomingEvent } = await supabase
      .from('events')
      .select('id, title, start_time, location_address')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(1)
      .maybeSingle()
    
    if (upcomingEvent) {
      nextEventData = {
        id: upcomingEvent.id,
        title: upcomingEvent.title,
        start_time: upcomingEvent.start_time,
        location: upcomingEvent.location_address,
      }
    }
  }

  // Personalize the hero message with user's name
  const personalizedHeroMessage = content.heroMessage.replace(
    '{firstName}',
    firstName
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
      <Container>
        <div className="py-8">
          {/* Dynamic Hero Message */}
          <DynamicHero message={personalizedHeroMessage} />

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* This Month's Practice Grid */}
              <PracticeGrid
                currentModule={{
                  title: content.programState.currentModule,
                  id: content.programState.moduleId,
                }}
                liveConversations={{
                  count: discussionCount || 0,
                  hottestTopic: hottestTopic,
                }}
                nextEvent={
                  nextEventData
                    ? {
                        id: nextEventData.id,
                        title: nextEventData.title,
                        startTime: nextEventData.start_time,
                        location: nextEventData.location,
                      }
                    : null
                }
                yourRhythm={{
                  daysActive: userMetrics.daysActive,
                }}
              />

              {/* What Your Cohort Is Working On */}
              <CohortActivity activities={content.activityFeed || []} />

              {/* Journey Context (below activity on mobile) */}
              <div className="lg:hidden">
                <JourneyContext
                  currentModule={{
                    title: content.programState.currentModule,
                    orderNumber: content.programState.currentModule.includes('Month 1')
                      ? 1
                      : content.programState.currentModule.includes('Month 2')
                      ? 2
                      : 1,
                  }}
                />
              </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="space-y-8">
              {/* Your Practice This Week */}
              <PracticeActions actions={personalizedActions} />

              {/* Journey Context (desktop only) */}
              <div className="hidden lg:block">
                <JourneyContext
                  currentModule={{
                    title: content.programState.currentModule,
                    orderNumber: content.programState.currentModule.includes('Month 1')
                      ? 1
                      : content.programState.currentModule.includes('Month 2')
                      ? 2
                      : 1,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
