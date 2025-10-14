import { createClient } from '@/lib/supabase/client'
import type { Module, Lesson, LessonProgress } from '@/types/index.types'

/**
 * Get all modules (admin view includes unpublished)
 */
export async function getModules(includeUnpublished: boolean = false) {
  const supabase = createClient()
  
  let query = supabase
    .from('modules')
    .select('*')
    .order('order_number', { ascending: true })
  
  if (!includeUnpublished) {
    query = query.eq('is_published', true)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data as Module[]
}

/**
 * Get single module by ID
 */
export async function getModule(moduleId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('id', moduleId)
    .single()
  
  if (error) throw error
  return data as Module
}

/**
 * Create new module
 */
export async function createModule(module: Partial<Module>) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('modules') as any)
    .insert(module)
    .select()
    .single()
  
  if (error) throw error
  return data as Module
}

/**
 * Update module
 */
export async function updateModule(moduleId: string, updates: Partial<Module>) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('modules') as any)
    .update(updates)
    .eq('id', moduleId)
    .select()
    .single()
  
  if (error) throw error
  return data as Module
}

/**
 * Delete module
 */
export async function deleteModule(moduleId: string) {
  const supabase = createClient()
  
  const { error } = await (supabase
    .from('modules') as any)
    .delete()
    .eq('id', moduleId)
  
  if (error) throw error
}

/**
 * Get lessons for a module
 */
export async function getLessons(moduleId: string) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .order('order_number', { ascending: true })) as any
  
  if (error) throw error
  return data as Lesson[]
}

/**
 * Get single lesson
 */
export async function getLesson(lessonId: string) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()) as any
  
  if (error) throw error
  return data as Lesson
}

/**
 * Create new lesson
 */
export async function createLesson(lesson: Partial<Lesson>) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('lessons') as any)
    .insert(lesson)
    .select()
    .single()
  
  if (error) throw error
  return data as Lesson
}

/**
 * Update lesson
 */
export async function updateLesson(lessonId: string, updates: Partial<Lesson>) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('lessons') as any)
    .update(updates)
    .eq('id', lessonId)
    .select()
    .single()
  
  if (error) throw error
  return data as Lesson
}

/**
 * Delete lesson
 */
export async function deleteLesson(lessonId: string) {
  const supabase = createClient()
  
  const { error } = await (supabase
    .from('lessons') as any)
    .delete()
    .eq('id', lessonId)
  
  if (error) throw error
}

/**
 * Get user's progress for a lesson
 */
export async function getLessonProgress(userId: string, lessonId: string) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single()) as any
  
  if (error && error.code !== 'PGRST116') throw error
  return data as LessonProgress | null
}

/**
 * Update lesson progress
 */
export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  updates: Partial<LessonProgress>
) {
  const supabase = createClient()
  
  const { data, error} = await (supabase
    .from('lesson_progress') as any)
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      status: updates.status || 'not_started',
      started_at: updates.started_at || null,
      completed_at: updates.completed_at || null,
      time_spent_minutes: updates.time_spent_minutes || 0,
    }, {
      onConflict: 'user_id,lesson_id',
    })
    .select()
    .single()
  
  if (error) throw error
  return data as LessonProgress
}

/**
 * Mark lesson as complete
 */
export async function markLessonComplete(userId: string, lessonId: string) {
  const supabase = createClient()
  
  // Get existing progress to preserve time spent
  const existing = await getLessonProgress(userId, lessonId)
  
  const { data, error } = await (supabase
    .from('lesson_progress') as any)
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      status: 'completed',
      started_at: existing?.started_at || new Date().toISOString(),
      completed_at: new Date().toISOString(),
      time_spent_minutes: existing?.time_spent_minutes || 0,
    }, {
      onConflict: 'user_id,lesson_id',
    })
    .select()
    .single()
  
  if (error) throw error
  return data as LessonProgress
}

/**
 * Get all progress for user
 */
export async function getUserProgress(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('lesson_progress')
    .select('*, lessons(*)')
    .eq('user_id', userId)) as any
  
  if (error) throw error
  return data
}

/**
 * Get user's reflection for a lesson
 */
export async function getReflection(userId: string, lessonId: string) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('reflections')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single()) as any
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

/**
 * Save reflection
 */
export async function saveReflection(userId: string, lessonId: string, content: string) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('reflections') as any)
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      content,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

