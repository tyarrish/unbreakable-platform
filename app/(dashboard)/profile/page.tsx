'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileForm } from '@/components/auth/profile-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RoleBadge } from '@/components/ui/role-badge'
import { PageLoader } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils/format-date'
import type { User } from '@/types/index.types'

export default function ProfilePage() {
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
        console.error('Error loading profile:', error)
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

  return (
    <div className="py-8">
      <Container size="md">
        <PageHeader
          heading="Profile Settings"
          description="Manage your account information and preferences"
        />

        <div className="grid gap-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your role and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-rogue-slate">Role</p>
                  <div className="mt-1">
                    <RoleBadge role={user.role} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-rogue-slate">Member Since</p>
                  <p className="text-sm font-medium text-rogue-forest mt-1">
                    {formatDate(user.created_at, { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              
              {user.partner_id && (
                <div>
                  <p className="text-sm text-rogue-slate">Accountability Partner</p>
                  <p className="text-sm font-medium text-rogue-forest mt-1">Assigned</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Form */}
          <ProfileForm user={user} />
        </div>
      </Container>
    </div>
  )
}

