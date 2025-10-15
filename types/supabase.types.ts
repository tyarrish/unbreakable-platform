export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      discussion_threads: {
        Row: {
          content_html: string | null
          created_at: string | null
          created_by: string
          has_media: boolean | null
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          last_activity_at: string | null
          media_urls: Json | null
          module_id: string | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          content_html?: string | null
          created_at?: string | null
          created_by: string
          has_media?: boolean | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_activity_at?: string | null
          media_urls?: Json | null
          module_id?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          content_html?: string | null
          created_at?: string | null
          created_by?: string
          has_media?: boolean | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_activity_at?: string | null
          media_urls?: Json | null
          module_id?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'facilitator' | 'participant'
          avatar_url: string | null
          bio: string | null
          learning_preferences: Json | null
          partner_id: string | null
          created_at: string | null
          updated_at: string | null
          is_active: boolean | null
          invited_by: string | null
          profile_completed: boolean | null
          deactivated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'facilitator' | 'participant'
          avatar_url?: string | null
          bio?: string | null
          learning_preferences?: Json | null
          partner_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          is_active?: boolean | null
          invited_by?: string | null
          profile_completed?: boolean | null
          deactivated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'facilitator' | 'participant'
          avatar_url?: string | null
          bio?: string | null
          learning_preferences?: Json | null
          partner_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          is_active?: boolean | null
          invited_by?: string | null
          profile_completed?: boolean | null
          deactivated_at?: string | null
        }
      }
    }
  }
}
