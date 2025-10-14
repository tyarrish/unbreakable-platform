/**
 * Upload book cover to Supabase Storage
 */

import { createClient } from '@/lib/supabase/client'

interface UploadResult {
  url: string
  path: string
}

/**
 * Upload a book cover image to Supabase Storage
 */
export async function uploadBookCover(file: File): Promise<UploadResult> {
  const supabase = createClient()
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.')
  }
  
  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB.')
  }
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
  const filePath = `covers/${fileName}`
  
  // Upload file
  const { data, error } = await supabase.storage
    .from('book-covers')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })
  
  if (error) {
    console.error('Upload error:', error)
    
    // Provide more specific error messages
    if (error.message?.includes('row-level security')) {
      throw new Error('Storage not configured. Please ensure the book-covers bucket exists and has proper permissions.')
    }
    if (error.message?.includes('Bucket not found')) {
      throw new Error('Storage bucket not found. Please run the database migration.')
    }
    if (error.message?.includes('already exists')) {
      throw new Error('File already exists. Please try again.')
    }
    
    throw new Error(`Upload failed: ${error.message || 'Please try again.'}`)
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('book-covers')
    .getPublicUrl(data.path)
  
  return {
    url: publicUrl,
    path: data.path,
  }
}

/**
 * Delete a book cover from Supabase Storage
 */
export async function deleteBookCover(path: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase.storage
    .from('book-covers')
    .remove([path])
  
  if (error) {
    console.error('Delete error:', error)
    throw new Error('Failed to delete image.')
  }
}

