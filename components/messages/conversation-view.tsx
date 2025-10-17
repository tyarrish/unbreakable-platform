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
  VolumeX
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RichTextEditor } from '@/components/discussions/rich-text-editor'
import { formatRelativeTime } from '@/lib/utils/format-date'
import { 
  getConversationMessages, 
  sendMessage, 
  markConversationAsRead,
  toggleArchiveConversation,
  toggleMuteConversation,
  leaveGroupChat
} from '@/lib/supabase/queries/conversations'
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
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()
    markAsRead()
  }, [conversation.id])

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
    if (!newMessage.trim() || isSending) return

    try {
      setIsSending(true)
      const message = await sendMessage(conversation.id, currentUserId, newMessage)
      setMessages(prev => [...prev, message as any])
      setNewMessage('')
      onRefresh()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
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
                    <div
                      className={`
                        rounded-2xl px-4 py-2.5 break-words
                        ${isCurrentUser 
                          ? 'bg-rogue-forest text-white rounded-br-sm' 
                          : 'bg-rogue-cream border border-rogue-sage/20 rounded-bl-sm'
                        }
                      `}
                    >
                      <div 
                        className={`prose prose-sm max-w-none ${isCurrentUser ? 'prose-invert' : ''}`}
                        dangerouslySetInnerHTML={{ __html: message.content }}
                      />
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
        <div className="flex gap-2 items-end">
          <div className="flex-1 bg-white rounded-lg border border-rogue-sage/20 overflow-hidden">
            <RichTextEditor
              content={newMessage}
              onChange={setNewMessage}
              placeholder="Type a message..."
              className="min-h-[60px] max-h-[200px]"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="bg-rogue-forest hover:bg-rogue-pine h-[60px] px-6"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

