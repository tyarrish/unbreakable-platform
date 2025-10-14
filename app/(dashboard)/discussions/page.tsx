'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { MessageSquare, Pin, Lock, Plus, Sparkles, TrendingUp, Clock, Users } from 'lucide-react'
import { getThreads } from '@/lib/supabase/queries/discussions'
import { formatRelativeTime } from '@/lib/utils/format-date'
import { toast } from 'sonner'

export default function DiscussionsPage() {
  const [threads, setThreads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadThreads()
  }, [])

  async function loadThreads() {
    try {
      const data = await getThreads()
      setThreads(data)
    } catch (error) {
      console.error('Error loading discussions:', error)
      toast.error('Failed to load discussions')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  const pinnedThreads = threads.filter(t => t.is_pinned)
  const regularThreads = threads.filter(t => !t.is_pinned)

  return (
    <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
      {/* Subtle header background */}
      <div className="bg-white/40 backdrop-blur-sm border-b border-rogue-sage/10">
        <Container>
          <div className="py-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-rogue-forest mb-2">Discussions</h1>
                <p className="text-lg text-rogue-slate">
                  Connect with your cohort and share insights
                </p>
              </div>
              <Button onClick={() => router.push('/discussions/new')} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                New Thread
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          {threads.length === 0 ? (
            <Card className="border-0 shadow-xl">
              <EmptyState
                icon={<MessageSquare size={64} />}
                title="No Discussions Yet"
                description="Start engaging with your cohort by creating the first discussion thread."
                action={{
                  label: 'Create Discussion',
                  onClick: () => router.push('/discussions/new'),
                }}
              />
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Pinned Discussions */}
              {pinnedThreads.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-rogue-gold/10 rounded-lg">
                      <Pin className="h-5 w-5 text-rogue-gold" />
                    </div>
                    <h2 className="text-2xl font-bold text-rogue-forest">Pinned Discussions</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {pinnedThreads.map((thread) => {
                      const postCount = thread.posts?.[0]?.count || 0
                      const author = thread.created_by_profile

                      return (
                        <Card
                          key={thread.id}
                          className="group border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer bg-gradient-to-br from-rogue-gold/5 to-white border-l-4 border-l-rogue-gold"
                          onClick={() => router.push(`/discussions/${thread.id}`)}
                        >
                          <CardContent className="pt-6">
                            <div className="flex gap-4">
                              <Avatar className="h-12 w-12 ring-2 ring-rogue-gold/20">
                                <AvatarImage src={author?.avatar_url} />
                                <AvatarFallback className="bg-rogue-gold text-white text-lg">
                                  {author?.full_name?.[0] || '?'}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Pin className="h-4 w-4 text-rogue-gold" />
                                      <Badge className="bg-rogue-gold text-white">Pinned</Badge>
                                      {thread.is_locked && (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                          <Lock size={12} />
                                          Locked
                                        </Badge>
                                      )}
                                    </div>
                                    <h3 className="text-xl font-semibold text-rogue-forest group-hover:text-rogue-gold transition-colors">
                                      {thread.title}
                                    </h3>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-rogue-slate">
                                  <div className="flex items-center gap-1">
                                    <Users size={14} />
                                    <span className="font-medium">{author?.full_name || 'Unknown'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    <span>{formatRelativeTime(thread.created_at)}</span>
                                  </div>
                                  {postCount > 0 && (
                                    <div className="flex items-center gap-1">
                                      <MessageSquare size={14} />
                                      <span className="font-medium">{postCount} {postCount === 1 ? 'reply' : 'replies'}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Regular Discussions */}
              {regularThreads.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-1 w-12 bg-gradient-to-r from-rogue-forest to-rogue-gold rounded-full"></div>
                    <h2 className="text-2xl font-bold text-rogue-forest">All Discussions</h2>
                    <Badge variant="outline" className="ml-auto">
                      {regularThreads.length} threads
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {regularThreads.map((thread) => {
                      const postCount = thread.posts?.[0]?.count || 0
                      const author = thread.created_by_profile

                      return (
                        <Card
                          key={thread.id}
                          className="group border-0 shadow-md hover:shadow-xl transition-all cursor-pointer hover:-translate-y-0.5"
                          onClick={() => router.push(`/discussions/${thread.id}`)}
                        >
                          <CardContent className="pt-5 pb-5">
                            <div className="flex gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={author?.avatar_url} />
                                <AvatarFallback className="bg-rogue-forest text-white">
                                  {author?.full_name?.[0] || '?'}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-rogue-forest group-hover:text-rogue-gold transition-colors mb-1">
                                      {thread.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-rogue-slate">
                                      <span className="font-medium">{author?.full_name || 'Unknown'}</span>
                                      <span>•</span>
                                      <span>{formatRelativeTime(thread.created_at)}</span>
                                      {postCount > 0 && (
                                        <>
                                          <span>•</span>
                                          <span className="flex items-center gap-1">
                                            <MessageSquare size={14} />
                                            {postCount}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  {thread.is_locked && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                      <Lock size={12} />
                                      Locked
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
