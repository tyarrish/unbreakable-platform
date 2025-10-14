'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/layout/sidebar'
import { NotificationCenter } from '@/components/layout/notification-center'
import { GlobalSearch } from '@/components/search/global-search'
import { PageLoader } from '@/components/ui/loading-spinner'
import type { UserRole } from '@/types/index.types'

interface UserProfile {
  full_name: string
  email: string
  avatar_url?: string
  role: UserRole
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkUser() {
      try {
        // First check if we have a session at all
        const { data: { session } } = await supabase.auth.getSession()
        
        console.log('Dashboard: Checking session...', session ? 'Session found' : 'No session')
        
        if (!session) {
          console.log('Dashboard: No session, redirecting to login')
          router.push('/login')
          return
        }

        setUserId(session.user.id)

        // Get user profile to determine role and user info
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, full_name, email, avatar_url')
          .eq('id', session.user.id)
          .single<{ role: string; full_name: string; email: string; avatar_url: string | null }>()

        console.log('Dashboard: Profile data:', profile)

        if (error || !profile) {
          console.error('Dashboard: Profile error:', error)
          router.push('/login')
          return
        }

        const userProfileData: UserProfile = {
          role: profile.role as UserRole,
          full_name: profile.full_name,
          email: profile.email,
          avatar_url: profile.avatar_url || undefined
        }

        setUserRole(profile.role as UserRole)
        setUserProfile(userProfileData)
        console.log('Dashboard: User role set:', profile.role)
      } catch (error) {
        console.error('Dashboard: Auth check error:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  if (isLoading) {
    return <PageLoader />
  }

  if (!userRole || !userId || !userProfile) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Sidebar userRole={userRole} userProfile={userProfile} />
      <div className="md:ml-64 min-h-screen bg-rogue-cream">
        {/* Header with Search and Notifications */}
        <header className="sticky top-0 z-30 bg-white border-b border-rogue-sage/20 px-6 py-3 flex items-center justify-between gap-4">
          <GlobalSearch />
          <NotificationCenter userId={userId} />
        </header>
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}

