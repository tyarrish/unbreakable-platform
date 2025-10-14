'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Calendar, Clock, MapPin, Users, ExternalLink, Video, Building2, AlertCircle, CheckCircle, Sparkles, CalendarDays } from 'lucide-react'
import { getEvents, registerForEvent, unregisterFromEvent, isRegisteredForEvent } from '@/lib/supabase/queries/events'
import { formatDate, formatEventTime } from '@/lib/utils/format-date'
import { toast } from 'sonner'
import { EVENT_TYPES, LOCATION_TYPES } from '@/lib/constants'

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

  const upcomingEvents = events.filter(e => new Date(e.end_time) >= new Date())
  const pastEvents = events.filter(e => new Date(e.end_time) < new Date())

  return (
    <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
      {/* Subtle header background */}
      <div className="bg-white/40 backdrop-blur-sm border-b border-rogue-sage/10">
        <Container>
          <div className="py-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-rogue-forest mb-2">Events Calendar</h1>
                <p className="text-lg text-rogue-slate">
                  Cohort calls, workshops, and book clubs
                </p>
              </div>
              <div className="flex gap-3">
                <Badge className="bg-rogue-copper/10 text-rogue-copper border-0 px-4 py-2">
                  {upcomingEvents.length} Upcoming
                </Badge>
                <Badge className="bg-green-100 text-green-700 border-0 px-4 py-2">
                  {events.filter(e => registrations.has(e.id)).length} Registered
                </Badge>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          {events.length === 0 ? (
            <Card className="border-0 shadow-xl">
              <EmptyState
                icon={<Calendar size={64} />}
                title="No Events Scheduled"
                description="Events and cohort calls will appear here. Stay tuned for upcoming sessions!"
              />
            </Card>
          ) : (
            <div className="space-y-12">
              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-rogue-copper/10 rounded-lg">
                      <Sparkles className="h-5 w-5 text-rogue-copper" />
                    </div>
                    <h2 className="text-3xl font-bold text-rogue-forest">Upcoming Events</h2>
                  </div>
                  
                  <div className="grid gap-6">
                    {upcomingEvents.map((event) => {
                      const eventType = EVENT_TYPES.find(t => t.value === event.event_type)
                      const locationType = LOCATION_TYPES.find(l => l.value === event.location_type)
                      const isRegistered = registrations.has(event.id)
                      const attendeeCount = event.attendance?.[0]?.count || 0
                      const isCapacityReached = event.max_attendees && attendeeCount >= event.max_attendees

                      return (
                        <Card key={event.id} className="border-0 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-white to-rogue-copper/5">
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                  <Badge className={`bg-${eventType?.color || 'rogue-copper'} text-white border-0`}>
                                    {eventType?.label || event.event_type}
                                  </Badge>
                                  {event.is_required ? (
                                    <Badge className="bg-red-600 text-white flex items-center gap-1 border-0">
                                      <AlertCircle size={12} />
                                      Required
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                      <CheckCircle size={12} />
                                      Optional
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    {locationType?.icon} {locationType?.label}
                                  </Badge>
                                  {isCapacityReached && !isRegistered && (
                                    <Badge className="bg-red-600 text-white border-0">Full</Badge>
                                  )}
                                  {event.module && (
                                    <Badge variant="outline">
                                      Module {event.module.order_number}
                                    </Badge>
                                  )}
                                </div>
                                <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
                                {event.description && (
                                  <CardDescription className="text-base leading-relaxed">{event.description}</CardDescription>
                                )}
                              </div>
                              {isRegistered && (
                                <div className="ml-4 p-3 bg-green-50 rounded-full">
                                  <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                              )}
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="flex items-center gap-3 p-3 bg-rogue-sage/5 rounded-lg">
                                <div className="p-2 bg-rogue-forest/10 rounded-lg">
                                  <Calendar size={16} className="text-rogue-forest" />
                                </div>
                                <div>
                                  <div className="text-xs text-rogue-slate">Date</div>
                                  <div className="font-medium text-rogue-forest">{formatDate(event.start_time)}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 bg-rogue-sage/5 rounded-lg">
                                <div className="p-2 bg-rogue-forest/10 rounded-lg">
                                  <Clock size={16} className="text-rogue-forest" />
                                </div>
                                <div>
                                  <div className="text-xs text-rogue-slate">Time</div>
                                  <div className="font-medium text-rogue-forest">{formatEventTime(event.start_time, event.end_time)}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 bg-rogue-sage/5 rounded-lg">
                                <div className="p-2 bg-rogue-forest/10 rounded-lg">
                                  <Users size={16} className="text-rogue-forest" />
                                </div>
                                <div>
                                  <div className="text-xs text-rogue-slate">Attendees</div>
                                  <div className="font-medium text-rogue-forest">
                                    {attendeeCount}{event.max_attendees && ` / ${event.max_attendees}`}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Location Details */}
                            {event.location_type === 'virtual' && event.zoom_link && (
                              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <Video size={20} className="text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">Virtual event via Zoom</span>
                              </div>
                            )}

                            {event.location_type === 'in_person' && event.location_address && (
                              <div className="flex items-start gap-3 p-4 bg-rogue-sage/10 rounded-lg">
                                <Building2 size={20} className="text-rogue-forest mt-0.5" />
                                <div>
                                  <div className="font-medium text-rogue-forest mb-1">Location</div>
                                  <div className="text-sm text-rogue-slate">{event.location_address}</div>
                                </div>
                              </div>
                            )}

                            {event.location_type === 'hybrid' && (
                              <div className="space-y-3 p-4 bg-gradient-to-br from-rogue-sage/10 to-blue-50 rounded-lg">
                                <div className="font-medium text-rogue-forest flex items-center gap-2">
                                  <MapPin size={18} />
                                  Hybrid Event - Choose Your Format
                                </div>
                                {event.location_address && (
                                  <div className="flex items-start gap-2 pl-6 text-sm">
                                    <Building2 size={14} className="text-rogue-slate mt-0.5" />
                                    <span className="text-rogue-slate">{event.location_address}</span>
                                  </div>
                                )}
                                {event.zoom_link && (
                                  <div className="flex items-center gap-2 pl-6 text-sm">
                                    <Video size={14} className="text-rogue-slate" />
                                    <span className="text-rogue-slate">Virtual option available</span>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex gap-3">
                              <Button
                                size="lg"
                                variant={isRegistered ? 'outline' : 'default'}
                                onClick={() => handleRegister(event.id)}
                                disabled={isCapacityReached && !isRegistered}
                                className={isRegistered ? '' : 'bg-gradient-to-r from-rogue-copper to-rogue-terracotta hover:from-rogue-terracotta hover:to-rogue-copper'}
                              >
                                {isRegistered ? (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Registered
                                  </>
                                ) : isCapacityReached ? (
                                  'Full'
                                ) : (
                                  <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Register Now
                                  </>
                                )}
                              </Button>
                              {event.zoom_link && isRegistered && (
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                                  <a href={event.zoom_link} target="_blank" rel="noopener noreferrer">
                                    <Video size={16} className="mr-2" />
                                    Join Zoom
                                    <ExternalLink size={16} className="ml-2" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-1 w-12 bg-rogue-slate/30 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-rogue-slate">Past Events</h2>
                    <Badge variant="outline" className="ml-auto">{pastEvents.length}</Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {pastEvents.slice(0, 6).map((event) => (
                      <Card key={event.id} className="border-rogue-slate/20 opacity-75">
                        <CardContent className="pt-5">
                          <h3 className="font-medium text-rogue-slate mb-2">{event.title}</h3>
                          <div className="text-sm text-rogue-slate/70">
                            {formatDate(event.start_time)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
