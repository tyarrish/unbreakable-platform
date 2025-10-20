import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Link,
} from '@react-email/components'

interface EventRegistrationEmailProps {
  participantName: string
  eventTitle: string
  eventDescription?: string
  eventType: string
  startTime: string
  endTime: string
  locationType: string
  locationAddress?: string
  zoomLink?: string
  isRequired: boolean
  googleCalendarLink: string
  outlookCalendarLink: string
  office365CalendarLink: string
  yahooCalendarLink: string
}

export const EventRegistrationEmail = ({
  participantName,
  eventTitle,
  eventDescription,
  eventType,
  startTime,
  endTime,
  locationType,
  locationAddress,
  zoomLink,
  isRequired,
  googleCalendarLink,
  outlookCalendarLink,
  office365CalendarLink,
  yahooCalendarLink,
}: EventRegistrationEmailProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/Los_Angeles',
    })
  }

  const formatTime = (start: string, end: string) => {
    const timeFormat = {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Los_Angeles',
      timeZoneName: 'short',
    } as const
    
    const startTime = new Date(start).toLocaleTimeString('en-US', timeFormat)
    const endTime = new Date(end).toLocaleTimeString('en-US', timeFormat)
    return `${startTime} - ${endTime}`
  }

  return (
    <Html>
      <Head />
      <Preview>You're registered for {eventTitle}</Preview>
      <Body style={{ backgroundColor: '#f4f1e8', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Header */}
          <Section style={{
            background: 'linear-gradient(135deg, #2c3e2d 0%, #1a2e1d 100%)',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '32px',
          }}>
            <Heading style={{
              color: '#d4af37',
              fontSize: '28px',
              fontWeight: '700',
              margin: '0',
            }}>
              Rogue Leadership Training
            </Heading>
            <Text style={{
              color: '#f4f1e8',
              fontSize: '16px',
              margin: '8px 0 0 0',
            }}>
              Event Registration Confirmed
            </Text>
          </Section>

          {/* Content */}
          <Section style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            <Text style={{
              color: '#2c3e2d',
              fontSize: '18px',
              margin: '0 0 24px 0',
            }}>
              Hi {participantName},
            </Text>
            
            <Text style={{
              color: '#64748b',
              fontSize: '16px',
              lineHeight: '1.6',
              margin: '0 0 24px 0',
            }}>
              You're all set! You've successfully registered for the following event:
            </Text>

            {/* Event Details Box */}
            <Section style={{
              background: '#f4f1e8',
              padding: '24px',
              borderRadius: '8px',
              borderLeft: '4px solid #d4af37',
              margin: '0 0 32px 0',
            }}>
              <Heading style={{
                color: '#2c3e2d',
                fontSize: '22px',
                fontWeight: '700',
                margin: '0 0 16px 0',
              }}>
                RLTE - {eventTitle}
              </Heading>

              {isRequired && (
                <Text style={{
                  display: 'inline-block',
                  background: '#dc2626',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  margin: '0 0 16px 0',
                }}>
                  REQUIRED EVENT
                </Text>
              )}

              <Text style={{
                color: '#2c3e2d',
                fontSize: '14px',
                margin: '0',
                lineHeight: '1.8',
              }}>
                <strong>📅 Date:</strong> {formatDate(startTime)}<br />
                <strong>🕒 Time:</strong> {formatTime(startTime, endTime)}<br />
                {locationType === 'virtual' && (
                  <>
                    <strong>📍 Location:</strong> Virtual Event (Zoom)
                  </>
                )}
                {locationType === 'in_person' && locationAddress && (
                  <>
                    <strong>📍 Location:</strong> {locationAddress}
                  </>
                )}
                {locationType === 'hybrid' && (
                  <>
                    <strong>📍 Location:</strong> Hybrid - In Person & Virtual
                  </>
                )}
              </Text>

              {eventDescription && (
                <>
                  <Hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #cbd5e1' }} />
                  <Text style={{
                    color: '#64748b',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    margin: '0',
                  }}>
                    {eventDescription.replace(/<[^>]*>/g, '')}
                  </Text>
                </>
              )}
            </Section>

            {/* Zoom Link for Virtual Events */}
            {(locationType === 'virtual' || locationType === 'hybrid') && zoomLink && (
              <Section style={{
                background: '#dbeafe',
                padding: '20px',
                borderRadius: '8px',
                margin: '0 0 32px 0',
                textAlign: 'center',
              }}>
                <Text style={{
                  color: '#1e3a8a',
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: '0 0 12px 0',
                }}>
                  Virtual Meeting Access
                </Text>
                <Button
                  href={zoomLink}
                  style={{
                    background: '#2563eb',
                    color: 'white',
                    textDecoration: 'none',
                    padding: '12px 32px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'inline-block',
                  }}
                >
                  Join Zoom Meeting
                </Button>
              </Section>
            )}

            {/* Add to Calendar Section */}
            <Section style={{ margin: '32px 0 0 0' }}>
              <Heading style={{
                color: '#2c3e2d',
                fontSize: '18px',
                fontWeight: '700',
                margin: '0 0 16px 0',
                textAlign: 'center',
              }}>
                📅 Add to Your Calendar
              </Heading>
              
              <Text style={{
                color: '#64748b',
                fontSize: '14px',
                textAlign: 'center',
                margin: '0 0 20px 0',
              }}>
                Choose your preferred calendar service:
              </Text>

              {/* Calendar Buttons */}
              <Section style={{ textAlign: 'center' }}>
                <table style={{ margin: '0 auto', borderCollapse: 'separate', borderSpacing: '8px' }}>
                  <tr>
                    <td>
                      <Button
                        href={googleCalendarLink}
                        style={{
                          background: 'white',
                          color: '#2c3e2d',
                          textDecoration: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '14px',
                          border: '2px solid #2c3e2d',
                          display: 'inline-block',
                        }}
                      >
                        Google Calendar
                      </Button>
                    </td>
                    <td>
                      <Button
                        href={outlookCalendarLink}
                        style={{
                          background: 'white',
                          color: '#2c3e2d',
                          textDecoration: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '14px',
                          border: '2px solid #2c3e2d',
                          display: 'inline-block',
                        }}
                      >
                        Outlook
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Button
                        href={office365CalendarLink}
                        style={{
                          background: 'white',
                          color: '#2c3e2d',
                          textDecoration: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '14px',
                          border: '2px solid #2c3e2d',
                          display: 'inline-block',
                        }}
                      >
                        Office 365
                      </Button>
                    </td>
                    <td>
                      <Button
                        href={yahooCalendarLink}
                        style={{
                          background: 'white',
                          color: '#2c3e2d',
                          textDecoration: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '14px',
                          border: '2px solid #2c3e2d',
                          display: 'inline-block',
                        }}
                      >
                        Yahoo
                      </Button>
                    </td>
                  </tr>
                </table>
              </Section>
            </Section>

            <Hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

            <Text style={{
              color: '#64748b',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: '0',
            }}>
              Looking forward to seeing you there! If you have any questions, please don't hesitate to reach out.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={{
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '14px',
            marginTop: '32px',
          }}>
            <Text style={{ margin: '0 0 8px 0' }}>
              Lead from Within. Grow with Others. Impact Your Community.
            </Text>
            <Text style={{ margin: '0' }}>
              © 2025 Rogue Leadership Training Experience. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

