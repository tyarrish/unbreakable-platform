'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PageLoader } from '@/components/ui/loading-spinner'
import { RichTextEditor } from '@/components/discussions/rich-text-editor'
import { CommentThread } from '@/components/discussions/comment-thread'
import { 
  ArrowLeft, 
  Pin, 
  Lock, 
  Eye, 
  MessageCircle,
  Heart,
  Lightbulb,
  Star
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format-date'
import { toast } from 'sonner'

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
  created_by_profile?: {
    full_name: string
    avatar_url?: string
    role: string
  }
}

interface Post {
  id: string
  thread_id: string
  author_id: string
  content: string
  content_html?: string
  parent_post_id?: string
  created_at: string
  updated_at: string
  is_edited: boolean
  author?: {
    full_name: string
    avatar_url?: string
    role: string
  }
  reactions?: Array<{
    reaction_type: string
    count: number
    user_reacted: boolean
  }>
  replies?: Post[]
}

export default function ThreadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const threadId = params.id as string
  const supabase = createClient()

  const [thread, setThread] = useState<Thread | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newCommentContent, setNewCommentContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadThread()
    incrementViewCount()
    setupRealtimeSubscription()
  }, [threadId])

  async function loadThread() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }

      // Get thread
      const { data: threadData, error: threadError } = await supabase
        .from('discussion_threads')
        .select('*, created_by_profile:profiles!created_by(full_name, avatar_url, role)')
        .eq('id', threadId)
        .single()

      if (threadError) throw threadError
      setThread(threadData)

      // Get all posts for this thread
      const { data: postsData, error: postsError } = await supabase
        .from('discussion_posts')
        .select('*, author:profiles!author_id(full_name, avatar_url, role)')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (postsError) throw postsError

      // Build nested structure
      const postsWithReactions = await Promise.all(
        (postsData || []).map(async (post: any) => {
          // Get reactions for this post
          const { data: reactions } = await supabase
            .from('post_reactions')
            .select('reaction_type, user_id')
            .eq('post_id', post.id)

          // Group reactions by type
          const reactionCounts = reactions?.reduce((acc: any, r: any) => {
            if (!acc[r.reaction_type]) {
              acc[r.reaction_type] = { count: 0, users: [] }
            }
            acc[r.reaction_type].count++
            acc[r.reaction_type].users.push(r.user_id)
            return acc
          }, {}) || {}

          return {
            ...post,
            reactions: Object.entries(reactionCounts).map(([type, data]: [string, any]) => ({
              reaction_type: type,
              count: data.count,
              user_reacted: user ? data.users.includes(user.id) : false,
            })),
          }
        })
      )

      // Build nested comment tree
      const rootPosts = postsWithReactions.filter(p => !p.parent_post_id)
      const nestedPosts = buildCommentTree(postsWithReactions, rootPosts)
      
      setPosts(nestedPosts)
    } catch (error) {
      console.error('Error loading thread:', error)
      toast.error('Failed to load discussion')
      router.push('/discussions')
    } finally {
      setIsLoading(false)
    }
  }

  function buildCommentTree(allPosts: Post[], parentPosts: Post[]): Post[] {
    return parentPosts.map(post => ({
      ...post,
      replies: buildCommentTree(
        allPosts,
        allPosts.filter(p => p.parent_post_id === post.id)
      ),
    }))
  }

  function setupRealtimeSubscription() {
    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'discussion_posts',
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          console.log('New comment added, reloading...')
          loadThread()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'discussion_posts',
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          console.log('Comment updated, reloading...')
          loadThread()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'discussion_posts',
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          console.log('Comment deleted, reloading...')
          loadThread()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function incrementViewCount() {
    try {
      await (supabase as any).rpc('increment_thread_views', { thread_id: threadId })
    } catch (error) {
      // Silently fail - view count is not critical
      console.log('View count increment skipped')
    }
  }

  async function handlePostComment() {
    if (!newCommentContent.trim() || !userId) return

    setIsSubmitting(true)

    try {
      const { error } = await (supabase as any)
        .from('discussion_posts')
        .insert({
          thread_id: threadId,
          author_id: userId,
          content: newCommentContent,
          content_html: newCommentContent,
        })

      if (error) throw error

      setNewCommentContent('')
      toast.success('Comment posted!')
      // Real-time will update automatically
    } catch (error: any) {
      console.error('Error posting comment:', error)
      toast.error(error.message || 'Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleReply(parentId: string, content: string) {
    if (!userId) return

    const { error } = await (supabase as any)
      .from('discussion_posts')
      .insert({
        thread_id: threadId,
        author_id: userId,
        parent_post_id: parentId,
        content,
        content_html: content,
      })

    if (error) throw error
  }

  async function handleEdit(commentId: string, content: string) {
    const { error } = await (supabase as any)
      .from('discussion_posts')
      .update({
        content_html: content,
        content,
        is_edited: true,
      })
      .eq('id', commentId)

    if (error) throw error
  }

  async function handleDelete(commentId: string) {
    const { error } = await supabase
      .from('discussion_posts')
      .delete()
      .eq('id', commentId)

    if (error) throw error
  }

  async function handleReact(commentId: string, reactionType: string) {
    if (!userId) return

    try {
      // Check if user already reacted with this type
      const { data: existingReaction } = await supabase
        .from('post_reactions')
        .select('id')
        .eq('post_id', commentId)
        .eq('user_id', userId)
        .eq('reaction_type', reactionType)
        .single()

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', commentId)
          .eq('user_id', userId)
          .eq('reaction_type', reactionType)
      } else {
        // Add reaction
        await (supabase as any)
          .from('post_reactions')
          .insert({
            post_id: commentId,
            user_id: userId,
            reaction_type: reactionType,
          })
      }

      loadThread() // Reload to update counts
    } catch (error: any) {
      console.error('Error toggling reaction:', error)
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

  if (!thread) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
      <Container>
        <div className="py-8 max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/discussions')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Discussions
          </Button>

          {/* Thread Header */}
          <Card className="border-0 shadow-xl mb-6 bg-white">
            <CardHeader>
              <div className="flex gap-4">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage src={thread.created_by_profile?.avatar_url} alt={thread.created_by_profile?.full_name} />
                  <AvatarFallback className="bg-rogue-sage text-white">
                    {getInitials(thread.created_by_profile?.full_name || 'User')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
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

                  <h1 className="text-2xl md:text-3xl font-bold text-rogue-forest mb-2">
                    {thread.title}
                  </h1>

                  <div className="flex items-center gap-2 text-sm text-rogue-slate">
                    <span className="font-medium">{thread.created_by_profile?.full_name}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(thread.created_at)}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{thread.views_count} views</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {thread.content_html ? (
                <div 
                  className="prose prose-sm max-w-none text-rogue-forest"
                  dangerouslySetInnerHTML={{ __html: thread.content_html }}
                />
              ) : (
                <p className="text-rogue-forest whitespace-pre-wrap">{thread.content}</p>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-rogue-forest flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {posts.length} {posts.length === 1 ? 'Comment' : 'Comments'}
              </h2>
            </div>

            {/* New Comment */}
            {!thread.is_locked && userId && (
              <Card className="border-0 shadow-md bg-white">
                <CardContent className="pt-6 space-y-3">
                  <RichTextEditor
                    content={newCommentContent}
                    onChange={setNewCommentContent}
                    placeholder="Share your thoughts..."
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handlePostComment}
                      disabled={isSubmitting || !newCommentContent.trim()}
                    >
                      {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Thread */}
            {posts.length > 0 && userId && (
              <CommentThread
                comments={posts}
                threadId={threadId}
                currentUserId={userId}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReact={handleReact}
              />
            )}

            {posts.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <MessageCircle className="h-12 w-12 text-rogue-slate/30 mx-auto mb-3" />
                  <p className="text-rogue-slate">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Container>
    </div>
  )
}

