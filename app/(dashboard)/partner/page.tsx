'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { CheckInForm } from '@/components/partners/check-in-form'
import { CheckInResponse } from '@/components/partners/check-in-response'
import { CheckInTimeline } from '@/components/partners/check-in-timeline'
import { 
  Users, 
  Send, 
  Calendar, 
  Target, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MessageCircle
} from 'lucide-react'
import { 
  getPartner, 
  getPartnerMessages, 
  sendPartnerMessage,
  subscribeToPartnerMessages,
  markMessagesAsRead 
} from '@/lib/supabase/queries/partners'
import {
  getCurrentCheckIn,
  getPartnerCheckIn,
  getCheckInHistory,
  updateCommitmentStatus
} from '@/lib/supabase/queries/partner-checkins'
import { formatRelativeTime } from '@/lib/utils/format-date'
import { getWeekNumber } from '@/lib/utils/format-date'
import { toast } from 'sonner'

export default function PartnerPage() {
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [partner, setPartner] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  
  // Check-in state
  const [currentWeek, setCurrentWeek] = useState(1)
  const [userCheckIn, setUserCheckIn] = useState<any>(null)
  const [partnerCheckIn, setPartnerCheckIn] = useState<any>(null)
  const [checkInHistory, setCheckInHistory] = useState<any>({ userCheckIns: [], partnerCheckIns: [] })
  const [showCheckInForm, setShowCheckInForm] = useState(false)
  
  const supabase = createClient()
  const cohortStartDate = '2025-10-23' // TODO: Make this dynamic from settings

  useEffect(() => {
    loadPartnerData()
  }, [])

  useEffect(() => {
    if (!userId || !partnerId) return

    // Subscribe to new messages
    const channel = subscribeToPartnerMessages(userId, partnerId, () => {
      loadMessages()
    })

    // Subscribe to check-in updates
    const checkInChannel = supabase
      .channel('partner-checkins')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'partner_checkins',
          filter: `partner_id=eq.${userId}`,
        },
        () => {
          console.log('Partner check-in updated, reloading...')
          loadCheckIns()
        }
      )
      .subscribe()

    // Mark messages as read
    markMessagesAsRead(userId)

    return () => {
      channel.unsubscribe()
      supabase.removeChannel(checkInChannel)
    }
  }, [userId, partnerId])

  async function loadPartnerData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoading(false)
        return
      }
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('partner_id, full_name')
        .eq('id', user.id)
        .single<{ partner_id: string | null, full_name: string | null }>()

      setUserName(profile?.full_name || 'You')

      if (profile?.partner_id) {
        setPartnerId(profile.partner_id)
        
        const [partnerData, messagesData] = await Promise.all([
          getPartner(profile.partner_id),
          getPartnerMessages(user.id, profile.partner_id),
        ])
        
        setPartner(partnerData)
        setMessages(messagesData)

        // Load check-ins
        const week = getWeekNumber(cohortStartDate)
        setCurrentWeek(week)
        loadCheckIns()
      }
    } catch (error) {
      console.error('Error loading partner:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadCheckIns() {
    if (!userId || !partnerId) return

    try {
      const [userCurrent, partnerCurrent, history] = await Promise.all([
        getCurrentCheckIn(userId, currentWeek),
        getPartnerCheckIn(partnerId, currentWeek),
        getCheckInHistory(userId, partnerId, 10)
      ])

      setUserCheckIn(userCurrent)
      setPartnerCheckIn(partnerCurrent)
      setCheckInHistory(history)
    } catch (error) {
      console.error('Error loading check-ins:', error)
    }
  }

  async function loadMessages() {
    if (!userId || !partnerId) return
    
    try {
      const data = await getPartnerMessages(userId, partnerId)
      setMessages(data)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  async function handleSendMessage() {
    if (!userId || !partnerId || !newMessage.trim()) return

    setIsSending(true)
    try {
      await sendPartnerMessage(userId, partnerId, newMessage)
      setNewMessage('')
      loadMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  async function handleUpdateLastWeekStatus(status: 'completed' | 'partial' | 'missed') {
    if (!userCheckIn) return

    try {
      await updateCommitmentStatus(userCheckIn.id, status)
      toast.success('Commitment status updated!')
      loadCheckIns()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status')
    }
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (!partnerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
        <div className="bg-white/40 backdrop-blur-sm border-b border-rogue-sage/10">
          <Container>
            <div className="py-8">
              <h1 className="text-3xl md:text-4xl font-bold text-rogue-forest mb-2">Accountability Partner</h1>
              <p className="text-lg text-rogue-slate">
                Your paired partner for weekly check-ins and mutual support
              </p>
            </div>
          </Container>
        </div>

        <Container>
          <div className="py-8">
            <EmptyState
              icon={<Users size={64} />}
              title="No Partner Assigned"
              description="You'll be paired with an accountability partner soon. Check back later!"
            />
          </div>
        </Container>
      </div>
    )
  }

  const completionRate = Math.round((checkInHistory.userCheckIns.length / currentWeek) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
      {/* Header */}
      <div className="bg-white/40 backdrop-blur-sm border-b border-rogue-sage/10">
        <Container>
          <div className="py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-rogue-forest mb-1">Accountability Partner</h1>
                <p className="text-rogue-slate">Weekly check-ins and mutual support</p>
              </div>
              <Badge className="bg-green-100 text-green-700 border-0 px-4 py-2">
                <Calendar className="mr-1 h-4 w-4" />
                Week {currentWeek}
              </Badge>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Left Column: Partner Info & Stats */}
            <div className="space-y-6">
              
              {/* Partner Card */}
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Your Partner</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={partner?.avatar_url} />
                      <AvatarFallback className="bg-rogue-forest text-white text-xl">
                        {getInitials(partner?.full_name || 'P')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-rogue-forest">{partner?.full_name || 'Partner'}</h3>
                      <p className="text-sm text-rogue-slate">{partner?.role}</p>
                    </div>
                  </div>
                  {partner?.bio && (
                    <p className="text-sm text-rogue-slate leading-relaxed">{partner.bio}</p>
                  )}
                  
                  {/* Accountability Score */}
                  <div className="pt-4 border-t border-rogue-sage/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-rogue-slate">Your Completion Rate</span>
                      <span className="text-lg font-bold text-rogue-forest">{completionRate}%</span>
                    </div>
                    <div className="h-2 bg-rogue-sage/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-rogue-forest to-rogue-gold transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <p className="text-xs text-rogue-slate mt-1">
                      {checkInHistory.userCheckIns.length} of {currentWeek} weeks completed
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Commitment Tracker */}
              {userCheckIn && (
                <Card className="border-0 shadow-xl bg-gradient-to-br from-rogue-gold/5 to-white">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-rogue-gold" />
                      This Week's Commitments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-rogue-forest/5 rounded-lg">
                      <div className="text-xs text-rogue-slate mb-1">Your Commitment</div>
                      <p className="text-sm font-medium text-rogue-forest">{userCheckIn.commitment}</p>
                    </div>
                    {partnerCheckIn && (
                      <div className="p-3 bg-rogue-sage/10 rounded-lg">
                        <div className="text-xs text-rogue-slate mb-1">Partner's Commitment</div>
                        <p className="text-sm font-medium text-rogue-forest">{partnerCheckIn.commitment}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Check-ins & Messages */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Check-in Notification */}
              {!userCheckIn && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-orange-900 mb-1">Week {currentWeek} Check-in Pending</h3>
                      <p className="text-sm text-orange-800">
                        Complete your weekly check-in to stay accountable with your partner.
                      </p>
                    </div>
                    {!showCheckInForm && (
                      <Button 
                        size="sm"
                        onClick={() => setShowCheckInForm(true)}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Start Check-in
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Partner Completed Notification */}
              {partnerCheckIn && !userCheckIn && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900 mb-1">
                        {partner?.full_name} completed their check-in!
                      </h3>
                      <p className="text-sm text-green-800">
                        View their responses and add a supportive comment.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Week Check-in */}
              {!userCheckIn && showCheckInForm && (
                <CheckInForm
                  userId={userId!}
                  partnerId={partnerId}
                  weekNumber={currentWeek}
                  onComplete={() => {
                    setShowCheckInForm(false)
                    loadCheckIns()
                  }}
                />
              )}

              {/* Completed Check-in Summary */}
              {userCheckIn && !showCheckInForm && (
                <Card className="border-0 shadow-xl bg-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-green-100 rounded-full">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-rogue-forest">Week {currentWeek} Check-in Complete!</h3>
                        <p className="text-sm text-rogue-slate">You submitted your check-in</p>
                      </div>
                    </div>
                    <div className="bg-rogue-gold/5 p-4 rounded-lg border border-rogue-gold/20">
                      <div className="text-xs text-rogue-slate mb-1">Your Commitment</div>
                      <p className="font-medium text-rogue-forest">{userCheckIn.commitment}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Partner's Latest Check-in */}
              {partnerCheckIn && (
                <CheckInResponse
                  checkIn={partnerCheckIn}
                  partnerName={partner?.full_name || 'Your Partner'}
                  onCommentAdded={loadCheckIns}
                />
              )}

              {/* Check-in History */}
              {checkInHistory.userCheckIns.length > 0 || checkInHistory.partnerCheckIns.length > 0 ? (
                <CheckInTimeline
                  userCheckIns={checkInHistory.userCheckIns}
                  partnerCheckIns={checkInHistory.partnerCheckIns}
                  userName={userName}
                  partnerName={partner?.full_name || 'Partner'}
                  currentWeek={currentWeek}
                />
              ) : null}

              {/* Messages */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-rogue-copper" />
                    Messages
                  </CardTitle>
                  <CardDescription>Private conversation with your partner</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Messages List */}
                  <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto">
                    {messages.length === 0 ? (
                      <p className="text-center text-rogue-slate py-8 text-sm">
                        No messages yet. Start the conversation!
                      </p>
                    ) : (
                      messages.map((message) => {
                        const isOwnMessage = message.sender_id === userId

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                isOwnMessage
                                  ? 'bg-rogue-forest text-white'
                                  : 'bg-rogue-sage/10 text-rogue-forest'
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                              <p className={`text-xs mt-1 ${isOwnMessage ? 'text-rogue-cream/70' : 'text-rogue-slate/70'}`}>
                                {formatRelativeTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Send Message */}
                  <div className="space-y-2 border-t border-rogue-sage/20 pt-4">
                    <Label htmlFor="message" className="text-sm">Send a message</Label>
                    <div className="flex gap-2">
                      <Textarea
                        id="message"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        rows={2}
                        disabled={isSending}
                        className="resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.metaKey) {
                            handleSendMessage()
                          }
                        }}
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={isSending || !newMessage.trim()}
                      size="sm"
                    >
                      <Send className="mr-2 h-3 w-3" />
                      {isSending ? 'Sending...' : 'Send'}
                    </Button>
                    <p className="text-xs text-rogue-slate">Cmd+Enter to send</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

