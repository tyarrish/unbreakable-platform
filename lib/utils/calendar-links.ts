/**
 * Generate calendar links for various calendar services
 * All times are in Pacific timezone (America/Los_Angeles)
 */

interface CalendarEvent {
  title: string
  description?: string
  location?: string
  startTime: string // ISO 8601 format
  endTime: string // ISO 8601 format
}

/**
 * Convert date to format required by calendar services
 * Note: Calendar services expect UTC time in the URL, but we display Pacific time to users
 */
function formatDateForCalendar(date: string): string {
  return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

/**
 * Generate Google Calendar link
 */
export function generateGoogleCalendarLink(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description || '',
    location: event.location || '',
    dates: `${formatDateForCalendar(event.startTime)}/${formatDateForCalendar(event.endTime)}`,
  })
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generate Outlook Calendar link
 */
export function generateOutlookCalendarLink(event: CalendarEvent): string {
  const params = new URLSearchParams({
    subject: event.title,
    body: event.description || '',
    location: event.location || '',
    startdt: new Date(event.startTime).toISOString(),
    enddt: new Date(event.endTime).toISOString(),
    path: '/calendar/action/compose',
    rru: 'addevent',
  })
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

/**
 * Generate Office 365 Calendar link
 */
export function generateOffice365CalendarLink(event: CalendarEvent): string {
  const params = new URLSearchParams({
    subject: event.title,
    body: event.description || '',
    location: event.location || '',
    startdt: new Date(event.startTime).toISOString(),
    enddt: new Date(event.endTime).toISOString(),
    path: '/calendar/action/compose',
    rru: 'addevent',
  })
  
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`
}

/**
 * Generate Yahoo Calendar link
 */
export function generateYahooCalendarLink(event: CalendarEvent): string {
  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    desc: event.description || '',
    in_loc: event.location || '',
    st: formatDateForCalendar(event.startTime),
    et: formatDateForCalendar(event.endTime),
  })
  
  return `https://calendar.yahoo.com/?${params.toString()}`
}

/**
 * Generate ICS file content for Apple Calendar and others
 */
export function generateICSContent(event: CalendarEvent): string {
  const startDate = formatDateForCalendar(event.startTime)
  const endDate = formatDateForCalendar(event.endTime)
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  
  // Escape special characters in ICS format
  const escapeICS = (text: string) => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
  }
  
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rogue Leadership//Event Registration//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `DTSTAMP:${timestamp}`,
    `UID:${timestamp}@rogueleadership.com`,
    `SUMMARY:${escapeICS(event.title)}`,
    event.description ? `DESCRIPTION:${escapeICS(event.description)}` : '',
    event.location ? `LOCATION:${escapeICS(event.location)}` : '',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n')
}

/**
 * Generate all calendar links for an event
 */
export function generateAllCalendarLinks(event: CalendarEvent) {
  return {
    google: generateGoogleCalendarLink(event),
    outlook: generateOutlookCalendarLink(event),
    office365: generateOffice365CalendarLink(event),
    yahoo: generateYahooCalendarLink(event),
    ics: generateICSContent(event),
  }
}

