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

  // Group events by module, separate required from optional
  const upcomingEvents = events.filter(e => new Date(e.end_time) >= new Date())
  
  const eventsByModule: { [key: string]: { required: Event[], optional: Event[], order: number } } = {}
  
  upcomingEvents.forEach(event => {
    let moduleKey = 'Upcoming Events'
    let moduleOrder = 999
    
    if ((event as any).module) {
      const module = (event as any).module
      moduleKey = `Month ${module.order_number}: ${module.title}`
      moduleOrder = module.order_number
    }
    
    if (!eventsByModule[moduleKey]) {
      eventsByModule[moduleKey] = { required: [], optional: [], order: moduleOrder }
    }
    
    if (event.is_required) {
      eventsByModule[moduleKey].required.push(event)
    } else {
      eventsByModule[moduleKey].optional.push(event)
    }
  })
  
  const sortedModules = Object.entries(eventsByModule).sort((a, b) => a[1].order - b[1].order)

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
                <div className="text-right">
                  <p className="text-xs text-rogue-slate/70 uppercase tracking-wide mb-1">Upcoming</p>
                  <p className="text-2xl font-bold text-rogue-forest">{totalUpcoming}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-700/70 uppercase tracking-wide mb-1">Registered</p>
                  <p className="text-2xl font-bold text-green-700">{totalRegistered}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-12 max-w-5xl">
          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={<Calendar size={64} />}
              title="No Events Scheduled"
              description="Events and cohort calls will appear here. Stay tuned for upcoming sessions!"
            />
          ) : (
            <div className="space-y-12">
              {sortedModules.map(([moduleName, { required, optional }]) => (
                <div key={moduleName}>
                  {/* Module Header */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-rogue-forest">{moduleName}</h2>
                    <div className="h-1 w-20 bg-rogue-gold mt-2 rounded-full" />
                  </div>

                  {/* Required Events - Large, Prominent */}
                  <div className="space-y-6">
                    {required.map((event) => {
                      const isRegistered = registrations.has(event.id)
                      const isExpanded = expandedEventId === event.id
                      const month = formatDate(event.start_time, { month: 'short' }).toUpperCase()
                      const day = formatDate(event.start_time, { day: 'numeric' })

                      return (
                        <Card 
                          key={event.id}
                          className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                          onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                        >
                          <CardContent className="p-0">
                            <div className="flex gap-6 p-6">
                              {/* Date - Clean Vertical */}
                              <div className="flex-shrink-0">
                                <div className="text-center">
                                  <div className="text-xs font-semibold text-rogue-gold mb-1">{month}</div>
                                  <div className="text-5xl font-bold text-rogue-forest leading-none">{day}</div>
                                </div>
                              </div>

                              {/* Content */}
                              <div className="flex-1">
                                {/* Badges Row */}
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  <Badge className="bg-rogue-forest text-white">Required</Badge>
                                  <Badge variant="outline">{event.event_type === 'cohort_call' ? 'Cohort Call' : event.event_type}</Badge>
                                  {event.location_type === 'in_person' && (
                                    <Badge variant="outline" className="border-rogue-forest/20">
                                      <Building2 className="h-3 w-3 mr-1" />
                                      In-Person
                                    </Badge>
                                  )}
                                  {event.location_type === 'virtual' && (
                                    <Badge variant="outline" className="border-blue-200 text-blue-600">
                                      <Video className="h-3 w-3 mr-1" />
                                      Virtual
                                    </Badge>
                                  )}
                                  {event.location_type === 'hybrid' && (
                                    <Badge variant="outline" className="border-purple-200 text-purple-600">
                                      Hybrid
                                    </Badge>
                                  )}
                                  {isRegistered && (
                                    <Badge className="bg-green-100 text-green-700 ml-auto">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Registered
                                    </Badge>
                                  )}
                                </div>

                                {/* Title */}
                                <h3 className="text-2xl font-bold text-rogue-forest mb-3">{event.title}</h3>

                                {/* Time & Location */}
                                <div className="flex flex-wrap gap-4 text-sm text-rogue-slate mb-4">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {formatEventTime(event.start_time, event.end_time)}
                                  </div>
                                  {event.location_address && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      {event.location_address}
                                    </div>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRegister(event.id)
                                    }}
                                    size="sm"
                                    variant={isRegistered ? 'outline' : 'default'}
                                    className={!isRegistered ? 'bg-rogue-forest hover:bg-rogue-pine' : ''}
                                  >
                                    {isRegistered ? 'Unregister' : 'Register'}
                                  </Button>

                                  {event.zoom_link && isRegistered && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-blue-600 hover:text-blue-700"
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

                            {/* Expanded Content */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 pb-6 pt-2 border-t border-rogue-sage/10 space-y-5">
                                    {/* Description */}
                                    {event.description && (
                                      <div>
                                        <h4 className="text-sm font-semibold text-rogue-forest mb-3">About This Event</h4>
                                        <div 
                                          className="text-sm text-rogue-slate leading-relaxed"
                                          dangerouslySetInnerHTML={{ __html: formatEventDescription(event.description) }}
                                        />
                                      </div>
                                    )}

                                    {/* Presenter Bio */}
                                    {(event as any).presenter_bio && (
                                      <div className="bg-rogue-cream/50 rounded-lg p-4 border border-rogue-sage/10">
                                        <h4 className="text-sm font-semibold text-rogue-forest mb-3 flex items-center gap-2">
                                          <UserCircle className="h-4 w-4" />
                                          About the Presenter
                                        </h4>
                                        <div 
                                          className="text-sm text-rogue-slate leading-relaxed"
                                          dangerouslySetInnerHTML={{ __html: formatEventDescription((event as any).presenter_bio) }}
                                        />
                                      </div>
                                    )}

                                    {/* Additional Info */}
                                    <div className="flex flex-wrap gap-6 text-sm">
                                      {((event as any).attendance_count || (event as any).max_capacity) && (
                                        <div className="flex items-center gap-2 text-rogue-slate">
                                          <Users className="h-4 w-4" />
                                          <span>
                                            {(event as any).attendance_count || 0} registered
                                            {(event as any).max_capacity && ` / ${(event as any).max_capacity} max`}
                                          </span>
                                        </div>
                                      )}

                                      {(event as any).resources_url && (
                                        <a
                                          href={(event as any).resources_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 text-rogue-forest hover:text-rogue-pine transition-colors"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          Event Resources
                                          <ExternalLink className="h-4 w-4" />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Optional Events - Smaller, Indented */}
                  {optional.length > 0 && (
                    <div className="mt-6 ml-8 space-y-3">
                      {optional.map((event) => {
                        const isRegistered = registrations.has(event.id)
                        const isExpanded = expandedEventId === event.id
                        const month = formatDate(event.start_time, { month: 'short' }).toUpperCase()
                        const day = formatDate(event.start_time, { day: 'numeric' })

                        return (
                          <Card 
                            key={event.id}
                            className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                            onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                          >
                            <CardContent className="p-0">
                              <div className="flex gap-4 p-4">
                                {/* Compact Date */}
                                <div className="flex-shrink-0">
                                  <div className="text-center">
                                    <div className="text-xs font-medium text-rogue-gold mb-0.5">{month}</div>
                                    <div className="text-2xl font-bold text-rogue-forest leading-none">{day}</div>
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                    <h4 className="text-lg font-semibold text-rogue-forest">{event.title}</h4>
                                    {isRegistered && (
                                      <Badge className="bg-green-100 text-green-700 flex-shrink-0">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Registered
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-3 text-xs text-rogue-slate mb-3">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatEventTime(event.start_time, event.end_time)}
                                    </div>
                                    {event.location_type === 'virtual' && (
                                      <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
                                        <Video className="h-3 w-3 mr-1" />
                                        Virtual
                                      </Badge>
                                    )}
                                    {event.location_type === 'hybrid' && (
                                      <Badge variant="outline" className="text-xs border-purple-200 text-purple-600">
                                        Hybrid
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant={isRegistered ? 'outline' : 'default'}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleRegister(event.id)
                                      }}
                                      className={!isRegistered ? 'bg-rogue-forest hover:bg-rogue-pine h-8' : 'h-8'}
                                    >
                                      {isRegistered ? 'Unregister' : 'Register'}
                                    </Button>

                                    {event.zoom_link && isRegistered && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-blue-600 hover:text-blue-700 h-8"
                                        asChild
                                        onClick={(e: any) => e.stopPropagation()}
                                      >
                                        <a href={event.zoom_link} target="_blank" rel="noopener noreferrer">
                                          <Video className="h-3 w-3 mr-1" />
                                          Zoom
                                        </a>
                                      </Button>
                                    )}

                                    <button className="ml-auto text-rogue-slate/60 hover:text-rogue-forest transition-colors">
                                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Content */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-4 pb-4 border-t border-rogue-sage/10 pt-4 space-y-4">
                                      {event.description && (
                                        <div>
                                          <h5 className="text-xs font-semibold text-rogue-forest mb-2">About This Event</h5>
                                          <div 
                                            className="text-xs text-rogue-slate leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: formatEventDescription(event.description) }}
                                          />
                                        </div>
                                      )}

                                      {(event as any).presenter_bio && (
                                        <div className="bg-rogue-cream/30 rounded p-3">
                                          <h5 className="text-xs font-semibold text-rogue-forest mb-2 flex items-center gap-1.5">
                                            <UserCircle className="h-3 w-3" />
                                            About the Presenter
                                          </h5>
                                          <div 
                                            className="text-xs text-rogue-slate leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: formatEventDescription((event as any).presenter_bio) }}
                                          />
                                        </div>
                                      )}

                                      {event.location_address && (
                                        <div className="flex items-start gap-2 text-xs text-rogue-slate">
                                          <MapPin className="h-3 w-3 mt-0.5" />
                                          {event.location_address}
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
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
