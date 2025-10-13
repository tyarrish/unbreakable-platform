import { PROGRESS_METAPHORS } from '@/lib/constants'

/**
 * Calculate completion percentage
 */
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

/**
 * Get progress metaphor based on percentage
 */
export function getProgressMetaphor(percentage: number) {
  const metaphor = PROGRESS_METAPHORS.find(
    m => percentage >= m.min && percentage < m.max
  )
  return metaphor || PROGRESS_METAPHORS[PROGRESS_METAPHORS.length - 1]
}

/**
 * Format progress for display (e.g., "3 of 8 modules")
 */
export function formatProgressText(completed: number, total: number, unit: string = 'items'): string {
  return `${completed} of ${total} ${unit}`
}

/**
 * Calculate time spent in a readable format
 */
export function formatTimeSpent(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) return `${hours}h`
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Estimate reading time based on word count
 */
export function estimateReadingTime(wordCount: number, wordsPerMinute: number = 200): number {
  return Math.ceil(wordCount / wordsPerMinute)
}

