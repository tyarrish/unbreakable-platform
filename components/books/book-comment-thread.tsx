'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { RoleBadge } from '@/components/ui/role-badge'
import { 
  getBookComments, 
  createBookComment, 
  deleteBookComment,
  likeBookComment,
  unlikeBookComment,
  type BookComment 
} from '@/lib/supabase/queries/book-comments'
import { formatDate } from '@/lib/utils/format-date'
import { toast } from 'sonner'
import { MessageSquare, Heart, Reply, Trash2, Send } from 'lucide-react'
import type { UserRole } from '@/types/index.types'

interface BookCommentThreadProps {
  bookId: string
  userId: string
}

export function BookCommentThread({ bookId, userId }: BookCommentThreadProps) {
  const [comments, setComments] = useState<BookComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [bookId])

  async function loadComments() {
    try {
      const data = await getBookComments(bookId, userId)
      setComments(data)
    } catch (error) {
      console.error('Error loading comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmitComment() {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await createBookComment(bookId, userId, newComment.trim())
      setNewComment('')
      toast.success('Comment posted!')
      loadComments()
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error('Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSubmitReply(parentId: string) {
    if (!replyContent.trim()) return

    setIsSubmitting(true)
    try {
      await createBookComment(bookId, userId, replyContent.trim(), parentId)
      setReplyContent('')
      setReplyingTo(null)
      toast.success('Reply posted!')
      loadComments()
    } catch (error) {
      console.error('Error posting reply:', error)
      toast.error('Failed to post reply')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await deleteBookComment(commentId)
      toast.success('Comment deleted')
      loadComments()
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  async function handleToggleLike(commentId: string, hasLiked: boolean) {
    try {
      if (hasLiked) {
        await unlikeBookComment(commentId, userId)
      } else {
        await likeBookComment(commentId, userId)
      }
      loadComments()
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Failed to update like')
    }
  }

  function CommentItem({ comment, depth = 0 }: { comment: BookComment; depth?: number }) {
    const isOwnComment = comment.user_id === userId
    const marginLeft = depth > 0 ? 'ml-8' : ''

    return (
      <div className={`${marginLeft} space-y-3`}>
        <div className="flex items-start gap-3 p-4 rounded-lg bg-white/50 border border-rogue-sage/20">
          <Avatar className="w-10 h-10 flex-shrink-0">
            {comment.user?.avatar_url ? (
              <img src={comment.user.avatar_url} alt={comment.user.full_name || 'User'} />
            ) : (
              <div className="w-full h-full bg-rogue-sage/20 flex items-center justify-center text-rogue-forest font-semibold">
                {comment.user?.full_name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-rogue-forest">
                {comment.user?.full_name || 'Anonymous'}
              </span>
              {comment.user?.role && <RoleBadge role={comment.user.role as UserRole} />}
              <span className="text-xs text-rogue-slate">
                {formatDate(comment.created_at)}
                {comment.is_edited && ' (edited)'}
              </span>
            </div>

            <p className="text-rogue-slate leading-relaxed mb-3 whitespace-pre-wrap">
              {comment.content}
            </p>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleToggleLike(comment.id, comment.user_has_liked || false)}
                className="h-8 px-2 text-xs"
              >
                <Heart
                  size={14}
                  className={`mr-1 ${comment.user_has_liked ? 'fill-red-500 text-red-500' : ''}`}
                />
                {comment.like_count || 0}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReplyingTo(comment.id)}
                className="h-8 px-2 text-xs"
              >
                <Reply size={14} className="mr-1" />
                Reply
              </Button>

              {isOwnComment && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="h-8 px-2 text-xs text-red-600 hover:text-red-700"
                >
                  <Trash2 size={14} className="mr-1" />
                  Delete
                </Button>
              )}
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  rows={3}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={isSubmitting || !replyContent.trim()}
                  >
                    <Send className="mr-2 h-3 w-3" />
                    Post Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyContent('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-center py-8 text-rogue-slate">Loading comments...</div>
  }

  return (
    <div className="space-y-6">
      {/* New Comment Form */}
      <div className="space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts about this book..."
          rows={4}
          className="resize-none"
        />
        <Button
          onClick={handleSubmitComment}
          disabled={isSubmitting || !newComment.trim()}
        >
          <Send className="mr-2 h-4 w-4" />
          Post Comment
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-rogue-slate">
            <MessageSquare className="mx-auto h-12 w-12 text-rogue-sage/40 mb-3" />
            <p className="text-lg font-medium mb-1">No comments yet</p>
            <p className="text-sm">Be the first to share your thoughts about this book!</p>
          </div>
        ) : (
          comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
        )}
      </div>
    </div>
  )
}




