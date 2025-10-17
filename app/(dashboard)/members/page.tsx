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
import { Users, Search, MapPin, Sparkles } from 'lucide-react'
import {
  getAllMembers,
  searchMembers,
  getFacilitators,
  type UserProfile
} from '@/lib/supabase/queries/social'
import { toast } from 'sonner'

export default function MembersPage() {
  const [members, setMembers] = useState<UserProfile[]>([])
  const [facilitators, setFacilitators] = useState<UserProfile[]>([])
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

      // Load facilitators separately
      const facilitatorsData = await getFacilitators()
      setFacilitators(facilitatorsData)

      // Load all members
      const allMembers = await getAllMembers(100)
      
      // Filter out facilitators from general member list to avoid duplication
      const regularMembers = allMembers.filter(
        member => !member.roles?.includes('facilitator') && !member.role?.includes('facilitator')
      )
      setMembers(regularMembers)
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
      
      // When searching, separate facilitators and members
      const searchedFacilitators = data.filter(
        member => member.roles?.includes('facilitator') || member.role === 'facilitator'
      )
      const searchedMembers = data.filter(
        member => !member.roles?.includes('facilitator') && member.role !== 'facilitator'
      )
      
      setFacilitators(searchedFacilitators)
      setMembers(searchedMembers)
    } catch (error) {
      console.error('Error searching members:', error)
      toast.error('Failed to search members')
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  const renderMemberCard = (member: UserProfile, featured: boolean = false) => (
    <Card
      key={member.id}
      className={`hover:shadow-md transition-shadow cursor-pointer ${
        featured ? 'border-2 border-rogue-gold/30' : ''
      }`}
      onClick={() => router.push(`/members/${member.id}`)}
    >
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <Avatar className={featured ? 'h-24 w-24' : 'h-20 w-20'}>
            <AvatarImage src={member.avatar_url || undefined} />
            <AvatarFallback className="bg-rogue-forest text-white text-2xl">
              {member.full_name?.[0] || member.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <h3 className={`font-semibold text-rogue-forest ${featured ? 'text-lg' : ''}`}>
              {member.full_name || 'Member'}
            </h3>
            {member.employer && (
              <p className="text-sm text-rogue-slate/80">{member.employer}</p>
            )}
            {member.current_role && (
              <p className="text-xs text-rogue-slate/60">{member.current_role}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <RoleBadge roles={member.roles as any} role={member.role as any} />
            {(member.city || member.state) && (
              <Badge variant="outline" className="text-xs">
                <MapPin size={12} className="mr-1" />
                {[member.city, member.state].filter(Boolean).join(', ')}
              </Badge>
            )}
          </div>

          {member.bio && (
            <p className="text-sm text-rogue-slate line-clamp-3 leading-relaxed">
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
  )

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

        {/* Featured Facilitators Section */}
        {facilitators.length > 0 && (
          <div className="mb-16">
            {/* Header with elegant background */}
            <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-rogue-forest/5 via-rogue-sage/5 to-rogue-gold/5 p-8 backdrop-blur-sm border border-rogue-gold/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(212,175,55,0.1),transparent)]"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-rogue-gold/10">
                    <Sparkles className="h-6 w-6 text-rogue-gold" />
                  </div>
                  <h2 className="text-3xl font-bold text-rogue-forest">
                    Meet Your Facilitators
                  </h2>
                </div>
                <p className="text-rogue-slate/80 text-lg leading-relaxed max-w-3xl">
                  Our experienced facilitators are here to guide you through your leadership journey. 
                  They bring years of expertise and are dedicated to your growth and success.
                </p>
              </div>
            </div>

            {/* Facilitator Cards - Horizontal Layout */}
            <div className="space-y-6">
              {facilitators.map((facilitator) => (
                <Card
                  key={facilitator.id}
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-rogue-gold/20 hover:border-rogue-gold/40 bg-gradient-to-br from-white to-rogue-cream/30 overflow-hidden"
                  onClick={() => router.push(`/members/${facilitator.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Image Section */}
                      <div className="relative md:w-64 flex-shrink-0 bg-gradient-to-br from-rogue-forest/10 to-rogue-sage/10 p-8 flex items-center justify-center">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.1),transparent)]"></div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-rogue-gold/20 blur-2xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-500"></div>
                          <Avatar className="relative h-32 w-32 border-4 border-white shadow-xl ring-2 ring-rogue-gold/20 group-hover:ring-rogue-gold/40 transition-all">
                            <AvatarImage src={facilitator.avatar_url || undefined} className="object-cover" />
                            <AvatarFallback className="bg-rogue-forest text-white text-4xl font-semibold">
                              {facilitator.full_name?.[0] || facilitator.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 p-6 md:p-8">
                        <div className="flex flex-col h-full">
                          {/* Header */}
                          <div className="mb-4">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <h3 className="text-2xl font-bold text-rogue-forest mb-1 group-hover:text-rogue-pine transition-colors">
                                  {facilitator.full_name || 'Facilitator'}
                                </h3>
                                {facilitator.current_role && (
                                  <p className="text-rogue-slate/80 font-medium">
                                    {facilitator.current_role}
                                  </p>
                                )}
                                {facilitator.employer && (
                                  <p className="text-sm text-rogue-slate/60">
                                    {facilitator.employer}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 items-start">
                                <RoleBadge roles={facilitator.roles as any} role={facilitator.role as any} />
                                {(facilitator.city || facilitator.state) && (
                                  <Badge variant="outline" className="text-xs border-rogue-sage/30">
                                    <MapPin size={12} className="mr-1" />
                                    {[facilitator.city, facilitator.state].filter(Boolean).join(', ')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Bio - Full Display */}
                          {facilitator.bio && (
                            <div className="flex-1 mb-4">
                              <p className="text-rogue-slate leading-relaxed text-base">
                                {facilitator.bio}
                              </p>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between gap-4 pt-4 border-t border-rogue-sage/10">
                            {facilitator.interests && facilitator.interests.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 flex-1">
                                {facilitator.interests.slice(0, 4).map((interest, idx) => (
                                  <Badge 
                                    key={idx} 
                                    variant="secondary" 
                                    className="text-xs bg-rogue-sage/10 text-rogue-forest hover:bg-rogue-sage/20"
                                  >
                                    {interest}
                                  </Badge>
                                ))}
                                {facilitator.interests.length > 4 && (
                                  <Badge 
                                    variant="secondary" 
                                    className="text-xs bg-rogue-sage/10 text-rogue-forest"
                                  >
                                    +{facilitator.interests.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            )}
                            <Button
                              variant="outline"
                              className="border-rogue-forest/20 hover:border-rogue-forest hover:bg-rogue-forest hover:text-white transition-all flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/members/${facilitator.id}`)
                              }}
                            >
                              View Full Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Regular Members Section */}
        <div>
          {facilitators.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-rogue-forest mb-2">
                Cohort Participants
              </h2>
              <p className="text-rogue-slate leading-relaxed">
                Connect with your fellow leaders on this transformative journey.
              </p>
            </div>
          )}

          {members.length === 0 && facilitators.length === 0 ? (
            <EmptyState
              icon={<Users size={64} />}
              title="No Members Found"
              description={searchQuery ? 'Try adjusting your search criteria' : 'No members yet'}
            />
          ) : members.length === 0 ? (
            <EmptyState
              icon={<Users size={64} />}
              title="No Participants Found"
              description={searchQuery ? 'Try adjusting your search criteria' : 'No participants yet'}
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member) => renderMemberCard(member, false))}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}







