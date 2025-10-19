import { createClient } from '@/lib/supabase/client'

export interface GuestSpeaker {
  id: string
  full_name: string
  bio: string | null
  avatar_url: string | null
  title: string | null
  organization: string | null
  linkedin_url: string | null
  website_url: string | null
  created_at: string
  updated_at: string
}

export interface EventSpeaker {
  id: string
  event_id: string
  speaker_type: 'facilitator' | 'guest' | 'member'
  profile_id: string | null
  guest_speaker_id: string | null
  display_order: number
  profile?: {
    full_name: string
    avatar_url: string | null
    employer: string | null
    current_role: string | null
    bio: string | null
  }
  guest_speaker?: GuestSpeaker
}

/**
 * Get all guest speakers
 */
export async function getAllGuestSpeakers(): Promise<GuestSpeaker[]> {
  const supabase = createClient()
  
  const { data, error } = await (supabase as any)
    .from('guest_speakers')
    .select('*')
    .order('full_name', { ascending: true })
  
  if (error) throw error
  return data as GuestSpeaker[]
}

/**
 * Create guest speaker
 */
export async function createGuestSpeaker(speaker: Omit<GuestSpeaker, 'id' | 'created_at' | 'updated_at'>): Promise<GuestSpeaker> {
  const supabase = createClient()
  
  const { data, error } = await (supabase as any)
    .from('guest_speakers')
    .insert(speaker)
    .select()
    .single()
  
  if (error) throw error
  return data as GuestSpeaker
}

/**
 * Update guest speaker
 */
export async function updateGuestSpeaker(id: string, updates: Partial<GuestSpeaker>): Promise<void> {
  const supabase = createClient()
  
  const { error } = await (supabase as any)
    .from('guest_speakers')
    .update(updates)
    .eq('id', id)
  
  if (error) throw error
}

/**
 * Delete guest speaker
 */
export async function deleteGuestSpeaker(id: string): Promise<void> {
  const supabase = createClient()
  
  const { error} = await (supabase as any)
    .from('guest_speakers')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

/**
 * Get speakers for an event
 */
export async function getEventSpeakers(eventId: string): Promise<EventSpeaker[]> {
  const supabase = createClient()
  
  const { data, error } = await (supabase as any)
    .from('event_speakers')
    .select(`
      *,
      profile:profiles(full_name, avatar_url, employer, current_role, bio),
      guest_speaker:guest_speakers(*)
    `)
    .eq('event_id', eventId)
    .order('display_order', { ascending: true })
  
  if (error) throw error
  return data as any as EventSpeaker[]
}

/**
 * Add speakers to event
 */
export async function addEventSpeakers(
  eventId: string,
  speakers: Array<{
    type: 'facilitator' | 'guest' | 'member'
    id: string // profile_id for facilitator/member, guest_speaker_id for guest
  }>
): Promise<void> {
  const supabase = createClient()
  
  // First, remove existing speakers for this event
  await (supabase as any)
    .from('event_speakers')
    .delete()
    .eq('event_id', eventId)
  
  // Then add new speakers
  const speakerRecords = speakers.map((speaker, index) => ({
    event_id: eventId,
    speaker_type: speaker.type,
    profile_id: speaker.type !== 'guest' ? speaker.id : null,
    guest_speaker_id: speaker.type === 'guest' ? speaker.id : null,
    display_order: index,
  }))
  
  if (speakerRecords.length > 0) {
    const { error } = await (supabase as any)
      .from('event_speakers')
      .insert(speakerRecords)
    
    if (error) throw error
  }
}

/**
 * Get all potential speakers grouped by type
 */
export async function getAllPotentialSpeakers() {
  const supabase = createClient()
  
  // Get facilitators
  const { data: facilitators } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, current_role, employer')
    .contains('roles', ['facilitator'])
    .order('full_name', { ascending: true })
  
  // Get guest speakers
  const { data: guests } = await (supabase as any)
    .from('guest_speakers')
    .select('id, full_name, avatar_url, title, organization')
    .order('full_name', { ascending: true })
  
  // Get all members
  const { data: members } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, current_role, employer')
    .order('full_name', { ascending: true })
  
  return {
    facilitators: facilitators || [],
    guests: guests || [],
    members: members || [],
  }
}

