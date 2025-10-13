'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressTree } from '@/components/ui/progress-tree'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/ui/loading-spinner'
import { 
  BookOpen, 
  MessageSquare, 
  Calendar, 
  Users,
  TrendingUp,
  Award
} from 'lucide-react'
import type { User } from '@/types/index.types'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
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
          .single()

        if (profile) {
          setUser({
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
          })
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [supabase])

  if (isLoading) {
    return <PageLoader />
  }

  if (!user) {
    return null
  }

  const greeting = `Welcome back, ${user.full_name || user.email?.split('@')[0] || 'Leader'}!`

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          heading={greeting}
          description="Continue your leadership journey. Track your progress and engage with your cohort."
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<BookOpen className="h-6 w-6 text-rogue-forest" />}
            label="Modules Completed"
            value="0/8"
            trend="+0 this week"
          />
          <StatCard
            icon={<MessageSquare className="h-6 w-6 text-rogue-gold" />}
            label="Discussion Posts"
            value="0"
            trend="Start engaging!"
          />
          <StatCard
            icon={<Calendar className="h-6 w-6 text-rogue-copper" />}
            label="Upcoming Events"
            value="0"
            trend="No events scheduled"
          />
          <StatCard
            icon={<Users className="h-6 w-6 text-rogue-sage" />}
            label="Partner Check-ins"
            value="0/32"
            trend="Weekly accountability"
          />
        </div>

        {/* Progress Overview */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Your Leadership Journey</CardTitle>
              <CardDescription>
                Track your progress through the 8-month leadership training experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProgressTree progress={0} />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-1">
                  <p className="text-sm text-rogue-slate">Time Spent Learning</p>
                  <p className="text-2xl font-semibold text-rogue-forest">0h</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-rogue-slate">Reflections Submitted</p>
                  <p className="text-2xl font-semibold text-rogue-forest">0</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-rogue-slate">Books Read</p>
                  <p className="text-2xl font-semibold text-rogue-forest">0/8</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-rogue-slate">Days Active</p>
                  <p className="text-2xl font-semibold text-rogue-forest">1</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-rogue-gold" />
                  Next Steps
                </CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-rogue-gold" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-rogue-slate">
                  Start your journey to unlock achievements
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity / Upcoming Events */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest interactions and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-rogue-slate py-8 text-center">
                No recent activity yet. Start your journey!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Cohort calls and workshops</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-rogue-slate py-8 text-center">
                No upcoming events scheduled
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  )
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          {icon}
          <span className="text-xs text-rogue-slate">{trend}</span>
        </div>
        <p className="text-2xl font-semibold text-rogue-forest">{value}</p>
        <p className="text-sm text-rogue-slate">{label}</p>
      </CardContent>
    </Card>
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

