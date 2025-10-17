// App Constants
export const APP_NAME = 'Rogue Leadership Training Experience'
export const APP_SHORT_NAME = 'RLTE'

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  FACILITATOR: 'facilitator',
  PARTICIPANT: 'participant',
} as const

// Module Constants
export const TOTAL_MODULES = 8
export const MODULE_DURATION_MONTHS = 8

// File Upload Constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const DISCUSSION_PAGE_SIZE = 50

// Success Metrics (Target percentages)
export const TARGET_LOGIN_RATE = 0.9 // 90%
export const TARGET_COMPLETION_RATE = 0.8 // 80%
export const TARGET_ENGAGEMENT_RATE = 0.75 // 75%

// Leadership Journey Progress Metaphors
export const PROGRESS_METAPHORS = [
  { min: 0, max: 12.5, label: 'Base Camp', icon: '🏕️' },
  { min: 12.5, max: 25, label: 'Trailhead', icon: '🥾' },
  { min: 25, max: 37.5, label: 'Ascending', icon: '⛰️' },
  { min: 37.5, max: 50, label: 'Steady Climb', icon: '🧗' },
  { min: 50, max: 62.5, label: 'Ridge Line', icon: '🏔️' },
  { min: 62.5, max: 75, label: 'High Ground', icon: '⛰️' },
  { min: 75, max: 87.5, label: 'Summit Push', icon: '🎯' },
  { min: 87.5, max: 100, label: 'Leadership Summit', icon: '🏆' },
]

// Event Types
export const EVENT_TYPES = [
  { value: 'main_session', label: 'Main Session', color: 'rogue-forest' },
  { value: 'workshop', label: 'Workshop', color: 'rogue-gold' },
  { value: 'guest_speaker', label: 'Guest Speaker', color: 'rogue-copper' },
  { value: 'book_club', label: 'Book Club', color: 'rogue-sage' },
  { value: 'panel_discussion', label: 'Panel Discussion', color: 'rogue-pine' },
  { value: 'office_hours', label: 'Office Hours', color: 'rogue-slate' },
  { value: 'fireside_chat', label: 'Fireside Chat', color: 'rogue-gold-light' },
  { value: 'networking_event', label: 'Networking Event', color: 'rogue-forest' },
  { value: 'celebration', label: 'Celebration', color: 'rogue-gold' },
]

// Event Location Types
export const LOCATION_TYPES = [
  { value: 'virtual', label: 'Virtual (Online)', icon: '💻' },
  { value: 'in_person', label: 'In-Person', icon: '📍' },
  { value: 'hybrid', label: 'Hybrid', icon: '🔗' },
]

// Reaction Types
export const REACTION_TYPES = [
  { value: 'like', label: 'Like', icon: '👍' },
  { value: 'helpful', label: 'Helpful', icon: '💡' },
  { value: 'insightful', label: 'Insightful', icon: '🌟' },
]

