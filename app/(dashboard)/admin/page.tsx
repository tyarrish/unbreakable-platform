'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/ui/loading-spinner'
import { Users, BookOpen, MessageSquare, Calendar, Library, Settings, BarChart, Sparkles, Brain } from 'lucide-react'
import type { UserRole } from '@/types/index.types'

export default function AdminPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAccess() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/dashboard')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single<{ role: string }>()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'facilitator')) {
          router.push('/dashboard')
          return
        }

        setUserRole(profile.role)
      } catch (error) {
        console.error('Error checking admin access:', error)
        router.push('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [router, supabase])

  if (isLoading) {
    return <PageLoader />
  }

  if (!userRole) {
    return null
  }

  const isAdmin = userRole === 'admin'
  const isFacilitator = userRole === 'facilitator'

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          heading={isAdmin ? "Admin Dashboard" : "Facilitator Dashboard"}
          description={isAdmin 
            ? "Manage users, content, and monitor cohort progress"
            : "Manage content and moderate discussions"
          }
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* AI Dashboard - Admin Only - Featured */}
          {isAdmin && (
            <Card className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-rogue-gold/10 via-white to-rogue-forest/5 border-2 border-rogue-gold/30 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-rogue-gold to-rogue-gold/80 rounded-xl text-white shadow-md">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">AI Dashboard</CardTitle>
                    <CardDescription className="text-base">
                      Review AI-generated content, monitor engagement flags, and manage automation
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button variant="default" className="bg-rogue-forest hover:bg-rogue-pine" asChild>
                    <a href="/admin/dashboard-review">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Review Generated Content
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/admin/engagement-flags">
                      <Brain className="h-4 w-4 mr-2" />
                      Engagement Flags
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/admin/ai-diagnostics">
                      <BarChart className="h-4 w-4 mr-2" />
                      System Diagnostics
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Management - Admin Only */}
          {isAdmin && (
            <AdminCard
              icon={<Users className="h-6 w-6" />}
              title="User Management"
              description="Manage participants, facilitators, and roles"
              href="/admin/users"
            />
          )}
          
          {/* Content Management - All */}
          <AdminCard
            icon={<BookOpen className="h-6 w-6" />}
            title="Modules"
            description="Create and manage learning content"
            href="/admin/modules"
          />
          <AdminCard
            icon={<MessageSquare className="h-6 w-6" />}
            title="Discussions"
            description="Moderate forums and discussions"
            href="/admin/discussions"
          />
          <AdminCard
            icon={<Calendar className="h-6 w-6" />}
            title="Events"
            description="Schedule cohort calls and workshops"
            href="/admin/events"
          />
          <AdminCard
            icon={<Library className="h-6 w-6" />}
            title="Book Library"
            description="Manage reading assignments"
            href="/admin/books"
          />
          <AdminCard
            icon={<Users className="h-6 w-6" />}
            title="Partner Matching"
            description="Pair accountability partners"
            href="/admin/partners"
          />
          
          {/* Analytics - Admin Only */}
          {isAdmin && (
            <AdminCard
              icon={<BarChart className="h-6 w-6" />}
              title="Analytics"
              description="Track engagement and completion"
              href="/admin/analytics"
            />
          )}
          
          {/* Settings - Admin Only */}
          {isAdmin && (
            <AdminCard
              icon={<Settings className="h-6 w-6" />}
              title="Settings"
              description="Platform configuration"
              href="/admin/settings"
            />
          )}
        </div>
      </Container>
    </div>
  )
}

function AdminCard({ icon, title, description, href }: { icon: React.ReactNode; title: string; description: string; href: string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-rogue-forest rounded-lg text-white">
            {icon}
          </div>
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full" asChild>
          <a href={href}>Manage</a>
        </Button>
      </CardContent>
    </Card>
  )
}

