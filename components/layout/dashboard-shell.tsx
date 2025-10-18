'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/layout/sidebar'
import { NotificationCenter } from '@/components/layout/notification-center'
import { GlobalSearch } from '@/components/search/global-search'
import { PageLoader } from '@/components/ui/loading-spinner'
import { ProfileSetupModal } from '@/components/auth/profile-setup-modal'
import { cn } from '@/lib/utils'
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [profileCompleted, setProfileCompleted] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Listen for sidebar toggle events
  useEffect(() => {
    // Check initial state
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved === 'true') {
      setSidebarCollapsed(true)
    }

    // Listen for changes
    const handleSidebarToggle = (e: any) => {
      setSidebarCollapsed(e.detail.isCollapsed)
    }
    
    window.addEventListener('sidebar-toggle', handleSidebarToggle)
    return () => window.removeEventListener('sidebar-toggle', handleSidebarToggle)
  }, [])

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
          .select('roles, full_name, email, avatar_url, is_active, profile_completed')
          .eq('id', session.user.id)
          .single<{ roles: string[]; full_name: string; email: string; avatar_url: string | null; is_active: boolean; profile_completed: boolean }>()

        console.log('✅ Dashboard: Profile data:', profile)

        if (error || !profile) {
          console.error('❌ Dashboard: Profile error:', error)
          console.error('❌ Error details:', error?.message, error?.code)
          alert(`Login Error: Unable to load profile. ${error?.message || 'Unknown error'}`)
          router.push('/login')
          return
        }

        // Check if user account is deactivated
        if (!profile.is_active) {
          console.log('Dashboard: User account is deactivated')
          await supabase.auth.signOut()
          router.push('/login')
          return
        }

        const userProfileData: UserProfile = {
          role: profile.roles?.[0] as UserRole || 'participant',
          full_name: profile.full_name,
          email: profile.email,
          avatar_url: profile.avatar_url || undefined
        }

        setUserRole((profile.roles?.includes('admin') ? 'admin' : profile.roles?.includes('facilitator') ? 'facilitator' : 'participant') as UserRole)
        setUserProfile(userProfileData)
        setProfileCompleted(profile.profile_completed)
        
        // Show profile setup modal if profile not completed
        if (!profile.profile_completed) {
          setShowProfileSetup(true)
        }
        
        console.log('Dashboard: User role set:', profile.roles)
        console.log('Dashboard: Profile completed:', profile.profile_completed)
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
      <Sidebar userRole={userRole} userProfile={userProfile} userId={userId} />
      <div className={cn(
        'min-h-screen bg-rogue-cream transition-all duration-300',
        sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      )}>
        {/* Header with Search and Notifications */}
        <header className="sticky top-0 z-30 bg-white border-b border-rogue-sage/20 px-6 py-3 flex items-center justify-between gap-4">
          <GlobalSearch />
          <NotificationCenter userId={userId} />
        </header>
        <main>
          {children}
        </main>
      </div>

      {/* Profile Setup Modal for New Users */}
      {showProfileSetup && userProfile && (
        <ProfileSetupModal
          open={showProfileSetup}
          onClose={() => {
            setShowProfileSetup(false)
            setProfileCompleted(true)
          }}
          userId={userId}
          userName={userProfile.full_name}
          userEmail={userProfile.email}
        />
      )}
    </div>
  )
}

