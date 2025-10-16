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
import { Calendar, Clock, MapPin, Users, Video, Building2, CheckCircle, ChevronDown, ChevronUp, UserCircle, ExternalLink } from 'lucide-react'
import { getEvents, registerForEvent, unregisterFromEvent, isRegisteredForEvent } from '@/lib/supabase/queries/events'
import { formatDate, formatEventTime } from '@/lib/utils/format-date'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import type { Event } from '@/types/index.types'

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [registrations, setRegistrations] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
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

  // Format event description - handle both plain text and HTML
  function formatEventDescription(description: string): string {
    if (description.includes('<p>') || description.includes('<div>')) {
      return description
    }

    let formatted = description
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-rogue-forest">$1</strong>')
    formatted = formatted.replace(/\n/g, '<br/>')
    formatted = formatted.replace(/- (.+?)(<br\/>|$)/g, '<div class="flex gap-2 mb-1"><span class="text-rogue-gold">•</span><span>$1</span></div>')
    
    return `<div>${formatted}</div>`
  }

  if (isLoading) {
    return <PageLoader />
  }

  // Group events by module
  const upcomingEvents = events.filter(e => new Date(e.end_time) >= new Date())
  
  const eventsByModule: { [key: string]: { events: Event[], order: number } } = {}
  
  upcomingEvents.forEach(event => {
    let moduleKey = 'Upcoming Events'
    let moduleOrder = 999
    
    if ((event as any).module) {
      const module = (event as any).module
      moduleKey = `Month ${module.order_number}: ${module.title}`
      moduleOrder = module.order_number
    }
    
    if (!eventsByModule[moduleKey]) {
      eventsByModule[moduleKey] = { events: [], order: moduleOrder }
    }
    
    eventsByModule[moduleKey].events.push(event)
  })
  
  // Sort by module order, then by date within module
  const sortedModules = Object.entries(eventsByModule)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([name, data]) => ({
      name,
      events: data.events.sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
    }))

  const totalUpcoming = upcomingEvents.length
  const totalRegistered = events.filter(e => registrations.has(e.id)).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-rogue-sage/20">
        <Container>
          <div className="py-8">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold text-rogue-forest mb-2">Events</h1>
                <p className="text-lg text-rogue-slate">Your cohort calendar</p>
              </div>
              <div className="flex gap-3">
                <div className="px-4 py-2 bg-rogue-cream rounded-lg border border-rogue-sage/20">
                  <p className="text-xs text-rogue-slate/70 uppercase tracking-wide">Upcoming</p>
                  <p className="text-2xl font-bold text-rogue-forest">{totalUpcoming}</p>
                </div>
                <div className="px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-700/70 uppercase tracking-wide">Registered</p>
                  <p className="text-2xl font-bold text-green-700">{totalRegistered}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-12 max-w-4xl">
          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={<Calendar size={64} />}
              title="No Events Scheduled"
              description="Events and cohort calls will appear here. Stay tuned for upcoming sessions!"
            />
          ) : (
            <div className="space-y-12">
              {sortedModules.map(({ name, events: moduleEvents }) => (
                <div key={name}>
                  {/* Module Header - Clean */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-rogue-forest">{name}</h2>
                    <div className="h-0.5 w-16 bg-rogue-gold mt-2 rounded-full" />
                  </div>

                  {/* Events Timeline */}
                  <div className="space-y-4">
                    {moduleEvents.map((event) => {
                      const isRegistered = registrations.has(event.id)
                      const isExpanded = expandedEventId === event.id

                      return (
                        <EventCard
                          key={event.id}
                          event={event}
                          isRegistered={isRegistered}
                          isExpanded={isExpanded}
                          onToggleExpand={() => setExpandedEventId(isExpanded ? null : event.id)}
                          onRegister={() => handleRegister(event.id)}
                          formatDescription={formatEventDescription}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

interface EventCardProps {
  event: Event
  isRegistered: boolean
  isExpanded: boolean
  onToggleExpand: () => void
  onRegister: () => void
  formatDescription: (desc: string) => string
}

function EventCard({
  event,
  isRegistered,
  isExpanded,
  onToggleExpand,
  onRegister,
  formatDescription,
}: EventCardProps) {
  const eventDate = new Date(event.start_time)
  const month = formatDate(event.start_time, { month: 'short' }).toUpperCase()
  const day = formatDate(event.start_time, { day: 'numeric' })

  return (
    <Card 
      className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer bg-white"
      onClick={onToggleExpand}
    >
      <CardContent className="p-0">
        {/* Main Content - Always Visible */}
        <div className="flex items-start gap-6 p-6">
          {/* Date Marker - Timeline Style */}
          <div className="flex-shrink-0 text-center">
            <div className="w-16">
              <div className="text-xs font-semibold text-rogue-gold/70 mb-0.5">{month}</div>
              <div className="text-4xl font-bold text-rogue-forest leading-none">{day}</div>
              <div className="mt-2 h-0.5 w-full bg-gradient-to-r from-rogue-gold/50 to-transparent rounded-full" />
            </div>
          </div>

          {/* Event Info */}
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {event.is_required && (
                <Badge className="bg-rogue-forest text-white border-0 text-xs">
                  Required
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {event.event_type === 'cohort_call' ? 'Cohort Call' : 
                 event.event_type === 'workshop' ? 'Workshop' :
                 event.event_type === 'book_club' ? 'Book Club' : 'Event'}
              </Badge>
              {event.location_type === 'virtual' && (
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                  <Video className="h-3 w-3 mr-1" />
                  Virtual
                </Badge>
              )}
              {event.location_type === 'in_person' && (
                <Badge variant="outline" className="text-xs text-rogue-forest border-rogue-forest/20">
                  <Building2 className="h-3 w-3 mr-1" />
                  In-Person
                </Badge>
              )}
              {event.location_type === 'hybrid' && (
                <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">
                  Hybrid
                </Badge>
              )}
              {isRegistered && (
                <Badge className="bg-green-100 text-green-700 border-0 text-xs ml-auto">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Registered
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-rogue-forest mb-2 group-hover:text-rogue-pine transition-colors">
              {event.title}
            </h3>

            {/* Time & Location - Compact */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-rogue-slate mb-4">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{formatEventTime(event.start_time, event.end_time)}</span>
              </div>
              {event.location_address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate max-w-xs">{event.location_address}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onRegister()
                }}
                variant={isRegistered ? 'outline' : 'default'}
                className={isRegistered ? '' : 'bg-rogue-forest hover:bg-rogue-pine'}
              >
                {isRegistered ? 'Unregister' : 'Register'}
              </Button>

              {event.zoom_link && isRegistered && (
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  onClick={(e: any) => e.stopPropagation()}
                >
                  <a href={event.zoom_link} target="_blank" rel="noopener noreferrer">
                    <Video className="h-4 w-4 mr-2" />
                    Join Zoom
                  </a>
                </Button>
              )}

              <button className="ml-auto text-rogue-slate/60 hover:text-rogue-forest transition-colors">
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 border-t border-rogue-sage/10 pt-6 space-y-6">
                {/* Description */}
                {event.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-rogue-forest uppercase tracking-wide mb-3">
                      About This Event
                    </h4>
                    <div 
                      className="text-sm text-rogue-slate leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: formatDescription(event.description) }}
                    />
                  </div>
                )}

                {/* Presenter Bio */}
                {(event as any).presenter_bio && (
                  <div className="bg-rogue-sage/5 rounded-xl p-5 border border-rogue-sage/10">
                    <h4 className="text-sm font-semibold text-rogue-forest uppercase tracking-wide mb-3 flex items-center gap-2">
                      <UserCircle className="h-4 w-4" />
                      About the Presenter
                    </h4>
                    <div 
                      className="text-sm text-rogue-slate leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: formatDescription((event as any).presenter_bio) }}
                    />
                  </div>
                )}

                {/* Additional Details Grid */}
                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-rogue-sage/10">
                  {/* Attendance */}
                  {((event as any).attendance_count || (event as any).max_capacity) && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-rogue-sage/10 rounded-lg">
                        <Users className="h-4 w-4 text-rogue-forest" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-rogue-slate/70 uppercase tracking-wide mb-1">
                          Attendance
                        </p>
                        <p className="text-sm font-semibold text-rogue-forest">
                          {(event as any).attendance_count || 0} registered
                          {(event as any).max_capacity && ` / ${(event as any).max_capacity} max`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Meeting Notes */}
                  {(event as any).meeting_notes && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-rogue-sage/10 rounded-lg">
                        <Calendar className="h-4 w-4 text-rogue-forest" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-rogue-slate/70 uppercase tracking-wide mb-1">
                          Notes
                        </p>
                        <p className="text-sm text-rogue-slate line-clamp-2">
                          {(event as any).meeting_notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Resources Link */}
                {(event as any).resources_url && (
                  <div>
                    <a
                      href={(event as any).resources_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-rogue-forest hover:text-rogue-pine transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Event Resources
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
