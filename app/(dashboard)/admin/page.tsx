'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/ui/loading-spinner'
import { Users, BookOpen, MessageSquare, Calendar, Library, Settings, BarChart } from 'lucide-react'
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

