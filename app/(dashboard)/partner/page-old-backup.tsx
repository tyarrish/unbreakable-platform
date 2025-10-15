'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Users, Send, Calendar } from 'lucide-react'
import { 
  getPartner, 
  getPartnerMessages, 
  sendPartnerMessage,
  subscribeToPartnerMessages,
  markMessagesAsRead,
  getPartnerCheckIns
} from '@/lib/supabase/queries/partners'
import { formatRelativeTime } from '@/lib/utils/format-date'
import { getWeekNumber } from '@/lib/utils/format-date'
import { toast } from 'sonner'

export default function PartnerPage() {
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [partner, setPartner] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [checkIns, setCheckIns] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const supabase = createClient()

  const cohortStartDate = '2025-10-23' // TODO: Make this dynamic

  useEffect(() => {
    loadPartnerData()
  }, [])

  useEffect(() => {
    if (!userId || !partnerId) return

    // Subscribe to new messages
    const channel = subscribeToPartnerMessages(userId, partnerId, () => {
      loadMessages()
    })

    // Mark messages as read
    markMessagesAsRead(userId)

    return () => {
      channel.unsubscribe()
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
        .select('partner_id')
        .eq('id', user.id)
        .single<{ partner_id: string | null }>()

      if (profile?.partner_id) {
        setPartnerId(profile.partner_id)
        
        const [partnerData, messagesData, checkInsData] = await Promise.all([
          getPartner(profile.partner_id),
          getPartnerMessages(user.id, profile.partner_id),
          getPartnerCheckIns(user.id),
        ])
        
        setPartner(partnerData)
        setMessages(messagesData)
        setCheckIns(checkInsData)
      }
    } catch (error) {
      console.error('Error loading partner:', error)
    } finally {
      setIsLoading(false)
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

  if (isLoading) {
    return <PageLoader />
  }

  if (!partnerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
        {/* Subtle header background */}
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
            <Card className="border-0 shadow-xl">
              <EmptyState
                icon={<Users size={64} />}
                title="No Partner Assigned"
                description="Complete the partner questionnaire to be matched with an accountability partner."
              />
            </Card>
          </div>
        </Container>
      </div>
    )
  }

  const currentWeek = getWeekNumber(cohortStartDate)

  return (
    <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
      {/* Subtle header background */}
      <div className="bg-white/40 backdrop-blur-sm border-b border-rogue-sage/10">
        <Container size="lg">
          <div className="py-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-rogue-forest mb-2">Accountability Partner</h1>
                <p className="text-lg text-rogue-slate">
                  Weekly check-ins and private messaging
                </p>
              </div>
              <Badge className="bg-green-100 text-green-700 border-0 px-4 py-2">
                <Users size={14} className="mr-1" />
                Week {currentWeek}
              </Badge>
            </div>
          </div>
        </Container>
      </div>

      <Container size="lg">
        <div className="py-8">

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Partner Info & Check-ins */}
          <div className="space-y-6">
            {/* Partner Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-rogue-sage/5">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-rogue-forest/10 rounded-lg">
                    <Users className="h-5 w-5 text-rogue-forest" />
                  </div>
                </div>
                <CardTitle className="text-xl">Your Partner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={partner?.avatar_url} />
                    <AvatarFallback className="bg-rogue-forest text-white text-xl">
                      {partner?.full_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-rogue-forest">{partner?.full_name || 'Partner'}</h3>
                    <p className="text-sm text-rogue-slate">{partner?.email}</p>
                  </div>
                </div>
                {partner?.bio && (
                  <p className="text-sm text-rogue-slate leading-relaxed">{partner.bio}</p>
                )}
              </CardContent>
            </Card>

            {/* Weekly Check-in */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-rogue-gold/5 to-white">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-rogue-gold/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-rogue-gold" />
                  </div>
                </div>
                <CardTitle className="text-xl">Week {currentWeek} Check-in</CardTitle>
                <CardDescription>Share your progress and commitments</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="gold">
                  Complete Check-in
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Messages */}
          <Card className="lg:col-span-2 border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-rogue-copper/10 rounded-lg">
                  <Send className="h-5 w-5 text-rogue-copper" />
                </div>
              </div>
              <CardTitle className="text-2xl">Messages</CardTitle>
              <CardDescription className="text-base">Private conversation with your partner</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Messages List */}
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-center text-rogue-slate py-8">
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
                          className={`max-w-[80%] rounded-lg p-4 ${
                            isOwnMessage
                              ? 'bg-rogue-forest text-white'
                              : 'bg-rogue-sage/10 text-rogue-slate'
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{message.message}</p>
                          <p className={`text-xs mt-2 ${isOwnMessage ? 'text-rogue-cream' : 'text-rogue-slate'}`}>
                            {formatRelativeTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Send Message */}
              <div className="space-y-3 border-t border-rogue-sage/20 pt-4">
                <Label htmlFor="message">Send a message</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={3}
                    disabled={isSending}
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
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSending ? 'Sending...' : 'Send Message'}
                </Button>
                <p className="text-xs text-rogue-slate">Tip: Press Cmd+Enter to send</p>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </Container>
    </div>
  )
}

