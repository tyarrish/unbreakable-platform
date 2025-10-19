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
      module:modules(id, title, order_number),
      attendance:event_attendance(count)
    `)
    .order('start_time', { ascending: true })
  
  if (error) throw error
  
  // Fetch speakers for each event
  if (data) {
    const eventsWithSpeakers = await Promise.all(
      data.map(async (event) => {
        const { data: speakers } = await (supabase as any)
          .from('event_speakers')
          .select(`
            *,
            profile:profiles(full_name, avatar_url),
            guest_speaker:guest_speakers(full_name, avatar_url)
          `)
          .eq('event_id', event.id)
          .order('display_order', { ascending: true })
        
        return { ...event, speakers: speakers || [] }
      })
    )
    return eventsWithSpeakers
  }
  
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
      module:modules(id, title, order_number),
      attendance:event_attendance(*, user:profiles(full_name, avatar_url))
    `)
    .eq('id', eventId)
    .single()
  
  if (error) throw error
  
  // Fetch speakers for this event
  const { data: speakers } = await (supabase as any)
    .from('event_speakers')
    .select(`
      *,
      profile:profiles(full_name, avatar_url, bio, employer, current_role),
      guest_speaker:guest_speakers(*)
    `)
    .eq('event_id', eventId)
    .order('display_order', { ascending: true })
  
  return { ...data, speakers: speakers || [] }
}

/**
 * Create event
 */
export async function createEvent(event: Partial<Event>) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('events') as any)
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
  
  const { data, error } = await (supabase
    .from('events') as any)
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
  
  const { error } = await (supabase
    .from('events') as any)
    .delete()
    .eq('id', eventId)
  
  if (error) throw error
}

/**
 * Register for event
 */
export async function registerForEvent(eventId: string, userId: string) {
  const supabase = createClient()
  
  const { error } = await (supabase
    .from('event_attendance') as any)
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
  
  const { error } = await (supabase
    .from('event_attendance') as any)
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
  
  const { data, error } = await (supabase
    .from('event_attendance')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single()) as any
  
  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

/**
 * Mark attendance
 */
export async function markAttendance(eventId: string, userId: string, status: 'attended' | 'missed') {
  const supabase = createClient()
  
  const { error } = await (supabase
    .from('event_attendance') as any)
    .update({ status })
    .eq('event_id', eventId)
    .eq('user_id', userId)
  
  if (error) throw error
}

/**
 * Get events by module ID
 */
export async function getEventsByModule(moduleId: string) {
  const supabase = createClient()
  
  const { data, error } = await (supabase
    .from('events')
    .select(`
      *,
      created_by_profile:profiles!events_created_by_fkey(full_name),
      attendance:event_attendance(count)
    `)
    .eq('module_id', moduleId)
    .order('start_time', { ascending: true })) as any
  
  if (error) throw error
  return data
}

