export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          icon: string | null
          id: string
          name: string
          points: number | null
          requirements: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          icon?: string | null
          id?: string
          name: string
          points?: number | null
          requirements?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          icon?: string | null
          id?: string
          name?: string
          points?: number | null
          requirements?: Json | null
        }
        Relationships: []
      }
      activity_feed: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          id: string
          link: string | null
          metadata: Json | null
          title: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          link?: string | null
          metadata?: Json | null
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          link?: string | null
          metadata?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      book_comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "book_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      book_comments: {
        Row: {
          book_id: string
          content: string
          created_at: string | null
          id: string
          is_edited: boolean | null
          parent_comment_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          book_id: string
          content: string
          created_at?: string | null
          id?: string
          is_edited?: boolean | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          book_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_edited?: boolean | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_comments_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "book_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          amazon_link: string | null
          assigned_month: number | null
          author: string
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          goodreads_link: string | null
          id: string
          is_featured: boolean | null
          isbn: string | null
          key_takeaways: string[] | null
          reasoning: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amazon_link?: string | null
          assigned_month?: number | null
          author: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          goodreads_link?: string | null
          id?: string
          is_featured?: boolean | null
          isbn?: string | null
          key_takeaways?: string[] | null
          reasoning?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amazon_link?: string | null
          assigned_month?: number | null
          author?: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          goodreads_link?: string | null
          id?: string
          is_featured?: boolean | null
          isbn?: string | null
          key_takeaways?: string[] | null
          reasoning?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      capstone_projects: {
        Row: {
          created_at: string | null
          description: string | null
          feedback: string | null
          id: string
          milestones: Json | null
          status: string | null
          submitted_at: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          feedback?: string | null
          id?: string
          milestones?: Json | null
          status?: string | null
          submitted_at?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          feedback?: string | null
          id?: string
          milestones?: Json | null
          status?: string | null
          submitted_at?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "capstone_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_content: {
        Row: {
          active: boolean | null
          ai_model: string | null
          approved: boolean | null
          approved_at: string | null
          approved_by: string | null
          content: Json
          content_type: string
          created_at: string | null
          generated_at: string
          generation_context: Json | null
          id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          ai_model?: string | null
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          content: Json
          content_type: string
          created_at?: string | null
          generated_at?: string
          generation_context?: Json | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          ai_model?: string | null
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          content?: Json
          content_type?: string
          created_at?: string | null
          generated_at?: string
          generation_context?: Json | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      discussion_posts: {
        Row: {
          author_id: string
          content: string
          content_html: string | null
          created_at: string | null
          has_media: boolean | null
          id: string
          is_edited: boolean | null
          media_urls: Json | null
          mentions: Json | null
          parent_post_id: string | null
          thread_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          content_html?: string | null
          created_at?: string | null
          has_media?: boolean | null
          id?: string
          is_edited?: boolean | null
          media_urls?: Json | null
          mentions?: Json | null
          parent_post_id?: string | null
          thread_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          content_html?: string | null
          created_at?: string | null
          has_media?: boolean | null
          id?: string
          is_edited?: boolean | null
          media_urls?: Json | null
          mentions?: Json | null
          parent_post_id?: string | null
          thread_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_posts_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_posts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "discussion_activity_stats"
            referencedColumns: ["thread_id"]
          },
          {
            foreignKeyName: "discussion_posts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "discussion_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_threads: {
        Row: {
          content: string | null
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
          content?: string | null
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
          content?: string | null
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
        Relationships: [
          {
            foreignKeyName: "discussion_threads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_threads_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "module_completion_stats"
            referencedColumns: ["module_id"]
          },
          {
            foreignKeyName: "discussion_threads_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_flags: {
        Row: {
          context: Json | null
          created_at: string | null
          flag_reason: string
          flag_type: string
          id: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          resolved_notes: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          flag_reason: string
          flag_type: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolved_notes?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          flag_reason?: string
          flag_type?: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolved_notes?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      event_attendance: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reminders: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          reminder_time: string
          sent: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          reminder_time: string
          sent?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          reminder_time?: string
          sent?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          end_time: string
          event_type: string
          id: string
          is_required: boolean | null
          location_address: string | null
          location_type: string | null
          max_attendees: number | null
          module_id: string | null
          start_time: string
          title: string
          updated_at: string | null
          zoom_link: string | null
          zoom_meeting_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          end_time: string
          event_type: string
          id?: string
          is_required?: boolean | null
          location_address?: string | null
          location_type?: string | null
          max_attendees?: number | null
          module_id?: string | null
          start_time: string
          title: string
          updated_at?: string | null
          zoom_link?: string | null
          zoom_meeting_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_time?: string
          event_type?: string
          id?: string
          is_required?: boolean | null
          location_address?: string | null
          location_type?: string | null
          max_attendees?: number | null
          module_id?: string | null
          start_time?: string
          title?: string
          updated_at?: string | null
          zoom_link?: string | null
          zoom_meeting_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "module_completion_stats"
            referencedColumns: ["module_id"]
          },
          {
            foreignKeyName: "events_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          full_name: string
          id: string
          invite_token: string | null
          invited_by: string | null
          role: string
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          full_name: string
          id?: string
          invite_token?: string | null
          invited_by?: string | null
          role: string
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          full_name?: string
          id?: string
          invite_token?: string | null
          invited_by?: string | null
          role?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_attachments: {
        Row: {
          created_at: string | null
          description: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          lesson_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          lesson_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          lesson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_attachments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string
          reflection: string | null
          reflection_word_count: number | null
          resources_downloaded: Json | null
          started_at: string | null
          status: string | null
          time_spent_minutes: number | null
          updated_at: string | null
          user_id: string
          video_watch_percentage: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id: string
          reflection?: string | null
          reflection_word_count?: number | null
          resources_downloaded?: Json | null
          started_at?: string | null
          status?: string | null
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id: string
          video_watch_percentage?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string
          reflection?: string | null
          reflection_word_count?: number | null
          resources_downloaded?: Json | null
          started_at?: string | null
          status?: string | null
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id?: string
          video_watch_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: Json | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          module_id: string
          order_number: number
          title: string
          updated_at: string | null
          video_duration: number | null
          video_thumbnail_url: string | null
          video_url: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          module_id: string
          order_number: number
          title: string
          updated_at?: string | null
          video_duration?: number | null
          video_thumbnail_url?: string | null
          video_url?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          module_id?: string
          order_number?: number
          title?: string
          updated_at?: string | null
          video_duration?: number | null
          video_thumbnail_url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "module_completion_stats"
            referencedColumns: ["module_id"]
          },
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_attachments: {
        Row: {
          created_at: string | null
          description: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          module_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          module_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          module_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_attachments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "module_completion_stats"
            referencedColumns: ["module_id"]
          },
          {
            foreignKeyName: "module_attachments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          order_number: number
          release_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          order_number: number
          release_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          order_number?: number
          release_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_checkins: {
        Row: {
          challenges: string | null
          commitment: string | null
          commitment_status: string | null
          created_at: string | null
          id: string
          partner_comment: string | null
          partner_commented_at: string | null
          partner_id: string
          partner_viewed: boolean | null
          prompt: string | null
          reflection: string | null
          response: string | null
          support_needed: string | null
          user_id: string
          week_number: number
          wins: string | null
        }
        Insert: {
          challenges?: string | null
          commitment?: string | null
          commitment_status?: string | null
          created_at?: string | null
          id?: string
          partner_comment?: string | null
          partner_commented_at?: string | null
          partner_id: string
          partner_viewed?: boolean | null
          prompt?: string | null
          reflection?: string | null
          response?: string | null
          support_needed?: string | null
          user_id: string
          week_number: number
          wins?: string | null
        }
        Update: {
          challenges?: string | null
          commitment?: string | null
          commitment_status?: string | null
          created_at?: string | null
          id?: string
          partner_comment?: string | null
          partner_commented_at?: string | null
          partner_id?: string
          partner_viewed?: boolean | null
          prompt?: string | null
          reflection?: string | null
          response?: string | null
          support_needed?: string | null
          user_id?: string
          week_number?: number
          wins?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_checkins_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_messages: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_questionnaire: {
        Row: {
          completed: boolean | null
          id: string
          responses: Json
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          id?: string
          responses?: Json
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          id?: string
          responses?: Json
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_questionnaire_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability_preferences: Json | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          communication_style: string | null
          country: string | null
          created_at: string | null
          deactivated_at: string | null
          email: string
          experience_level: string | null
          full_name: string | null
          goals: string | null
          id: string
          industry: string | null
          interests: string[] | null
          invited_by: string | null
          is_active: boolean | null
          learning_preferences: Json | null
          linkedin_url: string | null
          matching_preferences: Json | null
          partner_id: string | null
          profile_completed: boolean | null
          role: string | null
          state: string | null
          team_size: string | null
          time_zone: string | null
          twitter_url: string | null
          updated_at: string | null
        }
        Insert: {
          availability_preferences?: Json | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          communication_style?: string | null
          country?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          email: string
          experience_level?: string | null
          full_name?: string | null
          goals?: string | null
          id: string
          industry?: string | null
          interests?: string[] | null
          invited_by?: string | null
          is_active?: boolean | null
          learning_preferences?: Json | null
          linkedin_url?: string | null
          matching_preferences?: Json | null
          partner_id?: string | null
          profile_completed?: boolean | null
          role?: string | null
          state?: string | null
          team_size?: string | null
          time_zone?: string | null
          twitter_url?: string | null
          updated_at?: string | null
        }
        Update: {
          availability_preferences?: Json | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          communication_style?: string | null
          country?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          email?: string
          experience_level?: string | null
          full_name?: string | null
          goals?: string | null
          id?: string
          industry?: string | null
          interests?: string[] | null
          invited_by?: string | null
          is_active?: boolean | null
          learning_preferences?: Json | null
          linkedin_url?: string | null
          matching_preferences?: Json | null
          partner_id?: string | null
          profile_completed?: boolean | null
          role?: string | null
          state?: string | null
          team_size?: string | null
          time_zone?: string | null
          twitter_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      program_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      reading_groups: {
        Row: {
          book_id: string
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          book_id: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          book_id?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reading_groups_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_progress: {
        Row: {
          book_id: string
          created_at: string | null
          finished_at: string | null
          id: string
          notes: string | null
          rating: number | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          finished_at?: string | null
          id?: string
          notes?: string | null
          rating?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          finished_at?: string | null
          id?: string
          notes?: string | null
          rating?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          resource_id: string
          resource_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          resource_id: string
          resource_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          resource_id?: string
          resource_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_private: boolean | null
          max_members: number | null
          module_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          max_members?: number | null
          module_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          max_members?: number | null
          module_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_groups_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "module_completion_stats"
            referencedColumns: ["module_id"]
          },
          {
            foreignKeyName: "study_groups_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_reactions: {
        Row: {
          created_at: string | null
          id: string
          reaction_type: string
          thread_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reaction_type: string
          thread_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reaction_type?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_reactions_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "discussion_activity_stats"
            referencedColumns: ["thread_id"]
          },
          {
            foreignKeyName: "thread_reactions_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "discussion_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_snapshot: {
        Row: {
          created_at: string | null
          engagement_score: number | null
          id: string
          last_login: string | null
          last_partner_interaction: string | null
          last_post: string | null
          lessons_completed: number | null
          logins_count: number | null
          modules_completed: number | null
          posts_count: number | null
          responses_count: number | null
          snapshot_date: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          engagement_score?: number | null
          id?: string
          last_login?: string | null
          last_partner_interaction?: string | null
          last_post?: string | null
          lessons_completed?: number | null
          logins_count?: number | null
          modules_completed?: number | null
          posts_count?: number | null
          responses_count?: number | null
          snapshot_date: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          engagement_score?: number | null
          id?: string
          last_login?: string | null
          last_partner_interaction?: string | null
          last_post?: string | null
          lessons_completed?: number | null
          logins_count?: number | null
          modules_completed?: number | null
          posts_count?: number | null
          responses_count?: number | null
          snapshot_date?: string
          user_id?: string
        }
        Relationships: []
      }
      user_engagement: {
        Row: {
          created_at: string | null
          date: string
          discussions_posted: number | null
          events_attended: number | null
          id: string
          lessons_completed: number | null
          login_count: number | null
          streak_days: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          discussions_posted?: number | null
          events_attended?: number | null
          id?: string
          lessons_completed?: number | null
          login_count?: number | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          discussions_posted?: number | null
          events_attended?: number | null
          id?: string
          lessons_completed?: number | null
          login_count?: number | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_engagement_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_prompts: {
        Row: {
          commitment_prompt: string
          created_at: string | null
          id: string
          main_question: string
          reflection_prompt: string | null
          week_number: number
        }
        Insert: {
          commitment_prompt: string
          created_at?: string | null
          id?: string
          main_question: string
          reflection_prompt?: string | null
          week_number: number
        }
        Update: {
          commitment_prompt?: string
          created_at?: string | null
          id?: string
          main_question?: string
          reflection_prompt?: string | null
          week_number?: number
        }
        Relationships: []
      }
    }
    Views: {
      discussion_activity_stats: {
        Row: {
          created_by_name: string | null
          is_locked: boolean | null
          is_pinned: boolean | null
          last_activity: string | null
          post_count: number | null
          thread_id: string | null
          thread_title: string | null
          unique_participants: number | null
        }
        Relationships: []
      }
      module_completion_stats: {
        Row: {
          completion_percentage: number | null
          module_id: string | null
          module_title: string | null
          users_completed: number | null
          users_started: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_achievement_if_new: {
        Args: { p_achievement_name: string; p_user_id: string }
        Returns: undefined
      }
      check_streak_achievements: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      get_book_comment_count: {
        Args: { book_id_param: string }
        Returns: number
      }
      increment_thread_views: {
        Args: { thread_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
