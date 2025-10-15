'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { RoleBadge } from '@/components/ui/role-badge'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Users, Search, MapPin } from 'lucide-react'
import {
  getAllMembers,
  searchMembers,
  type UserProfile
} from '@/lib/supabase/queries/social'
import { toast } from 'sonner'

export default function MembersPage() {
  const [members, setMembers] = useState<UserProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadMembers()
  }, [])

  async function loadMembers() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }

      const data = await getAllMembers(100)
      setMembers(data)
    } catch (error) {
      console.error('Error loading members:', error)
      toast.error('Failed to load members')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSearch(query: string) {
    setSearchQuery(query)
    
    if (!query.trim()) {
      loadMembers()
      return
    }

    try {
      const data = await searchMembers(query)
      setMembers(data)
    } catch (error) {
      console.error('Error searching members:', error)
      toast.error('Failed to search members')
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          heading="Cohort Members"
          description="Connect with your fellow leaders"
        />

        {/* Search */}
        <div className="mb-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rogue-slate" />
            <Input
              placeholder="Search members by name, email, or bio..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {members.length === 0 ? (
          <EmptyState
            icon={<Users size={64} />}
            title="No Members Found"
            description={searchQuery ? 'Try adjusting your search criteria' : 'No members yet'}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <Card
                key={member.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/members/${member.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback className="bg-rogue-forest text-white text-2xl">
                        {member.full_name?.[0] || member.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                      <h3 className="font-semibold text-rogue-forest">
                        {member.full_name || 'Member'}
                      </h3>
                      <p className="text-sm text-rogue-slate">{member.email}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      <RoleBadge role={member.role as any} />
                      {(member.city || member.state) && (
                        <Badge variant="outline" className="text-xs">
                          <MapPin size={12} className="mr-1" />
                          {[member.city, member.state].filter(Boolean).join(', ')}
                        </Badge>
                      )}
                    </div>

                    {member.bio && (
                      <p className="text-sm text-rogue-slate line-clamp-2 leading-relaxed">
                        {member.bio}
                      </p>
                    )}

                    {member.interests && member.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {member.interests.slice(0, 3).map((interest, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                        {member.interests.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{member.interests.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/members/${member.id}`)
                      }}
                    >
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}





