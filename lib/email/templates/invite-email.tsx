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
} from '@react-email/components'

interface InviteEmailProps {
  fullName: string
  inviteUrl: string
  role: string
  invitedBy?: string
}

export const InviteEmail = ({ fullName, inviteUrl, role, invitedBy }: InviteEmailProps) => {
  const roleDescriptions: Record<string, string> = {
    admin: 'Full access to all platform features and user management',
    facilitator: 'Manage content and moderate discussions',
    participant: 'Full access to the 8-month leadership curriculum',
  }

  return (
    <Html>
      <Head />
      <Preview>You're invited to join Rogue Leadership Training Experience</Preview>
      <Body style={{ backgroundColor: '#f4f1e8', padding: '40px 20px' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Header */}
          <Section className="header" style={{
            background: 'linear-gradient(135deg, #2c3e2d 0%, #1a2e1d 100%)',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '40px',
          }}>
            <Heading className="logo" style={{
              color: '#d4af37',
              fontSize: '28px',
              fontWeight: '700',
              margin: '0',
            }}>
              Rogue Leadership Training
            </Heading>
            <Text className="tagline" style={{
              color: '#f4f1e8',
              fontSize: '16px',
              margin: '8px 0 0 0',
            }}>
              Your Journey Begins Here
            </Text>
          </Section>

          {/* Content */}
          <Section className="content" style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            <Heading className="heading" style={{
              color: '#2c3e2d',
              fontSize: '24px',
              fontWeight: '700',
              margin: '0 0 16px 0',
            }}>
              Welcome to the Journey, {fullName}! 🏔️
            </Heading>
            
            <Text className="text" style={{
              color: '#64748b',
              marginBottom: '24px',
            }}>
              You've been invited to join an elite cohort of leaders committed to transformative growth. 
              Over the next 8 months, you'll build unbreakable leadership foundations through Stoic philosophy, 
              interpersonal mastery, and practical application.
            </Text>

            <Section className="role-box" style={{
              background: '#f4f1e8',
              padding: '20px',
              borderRadius: '8px',
              borderLeft: '4px solid #d4af37',
              margin: '24px 0',
            }}>
              <Text className="role-text" style={{
                color: '#2c3e2d',
                fontSize: '14px',
                margin: '0',
              }}>
                <strong>Your Role:</strong> {role.charAt(0).toUpperCase() + role.slice(1)}<br />
                {roleDescriptions[role]}
              </Text>
            </Section>

            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
              <Button
                href={inviteUrl}
                style={{
                  background: 'linear-gradient(135deg, #2c3e2d 0%, #1a2e1d 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '16px 40px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '16px',
                  display: 'inline-block',
                }}
              >
                Accept Invitation & Create Account
              </Button>
            </Section>

            <Text style={{
              color: '#94a3b8',
              fontSize: '14px',
              textAlign: 'center',
              margin: '16px 0 0 0',
            }}>
              This invitation expires in 7 days
            </Text>
          </Section>

          {/* Footer */}
          <Section className="footer" style={{
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '14px',
            marginTop: '40px',
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

