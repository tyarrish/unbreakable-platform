import { createClient } from '@/lib/supabase/client'
import type { Book, ReadingStatus } from '@/types/index.types'

/**
 * Get all books
 */
export async function getBooks() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('assigned_month', { ascending: true, nullsFirst: false })
    .order('title', { ascending: true })
  
  if (error) {
    console.error('Error fetching books:', error)
    throw error
  }
  
  // Fetch submitter info separately to avoid FK issues
  if (data && data.length > 0) {
    const submitterIds = data.filter(b => (b as any).submitted_by).map(b => (b as any).submitted_by)
    if (submitterIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', submitterIds)
      
      // Attach submitter info
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
      data.forEach((book: any) => {
        if (book.submitted_by) {
          book.submitted_by_profile = profileMap.get(book.submitted_by)
        }
      })
    }
  }
  
  return data as any[]
}

/**
 * Get single book
 */
export async function getBook(bookId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', bookId)
    .single()
  
  if (error) throw error
  return data as Book
}

/**
 * Create book (admin only)
 */
export async function createBook(book: Partial<Book>) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('books') as any)
    .insert(book)
    .select()
    .single()
  
  if (error) throw error
  return data as Book
}

/**
 * Update book
 */
export async function updateBook(bookId: string, updates: Partial<Book>) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('books') as any)
    .update(updates)
    .eq('id', bookId)
    .select()
    .single()
  
  if (error) throw error
  return data as Book
}

/**
 * Delete book
 */
export async function deleteBook(bookId: string) {
  const supabase = createClient()
  
  const { error } = await (supabase
    .from('books') as any)
    .delete()
    .eq('id', bookId)
  
  if (error) throw error
}

/**
 * Get user's reading progress for a book
 */
export async function getReadingProgress(userId: string, bookId: string) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('reading_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .single()) as any
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

/**
 * Update reading progress
 */
export async function updateReadingProgress(
  userId: string,
  bookId: string,
  updates: {
    status?: ReadingStatus
    started_at?: string | null
    finished_at?: string | null
    rating?: number | null
    notes?: string
  }
) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('reading_progress') as any)
    .upsert({
      user_id: userId,
      book_id: bookId,
      ...updates,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Get all reading progress for user
 */
export async function getUserReadingList(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('reading_progress')
    .select('*, book:books(*)')
    .eq('user_id', userId)) as any
  
  if (error) throw error
  return data
}

/**
 * Get books by assigned month (module number)
 */
export async function getBooksByMonth(month: number) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('books')
    .select('*')
    .eq('assigned_month', month)
    .order('title', { ascending: true })) as any
  
  if (error) throw error
  return data as Book[]
}

