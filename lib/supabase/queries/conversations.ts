import { createClient } from '@/lib/supabase/client'
import type { Conversation, ConversationMember, DiscussionPost, User } from '@/types/index.types'

/**
 * Get all conversations for the current user (DMs and groups)
 */
export async function getUserConversations(userId: string, includeArchived: boolean = false) {
  const supabase = createClient()
  
  console.log('getUserConversations called for user:', userId)
  
  // First get all conversation IDs where user is a member
  const { data: membershipData, error: memberError } = await (supabase as any)
    .from('conversation_members')
    .select('thread_id, is_archived')
    .eq('user_id', userId)
  
  console.log('Memberships found:', membershipData?.length, membershipData)
  
  if (memberError) {
    console.error('Error fetching memberships:', memberError)
    throw memberError
  }
  
  if (!membershipData || membershipData.length === 0) {
    console.log('No memberships found for user')
    return []
  }
  
  // Filter archived if needed
  const relevantMemberships = includeArchived 
    ? membershipData 
    : membershipData.filter((m: any) => !m.is_archived)
  
  if (relevantMemberships.length === 0) {
    console.log('All conversations are archived')
    return []
  }
  
  const conversationIds = relevantMemberships.map((m: any) => m.thread_id)
  console.log('Fetching conversations:', conversationIds)
  
  const { data: threads, error } = await supabase
    .from('discussion_threads')
    .select('*')
    .in('id', conversationIds)
    .in('conversation_type', ['direct_message', 'group_chat'])
    .order('updated_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching threads:', error)
    throw error
  }
  
  console.log('Threads found:', threads?.length)
  
  // Get members for each conversation
  const threadsWithMembers = await Promise.all(
    (threads || []).map(async (thread) => {
      const { data: members } = await (supabase as any)
        .from('conversation_members')
        .select(`
          *,
          user:profiles!conversation_members_user_id_fkey(*)
        `)
        .eq('thread_id', thread.id)
      
      return {
        ...thread,
        members: members || []
      }
    })
  )
  
  // Get last message for each conversation
  const conversationsWithMessages = await Promise.all(
    threadsWithMembers.map(async (thread) => {
      const { data: lastMessage } = await supabase
        .from('discussion_posts')
        .select(`
          *,
          author:profiles!discussion_posts_author_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      // Get unread count
      const userMembership = thread.members?.find((m: any) => m.user_id === userId)
      const lastReadAt = userMembership?.last_read_at || userMembership?.joined_at
      
      const { count: unreadCount } = await supabase
        .from('discussion_posts')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', thread.id)
        .neq('author_id', userId)
        .gt('created_at', lastReadAt || new Date(0).toISOString())
      
      return {
        ...thread,
        last_message: lastMessage,
        unread_count: unreadCount || 0,
        participants: thread.members?.map((m: any) => m.user).filter((u: any) => u.id !== userId)
      }
    })
  )
  
  return conversationsWithMessages as unknown as Conversation[]
}

/**
 * Get a single conversation with full details
 */
export async function getConversation(conversationId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('discussion_threads')
    .select('*')
    .eq('id', conversationId)
    .single()
  
  if (error) throw error
  
  // Get members separately
  const { data: members } = await (supabase as any)
    .from('conversation_members')
    .select(`
      *,
      user:profiles!conversation_members_user_id_fkey(*)
    `)
    .eq('thread_id', conversationId)
  
  return {
    ...data,
    members: members || [],
    participants: members?.map((m: any) => m.user)
  } as unknown as Conversation
}

/**
 * Get messages for a conversation
 */
export async function getConversationMessages(conversationId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('discussion_posts')
    .select(`
      *,
      author:profiles!discussion_posts_author_id_fkey(
        id,
        full_name,
        avatar_url,
        role
      ),
      reactions:post_reactions(*)
    `)
    .eq('thread_id', conversationId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data as unknown as (DiscussionPost & { author: User })[]
}

/**
 * Create a new direct message conversation
 */
export async function createDirectMessage(fromUserId: string, toUserId: string) {
  const supabase = createClient()
  
  // Verify auth
  const { data: { session } } = await supabase.auth.getSession()
  console.log('Auth session exists:', !!session, 'User ID matches:', session?.user?.id === fromUserId)
  
  if (!session) {
    throw new Error('Not authenticated')
  }
  
  // Check if DM already exists between these users
  const { data: existing } = await supabase
    .from('discussion_threads')
    .select('*')
    .eq('conversation_type', 'direct_message')
  
  // Get members for each thread
  const threadsWithMembers = await Promise.all(
    (existing || []).map(async (thread) => {
      const { data: members } = await (supabase as any)
        .from('conversation_members')
        .select('user_id')
        .eq('thread_id', thread.id)
      return {
        ...thread,
        members
      }
    })
  )
  
  // Find existing DM with exactly these two users
  const existingDM = threadsWithMembers.find(thread => {
    const memberIds = thread.members?.map((m: any) => m.user_id).sort()
    const targetIds = [fromUserId, toUserId].sort()
    return memberIds?.length === 2 && 
           memberIds[0] === targetIds[0] && 
           memberIds[1] === targetIds[1]
  })
  
  if (existingDM) {
    return existingDM
  }
  
  // Create new DM conversation
  const { data: thread, error: threadError } = await supabase
    .from('discussion_threads')
    .insert({
      title: 'Direct Message', // Fallback title in case null doesn't work
      conversation_type: 'direct_message',
      created_by: fromUserId,
      is_pinned: false,
      is_locked: false
    })
    .select()
    .single()
  
  if (threadError) {
    console.error('Error creating thread:', threadError)
    throw threadError
  }
  
  // Add both users as members
  const { error: membersError } = await (supabase as any)
    .from('conversation_members')
    .insert([
      { thread_id: thread.id, user_id: fromUserId },
      { thread_id: thread.id, user_id: toUserId }
    ])
  
  if (membersError) {
    console.error('Error adding members:', membersError)
    throw membersError
  }
  
  return thread
}

/**
 * Create a new group chat
 */
export async function createGroupChat(
  creatorId: string,
  memberUserIds: string[],
  groupName?: string
) {
  const supabase = createClient()
  
  // Verify auth
  const { data: { session } } = await supabase.auth.getSession()
  console.log('Auth session exists:', !!session, 'User ID matches:', session?.user?.id === creatorId)
  
  if (!session) {
    throw new Error('Not authenticated')
  }
  
  // Create group conversation
  const { data: thread, error: threadError } = await supabase
    .from('discussion_threads')
    .insert({
      title: groupName || 'Group Chat',
      conversation_name: groupName,
      conversation_type: 'group_chat',
      created_by: creatorId,
      is_pinned: false,
      is_locked: false
    })
    .select()
    .single()
  
  if (threadError) throw threadError
  
  // Add creator and all members
  const allMemberIds = [creatorId, ...memberUserIds.filter(id => id !== creatorId)]
  const members = allMemberIds.map(userId => ({
    thread_id: thread.id,
    user_id: userId
  }))
  
  const { error: membersError } = await (supabase as any)
    .from('conversation_members')
    .insert(members)
  
  if (membersError) throw membersError
  
  return thread
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  conversationId: string,
  authorId: string,
  content: string,
  parentPostId?: string,
  mediaUrls?: string[]
) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('discussion_posts')
    .insert({
      thread_id: conversationId,
      author_id: authorId,
      content,
      parent_post_id: parentPostId,
      media_urls: mediaUrls && mediaUrls.length > 0 ? mediaUrls : null,
      has_media: mediaUrls && mediaUrls.length > 0
    })
    .select(`
      *,
      author:profiles!discussion_posts_author_id_fkey(
        id,
        full_name,
        avatar_url,
        role
      )
    `)
    .single()
  
  if (error) throw error
  return data
}

/**
 * Mark conversation as read
 */
export async function markConversationAsRead(conversationId: string, userId: string) {
  const supabase = createClient()
  
  const { error } = await (supabase as any)
    .from('conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('thread_id', conversationId)
    .eq('user_id', userId)
  
  if (error) throw error
}

/**
 * Archive/unarchive conversation
 */
export async function toggleArchiveConversation(
  conversationId: string,
  userId: string,
  isArchived: boolean
) {
  const supabase = createClient()
  
  const { error } = await (supabase as any)
    .from('conversation_members')
    .update({ is_archived: isArchived })
    .eq('thread_id', conversationId)
    .eq('user_id', userId)
  
  if (error) throw error
}

/**
 * Mute/unmute conversation
 */
export async function toggleMuteConversation(
  conversationId: string,
  userId: string,
  isMuted: boolean
) {
  const supabase = createClient()
  
  const { error } = await (supabase as any)
    .from('conversation_members')
    .update({ is_muted: isMuted })
    .eq('thread_id', conversationId)
    .eq('user_id', userId)
  
  if (error) throw error
}

/**
 * Get unread message count for user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createClient()
  
  const { data, error } = await (supabase as any).rpc('get_unread_message_count', {
    user_uuid: userId
  })
  
  if (error) {
    console.error('Error getting unread count:', error)
    return 0
  }
  
  return data || 0
}

/**
 * Add member to group chat
 */
export async function addMemberToGroup(conversationId: string, userId: string) {
  const supabase = createClient()
  
  const { error } = await (supabase as any)
    .from('conversation_members')
    .insert({
      thread_id: conversationId,
      user_id: userId
    })
  
  if (error) throw error
}

/**
 * Leave group chat
 */
export async function leaveGroupChat(conversationId: string, userId: string) {
  const supabase = createClient()
  
  const { error } = await (supabase as any)
    .from('conversation_members')
    .delete()
    .eq('thread_id', conversationId)
    .eq('user_id', userId)
  
  if (error) throw error
}

/**
 * Update group chat name
 */
export async function updateGroupName(conversationId: string, groupName: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('discussion_threads')
    .update({
      title: groupName,
      conversation_name: groupName
    })
    .eq('id', conversationId)
  
  if (error) throw error
}

/**
 * Subscribe to conversation changes (real-time)
 */
export function subscribeToConversation(conversationId: string, callback: () => void) {
  const supabase = createClient()
  
  console.log('Setting up real-time subscription for conversation:', conversationId)
  
  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'discussion_posts',
        filter: `thread_id=eq.${conversationId}`,
      },
      (payload) => {
        console.log('Real-time event received:', payload)
        callback()
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status)
    })
  
  return channel
}

/**
 * Subscribe to all user conversations (for inbox updates)
 */
export function subscribeToUserConversations(userId: string, callback: () => void) {
  const supabase = createClient()
  
  console.log('Setting up user conversations real-time subscription for:', userId)
  
  // Subscribe to any changes in conversations where user is a member
  const channel = supabase
    .channel(`user-conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'discussion_posts',
      },
      (payload) => {
        console.log('Real-time: discussion_posts change', payload.eventType)
        callback()
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversation_members',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('Real-time: conversation_members change', payload.eventType)
        callback()
      }
    )
    .subscribe((status) => {
      console.log('User conversations subscription status:', status)
    })
  
  return channel
}

