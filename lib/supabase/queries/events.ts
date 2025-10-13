import { createClient } from '@/lib/supabase/client'
import type { Event } from '@/types/index.types'

/**
 * Get all events
 */
export async function getEvents() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      created_by_profile:profiles!events_created_by_fkey(full_name),
      attendance:event_attendance(count)
    `)
    .order('start_time', { ascending: true })
  
  if (error) throw error
  return data
}

/**
 * Get single event
 */
export async function getEvent(eventId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      created_by_profile:profiles!events_created_by_fkey(full_name),
      attendance:event_attendance(*, user:profiles(full_name, avatar_url))
    `)
    .eq('id', eventId)
    .single()
  
  if (error) throw error
  return data
}

/**
 * Create event
 */
export async function createEvent(event: Partial<Event>) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single()
  
  if (error) throw error
  return data as Event
}

/**
 * Update event
 */
export async function updateEvent(eventId: string, updates: Partial<Event>) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single()
  
  if (error) throw error
  return data as Event
}

/**
 * Delete event
 */
export async function deleteEvent(eventId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)
  
  if (error) throw error
}

/**
 * Register for event
 */
export async function registerForEvent(eventId: string, userId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('event_attendance')
    .insert({
      event_id: eventId,
      user_id: userId,
      status: 'registered',
    })
  
  if (error) throw error
}

/**
 * Unregister from event
 */
export async function unregisterFromEvent(eventId: string, userId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('event_attendance')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId)
  
  if (error) throw error
}

/**
 * Check if user is registered for event
 */
export async function isRegisteredForEvent(eventId: string, userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('event_attendance')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

/**
 * Mark attendance
 */
export async function markAttendance(eventId: string, userId: string, status: 'attended' | 'missed') {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('event_attendance')
    .update({ status })
    .eq('event_id', eventId)
    .eq('user_id', userId)
  
  if (error) throw error
}

