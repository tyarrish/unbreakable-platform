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
import { AchievementsPreview } from '@/components/dashboard/achievements-preview'
import { 
  BookOpen, 
  MessageSquare, 
  Calendar, 
  Users,
  TrendingUp,
  Award,
  ArrowRight,
  UserCircle,
  Play,
  Handshake,
  MessagesSquare
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

        {/* Progress Overview */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-rogue-forest/5">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rogue-forest/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-rogue-forest" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Your Leadership Journey</CardTitle>
                    <CardDescription className="text-sm">
                      8-Month Program • {stats?.progress || 0}% Complete
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress Tree Section */}
                <div className="mb-6">
                  <ProgressTree progress={stats?.progress || 0} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Modules */}
                  <div className="bg-gradient-to-br from-rogue-forest/5 to-transparent p-4 rounded-lg border border-rogue-forest/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-rogue-forest/10 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-rogue-forest" />
                      </div>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                        +{stats?.modulesCompleted || 0} month
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-rogue-forest mb-0.5">
                      {stats?.modulesCompleted || 0}/{stats?.totalModules || 8}
                    </p>
                    <p className="text-xs text-rogue-slate font-medium">Modules</p>
                  </div>

                  {/* Discussion Posts */}
                  <div className="bg-gradient-to-br from-rogue-gold/5 to-transparent p-4 rounded-lg border border-rogue-gold/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-rogue-gold/10 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-rogue-gold" />
                      </div>
                      <Badge variant="outline" className="text-xs bg-rogue-gold/10 text-rogue-gold border-rogue-gold/20">
                        Active
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-rogue-forest mb-0.5">
                      {stats?.discussionPosts || 0}
                    </p>
                    <p className="text-xs text-rogue-slate font-medium">Discussions</p>
                  </div>

                  {/* Upcoming Events */}
                  <div className="bg-gradient-to-br from-rogue-copper/5 to-transparent p-4 rounded-lg border border-rogue-copper/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-rogue-copper/10 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-rogue-copper" />
                      </div>
                      <Badge variant="outline" className="text-xs bg-rogue-copper/10 text-rogue-copper border-rogue-copper/20">
                        Upcoming
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-rogue-forest mb-0.5">
                      {stats?.upcomingEvents || 0}
                    </p>
                    <p className="text-xs text-rogue-slate font-medium">Events</p>
                  </div>

                  {/* Partner Check-ins */}
                  <div className="bg-gradient-to-br from-rogue-sage/10 to-transparent p-4 rounded-lg border border-rogue-sage/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-rogue-sage/20 flex items-center justify-center">
                        <Users className="h-4 w-4 text-rogue-forest" />
                      </div>
                      <Badge variant="outline" className="text-xs bg-rogue-sage/20 text-rogue-slate border-rogue-sage/30">
                        Weekly
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-rogue-forest mb-0.5">
                      {stats?.partnerCheckins || 0}/{stats?.totalCheckins || 32}
                    </p>
                    <p className="text-xs text-rogue-slate font-medium">Check-ins</p>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-rogue-sage/10">
                  <div>
                    <p className="text-xs text-rogue-slate mb-1">Books Read</p>
                    <p className="text-lg font-semibold text-rogue-forest">{stats?.booksRead || 0}/{stats?.totalBooks || 8}</p>
                  </div>
                  <div>
                    <p className="text-xs text-rogue-slate mb-1">Reflections</p>
                    <p className="text-lg font-semibold text-rogue-forest">{stats?.reflectionsSubmitted || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-rogue-slate mb-1">Learning Time</p>
                    <p className="text-lg font-semibold text-rogue-forest">{stats?.timeSpentLearning || 0}h</p>
                  </div>
                  <div>
                    <p className="text-xs text-rogue-slate mb-1">Days Active</p>
                    <p className="text-lg font-semibold text-rogue-forest">{stats?.daysActive || 1}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Activity */}
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

          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-rogue-gold/5 to-white">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rogue-gold/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-rogue-gold" />
                  </div>
                  <CardTitle className="text-xl">Next Steps</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <ActionItem 
                  label="Complete your profile"
                  href="/profile"
                  icon={UserCircle}
                  variant="profile"
                />
                <ActionItem 
                  label="Start Module 1"
                  href="/modules"
                  icon={Play}
                  variant="module"
                />
                <ActionItem 
                  label="Meet your partner"
                  href="/partner"
                  icon={Handshake}
                  variant="partner"
                />
                <ActionItem 
                  label="Join a discussion"
                  href="/discussions"
                  icon={MessagesSquare}
                  variant="discussion"
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-rogue-copper/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rogue-copper/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-rogue-copper" />
                  </div>
                  <CardTitle className="text-xl">Upcoming Events</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-start gap-3 pb-3 border-b border-rogue-sage/20 last:border-0 last:pb-0">
                        <Calendar className="h-4 w-4 text-rogue-copper mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-rogue-forest">{event.title}</p>
                          <p className="text-xs text-rogue-slate">{new Date(event.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
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
                  <p className="text-sm text-rogue-slate py-4 text-center">
                    No upcoming events
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-rogue-gold/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rogue-gold/10 rounded-lg">
                    <Award className="h-5 w-5 text-rogue-gold" />
                  </div>
                  <CardTitle className="text-xl">Achievements</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {user && <AchievementsPreview userId={user.id} />}
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
            // Reload the page to show updated profile data
            window.location.reload()
          }}
          userId={user.id}
          userName={user.full_name || user.email}
          userEmail={user.email}
        />
      )}
    </div>
  )
}

function ActionItem({ 
  label, 
  href, 
  icon: Icon, 
  variant 
}: { 
  label: string; 
  href: string; 
  icon: any;
  variant: 'profile' | 'module' | 'partner' | 'discussion';
}) {
  const variantStyles = {
    profile: 'bg-gradient-to-r from-rogue-sage/10 to-rogue-sage/5 hover:from-rogue-sage/20 hover:to-rogue-sage/10 border-rogue-sage/20 hover:border-rogue-sage/30',
    module: 'bg-gradient-to-r from-rogue-forest/10 to-rogue-forest/5 hover:from-rogue-forest/20 hover:to-rogue-forest/10 border-rogue-forest/20 hover:border-rogue-forest/30',
    partner: 'bg-gradient-to-r from-rogue-gold/10 to-rogue-gold/5 hover:from-rogue-gold/20 hover:to-rogue-gold/10 border-rogue-gold/20 hover:border-rogue-gold/30',
    discussion: 'bg-gradient-to-r from-rogue-copper/10 to-rogue-copper/5 hover:from-rogue-copper/20 hover:to-rogue-copper/10 border-rogue-copper/20 hover:border-rogue-copper/30'
  }

  return (
    <a 
      href={href}
      className={`
        group flex items-center gap-3 p-3 rounded-lg border
        transition-all duration-200 cursor-pointer
        ${variantStyles[variant]}
      `}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center">
        <Icon className="h-4 w-4 text-rogue-forest" />
      </div>
      <span className="flex-1 text-sm font-medium text-rogue-forest">{label}</span>
      <ArrowRight className="h-4 w-4 text-rogue-slate group-hover:text-rogue-forest group-hover:translate-x-0.5 transition-all" />
    </a>
  )
}

