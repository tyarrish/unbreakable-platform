'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { 
  MessageCircle, 
  Search, 
  Plus, 
  Users, 
  MoreVertical,
  Archive,
  VolumeX,
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatRelativeTime } from '@/lib/utils/format-date'
import { toggleArchiveConversation, toggleMuteConversation } from '@/lib/supabase/queries/conversations'
import { toast } from 'sonner'
import type { Conversation } from '@/types/index.types'

interface ConversationListProps {
  conversations: Conversation[]
  currentUserId: string
  selectedConversationId?: string
  onSelectConversation: (id: string) => void
  onNewMessage: () => void
  onRefresh: () => void
}

export function ConversationList({
  conversations,
  currentUserId,
  selectedConversationId,
  onSelectConversation,
  onNewMessage,
  onRefresh
}: ConversationListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'direct' | 'groups'>('all')

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  function getConversationTitle(conversation: Conversation): string {
    if (conversation.conversation_type === 'group_chat') {
      return conversation.conversation_name || conversation.title || 'Group Chat'
    }
    
    // For DMs, show the other person's name
    const otherUser = conversation.participants?.[0]
    return otherUser?.full_name || 'Unknown User'
  }

  function getConversationAvatar(conversation: Conversation): { url?: string; initials: string } {
    if (conversation.conversation_type === 'group_chat') {
      return {
        initials: getInitials(getConversationTitle(conversation))
      }
    }
    
    const otherUser = conversation.participants?.[0]
    return {
      url: otherUser?.avatar_url,
      initials: getInitials(otherUser?.full_name || 'U')
    }
  }

  function getLastMessagePreview(conversation: Conversation): string {
    const lastMsg = conversation.last_message
    if (!lastMsg) return 'No messages yet'
    
    // Remove HTML tags for preview
    const text = lastMsg.content.replace(/<[^>]*>/g, '')
    const preview = text.length > 60 ? text.slice(0, 60) + '...' : text
    
    const authorName = lastMsg.author?.id === currentUserId 
      ? 'You' 
      : lastMsg.author?.full_name?.split(' ')[0]
    
    return `${authorName}: ${preview}`
  }

  async function handleArchive(conversationId: string, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await toggleArchiveConversation(conversationId, currentUserId, true)
      toast.success('Conversation archived')
      onRefresh()
    } catch (error) {
      console.error('Error archiving conversation:', error)
      toast.error('Failed to archive conversation')
    }
  }

  async function handleMute(conversationId: string, isMuted: boolean, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await toggleMuteConversation(conversationId, currentUserId, !isMuted)
      toast.success(isMuted ? 'Unmuted' : 'Muted')
      onRefresh()
    } catch (error) {
      console.error('Error muting conversation:', error)
      toast.error('Failed to update conversation')
    }
  }

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    // Filter by type
    if (filter === 'direct' && conv.conversation_type !== 'direct_message') return false
    if (filter === 'groups' && conv.conversation_type !== 'group_chat') return false
    
    // Filter by search
    if (searchQuery) {
      const title = getConversationTitle(conv).toLowerCase()
      const lastMessage = getLastMessagePreview(conv).toLowerCase()
      const query = searchQuery.toLowerCase()
      return title.includes(query) || lastMessage.includes(query)
    }
    
    return true
  })

  const directCount = conversations.filter(c => c.conversation_type === 'direct_message').length
  const groupCount = conversations.filter(c => c.conversation_type === 'group_chat').length

  return (
    <div className="flex flex-col h-full bg-white border-r border-rogue-sage/20">
      {/* Header */}
      <div className="p-4 border-b border-rogue-sage/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-rogue-forest">Messages</h2>
          <Button
            size="sm"
            onClick={onNewMessage}
            className="bg-rogue-forest hover:bg-rogue-pine"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rogue-slate/50" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="pl-9 bg-rogue-cream/30 border-rogue-sage/20"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-rogue-forest' : ''}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === 'direct' ? 'default' : 'outline'}
            onClick={() => setFilter('direct')}
            className={filter === 'direct' ? 'bg-rogue-forest' : ''}
          >
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
            Direct{directCount > 0 && ` (${directCount})`}
          </Button>
          <Button
            size="sm"
            variant={filter === 'groups' ? 'default' : 'outline'}
            onClick={() => setFilter('groups')}
            className={filter === 'groups' ? 'bg-rogue-forest' : ''}
          >
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Groups{groupCount > 0 && ` (${groupCount})`}
          </Button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageCircle className="h-12 w-12 text-rogue-slate/30 mb-3" />
            <p className="text-sm text-rogue-slate/70">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </p>
            {!searchQuery && (
              <Button
                size="sm"
                onClick={onNewMessage}
                variant="outline"
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Start a conversation
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-rogue-sage/10">
            {filteredConversations.map((conversation) => {
              const avatar = getConversationAvatar(conversation)
              const isSelected = conversation.id === selectedConversationId
              const userMember = conversation.members?.find(m => m.user_id === currentUserId)
              const isMuted = userMember?.is_muted || false

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`
                    p-4 cursor-pointer transition-all hover:bg-rogue-cream/30
                    ${isSelected ? 'bg-rogue-cream/50 border-l-4 border-rogue-forest' : ''}
                  `}
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-12 w-12">
                        {avatar.url ? (
                          <AvatarImage src={avatar.url} alt={getConversationTitle(conversation)} />
                        ) : null}
                        <AvatarFallback className="bg-rogue-forest text-white">
                          {conversation.conversation_type === 'group_chat' ? (
                            <Users className="h-5 w-5" />
                          ) : (
                            avatar.initials
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.unread_count && conversation.unread_count > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-rogue-gold text-white text-xs">
                          {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h3 className="font-semibold text-rogue-forest truncate">
                            {getConversationTitle(conversation)}
                          </h3>
                          {isMuted && (
                            <VolumeX className="h-3.5 w-3.5 text-rogue-slate/50 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-rogue-slate/60">
                            {conversation.last_message 
                              ? formatRelativeTime(conversation.last_message.created_at)
                              : formatRelativeTime(conversation.created_at)
                            }
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-rogue-sage/20"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => handleMute(conversation.id, isMuted, e)}>
                                <VolumeX className="h-4 w-4 mr-2" />
                                {isMuted ? 'Unmute' : 'Mute'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleArchive(conversation.id, e)}>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <p className={`text-sm truncate ${
                        conversation.unread_count && conversation.unread_count > 0 
                          ? 'text-rogue-forest font-medium' 
                          : 'text-rogue-slate/70'
                      }`}>
                        {getLastMessagePreview(conversation)}
                      </p>

                      {conversation.conversation_type === 'group_chat' && conversation.participants && conversation.participants.length > 0 && (
                        <p className="text-xs text-rogue-slate/50 mt-1 truncate">
                          {conversation.participants.length} member{conversation.participants.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

