'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading-spinner'
import { BarChart, Users, BookOpen, MessageSquare, Calendar, TrendingUp } from 'lucide-react'
import { TARGET_LOGIN_RATE, TARGET_COMPLETION_RATE, TARGET_ENGAGEMENT_RATE } from '@/lib/constants'
import { toast } from 'sonner'

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdminAccess()
    loadAnalytics()
  }, [])

  async function checkAdminAccess() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single<{ role: string }>()

    // Only admins can access analytics
    if (profile?.role !== 'admin') {
      router.push('/admin')
    }
  }

  async function loadAnalytics() {
    try {
      // Get total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'participant')

      // Get login rate (users who have logged in at least once)
      const { count: loggedInCount } = await supabase
        .from('lesson_progress')
        .select('user_id', { count: 'exact', head: true })

      // Get completion stats
      const { count: completedLessons } = await supabase
        .from('lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      const { count: totalLessons } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })

      // Get engagement stats
      const { count: discussionPosts } = await supabase
        .from('discussion_posts')
        .select('*', { count: 'exact', head: true })

      // TODO: Fix reflections table query after schema update
      const reflections = 0
      // const { count: reflections } = await supabase
      //   .from('reflections')
      //   .select('*', { count: 'exact', head: true })

      setStats({
        userCount: userCount || 0,
        loggedInCount: loggedInCount || 0,
        loginRate: userCount ? (loggedInCount || 0) / userCount : 0,
        completedLessons: completedLessons || 0,
        totalLessons: totalLessons || 0,
        completionRate: totalLessons ? (completedLessons || 0) / totalLessons : 0,
        discussionPosts: discussionPosts || 0,
        reflections: reflections || 0,
        engagementRate: userCount ? (discussionPosts || 0) / userCount : 0,
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  const loginProgress = (stats.loginRate * 100).toFixed(1)
  const completionProgress = (stats.completionRate * 100).toFixed(1)
  const engagementProgress = (stats.engagementRate * 100).toFixed(1)

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          heading="Analytics Dashboard"
          description="Monitor cohort engagement and completion rates"
        />

        {/* Success Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Login Rate"
            value={`${loginProgress}%`}
            target={`${TARGET_LOGIN_RATE * 100}%`}
            description={`${stats.loggedInCount} of ${stats.userCount} participants`}
            icon={<Users className="h-6 w-6 text-rogue-forest" />}
            isOnTrack={stats.loginRate >= TARGET_LOGIN_RATE}
          />
          <MetricCard
            title="Completion Rate"
            value={`${completionProgress}%`}
            target={`${TARGET_COMPLETION_RATE * 100}%`}
            description={`${stats.completedLessons} of ${stats.totalLessons} lessons`}
            icon={<BookOpen className="h-6 w-6 text-rogue-gold" />}
            isOnTrack={stats.completionRate >= TARGET_COMPLETION_RATE}
          />
          <MetricCard
            title="Engagement Rate"
            value={`${engagementProgress}%`}
            target={`${TARGET_ENGAGEMENT_RATE * 100}%`}
            description={`${stats.discussionPosts} discussion posts`}
            icon={<MessageSquare className="h-6 w-6 text-rogue-copper" />}
            isOnTrack={stats.engagementRate >= TARGET_ENGAGEMENT_RATE}
          />
        </div>

        {/* Additional Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Participants"
            value={stats.userCount}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            label="Reflections Submitted"
            value={stats.reflections}
            icon={<BookOpen className="h-5 w-5" />}
          />
          <StatCard
            label="Discussion Posts"
            value={stats.discussionPosts}
            icon={<MessageSquare className="h-5 w-5" />}
          />
          <StatCard
            label="Active This Week"
            value={Math.floor(stats.userCount * 0.7)} // Placeholder
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>
      </Container>
    </div>
  )
}

function MetricCard({
  title,
  value,
  target,
  description,
  icon,
  isOnTrack,
}: {
  title: string
  value: string
  target: string
  description: string
  icon: React.ReactNode
  isOnTrack: boolean
}) {
  return (
    <Card className={isOnTrack ? 'border-rogue-sage/40' : 'border-rogue-ochre/40'}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-rogue-forest">{value}</div>
        <p className="text-xs text-rogue-slate mt-1">Target: {target}</p>
        <p className="text-xs text-rogue-slate mt-2">{description}</p>
        {isOnTrack && (
          <Badge className="mt-3 bg-rogue-sage text-white">On Track</Badge>
        )}
      </CardContent>
    </Card>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          {icon}
        </div>
        <div className="text-2xl font-semibold text-rogue-forest">{value}</div>
        <p className="text-sm text-rogue-slate">{label}</p>
      </CardContent>
    </Card>
  )
}

