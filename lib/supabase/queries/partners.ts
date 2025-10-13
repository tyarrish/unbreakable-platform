import { createClient } from '@/lib/supabase/client'

/**
 * Get partner questionnaire for user
 */
export async function getPartnerQuestionnaire(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('partner_questionnaire')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

/**
 * Submit partner questionnaire
 */
export async function submitPartnerQuestionnaire(userId: string, responses: Record<string, any>) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('partner_questionnaire')
    .upsert({
      user_id: userId,
      responses,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Get partner details
 */
export async function getPartner(partnerId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, bio, email')
    .eq('id', partnerId)
    .single()
  
  if (error) throw error
  return data
}

/**
 * Get partner check-ins
 */
export async function getPartnerCheckIns(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('partner_checkins')
    .select('*')
    .eq('user_id', userId)
    .order('week_number', { ascending: false })
  
  if (error) throw error
  return data
}

/**
 * Submit partner check-in
 */
export async function submitCheckIn(userId: string, partnerId: string, weekNumber: number, response: string, prompt?: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('partner_checkins')
    .upsert({
      user_id: userId,
      partner_id: partnerId,
      week_number: weekNumber,
      prompt,
      response,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Get partner messages
 */
export async function getPartnerMessages(userId: string, partnerId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('partner_messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .or(`sender_id.eq.${partnerId},receiver_id.eq.${partnerId}`)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

/**
 * Send partner message
 */
export async function sendPartnerMessage(senderId: string, receiverId: string, message: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('partner_messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      message,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(userId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('partner_messages')
    .update({ is_read: true })
    .eq('receiver_id', userId)
    .eq('is_read', false)
  
  if (error) throw error
}

/**
 * Subscribe to partner messages (real-time)
 */
export function subscribeToPartnerMessages(userId: string, partnerId: string, callback: () => void) {
  const supabase = createClient()
  
  const channel = supabase
    .channel(`partner:${userId}:${partnerId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'partner_messages',
        filter: `receiver_id=eq.${userId}`,
      },
      callback
    )
    .subscribe()
  
  return channel
}

