import { createClient } from '@/lib/supabase/client'

export interface CheckInData {
  response: string
  commitment: string
  wins?: string
  challenges?: string
  support_needed?: string
  reflection?: string
  commitment_status?: 'pending' | 'completed' | 'partial' | 'missed'
}

export interface CheckIn {
  id: string
  user_id: string
  partner_id: string
  week_number: number
  prompt: string | null
  response: string | null
  commitment: string | null
  commitment_status: string | null
  wins: string | null
  challenges: string | null
  support_needed: string | null
  reflection: string | null
  partner_viewed: boolean
  partner_comment: string | null
  partner_commented_at: string | null
  created_at: string
}

export interface WeeklyPrompt {
  week_number: number
  main_question: string
  commitment_prompt: string
  reflection_prompt: string | null
}

/**
 * Get current week's check-in for a user
 */
export async function getCurrentCheckIn(userId: string, weekNumber: number): Promise<CheckIn | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('partner_checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('week_number', weekNumber)
    .single()

  if (error) {
    console.log('No check-in found for this week')
    return null
  }

  return data as CheckIn
}

/**
 * Submit weekly check-in
 */
export async function submitCheckIn(
  userId: string, 
  partnerId: string, 
  weekNumber: number, 
  prompt: string,
  data: CheckInData
): Promise<CheckIn> {
  const supabase = createClient()

  const { data: checkIn, error } = await (supabase as any)
    .from('partner_checkins')
    .insert({
      user_id: userId,
      partner_id: partnerId,
      week_number: weekNumber,
      prompt,
      response: data.response,
      commitment: data.commitment,
      commitment_status: data.commitment_status || 'pending',
      wins: data.wins,
      challenges: data.challenges,
      support_needed: data.support_needed,
      reflection: data.reflection,
    })
    .select()
    .single()

  if (error) throw error

  return checkIn as CheckIn
}

/**
 * Get partner's check-in for a specific week
 */
export async function getPartnerCheckIn(partnerId: string, weekNumber: number): Promise<CheckIn | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('partner_checkins')
    .select('*')
    .eq('user_id', partnerId)
    .eq('week_number', weekNumber)
    .single()

  if (error) {
    console.log('Partner has not completed this week\'s check-in')
    return null
  }

  return data as CheckIn
}

/**
 * Get check-in history for both user and partner
 */
export async function getCheckInHistory(
  userId: string, 
  partnerId: string, 
  limit: number = 10
): Promise<{ userCheckIns: CheckIn[], partnerCheckIns: CheckIn[] }> {
  const supabase = createClient()

  const [userResult, partnerResult] = await Promise.all([
    supabase
      .from('partner_checkins')
      .select('*')
      .eq('user_id', userId)
      .order('week_number', { ascending: false })
      .limit(limit),
    supabase
      .from('partner_checkins')
      .select('*')
      .eq('user_id', partnerId)
      .order('week_number', { ascending: false })
      .limit(limit)
  ])

  return {
    userCheckIns: (userResult.data || []) as CheckIn[],
    partnerCheckIns: (partnerResult.data || []) as CheckIn[],
  }
}

/**
 * Update commitment status for a previous check-in
 */
export async function updateCommitmentStatus(checkInId: string, status: 'completed' | 'partial' | 'missed'): Promise<void> {
  const supabase = createClient()

  const { error } = await (supabase as any)
    .from('partner_checkins')
    .update({ commitment_status: status })
    .eq('id', checkInId)

  if (error) throw error
}

/**
 * Add comment to partner's check-in
 */
export async function commentOnPartnerCheckIn(checkInId: string, comment: string): Promise<void> {
  const supabase = createClient()

  const { error } = await (supabase as any)
    .from('partner_checkins')
    .update({ 
      partner_comment: comment,
      partner_commented_at: new Date().toISOString()
    })
    .eq('id', checkInId)

  if (error) throw error
}

/**
 * Mark partner's check-in as viewed
 */
export async function markCheckInViewed(checkInId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await (supabase as any)
    .from('partner_checkins')
    .update({ partner_viewed: true })
    .eq('id', checkInId)

  if (error) throw error
}

/**
 * Get weekly prompt for a specific week
 */
export async function getWeeklyPrompt(weekNumber: number): Promise<WeeklyPrompt | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('weekly_prompts')
    .select('*')
    .eq('week_number', weekNumber)
    .single()

  if (error) {
    console.error('Error fetching prompt:', error)
    return null
  }

  return data as WeeklyPrompt
}

/**
 * Get previous week's check-in for commitment status update
 */
export async function getPreviousWeekCheckIn(userId: string, currentWeek: number): Promise<CheckIn | null> {
  if (currentWeek <= 1) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('partner_checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('week_number', currentWeek - 1)
    .single()

  if (error) return null

  return data as CheckIn
}

