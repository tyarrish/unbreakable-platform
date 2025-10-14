import { createClient } from '@/lib/supabase/client'

export interface BookComment {
  id: string
  book_id: string
  user_id: string
  parent_comment_id?: string
  content: string
  is_edited: boolean
  created_at: string
  updated_at: string
  user?: {
    id: string
    full_name?: string
    avatar_url?: string
    role: string
  }
  replies?: BookComment[]
  like_count?: number
  user_has_liked?: boolean
}

/**
 * Get all comments for a book with user info
 */
export async function getBookComments(bookId: string, userId?: string) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('book_comments')
    .select(`
      *,
      user:profiles!book_comments_user_id_fkey(id, full_name, avatar_url, role)
    `)
    .eq('book_id', bookId)
    .order('created_at', { ascending: true })) as any
  
  if (error) throw error
  
  // Get like counts and user likes for each comment
  const commentsWithLikes = await Promise.all(
    (data || []).map(async (comment: any) => {
      const { count } = await supabase
        .from('book_comment_likes')
        .select('*', { count: 'exact', head: true })
        .eq('comment_id', comment.id)
      
      let userHasLiked = false
      if (userId) {
        const { data: likeData } = await supabase
          .from('book_comment_likes')
          .select('id')
          .eq('comment_id', comment.id)
          .eq('user_id', userId)
          .single()
        userHasLiked = !!likeData
      }
      
      return {
        ...comment,
        like_count: count || 0,
        user_has_liked: userHasLiked,
      }
    })
  )
  
  // Organize into threaded structure
  const commentMap = new Map<string, BookComment>()
  const rootComments: BookComment[] = []
  
  commentsWithLikes.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })
  
  commentsWithLikes.forEach((comment) => {
    if (comment.parent_comment_id) {
      const parent = commentMap.get(comment.parent_comment_id)
      if (parent) {
        parent.replies = parent.replies || []
        parent.replies.push(commentMap.get(comment.id)!)
      }
    } else {
      rootComments.push(commentMap.get(comment.id)!)
    }
  })
  
  return rootComments
}

/**
 * Create a new comment
 */
export async function createBookComment(
  bookId: string,
  userId: string,
  content: string,
  parentCommentId?: string
) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('book_comments') as any)
    .insert({
      book_id: bookId,
      user_id: userId,
      content,
      parent_comment_id: parentCommentId || null,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Update a comment
 */
export async function updateBookComment(commentId: string, content: string) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('book_comments') as any)
    .update({ content, is_edited: true })
    .eq('id', commentId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Delete a comment
 */
export async function deleteBookComment(commentId: string) {
  const supabase = createClient()
  
  const { error } = await (supabase
    .from('book_comments') as any)
    .delete()
    .eq('id', commentId)
  
  if (error) throw error
}

/**
 * Like a comment
 */
export async function likeBookComment(commentId: string, userId: string) {
  const supabase = createClient()
  
  const { error } = await (supabase
    .from('book_comment_likes') as any)
    .insert({ comment_id: commentId, user_id: userId })
  
  if (error) throw error
}

/**
 * Unlike a comment
 */
export async function unlikeBookComment(commentId: string, userId: string) {
  const supabase = createClient()
  
  const { error } = await (supabase
    .from('book_comment_likes') as any)
    .delete()
    .eq('comment_id', commentId)
    .eq('user_id', userId)
  
  if (error) throw error
}




