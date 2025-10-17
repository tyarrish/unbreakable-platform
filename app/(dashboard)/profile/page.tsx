'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { ProfileForm } from '@/components/auth/profile-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RoleBadge } from '@/components/ui/role-badge'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils/format-date'
import { Settings, User, Award, Calendar, Users, Sparkles } from 'lucide-react'
import type { User as UserType } from '@/types/index.types'

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null)
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
          .single() as any

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name || undefined,
            role: profile.role,
            roles: profile.roles || [profile.role],
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
    <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
      {/* Subtle header background */}
      <div className="bg-white/40 backdrop-blur-sm border-b border-rogue-sage/10">
        <Container size="md">
          <div className="py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-rogue-forest mb-2">Profile Settings</h1>
            <p className="text-lg text-rogue-slate">
              Manage your account information and preferences
            </p>
          </div>
        </Container>
      </div>

      <Container size="md">
        <div className="py-8">
          
          <div className="space-y-6">
          {/* Account Overview */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-rogue-sage/5">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-rogue-forest/10 rounded-lg">
                  <User className="h-5 w-5 text-rogue-forest" />
                </div>
                <CardTitle className="text-2xl">Account Overview</CardTitle>
              </div>
              <CardDescription className="text-base">
                Your role and membership details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-rogue-sage/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-rogue-gold" />
                    <p className="text-sm text-rogue-slate font-medium">Role</p>
                  </div>
                  <RoleBadge role={user.role} />
                </div>
                
                <div className="p-4 bg-rogue-sage/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-rogue-copper" />
                    <p className="text-sm text-rogue-slate font-medium">Member Since</p>
                  </div>
                  <p className="text-lg font-semibold text-rogue-forest">
                    {formatDate(user.created_at, { month: 'short', year: 'numeric' })}
                  </p>
                </div>
                
                <div className="p-4 bg-rogue-sage/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-rogue-sage" />
                    <p className="text-sm text-rogue-slate font-medium">Partner Status</p>
                  </div>
                  {user.partner_id ? (
                    <Badge className="bg-green-600 text-white border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Assigned
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not Yet Assigned</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <ProfileForm user={user} />
          </div>
        </div>
      </Container>
    </div>
  )
}
