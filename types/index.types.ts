// User types
export type UserRole = 'admin' | 'facilitator' | 'participant'

export interface User {
  id: string
  email: string
  full_name?: string
  role: UserRole
  avatar_url?: string
  bio?: string
  learning_preferences?: Record<string, any>
  partner_id?: string
  created_at: string
  updated_at: string
}

// Module types
export type LessonStatus = 'not_started' | 'in_progress' | 'completed'

export interface Module {
  id: string
  title: string
  description?: string
  order_number: number
  release_date?: string
  is_published: boolean
  cover_image_url?: string
  created_at: string
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  content?: any // JSONB for rich text
  order_number: number
  duration_minutes?: number
  video_url?: string
  video_duration?: number
  video_thumbnail_url?: string
  created_at: string
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  status: LessonStatus
  started_at?: string
  completed_at?: string
  time_spent_minutes: number
  video_watch_percentage?: number
  resources_downloaded?: string[]
  reflection_word_count?: number
}

// Discussion types
export interface DiscussionThread {
  id: string
  module_id?: string
  created_by: string
  title: string
  is_pinned: boolean
  is_locked: boolean
  created_at: string
  updated_at: string
}

export interface DiscussionPost {
  id: string
  thread_id: string
  parent_post_id?: string
  author_id: string
  content: string
  mentions?: string[]
  is_edited: boolean
  created_at: string
  updated_at: string
}

// Event types
export type EventType = 'cohort_call' | 'workshop' | 'book_club' | 'office_hours'
export type AttendanceStatus = 'registered' | 'attended' | 'missed'
export type LocationType = 'in_person' | 'virtual' | 'hybrid'

export interface Event {
  id: string
  title: string
  description?: string
  event_type: EventType
  start_time: string
  end_time: string
  is_required: boolean
  location_type: LocationType
  location_address?: string
  module_id?: string
  zoom_link?: string
  zoom_meeting_id?: string
  created_by: string
  max_attendees?: number
  created_at: string
  updated_at: string
}

// Book types
export type ReadingStatus = 'want_to_read' | 'reading' | 'finished'

export interface Book {
  id: string
  title: string
  author: string
  cover_image_url?: string
  description?: string
  isbn?: string
  amazon_link?: string
  goodreads_link?: string
  is_featured: boolean
  assigned_month?: number
  reasoning?: string
  key_takeaways?: string[]
  created_at: string
}

// Capstone types
export type CapstoneStatus = 'planning' | 'in_progress' | 'submitted' | 'completed'

export interface CapstoneProject {
  id: string
  user_id: string
  title?: string
  description?: string
  milestones?: any[] // JSONB array
  submitted_at?: string
  feedback?: string
  status: CapstoneStatus
  created_at: string
  updated_at: string
}

