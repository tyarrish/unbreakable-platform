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

// Nature-themed Progress Metaphors
export const PROGRESS_METAPHORS = [
  { min: 0, max: 12.5, label: 'Seedling', icon: '🌱' },
  { min: 12.5, max: 25, label: 'Sprout', icon: '🌿' },
  { min: 25, max: 37.5, label: 'Young Tree', icon: '🌳' },
  { min: 37.5, max: 50, label: 'Growing Forest', icon: '🌲' },
  { min: 50, max: 62.5, label: 'Thriving Woods', icon: '🏞️' },
  { min: 62.5, max: 75, label: 'Deep Forest', icon: '🌲🌲' },
  { min: 75, max: 87.5, label: 'Ancient Grove', icon: '🌳🌲' },
  { min: 87.5, max: 100, label: 'Leadership Summit', icon: '⛰️' },
]

// Event Types
export const EVENT_TYPES = [
  { value: 'cohort_call', label: 'Cohort Call', color: 'rogue-forest' },
  { value: 'workshop', label: 'Workshop', color: 'rogue-gold' },
  { value: 'book_club', label: 'Book Club', color: 'rogue-copper' },
  { value: 'office_hours', label: 'Office Hours', color: 'rogue-sage' },
]

// Reaction Types
export const REACTION_TYPES = [
  { value: 'like', label: 'Like', icon: '👍' },
  { value: 'helpful', label: 'Helpful', icon: '💡' },
  { value: 'insightful', label: 'Insightful', icon: '🌟' },
]

