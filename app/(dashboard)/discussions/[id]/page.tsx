'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RoleBadge } from '@/components/ui/role-badge'
import { PageLoader } from '@/components/ui/loading-spinner'
import {
  getThread,
  getThreadPosts,
  createPost,
  toggleReaction,
  subscribeToThread,
} from '@/lib/supabase/queries/discussions'
import { formatRelativeTime } from '@/lib/utils/format-date'
import { ArrowLeft, Send, ThumbsUp, Lightbulb, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/index.types'

const reactionIcons: Record<string, any> = {
  like: ThumbsUp,
  helpful: Lightbulb,
  insightful: Star,
}

export default function ThreadViewPage() {
  const params = useParams()
  const router = useRouter()
  const threadId = params.id as string
  const supabase = createClient()

  const [thread, setThread] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [replyContent, setReplyContent] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPosting, setIsPosting] = useState(false)

  useEffect(() => {
    loadThread()
    loadPosts()
    
    supabase.auth.getUser().then(res => {
      if (res.data.user) {
        setUserId(res.data.user.id)
      }
    })
  }, [threadId])

  useEffect(() => {
    // Subscribe to real-time updates
    const channel = subscribeToThread(threadId, () => {
      loadPosts()
    })

    return () => {
      channel.unsubscribe()
    }
  }, [threadId])

  async function loadThread() {
    try {
      const data = await getThread(threadId)
      setThread(data)
    } catch (error) {
      console.error('Error loading thread:', error)
      toast.error('Failed to load discussion')
      router.push('/discussions')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadPosts() {
    try {
      const data = await getThreadPosts(threadId)
      setPosts(data)
    } catch (error) {
      console.error('Error loading posts:', error)
    }
  }

  async function handleReply() {
    if (!userId || !replyContent.trim() || thread.is_locked) return

    setIsPosting(true)
    try {
      await createPost({
        thread_id: threadId,
        author_id: userId,
        content: replyContent,
      })

      setReplyContent('')
      toast.success('Reply posted!')
      loadPosts()
    } catch (error) {
      console.error('Error posting reply:', error)
      toast.error('Failed to post reply')
    } finally {
      setIsPosting(false)
    }
  }

  async function handleReaction(postId: string, reactionType: string) {
    if (!userId) return

    try {
      await toggleReaction(postId, userId, reactionType)
      loadPosts()
    } catch (error) {
      console.error('Error toggling reaction:', error)
      toast.error('Failed to add reaction')
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (!thread) {
    return null
  }

  const author = thread.created_by_profile

  return (
    <div className="py-8">
      <Container size="lg">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/discussions')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Discussions
          </Button>
        </div>

        {/* Thread Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-rogue-forest mb-4">{thread.title}</h1>
          <div className="flex items-center gap-3 text-sm text-rogue-slate">
            <span>Started by {author?.full_name || 'Unknown'}</span>
            <span>•</span>
            <span>{formatRelativeTime(thread.created_at)}</span>
            {thread.is_locked && (
              <>
                <span>•</span>
                <Badge variant="secondary">Locked</Badge>
              </>
            )}
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4 mb-8">
          {posts.map((post, index) => {
            const postAuthor = post.author
            const userReactions = post.reactions?.filter((r: any) => r.user_id === userId) || []
            const reactionCounts: Record<string, number> = {}
            
            post.reactions?.forEach((r: any) => {
              reactionCounts[r.reaction_type] = (reactionCounts[r.reaction_type] || 0) + 1
            })

            return (
              <Card key={post.id} className={index === 0 ? 'border-rogue-gold/40' : ''}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={postAuthor?.avatar_url} />
                      <AvatarFallback className="bg-rogue-forest text-white">
                        {postAuthor?.full_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-rogue-forest">
                          {postAuthor?.full_name || 'Unknown'}
                        </span>
                        {postAuthor?.role && (
                          <RoleBadge role={postAuthor.role as UserRole} />
                        )}
                        <span className="text-sm text-rogue-slate">
                          {formatRelativeTime(post.created_at)}
                        </span>
                        {post.is_edited && (
                          <span className="text-xs text-rogue-slate italic">(edited)</span>
                        )}
                      </div>

                      <p className="text-rogue-slate leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>

                      {/* Reactions */}
                      <div className="flex gap-2 mt-4">
                        {['like', 'helpful', 'insightful'].map((type) => {
                          const Icon = reactionIcons[type]
                          const count = reactionCounts[type] || 0
                          const userHasReacted = userReactions.some((r: any) => r.reaction_type === type)

                          return (
                            <button
                              key={type}
                              onClick={() => handleReaction(post.id, type)}
                              className={cn(
                                'flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors',
                                userHasReacted
                                  ? 'bg-rogue-gold text-rogue-forest'
                                  : 'bg-rogue-sage/10 text-rogue-slate hover:bg-rogue-sage/20'
                              )}
                            >
                              <Icon size={14} />
                              {count > 0 && <span>{count}</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Reply Box */}
        {!thread.is_locked && (
          <Card className="bg-rogue-cream/50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Label htmlFor="reply">Add your reply</Label>
                <Textarea
                  id="reply"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Share your thoughts... Use @username to mention others"
                  rows={4}
                  disabled={isPosting}
                />
                <Button
                  onClick={handleReply}
                  disabled={isPosting || !replyContent.trim()}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isPosting ? 'Posting...' : 'Post Reply'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {thread.is_locked && (
          <Card className="bg-rogue-slate/5 border-rogue-slate/20">
            <CardContent className="pt-6 text-center">
              <p className="text-rogue-slate">This discussion has been locked by a facilitator.</p>
            </CardContent>
          </Card>
        )}
      </Container>
    </div>
  )
}

