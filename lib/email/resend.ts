import { Resend } from 'resend'

// Initialize Resend with API key
export const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
export const EMAIL_CONFIG = {
  from: 'Rogue Leadership <noreply@thehivve.com>',
  replyTo: 'info@thehivve.com',
}

