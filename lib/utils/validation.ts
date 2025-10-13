import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES, ALLOWED_DOCUMENT_TYPES } from '@/lib/constants'

export { ALLOWED_DOCUMENT_TYPES, ALLOWED_IMAGE_TYPES }

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSize: number = MAX_FILE_SIZE): boolean {
  return file.size <= maxSize
}

/**
 * Validate image file type
 */
export function isValidImageType(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.type)
}

/**
 * Validate document file type
 */
export function isValidDocumentType(file: File): boolean {
  return ALLOWED_DOCUMENT_TYPES.includes(file.type)
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  allowedTypes: string[],
  maxSize: number = MAX_FILE_SIZE
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    }
  }
  
  if (!isValidFileSize(file, maxSize)) {
    return {
      valid: false,
      error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`,
    }
  }
  
  return { valid: true }
}

/**
 * Sanitize user input (basic HTML escaping)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate Zoom link format
 */
export function isValidZoomLink(url: string): boolean {
  return isValidUrl(url) && url.includes('zoom.us')
}

