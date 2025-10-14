'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressTree } from '@/components/ui/progress-tree'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/ui/loading-spinner'
import { ActivityFeed } from '@/components/social/activity-feed'
import { ProfileSetupModal } from '@/components/auth/profile-setup-modal'
import { 
  BookOpen, 
  MessageSquare, 
  Calendar, 
  Users,
  TrendingUp,
  Award
} from 'lucide-react'
import type { User } from '@/types/index.types'
import { getDashboardStats, getRecentActivity, getUpcomingEvents, type DashboardStats, type ActivityItem } from '@/lib/supabase/queries/dashboard'
import { formatRelativeTime } from '@/lib/utils/format-date'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [profileCompleted, setProfileCompleted] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          setIsLoading(false)
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single() as any

        if (profile) {
          // Check if profile setup is needed
          setProfileCompleted(profile.profile_completed ?? true)
          if (!profile.profile_completed) {
            setShowProfileSetup(true)
          }

          const userData = {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name || undefined,
            role: profile.role,
            avatar_url: profile.avatar_url || undefined,
            bio: profile.bio || undefined,
            learning_preferences: profile.learning_preferences || undefined,
            partner_id: profile.partner_id || undefined,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
          }
          setUser(userData)

          // Load dashboard stats
          const dashboardStats = await getDashboardStats(profile.id)
          setStats(dashboardStats)

          // Load recent activity
          const activity = await getRecentActivity(profile.id)
          setRecentActivity(activity)

          // Load upcoming events
          const events = await getUpcomingEvents()
          setUpcomingEvents(events)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [supabase])

  if (isLoading) {
    return <PageLoader />
  }

  if (!user) {
    return null
  }

  const greeting = `Welcome back, ${user.full_name || user.email?.split('@')[0] || 'Leader'}!`

  return (
    <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
      {/* Subtle header background */}
      <div className="bg-white/40 backdrop-blur-sm border-b border-rogue-sage/10">
        <Container>
          <div className="py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-rogue-forest mb-2">{greeting}</h1>
            <p className="text-lg text-rogue-slate">
              Continue your leadership journey. Track your progress and engage with your cohort.
            </p>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8">

        {/* Quick Stats - Elevated Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-br from-white to-rogue-forest/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-rogue-forest/10 rounded-xl">
                  <BookOpen className="h-6 w-6 text-rogue-forest" />
                </div>
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                  +{stats?.modulesCompleted || 0} this month
                </span>
              </div>
              <p className="text-3xl font-bold text-rogue-forest mb-1">
                {stats?.modulesCompleted || 0}/{stats?.totalModules || 8}
              </p>
              <p className="text-sm text-rogue-slate font-medium">Modules Completed</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-br from-white to-rogue-gold/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-rogue-gold/10 rounded-xl">
                  <MessageSquare className="h-6 w-6 text-rogue-gold" />
                </div>
                <span className="text-xs text-rogue-gold font-medium bg-rogue-gold/10 px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-3xl font-bold text-rogue-forest mb-1">
                {stats?.discussionPosts || 0}
              </p>
              <p className="text-sm text-rogue-slate font-medium">Discussion Posts</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-br from-white to-rogue-copper/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-rogue-copper/10 rounded-xl">
                  <Calendar className="h-6 w-6 text-rogue-copper" />
                </div>
                <span className="text-xs text-rogue-copper font-medium bg-rogue-copper/10 px-2 py-1 rounded-full">
                  {stats?.upcomingEvents || 0} upcoming
                </span>
              </div>
              <p className="text-3xl font-bold text-rogue-forest mb-1">
                {stats?.upcomingEvents || 0}
              </p>
              <p className="text-sm text-rogue-slate font-medium">Upcoming Events</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-br from-white to-rogue-sage/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-rogue-sage/20 rounded-xl">
                  <Users className="h-6 w-6 text-rogue-forest" />
                </div>
                <span className="text-xs text-rogue-slate font-medium bg-rogue-sage/20 px-2 py-1 rounded-full">
                  Weekly
                </span>
              </div>
              <p className="text-3xl font-bold text-rogue-forest mb-1">
                {stats?.partnerCheckins || 0}/{stats?.totalCheckins || 32}
              </p>
              <p className="text-sm text-rogue-slate font-medium">Partner Check-ins</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-2 border-0 shadow-xl bg-gradient-to-br from-white to-rogue-forest/5">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-rogue-forest/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-rogue-forest" />
                </div>
                <Badge className="bg-rogue-forest text-white">8-Month Program</Badge>
              </div>
              <CardTitle className="text-2xl">Your Leadership Journey</CardTitle>
              <CardDescription className="text-base">
                Track your progress through the leadership training experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProgressTree progress={stats?.progress || 0} />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-1">
                  <p className="text-sm text-rogue-slate">Time Spent Learning</p>
                  <p className="text-2xl font-semibold text-rogue-forest">{stats?.timeSpentLearning || 0}h</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-rogue-slate">Reflections Submitted</p>
                  <p className="text-2xl font-semibold text-rogue-forest">{stats?.reflectionsSubmitted || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-rogue-slate">Books Read</p>
                  <p className="text-2xl font-semibold text-rogue-forest">{stats?.booksRead || 0}/{stats?.totalBooks || 8}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-rogue-slate">Days Active</p>
                  <p className="text-2xl font-semibold text-rogue-forest">{stats?.daysActive || 1}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-rogue-gold/5 to-white">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-rogue-gold/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-rogue-gold" />
                  </div>
                </div>
                <CardTitle className="text-xl">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ActionItem 
                  label="Complete your profile"
                  href="/profile"
                />
                <ActionItem 
                  label="Start Module 1"
                  href="/modules"
                />
                <ActionItem 
                  label="Meet your partner"
                  href="/partner"
                />
                <ActionItem 
                  label="Join a discussion"
                  href="/discussions"
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-rogue-gold/5">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-rogue-gold/10 rounded-lg">
                    <Award className="h-5 w-5 text-rogue-gold" />
                  </div>
                </div>
                <CardTitle className="text-xl">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-rogue-slate">
                  Start your journey to unlock achievements
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Community Activity / Upcoming Events */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-1 w-8 bg-gradient-to-r from-rogue-forest to-rogue-gold rounded-full"></div>
                </div>
                <CardTitle className="text-2xl">Community Activity</CardTitle>
                <CardDescription className="text-base">What's happening in your cohort</CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityFeed limit={10} showFilters={false} />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-rogue-copper/5">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-rogue-copper/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-rogue-copper" />
                  </div>
                </div>
                <CardTitle className="text-xl">Upcoming Events</CardTitle>
                <CardDescription>Cohort calls and workshops</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-start gap-3 pb-3 border-b border-rogue-sage/20 last:border-0 last:pb-0">
                        <Calendar className="h-4 w-4 text-rogue-copper mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-rogue-forest">{event.title}</p>
                          <p className="text-sm text-rogue-slate">{new Date(event.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                          {event.location_type === 'virtual' && event.zoom_link && (
                            <Button variant="link" className="h-auto p-0 text-xs text-rogue-gold" asChild>
                              <a href={event.zoom_link} target="_blank" rel="noopener noreferrer">Join virtual meeting</a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-rogue-slate py-8 text-center">
                    No upcoming events scheduled
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </Container>

      {/* Profile Setup Modal for first-time users */}
      {user && showProfileSetup && (
        <ProfileSetupModal
          open={showProfileSetup}
          onClose={() => {
            setShowProfileSetup(false)
            setProfileCompleted(true)
          }}
          userId={user.id}
          userName={user.full_name || user.email}
          userEmail={user.email}
        />
      )}
    </div>
  )
}

function ActionItem({ label, href }: { label: string; href: string }) {
  return (
    <Button
      variant="outline"
      className="w-full justify-start"
      asChild
    >
      <a href={href}>{label}</a>
    </Button>
  )
}

