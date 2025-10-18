'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PageLoader } from '@/components/ui/loading-spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Handshake, Search, UserPlus, X, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  bio?: string
  partner_id?: string
  experience_level?: string
  industry?: string
  team_size?: string
  time_zone?: string
  communication_style?: string
  goals?: string
}

export default function AdminPartnersPage() {
  const [participants, setParticipants] = useState<Profile[]>([])
  const [filteredParticipants, setFilteredParticipants] = useState<Profile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [potentialPartners, setPotentialPartners] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMatching, setIsMatching] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAccess()
    loadParticipants()
  }, [])

  useEffect(() => {
    filterParticipants()
  }, [participants, searchQuery, filterStatus])

  async function checkAccess() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .single<{ roles: string[] }>()

    if (!profile?.roles?.some(r => ['admin', 'facilitator'].includes(r))) {
      router.push('/dashboard')
    }
  }

  async function loadParticipants() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'participant')
        .eq('is_active', true)
        .order('full_name', { ascending: true })

      if (error) throw error

      setParticipants((data as Profile[]) || [])
    } catch (error) {
      console.error('Error loading participants:', error)
      toast.error('Failed to load participants')
    } finally {
      setIsLoading(false)
    }
  }

  function filterParticipants() {
    let filtered = [...participants]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.full_name?.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.industry?.toLowerCase().includes(query)
      )
    }

    if (filterStatus === 'paired') {
      filtered = filtered.filter(p => p.partner_id)
    } else if (filterStatus === 'unpaired') {
      filtered = filtered.filter(p => !p.partner_id)
    }

    setFilteredParticipants(filtered)
  }

  function calculateCompatibility(user1: Profile, user2: Profile): number {
    let score = 0
    let maxScore = 0

    // Experience level match (20 points)
    maxScore += 20
    if (user1.experience_level === user2.experience_level) {
      score += 20
    } else if (user1.experience_level && user2.experience_level) {
      score += 10 // Partial credit for having data
    }

    // Industry match (15 points)
    maxScore += 15
    if (user1.industry && user2.industry && 
        user1.industry.toLowerCase() === user2.industry.toLowerCase()) {
      score += 15
    }

    // Time zone proximity (25 points)
    maxScore += 25
    if (user1.time_zone && user2.time_zone &&
        user1.time_zone === user2.time_zone) {
      score += 25
    } else if (user1.time_zone && user2.time_zone) {
      score += 10 // Different but at least both provided
    }

    // Communication style (20 points)
    maxScore += 20
    if (user1.communication_style && user2.communication_style) {
      if (user1.communication_style === user2.communication_style) {
        score += 20
      } else {
        // Complementary styles get partial credit
        score += 12
      }
    }

    // Team size similarity (10 points)
    maxScore += 10
    if (user1.team_size === user2.team_size) {
      score += 10
    }

    // Goals overlap (10 points)
    maxScore += 10
    if (user1.goals && user2.goals) {
      score += 10
    }

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  }

  function handleSelectUser(user: Profile) {
    setSelectedUser(user)
    
    // Find potential matches (unpaired users)
    const unpaired = participants.filter(p => 
      !p.partner_id && 
      p.id !== user.id
    )

    // Calculate compatibility scores
    const withScores = unpaired.map(partner => ({
      ...partner,
      compatibilityScore: calculateCompatibility(user, partner)
    }))

    // Sort by score
    withScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore)

    setPotentialPartners(withScores as any)
  }

  async function handlePairPartners(partnerId: string) {
    if (!selectedUser) return

    setIsMatching(true)

    try {
      // Update both users to be partners
      const { error: error1 } = await (supabase as any)
        .from('profiles')
        .update({ partner_id: partnerId })
        .eq('id', selectedUser.id)

      const { error: error2 } = await (supabase as any)
        .from('profiles')
        .update({ partner_id: selectedUser.id })
        .eq('id', partnerId)

      if (error1 || error2) throw error1 || error2

      toast.success('Partners matched successfully!')
      setSelectedUser(null)
      loadParticipants()
    } catch (error: any) {
      console.error('Error pairing partners:', error)
      toast.error(error.message || 'Failed to pair partners')
    } finally {
      setIsMatching(false)
    }
  }

  async function handleUnpair(userId: string, partnerId: string) {
    if (!confirm('Are you sure you want to unpair these partners?')) return

    try {
      const { error: error1 } = await (supabase as any)
        .from('profiles')
        .update({ partner_id: null })
        .eq('id', userId)

      const { error: error2 } = await (supabase as any)
        .from('profiles')
        .update({ partner_id: null })
        .eq('id', partnerId)

      if (error1 || error2) throw error1 || error2

      toast.success('Partners unpaired successfully')
      loadParticipants()
    } catch (error: any) {
      toast.error(error.message || 'Failed to unpair partners')
    }
  }

  function getInitials(name: string) {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  if (isLoading) {
    return <PageLoader />
  }

  const pairedCount = participants.filter(p => p.partner_id).length
  const unpairedCount = participants.filter(p => !p.partner_id).length

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          heading="Partner Matching"
          description="Match participants with accountability partners based on compatibility"
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-rogue-forest">{participants.length}</div>
                <div className="text-sm text-rogue-slate">Total Participants</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{pairedCount}</div>
                <div className="text-sm text-rogue-slate">Paired</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{unpairedCount}</div>
                <div className="text-sm text-rogue-slate">Unpaired</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rogue-slate" />
                <Input
                  placeholder="Search by name, email, or industry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Participants</SelectItem>
                  <SelectItem value="unpaired">Unpaired Only</SelectItem>
                  <SelectItem value="paired">Paired Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Participants Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredParticipants.map((participant) => {
            const partner = participants.find(p => p.id === participant.partner_id)

            return (
              <Card key={participant.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={participant.avatar_url} />
                      <AvatarFallback className="bg-rogue-sage text-white">
                        {getInitials(participant.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-rogue-forest truncate">{participant.full_name}</h3>
                      <p className="text-sm text-rogue-slate truncate">{participant.email}</p>
                      {participant.experience_level && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {participant.experience_level}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {participant.industry && (
                    <p className="text-xs text-rogue-slate mb-2">
                      {participant.industry} • {participant.team_size || 'Team size not set'}
                    </p>
                  )}

                  {partner ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Handshake className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium text-green-800">Paired with</span>
                      </div>
                      <p className="text-sm font-medium text-green-900">{partner.full_name}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnpair(participant.id, partner.id)}
                        className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Unpair
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectUser(participant)}
                      className="w-full"
                    >
                      <UserPlus className="h-3 w-3 mr-2" />
                      Find Partner
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Matching Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Find Partner for {selectedUser?.full_name}</DialogTitle>
              <DialogDescription>
                Suggested matches based on compatibility score
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-4">
                {potentialPartners.length === 0 ? (
                  <p className="text-center text-rogue-slate py-8">
                    No unpaired participants available
                  </p>
                ) : (
                  potentialPartners.map((partner: any) => (
                    <Card key={partner.id} className="border-rogue-sage/20">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={partner.avatar_url} />
                            <AvatarFallback className="bg-rogue-sage text-white">
                              {getInitials(partner.full_name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-rogue-forest">{partner.full_name}</h4>
                                <p className="text-sm text-rogue-slate">{partner.email}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-center">
                                  <div className={`text-2xl font-bold ${
                                    partner.compatibilityScore >= 70 ? 'text-green-600' :
                                    partner.compatibilityScore >= 50 ? 'text-yellow-600' :
                                    'text-orange-600'
                                  }`}>
                                    {partner.compatibilityScore}%
                                  </div>
                                  <div className="text-xs text-rogue-slate">Match</div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                              {partner.experience_level && (
                                <div>
                                  <span className="text-rogue-slate">Experience:</span>
                                  <span className="ml-1 text-rogue-forest font-medium">{partner.experience_level}</span>
                                </div>
                              )}
                              {partner.industry && (
                                <div>
                                  <span className="text-rogue-slate">Industry:</span>
                                  <span className="ml-1 text-rogue-forest font-medium">{partner.industry}</span>
                                </div>
                              )}
                              {partner.time_zone && (
                                <div>
                                  <span className="text-rogue-slate">Time Zone:</span>
                                  <span className="ml-1 text-rogue-forest font-medium">{partner.time_zone}</span>
                                </div>
                              )}
                              {partner.communication_style && (
                                <div>
                                  <span className="text-rogue-slate">Style:</span>
                                  <span className="ml-1 text-rogue-forest font-medium">{partner.communication_style}</span>
                                </div>
                              )}
                            </div>

                            {partner.bio && (
                              <p className="text-sm text-rogue-slate line-clamp-2 mb-3">{partner.bio}</p>
                            )}

                            <Button
                              size="sm"
                              onClick={() => handlePairPartners(partner.id)}
                              disabled={isMatching}
                              className="w-full"
                            >
                              <Handshake className="h-3 w-3 mr-2" />
                              Pair as Partners
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </div>
  )
}

