'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { RichTextEditor } from '@/components/discussions/rich-text-editor'
import { MessageSquare, Pin, Lock, Plus, Eye, MessageCircle, TrendingUp } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format-date'
import { toast } from 'sonner'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Thread {
  id: string
  title: string
  content: string
  content_html?: string
  created_by: string
  is_pinned: boolean
  is_locked: boolean
  views_count: number
  created_at: string
  last_activity_at: string
  created_by_profile?: {
    full_name: string
    avatar_url?: string
    role: string
  }
  post_count?: number
  last_post?: {
    created_at: string
    author?: {
      full_name: string
    }
  }
}

export default function DiscussionsPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [showNewThread, setShowNewThread] = useState(false)
  const [newThreadTitle, setNewThreadTitle] = useState('')
  const [newThreadContent, setNewThreadContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadDiscussions()
    setupRealtimeSubscription()
  }, [])

  async function loadDiscussions() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }

      // Get threads with post counts and last activity
      const { data, error } = await supabase
        .from('discussion_threads')
        .select(`
          *,
          created_by_profile:profiles!created_by(full_name, avatar_url, role)
        `)
        .order('is_pinned', { ascending: false })
        .order('last_activity_at', { ascending: false })

      if (error) throw error

      // Get post counts for each thread
      const threadsWithCounts = await Promise.all(
        (data || []).map(async (thread: any) => {
          const { count } = await supabase
            .from('discussion_posts')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', thread.id)

          const { data: lastPost } = await supabase
            .from('discussion_posts')
            .select('created_at, author:profiles(full_name)')
            .eq('thread_id', thread.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single() as any

          return {
            ...thread,
            post_count: count || 0,
            last_post: lastPost ? {
              created_at: lastPost.created_at,
              author: lastPost.author
            } : null
          }
        })
      )

      setThreads(threadsWithCounts)
    } catch (error) {
      console.error('Error loading discussions:', error)
      toast.error('Failed to load discussions')
    } finally {
      setIsLoading(false)
    }
  }

  function setupRealtimeSubscription() {
    const channel = supabase
      .channel('discussions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'discussion_threads',
        },
        () => {
          console.log('Discussion threads changed, reloading...')
          loadDiscussions()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'discussion_posts',
        },
        () => {
          console.log('New post added, reloading threads...')
          loadDiscussions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function handleCreateThread() {
    if (!newThreadTitle.trim() || !newThreadContent.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)

    try {
      const { data: thread, error } = await (supabase as any)
        .from('discussion_threads')
        .insert({
          title: newThreadTitle,
          content: newThreadContent,
          content_html: newThreadContent,
          created_by: userId,
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Discussion thread created!')
      setNewThreadTitle('')
      setNewThreadContent('')
      setShowNewThread(false)
      loadDiscussions()
    } catch (error: any) {
      console.error('Error creating thread:', error)
      toast.error(error.message || 'Failed to create thread')
    } finally {
      setIsSubmitting(false)
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

  const pinnedThreads = threads.filter(t => t.is_pinned)
  const regularThreads = threads.filter(t => !t.is_pinned)

  return (
    <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
      {/* Header */}
      <div className="bg-white/40 backdrop-blur-sm border-b border-rogue-sage/10">
        <Container>
          <div className="py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-rogue-forest mb-1">Discussions</h1>
                <p className="text-rogue-slate">
                  Connect with your cohort and share insights
                </p>
              </div>
              <Button onClick={() => setShowNewThread(true)} size="lg" className="bg-gradient-to-r from-rogue-forest to-rogue-pine">
                <Plus className="mr-2 h-4 w-4" />
                Start Discussion
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8 max-w-4xl mx-auto">
          
          {/* New Thread Form */}
          {showNewThread && (
            <Card className="mb-6 border-0 shadow-xl bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-rogue-forest">Start a New Discussion</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setShowNewThread(false)
                      setNewThreadTitle('')
                      setNewThreadContent('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Discussion title..."
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    className="w-full text-xl font-semibold border-0 focus:outline-none focus:ring-0 placeholder:text-rogue-slate/40"
                  />
                </div>
                <RichTextEditor
                  content={newThreadContent}
                  onChange={setNewThreadContent}
                  placeholder="Share your thoughts, ask questions, or start a meaningful conversation..."
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowNewThread(false)
                      setNewThreadTitle('')
                      setNewThreadContent('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateThread}
                    disabled={isSubmitting || !newThreadTitle.trim() || !newThreadContent.trim()}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Discussion'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {threads.length === 0 ? (
            <EmptyState
              icon={<MessageSquare size={64} />}
              title="No Discussions Yet"
              description="Start engaging with your cohort by creating the first discussion thread."
              action={
                <Button onClick={() => setShowNewThread(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Start First Discussion
                </Button>
              }
            />
          ) : (
            <div className="space-y-6">
              {/* Pinned Discussions */}
              {pinnedThreads.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Pin className="h-4 w-4 text-rogue-gold" />
                    <h2 className="text-sm font-semibold text-rogue-gold uppercase tracking-wide">Pinned</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {pinnedThreads.map((thread) => (
                      <ThreadCard key={thread.id} thread={thread} userId={userId} />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Discussions */}
              {regularThreads.length > 0 && (
                <div>
                  {pinnedThreads.length > 0 && (
                    <div className="h-px bg-rogue-sage/20 my-6" />
                  )}
                  
                  <div className="space-y-3">
                    {regularThreads.map((thread) => (
                      <ThreadCard key={thread.id} thread={thread} userId={userId} />
                    ))}
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

interface ThreadCardProps {
  thread: Thread
  userId: string | null
}

function ThreadCard({ thread, userId }: ThreadCardProps) {
  const router = useRouter()

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card 
      className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer bg-white group"
      onClick={() => router.push(`/discussions/${thread.id}`)}
    >
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={thread.created_by_profile?.avatar_url} alt={thread.created_by_profile?.full_name} />
            <AvatarFallback className="bg-rogue-sage text-white">
              {getInitials(thread.created_by_profile?.full_name || 'User')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {thread.is_pinned && (
                    <Badge className="bg-rogue-gold/10 text-rogue-gold border-rogue-gold/20">
                      <Pin className="mr-1 h-3 w-3" />
                      Pinned
                    </Badge>
                  )}
                  {thread.is_locked && (
                    <Badge variant="outline" className="border-rogue-slate/30 text-rogue-slate">
                      <Lock className="mr-1 h-3 w-3" />
                      Locked
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-bold text-lg text-rogue-forest group-hover:text-rogue-gold transition-colors line-clamp-2">
                  {thread.title}
                </h3>
                
                <div className="flex items-center gap-2 mt-1 text-sm text-rogue-slate">
                  <span className="font-medium">{thread.created_by_profile?.full_name}</span>
                  <span>•</span>
                  <span>{formatRelativeTime(thread.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Thread Preview */}
            {thread.content_html && (
              <div 
                className="tiptap-content text-rogue-slate line-clamp-2 mt-2"
                dangerouslySetInnerHTML={{ __html: thread.content_html }}
              />
            )}

            {/* Thread Stats */}
            <div className="flex items-center gap-4 mt-3 text-sm text-rogue-slate">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{thread.post_count || 0} {thread.post_count === 1 ? 'comment' : 'comments'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{thread.views_count || 0} views</span>
              </div>
              {thread.last_post && (
                <>
                  <span>•</span>
                  <span className="text-xs">
                    Last activity {formatRelativeTime(thread.last_post.created_at)}
                    {thread.last_post.author && ` by ${thread.last_post.author.full_name}`}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

