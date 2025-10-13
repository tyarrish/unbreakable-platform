/**
 * Format a date string or Date object to a readable format
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj)
}

/**
 * Format a date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

/**
 * Format time for event display
 */
export function formatEventTime(startTime: string, endTime: string): string {
  const start = new Date(startTime)
  const end = new Date(endTime)
  
  const timeFormat: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }
  
  return `${start.toLocaleTimeString('en-US', timeFormat)} - ${end.toLocaleTimeString('en-US', timeFormat)}`
}

/**
 * Check if a date is in the past
 */
export function isPast(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.getTime() < Date.now()
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: string | Date): boolean {
  return !isPast(date)
}

/**
 * Get the week number for partner check-ins
 */
export function getWeekNumber(startDate: string | Date, currentDate?: string | Date): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const current = currentDate 
    ? (typeof currentDate === 'string' ? new Date(currentDate) : currentDate)
    : new Date()
  
  const diffInMs = current.getTime() - start.getTime()
  const diffInWeeks = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7))
  
  return diffInWeeks + 1
}

