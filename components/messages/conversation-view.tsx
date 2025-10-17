'use client'

import { useState, useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Users, 
  MoreVertical,
  Send,
  Smile,
  Settings,
  UserPlus,
  LogOut,
  Archive,
  VolumeX,
  ThumbsUp,
  Heart,
  Lightbulb,
  Star
} from 'lucide-react'
import { MessageAttachmentUpload, AttachmentDisplay } from './message-attachments'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RichTextEditor } from '@/components/discussions/rich-text-editor'
import { formatRelativeTime } from '@/lib/utils/format-date'
import { createClient } from '@/lib/supabase/client'
import { 
  getConversationMessages, 
  sendMessage, 
  markConversationAsRead,
  toggleArchiveConversation,
  toggleMuteConversation,
  leaveGroupChat,
  subscribeToConversation
} from '@/lib/supabase/queries/conversations'
import { toggleReaction } from '@/lib/supabase/queries/discussions'
import { toast } from 'sonner'
import type { Conversation, DiscussionPost, User } from '@/types/index.types'

interface ConversationViewProps {
  conversation: Conversation
  currentUserId: string
  onBack?: () => void
  onRefresh: () => void
  onMembersClick?: () => void
}

export function ConversationView({
  conversation,
  currentUserId,
  onBack,
  onRefresh,
  onMembersClick
}: ConversationViewProps) {
  const [messages, setMessages] = useState<(DiscussionPost & { author: User })[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadMessages()
    markAsRead()

    // Set up real-time subscription for new messages
    const channel = subscribeToConversation(conversation.id, () => {
      console.log('Real-time: New message detected in conversation')
      loadMessages()
      markAsRead()
    })

    return () => {
      console.log('Cleaning up real-time subscription')
      supabase.removeChannel(channel)
    }
  }, [conversation.id])

  // Mark as read whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead()
    }
  }, [messages.length])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadMessages() {
    try {
      setIsLoading(true)
      const data = await getConversationMessages(conversation.id)
      setMessages(data)
    } catch (error) {
      console.error('Error loading messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  async function markAsRead() {
    try {
      await markConversationAsRead(conversation.id, currentUserId)
      onRefresh()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  async function handleSendMessage() {
    if ((!newMessage.trim() && attachments.length === 0) || isSending) return

    try {
      setIsSending(true)
      const message = await sendMessage(
        conversation.id, 
        currentUserId, 
        newMessage || ' ', // Empty content if only attachments
        undefined,
        attachments
      )
      
      // Immediately clear form BEFORE adding to messages
      const tempMessage = newMessage
      const tempAttachments = attachments
      setNewMessage('')
      setAttachments([])
      
      // Add message to list
      setMessages(prev => [...prev, message as any])
      
      // Refresh parent to update conversation list
      onRefresh()
      
      console.log('Message sent and form cleared')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  async function handleReaction(messageId: string, reactionType: string) {
    try {
      await toggleReaction(messageId, currentUserId, reactionType)
      // Refresh messages to show updated reactions
      await loadMessages()
    } catch (error) {
      console.error('Error toggling reaction:', error)
      toast.error('Failed to react')
    }
  }

  function getReactionIcon(type: string) {
    const icons: Record<string, any> = {
      like: ThumbsUp,
      helpful: Lightbulb,
      insightful: Star
    }
    return icons[type] || ThumbsUp
  }

  async function handleArchive() {
    try {
      await toggleArchiveConversation(conversation.id, currentUserId, true)
      toast.success('Conversation archived')
      onRefresh()
      if (onBack) onBack()
    } catch (error) {
      console.error('Error archiving:', error)
      toast.error('Failed to archive conversation')
    }
  }

  async function handleMute() {
    const userMember = conversation.members?.find(m => m.user_id === currentUserId)
    const isMuted = userMember?.is_muted || false
    
    try {
      await toggleMuteConversation(conversation.id, currentUserId, !isMuted)
      toast.success(isMuted ? 'Unmuted' : 'Muted')
      onRefresh()
    } catch (error) {
      console.error('Error muting:', error)
      toast.error('Failed to update conversation')
    }
  }

  async function handleLeaveGroup() {
    if (!confirm('Are you sure you want to leave this group?')) return
    
    try {
      await leaveGroupChat(conversation.id, currentUserId)
      toast.success('Left group')
      onRefresh()
      if (onBack) onBack()
    } catch (error) {
      console.error('Error leaving group:', error)
      toast.error('Failed to leave group')
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  function getConversationTitle(): string {
    if (conversation.conversation_type === 'group_chat') {
      return conversation.conversation_name || conversation.title || 'Group Chat'
    }
    
    const otherUser = conversation.participants?.[0]
    return otherUser?.full_name || 'Unknown User'
  }

  function getConversationSubtitle(): string {
    if (conversation.conversation_type === 'group_chat') {
      const count = conversation.participants?.length || 0
      return `${count} member${count !== 1 ? 's' : ''}`
    }
    
    const otherUser = conversation.participants?.[0]
    return otherUser?.role || 'User'
  }

  const userMember = conversation.members?.find(m => m.user_id === currentUserId)
  const isMuted = userMember?.is_muted || false

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-rogue-sage/20 bg-gradient-to-r from-rogue-cream/30 to-transparent">
        {onBack && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onBack}
            className="lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10 flex-shrink-0">
            {conversation.conversation_type === 'group_chat' ? (
              <AvatarFallback className="bg-rogue-forest text-white">
                <Users className="h-5 w-5" />
              </AvatarFallback>
            ) : (
              <>
                {conversation.participants?.[0]?.avatar_url ? (
                  <AvatarImage src={conversation.participants[0].avatar_url} />
                ) : null}
                <AvatarFallback className="bg-rogue-forest text-white">
                  {getInitials(conversation.participants?.[0]?.full_name || 'U')}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-rogue-forest truncate">
                {getConversationTitle()}
              </h2>
              {isMuted && (
                <VolumeX className="h-4 w-4 text-rogue-slate/50 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-rogue-slate/70 truncate">
              {getConversationSubtitle()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {conversation.conversation_type === 'group_chat' && onMembersClick && (
            <Button
              size="sm"
              variant="outline"
              onClick={onMembersClick}
            >
              <Users className="h-4 w-4 mr-1.5" />
              Members
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleMute}>
                <VolumeX className="h-4 w-4 mr-2" />
                {isMuted ? 'Unmute' : 'Mute'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              {conversation.conversation_type === 'group_chat' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLeaveGroup} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Leave Group
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rogue-forest" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-rogue-cream/50 rounded-full p-6 mb-4">
              {conversation.conversation_type === 'group_chat' ? (
                <Users className="h-12 w-12 text-rogue-forest" />
              ) : (
                <Send className="h-12 w-12 text-rogue-forest" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-rogue-forest mb-2">
              {conversation.conversation_type === 'group_chat' 
                ? 'Group created!' 
                : 'Start the conversation'}
            </h3>
            <p className="text-sm text-rogue-slate/70 max-w-sm">
              {conversation.conversation_type === 'group_chat'
                ? 'Send a message to kick things off with your group.'
                : 'Send a message to start chatting.'}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isCurrentUser = message.author_id === currentUserId
              const showAvatar = !isCurrentUser && (
                index === 0 || 
                messages[index - 1].author_id !== message.author_id
              )
              const showName = conversation.conversation_type === 'group_chat' && showAvatar

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                >
                  <div className="flex-shrink-0">
                    {showAvatar ? (
                      <Avatar className="h-8 w-8">
                        {message.author?.avatar_url ? (
                          <AvatarImage src={message.author.avatar_url} />
                        ) : null}
                        <AvatarFallback className="bg-rogue-sage text-white text-xs">
                          {getInitials(message.author?.full_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8" />
                    )}
                  </div>

                  <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : ''}`}>
                    {showName && (
                      <span className="text-xs font-medium text-rogue-forest mb-1">
                        {message.author?.full_name}
                      </span>
                    )}
                    <div className="space-y-2">
                      <div
                        className={`
                          rounded-2xl px-4 py-2.5 break-words
                          ${isCurrentUser 
                            ? 'bg-rogue-forest text-white rounded-br-sm' 
                            : 'bg-rogue-cream border border-rogue-sage/20 rounded-bl-sm'
                          }
                        `}
                      >
                        {message.content && message.content.trim() !== ' ' && (
                          <div 
                            className={`prose prose-sm max-w-none ${isCurrentUser ? 'prose-invert' : ''}`}
                            dangerouslySetInnerHTML={{ __html: message.content }}
                          />
                        )}
                        {(message as any).media_urls && (message as any).media_urls.length > 0 && (
                          <AttachmentDisplay 
                            urls={(message as any).media_urls} 
                            compact={true}
                          />
                        )}
                      </div>

                      {/* Reactions */}
                      {(message as any).reactions && (message as any).reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {['like', 'helpful', 'insightful'].map(reactionType => {
                            const reactionData = (message as any).reactions.reduce((acc: any, r: any) => {
                              if (r.reaction_type === reactionType) {
                                acc.count++
                                if (r.user_id === currentUserId) acc.userReacted = true
                              }
                              return acc
                            }, { count: 0, userReacted: false })

                            if (reactionData.count === 0) return null

                            const Icon = getReactionIcon(reactionType)

                            return (
                              <button
                                key={reactionType}
                                onClick={() => handleReaction(message.id, reactionType)}
                                className={`
                                  flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all
                                  ${reactionData.userReacted
                                    ? 'bg-rogue-gold/20 text-rogue-forest border border-rogue-gold'
                                    : 'bg-white border border-rogue-sage/30 text-rogue-slate hover:border-rogue-sage'
                                  }
                                `}
                              >
                                <Icon className="h-3 w-3" />
                                <span className="font-medium">{reactionData.count}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {/* Reaction Buttons (hover) */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          {['like', 'helpful', 'insightful'].map(reactionType => {
                            const Icon = getReactionIcon(reactionType)
                            const userReacted = (message as any).reactions?.some(
                              (r: any) => r.reaction_type === reactionType && r.user_id === currentUserId
                            )

                            return (
                              <button
                                key={reactionType}
                                onClick={() => handleReaction(message.id, reactionType)}
                                className={`
                                  p-1.5 rounded-full transition-all
                                  ${userReacted
                                    ? 'bg-rogue-gold/20 text-rogue-forest'
                                    : 'bg-white hover:bg-rogue-cream border border-rogue-sage/20 text-rogue-slate hover:text-rogue-forest'
                                  }
                                `}
                                title={reactionType}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs text-rogue-slate/50 mt-1 px-1">
                      {formatRelativeTime(message.created_at)}
                      {message.is_edited && ' (edited)'}
                    </span>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-rogue-sage/20 bg-rogue-cream/20">
        <div className="space-y-2">
          {/* Attachment Upload */}
          <MessageAttachmentUpload
            attachments={attachments}
            onAttachmentsChange={setAttachments}
          />

          {/* Message Input */}
          <div className="flex gap-2 items-end">
            <div className="flex-1 bg-white rounded-lg border border-rogue-sage/20 overflow-hidden">
              <RichTextEditor
                key={`editor-${messages.length}`}
                content={newMessage}
                onChange={setNewMessage}
                placeholder="Type a message..."
                className="min-h-[60px] max-h-[200px]"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={(!newMessage.trim() && attachments.length === 0) || isSending}
              className="bg-rogue-forest hover:bg-rogue-pine h-[60px] px-6"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

