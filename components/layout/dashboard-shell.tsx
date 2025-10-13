'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/layout/sidebar'
import { PageLoader } from '@/components/ui/loading-spinner'
import type { UserRole } from '@/types/index.types'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole | null>(null)
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

        // Get user profile to determine role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        console.log('Dashboard: Profile data:', profile)

        if (error || !profile) {
          console.error('Dashboard: Profile error:', error)
          router.push('/login')
          return
        }

        setUserRole(profile.role)
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

  if (!userRole) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Sidebar userRole={userRole} />
      <main className="md:ml-64 min-h-screen bg-rogue-cream">
        {children}
      </main>
    </div>
  )
}

