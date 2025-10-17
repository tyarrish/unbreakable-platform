'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RichTextEditor } from './rich-text-editor'
import { 
  MessageCircle, 
  Heart, 
  Lightbulb, 
  Star, 
  MoreVertical,
  Reply,
  Trash2,
  Edit,
  ThumbsUp,
  Zap
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatRelativeTime } from '@/lib/utils/format-date'
import { toast } from 'sonner'

interface Comment {
  id: string
  author_id: string
  author?: {
    full_name: string
    avatar_url?: string
    role: string
  }
  content: string
  content_html?: string
  parent_post_id?: string
  created_at: string
  updated_at: string
  is_edited: boolean
  reactions?: Array<{
    reaction_type: string
    count: number
    user_reacted: boolean
  }>
  replies?: Comment[]
}

interface CommentThreadProps {
  comments: Comment[]
  threadId: string
  currentUserId: string
  onReply: (parentId: string, content: string) => Promise<void>
  onEdit: (commentId: string, content: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
  onReact: (commentId: string, reactionType: string) => Promise<void>
  maxDepth?: number
  currentDepth?: number
}

export function CommentThread({ 
  comments, 
  threadId,
  currentUserId,
  onReply, 
  onEdit, 
  onDelete, 
  onReact,
  maxDepth = 3,
  currentDepth = 0 
}: CommentThreadProps) {
  return (
    <div className={currentDepth > 0 ? 'ml-12 mt-3' : 'space-y-4'}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          threadId={threadId}
          currentUserId={currentUserId}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onReact={onReact}
          canReply={currentDepth < maxDepth}
          currentDepth={currentDepth}
          maxDepth={maxDepth}
        />
      ))}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  threadId: string
  currentUserId: string
  onReply: (parentId: string, content: string) => Promise<void>
  onEdit: (commentId: string, content: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
  onReact: (commentId: string, reactionType: string) => Promise<void>
  canReply: boolean
  currentDepth: number
  maxDepth: number
}

function CommentItem({ 
  comment, 
  threadId,
  currentUserId,
  onReply, 
  onEdit, 
  onDelete, 
  onReact,
  canReply,
  currentDepth,
  maxDepth
}: CommentItemProps) {
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content_html || comment.content)

  const isAuthor = comment.author_id === currentUserId

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  async function handleSubmitReply() {
    if (!replyContent.trim()) return

    setIsSubmitting(true)
    try {
      console.log('Submitting reply to comment:', comment.id)
      await onReply(comment.id, replyContent)
      setReplyContent('')
      setShowReplyBox(false)
      toast.success('Reply posted!')
    } catch (error: any) {
      console.error('Reply submission error:', error)
      const errorMessage = error?.message || error?.toString() || 'Failed to post reply. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSubmitEdit() {
    if (!editContent.trim()) return

    setIsSubmitting(true)
    try {
      await onEdit(comment.id, editContent)
      setIsEditing(false)
      toast.success('Comment updated')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await onDelete(comment.id)
      toast.success('Comment deleted')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete comment')
    }
  }

  const reactionIcons: Record<string, any> = {
    like: ThumbsUp,
    love: Heart,
    surprise: Zap,
    helpful: Lightbulb,
    insightful: Star,
  }

  return (
    <div className="group">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={comment.author?.avatar_url} alt={comment.author?.full_name} />
          <AvatarFallback className="bg-rogue-sage text-white text-sm">
            {getInitials(comment.author?.full_name || 'User')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <Card className="p-3 bg-rogue-sage/5 border-rogue-sage/10">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="font-semibold text-sm text-rogue-forest">
                  {comment.author?.full_name || 'Unknown User'}
                </div>
                <div className="text-xs text-rogue-slate">
                  {formatRelativeTime(comment.created_at)}
                  {comment.is_edited && <span className="ml-1">(edited)</span>}
                </div>
              </div>

              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <RichTextEditor
                  content={editContent}
                  onChange={setEditContent}
                  placeholder="Edit your comment..."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSubmitEdit} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false)
                      setEditContent(comment.content_html || comment.content)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="tiptap-content"
                dangerouslySetInnerHTML={{ __html: comment.content_html || comment.content }}
              />
            )}
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-2 px-2">
            {/* Show all reaction types */}
            {['like', 'love', 'surprise'].map((type) => {
              const reaction = comment.reactions?.find(r => r.reaction_type === type)
              const Icon = reactionIcons[type]
              const count = reaction?.count || 0
              const userReacted = reaction?.user_reacted || false

              // Only show button if there are reactions or user is hovering
              if (count === 0) {
                return (
                  <button
                    key={type}
                    onClick={() => onReact(comment.id, type)}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-rogue-slate/60 hover:text-rogue-forest hover:bg-rogue-sage/10 transition-all opacity-0 group-hover:opacity-100"
                    title={type.charAt(0).toUpperCase() + type.slice(1)}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                )
              }

              return (
                <button
                  key={type}
                  onClick={() => onReact(comment.id, type)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all ${
                    userReacted
                      ? 'bg-rogue-forest/10 text-rogue-forest border border-rogue-forest/20'
                      : 'bg-rogue-sage/10 text-rogue-slate hover:bg-rogue-sage/20'
                  }`}
                  title={`${type.charAt(0).toUpperCase() + type.slice(1)} (${count})`}
                >
                  <Icon className={`h-3.5 w-3.5 ${userReacted ? 'fill-current text-rogue-forest' : ''}`} />
                  <span className="text-xs font-medium">{count}</span>
                </button>
              )
            })}

            <span className="text-rogue-slate/30 mx-1">·</span>

            {canReply && (
              <button
                onClick={() => setShowReplyBox(!showReplyBox)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-rogue-slate hover:text-rogue-forest hover:bg-rogue-sage/10 transition-all"
              >
                <Reply className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Reply</span>
              </button>
            )}
          </div>

          {/* Reply Box */}
          {showReplyBox && (
            <div className="mt-3 space-y-2">
              <RichTextEditor
                content={replyContent}
                onChange={setReplyContent}
                placeholder="Write a reply..."
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSubmitReply} disabled={isSubmitting || !replyContent.trim()}>
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setShowReplyBox(false)
                    setReplyContent('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <CommentThread
              comments={comment.replies}
              threadId={threadId}
              currentUserId={currentUserId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onReact={onReact}
              maxDepth={maxDepth}
              currentDepth={currentDepth + 1}
            />
          )}
        </div>
      </div>
    </div>
  )
}

