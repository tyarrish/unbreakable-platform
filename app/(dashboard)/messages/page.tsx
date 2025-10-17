'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { ConversationList } from '@/components/messages/conversation-list'
import { ConversationView } from '@/components/messages/conversation-view'
import { NewConversationModal } from '@/components/messages/new-conversation-modal'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { MessageCircle } from 'lucide-react'
import { getUserConversations, getConversation, subscribeToUserConversations } from '@/lib/supabase/queries/conversations'
import { toast } from 'sonner'
import type { Conversation } from '@/types/index.types'

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationIdParam = searchParams.get('id')
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showNewConversationModal, setShowNewConversationModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    initializeMessages()
  }, [])

  useEffect(() => {
    if (userId) {
      // Subscribe to conversation updates
      const channel = subscribeToUserConversations(userId, () => {
        loadConversations()
      })

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [userId])

  useEffect(() => {
    // Handle conversation selection from URL
    if (conversationIdParam && conversations.length > 0) {
      handleSelectConversation(conversationIdParam)
    }
  }, [conversationIdParam, conversations])

  async function initializeMessages() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      
      setUserId(user.id)
      await loadConversations()
    } catch (error) {
      console.error('Error initializing messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadConversations() {
    try {
      if (!userId) return
      
      const data = await getUserConversations(userId, false)
      setConversations(data)
    } catch (error) {
      console.error('Error loading conversations:', error)
      toast.error('Failed to load conversations')
    }
  }

  async function handleSelectConversation(conversationId: string) {
    try {
      const conversation = await getConversation(conversationId)
      setSelectedConversation(conversation)
      
      // Update URL
      router.push(`/messages?id=${conversationId}`, { scroll: false })
    } catch (error) {
      console.error('Error loading conversation:', error)
      toast.error('Failed to load conversation')
    }
  }

  function handleConversationCreated(conversationId: string) {
    loadConversations()
    handleSelectConversation(conversationId)
  }

  function handleBack() {
    setSelectedConversation(null)
    router.push('/messages', { scroll: false })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (!userId) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
      <Container className="h-[calc(100vh-4rem)] py-0">
        <div className="h-full flex rounded-lg overflow-hidden border border-rogue-sage/20 bg-white shadow-lg my-6">
          {/* Desktop: Two-column layout */}
          <div className="hidden lg:flex w-full">
            {/* Sidebar */}
            <div className="w-96 border-r border-rogue-sage/20">
              <ConversationList
                conversations={conversations}
                currentUserId={userId}
                selectedConversationId={selectedConversation?.id}
                onSelectConversation={handleSelectConversation}
                onNewMessage={() => setShowNewConversationModal(true)}
                onRefresh={loadConversations}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {selectedConversation ? (
                <ConversationView
                  conversation={selectedConversation}
                  currentUserId={userId}
                  onRefresh={loadConversations}
                />
              ) : (
                <EmptyState
                  icon={<MessageCircle size={64} />}
                  title="Select a conversation"
                  description="Choose a conversation from the list to start messaging"
                />
              )}
            </div>
          </div>

          {/* Mobile: Single column */}
          <div className="lg:hidden w-full">
            {selectedConversation ? (
              <ConversationView
                conversation={selectedConversation}
                currentUserId={userId}
                onBack={handleBack}
                onRefresh={loadConversations}
              />
            ) : (
              <ConversationList
                conversations={conversations}
                currentUserId={userId}
                selectedConversationId={undefined}
                onSelectConversation={handleSelectConversation}
                onNewMessage={() => setShowNewConversationModal(true)}
                onRefresh={loadConversations}
              />
            )}
          </div>
        </div>
      </Container>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        currentUserId={userId}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  )
}

