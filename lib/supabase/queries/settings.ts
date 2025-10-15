import { createClient } from '@/lib/supabase/client'

export interface PlatformSetting {
  id: string
  setting_key: string
  setting_value: any
  description?: string
  category?: string
  updated_at: string
}

/**
 * Get a setting by key
 */
export async function getSetting(key: string): Promise<any> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('platform_settings')
    .select('setting_value')
    .eq('setting_key', key)
    .single() as any

  if (error) {
    console.error('Error fetching setting:', error)
    return null
  }

  return data?.setting_value
}

/**
 * Get all settings
 */
export async function getAllSettings(): Promise<PlatformSetting[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('platform_settings')
    .select('*')
    .order('category', { ascending: true })
    .order('setting_key', { ascending: true })

  if (error) throw error

  return data as PlatformSetting[]
}

/**
 * Update a setting
 */
export async function updateSetting(key: string, value: any): Promise<void> {
  const supabase = createClient()

  const { error } = await (supabase as any)
    .from('platform_settings')
    .update({ 
      setting_value: value,
      updated_at: new Date().toISOString()
    })
    .eq('setting_key', key)

  if (error) throw error
}

/**
 * Get cohort start date (commonly used)
 */
export async function getCohortStartDate(): Promise<string> {
  const value = await getSetting('cohort_start_date')
  return value || '2025-10-23'
}

