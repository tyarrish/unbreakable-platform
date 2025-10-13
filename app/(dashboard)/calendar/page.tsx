'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Calendar, Clock, MapPin, Users, ExternalLink } from 'lucide-react'
import { getEvents, registerForEvent, unregisterFromEvent, isRegisteredForEvent } from '@/lib/supabase/queries/events'
import { formatDate, formatEventTime } from '@/lib/utils/format-date'
import { toast } from 'sonner'
import { EVENT_TYPES } from '@/lib/constants'

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([])
  const [registrations, setRegistrations] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }
      setUserId(user.id)

      const eventsData = await getEvents()
      setEvents(eventsData)

      // Check registrations
      const regPromises = eventsData.map(event => 
        isRegisteredForEvent(event.id, user.id)
      )
      const regResults = await Promise.all(regPromises)
      
      const newRegs = new Set<string>()
      regResults.forEach((isReg, index) => {
        if (isReg) {
          newRegs.add(eventsData[index].id)
        }
      })
      setRegistrations(newRegs)
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Failed to load events')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRegister(eventId: string) {
    if (!userId) return

    try {
      if (registrations.has(eventId)) {
        await unregisterFromEvent(eventId, userId)
        setRegistrations(prev => {
          const next = new Set(prev)
          next.delete(eventId)
          return next
        })
        toast.success('Unregistered from event')
      } else {
        await registerForEvent(eventId, userId)
        setRegistrations(prev => new Set(prev).add(eventId))
        toast.success('Registered for event!')
      }
    } catch (error) {
      console.error('Error toggling registration:', error)
      toast.error('Failed to update registration')
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          heading="Events Calendar"
          description="Cohort calls, workshops, and book clubs"
        />

        {events.length === 0 ? (
          <EmptyState
            icon={<Calendar size={64} />}
            title="No Events Scheduled"
            description="Events and cohort calls will appear here. Stay tuned for upcoming sessions!"
          />
        ) : (
          <div className="grid gap-6">
            {events.map((event) => {
              const eventType = EVENT_TYPES.find(t => t.value === event.event_type)
              const isRegistered = registrations.has(event.id)
              const attendeeCount = event.attendance?.[0]?.count || 0
              const isPast = new Date(event.end_time) < new Date()

              return (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`bg-${eventType?.color || 'rogue-forest'} text-white`}>
                            {eventType?.label || event.event_type}
                          </Badge>
                          {isPast && <Badge variant="secondary">Past</Badge>}
                        </div>
                        <CardTitle>{event.title}</CardTitle>
                        {event.description && (
                          <CardDescription className="mt-2">{event.description}</CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-rogue-slate">
                        <Calendar size={16} />
                        <span>{formatDate(event.start_time)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-rogue-slate">
                        <Clock size={16} />
                        <span>{formatEventTime(event.start_time, event.end_time)}</span>
                      </div>
                      {attendeeCount > 0 && (
                        <div className="flex items-center gap-2 text-rogue-slate">
                          <Users size={16} />
                          <span>{attendeeCount} registered</span>
                        </div>
                      )}
                      {event.zoom_link && (
                        <a
                          href={event.zoom_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-rogue-forest hover:text-rogue-pine"
                        >
                          <MapPin size={16} />
                          <span>Join Zoom</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant={isRegistered ? 'outline' : 'default'}
                        onClick={() => handleRegister(event.id)}
                        disabled={isPast}
                      >
                        {isRegistered ? 'Unregister' : 'Register'}
                      </Button>
                      {event.zoom_link && isRegistered && (
                        <Button variant="gold" asChild>
                          <a href={event.zoom_link} target="_blank" rel="noopener noreferrer">
                            Join Zoom
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </Container>
    </div>
  )
}

