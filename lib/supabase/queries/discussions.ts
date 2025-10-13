import { createClient } from '@/lib/supabase/client'
import type { DiscussionThread, DiscussionPost } from '@/types/index.types'

/**
 * Get all discussion threads
 */
export async function getThreads(moduleId?: string) {
  const supabase = createClient()
  
  let query = supabase
    .from('discussion_threads')
    .select(`
      *,
      created_by_profile:profiles!discussion_threads_created_by_fkey(full_name, avatar_url),
      posts:discussion_posts(count)
    `)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })
  
  if (moduleId) {
    query = query.eq('module_id', moduleId)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

/**
 * Get single thread with posts
 */
export async function getThread(threadId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('discussion_threads')
    .select(`
      *,
      created_by_profile:profiles!discussion_threads_created_by_fkey(full_name, avatar_url, role)
    `)
    .eq('id', threadId)
    .single()
  
  if (error) throw error
  return data
}

/**
 * Get posts for a thread
 */
export async function getThreadPosts(threadId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('discussion_posts')
    .select(`
      *,
      author:profiles!discussion_posts_author_id_fkey(full_name, avatar_url, role),
      reactions:post_reactions(*)
    `)
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

/**
 * Create discussion thread
 */
export async function createThread(thread: {
  title: string
  module_id?: string
  created_by: string
}) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('discussion_threads')
    .insert(thread)
    .select()
    .single()
  
  if (error) throw error
  return data as DiscussionThread
}

/**
 * Create discussion post
 */
export async function createPost(post: {
  thread_id: string
  author_id: string
  content: string
  parent_post_id?: string
  mentions?: string[]
}) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('discussion_posts')
    .insert(post)
    .select(`
      *,
      author:profiles!discussion_posts_author_id_fkey(full_name, avatar_url, role)
    `)
    .single()
  
  if (error) throw error
  return data
}

/**
 * Update post
 */
export async function updatePost(postId: string, content: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('discussion_posts')
    .update({ content, is_edited: true })
    .eq('id', postId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Delete post
 */
export async function deletePost(postId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('discussion_posts')
    .delete()
    .eq('id', postId)
  
  if (error) throw error
}

/**
 * Toggle reaction on a post
 */
export async function toggleReaction(postId: string, userId: string, reactionType: string) {
  const supabase = createClient()
  
  // Check if reaction exists
  const { data: existing } = await supabase
    .from('post_reactions')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .eq('reaction_type', reactionType)
    .single()
  
  if (existing) {
    // Remove reaction
    const { error } = await supabase
      .from('post_reactions')
      .delete()
      .eq('id', existing.id)
    
    if (error) throw error
    return { action: 'removed' }
  } else {
    // Add reaction
    const { error } = await supabase
      .from('post_reactions')
      .insert({
        post_id: postId,
        user_id: userId,
        reaction_type: reactionType,
      })
    
    if (error) throw error
    return { action: 'added' }
  }
}

/**
 * Pin/unpin thread (admin only)
 */
export async function togglePinThread(threadId: string, isPinned: boolean) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('discussion_threads')
    .update({ is_pinned: isPinned })
    .eq('id', threadId)
  
  if (error) throw error
}

/**
 * Lock/unlock thread (admin only)
 */
export async function toggleLockThread(threadId: string, isLocked: boolean) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('discussion_threads')
    .update({ is_locked: isLocked })
    .eq('id', threadId)
  
  if (error) throw error
}

/**
 * Subscribe to thread changes (real-time)
 */
export function subscribeToThread(threadId: string, callback: () => void) {
  const supabase = createClient()
  
  const channel = supabase
    .channel(`thread:${threadId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'discussion_posts',
        filter: `thread_id=eq.${threadId}`,
      },
      callback
    )
    .subscribe()
  
  return channel
}

