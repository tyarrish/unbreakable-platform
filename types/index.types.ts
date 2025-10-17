// User types
export type UserRole = 'admin' | 'facilitator' | 'participant'

export interface User {
  id: string
  email: string
  full_name?: string
  role: UserRole // Deprecated - use roles instead
  roles: UserRole[] // Array to support multiple roles
  avatar_url?: string
  bio?: string
  learning_preferences?: Record<string, any>
  partner_id?: string
  employer?: string
  current_role?: string
  food_preferences?: string
  allergies?: string
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
  reflection?: string
  reflection_word_count?: number
}

// Discussion & Conversation types
export type ConversationType = 'public_discussion' | 'direct_message' | 'group_chat'

export interface DiscussionThread {
  id: string
  module_id?: string
  created_by: string
  title: string
  conversation_type: ConversationType
  conversation_name?: string
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

// Messaging types (extends discussions)
export interface ConversationMember {
  id: string
  thread_id: string
  user_id: string
  last_read_at?: string
  is_archived: boolean
  is_muted: boolean
  joined_at: string
  created_at: string
}

export interface Conversation extends DiscussionThread {
  members?: ConversationMember[]
  participants?: User[]
  last_message?: DiscussionPost & {
    author?: User
  }
  unread_count?: number
  post_count?: number
}

// Event types
export type EventType = 'main_session' | 'workshop' | 'guest_speaker' | 'book_club' | 'panel_discussion' | 'office_hours' | 'fireside_chat' | 'networking_event' | 'celebration'
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
export type BookSubmissionStatus = 'pending' | 'approved' | 'rejected'

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

export interface BookSubmission {
  id: string
  submitted_by: string
  title: string
  author: string
  isbn?: string
  amazon_link?: string
  description?: string
  reason_for_recommendation: string
  category?: string
  status: BookSubmissionStatus
  reviewed_by?: string
  reviewed_at?: string
  review_notes?: string
  created_at: string
  updated_at: string
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

