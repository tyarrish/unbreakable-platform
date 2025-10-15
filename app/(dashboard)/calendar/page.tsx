'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Calendar, Clock, MapPin, Users, Video, Building2, CheckCircle, Sparkles, CalendarDays } from 'lucide-react'
import { getEvents, registerForEvent, unregisterFromEvent, isRegisteredForEvent } from '@/lib/supabase/queries/events'
import { formatDate, formatEventTime } from '@/lib/utils/format-date'
import { toast } from 'sonner'
import type { Event } from '@/types/index.types'

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
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

      const eventsData = await getEvents() as Event[]
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

  // Group events by month and separate required from optional
  const upcomingEvents = events.filter(e => new Date(e.end_time) >= new Date())
  
  // Group by month
  const eventsByMonth: { [key: string]: { required: Event[], optional: Event[] } } = {}
  
  upcomingEvents.forEach(event => {
    const monthKey = formatDate(event.start_time, { month: 'long', year: 'numeric' })
    
    if (!eventsByMonth[monthKey]) {
      eventsByMonth[monthKey] = { required: [], optional: [] }
    }
    
    if (event.is_required) {
      eventsByMonth[monthKey].required.push(event)
    } else {
      eventsByMonth[monthKey].optional.push(event)
    }
  })

  const totalUpcoming = upcomingEvents.length
  const totalRegistered = events.filter(e => registrations.has(e.id)).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
      {/* Header */}
      <div className="bg-white/40 backdrop-blur-sm border-b border-rogue-sage/10">
        <Container>
          <div className="py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-rogue-forest mb-1">Events Calendar</h1>
                <p className="text-rogue-slate">Cohort calls, workshops, and book clubs</p>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-orange-100 text-orange-700 border-0 px-3 py-1.5">
                  {totalUpcoming} Upcoming
                </Badge>
                <Badge className="bg-green-100 text-green-700 border-0 px-3 py-1.5">
                  {totalRegistered} Registered
                </Badge>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8 max-w-5xl mx-auto">
          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={<Calendar size={64} />}
              title="No Events Scheduled"
              description="Events and cohort calls will appear here. Stay tuned for upcoming sessions!"
            />
          ) : (
            <div className="space-y-8">
              {Object.entries(eventsByMonth).map(([month, { required, optional }]) => (
                <div key={month} className="space-y-4">
                  {/* Month Header */}
                  <div className="flex items-center gap-3 sticky top-0 bg-gradient-to-r from-rogue-cream to-transparent py-3 z-10">
                    <CalendarDays className="h-5 w-5 text-rogue-gold" />
                    <h2 className="text-xl font-bold text-rogue-forest">{month}</h2>
                  </div>

                  {/* Required Events - Prominent */}
                  {required.map((event) => {
                    const isRegistered = registrations.has(event.id)
                    
                    return (
                      <Card 
                        key={event.id} 
                        className="border-l-4 border-red-500 shadow-lg hover:shadow-xl transition-all bg-white"
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-red-600 text-white border-0 px-2.5 py-0.5 text-xs">
                                  Required
                                </Badge>
                                <Badge className="bg-rogue-forest text-white border-0 px-2.5 py-0.5 text-xs">
                                  {event.event_type === 'cohort_call' ? 'Cohort Call' : event.event_type}
                                </Badge>
                                {isRegistered && (
                                  <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                                )}
                              </div>

                              <h3 className="font-bold text-xl text-rogue-forest mb-3">{event.title}</h3>

                              <div className="grid sm:grid-cols-3 gap-3 mb-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-rogue-copper" />
                                  <span className="text-rogue-slate">{formatDate(event.start_time, { month: 'short', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-rogue-copper" />
                                  <span className="text-rogue-slate">{formatEventTime(event.start_time, event.end_time)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  {event.location_type === 'virtual' ? (
                                    <><Video className="h-4 w-4 text-blue-600" /><span className="text-rogue-slate">Virtual</span></>
                                  ) : event.location_type === 'in_person' ? (
                                    <><Building2 className="h-4 w-4 text-rogue-forest" /><span className="text-rogue-slate">In-Person</span></>
                                  ) : (
                                    <><MapPin className="h-4 w-4 text-rogue-gold" /><span className="text-rogue-slate">Hybrid</span></>
                                  )}
                                </div>
                              </div>

                              {event.location_address && (
                                <div className="flex items-start gap-2 text-sm text-rogue-slate mb-3">
                                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <span>{event.location_address}</span>
                                </div>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={isRegistered ? 'outline' : 'default'}
                                  onClick={() => handleRegister(event.id)}
                                  className={!isRegistered ? 'bg-red-600 hover:bg-red-700' : ''}
                                >
                                  {isRegistered ? 'Registered ✓' : 'Register'}
                                </Button>
                                {event.zoom_link && isRegistered && (
                                  <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-700" asChild>
                                    <a href={event.zoom_link} target="_blank" rel="noopener noreferrer">
                                      <Video className="h-3 w-3 mr-1" />
                                      Join
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}

                  {/* Optional Events - Indented & Compact */}
                  {optional.length > 0 && (
                    <div className="ml-6 space-y-2">
                      {optional.map((event) => {
                        const isRegistered = registrations.has(event.id)
                        
                        return (
                          <Card 
                            key={event.id} 
                            className="border-l-2 border-rogue-sage/40 shadow-sm hover:shadow-md transition-all bg-white/80"
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-rogue-forest text-sm">{event.title}</h4>
                                    {isRegistered && <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />}
                                  </div>
                                  
                                  <div className="flex items-center gap-3 text-xs text-rogue-slate">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {formatDate(event.start_time, { month: 'short', day: 'numeric' })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatEventTime(event.start_time, event.end_time)}
                                    </span>
                                    <Badge variant="outline" className="px-1.5 py-0 text-xs h-5">
                                      {event.event_type === 'workshop' ? 'Workshop' : 
                                       event.event_type === 'book_club' ? 'Book Club' : 
                                       event.event_type === 'office_hours' ? 'Office Hours' : event.event_type}
                                    </Badge>
                                  </div>
                                </div>

                                <Button
                                  size="sm"
                                  variant={isRegistered ? 'ghost' : 'outline'}
                                  onClick={() => handleRegister(event.id)}
                                  className={`flex-shrink-0 h-7 px-3 text-xs ${isRegistered ? 'text-green-700' : ''}`}
                                >
                                  {isRegistered ? 'Registered' : 'Register'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

