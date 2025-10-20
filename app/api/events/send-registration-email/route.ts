import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend, EMAIL_CONFIG } from '@/lib/email/resend'
import { EventRegistrationEmail } from '@/lib/email/templates/event-registration-email'
import { generateAllCalendarLinks } from '@/lib/utils/calendar-links'
import { render } from '@react-email/render'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const { eventId } = await request.json()

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Fetch event details
    const { data: event, error: eventError } = await (supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single() as any)

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await (supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single() as any)

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get user email from auth
    const userEmail = user.email || profile.email

    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    // Generate calendar links
    const calendarEvent = {
      title: event.title,
      description: event.description || '',
      location: event.location_type === 'virtual' 
        ? 'Virtual (Zoom)' 
        : event.location_address || 'TBA',
      startTime: event.start_time,
      endTime: event.end_time,
    }

    const calendarLinks = generateAllCalendarLinks(calendarEvent)

    // Send email using Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: userEmail,
      replyTo: EMAIL_CONFIG.replyTo,
      subject: `Registration Confirmed: ${event.title}`,
      react: EventRegistrationEmail({
        participantName: profile.full_name || 'there',
        eventTitle: event.title,
        eventDescription: event.description || undefined,
        eventType: event.event_type,
        startTime: event.start_time,
        endTime: event.end_time,
        locationType: event.location_type,
        locationAddress: event.location_address || undefined,
        zoomLink: event.zoom_link || undefined,
        isRequired: event.is_required,
        googleCalendarLink: calendarLinks.google,
        outlookCalendarLink: calendarLinks.outlook,
        office365CalendarLink: calendarLinks.office365,
        yahooCalendarLink: calendarLinks.yahoo,
      }),
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      emailId: emailData?.id,
      message: 'Registration email sent successfully' 
    })
  } catch (error) {
    console.error('Error in send-registration-email:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

