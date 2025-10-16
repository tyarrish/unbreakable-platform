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
import { getMonthColorFromString } from '@/lib/utils/month-colors'
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

      const regPromises = eventsData.map(event => isRegisteredForEvent(event.id, user.id))
      const regResults = await Promise.all(regPromises)
      
      const newRegs = new Set<string>()
      regResults.forEach((isReg, index) => {
        if (isReg) newRegs.add(eventsData[index].id)
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
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-xs text-rogue-slate/60 uppercase mb-1">Upcoming</p>
                  <p className="text-2xl font-bold text-rogue-forest">{totalUpcoming}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-600/60 uppercase mb-1">Registered</p>
                  <p className="text-2xl font-bold text-green-600">{totalRegistered}</p>
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
              description="Events and cohort calls will appear here."
            />
          ) : (
            <div className="space-y-12">
              {sortedModules.map(([moduleName, { required, optional }]) => {
                const moduleColor = getMonthColorFromString(moduleName)
                
                return (
                <div key={moduleName}>
                  {/* Module Header - Color Coded */}
                  <div className="mb-6">
                    <h2 className={`text-xl font-bold ${moduleColor.text}`}>{moduleName}</h2>
                    <div className={`h-0.5 w-12 ${moduleColor.bg} mt-2`} />
                  </div>

                  {/* Required Events - Prominent */}
                  <div className="space-y-4">
                    {required.map((event) => {
                      const isRegistered = registrations.has(event.id)
                      const isExpanded = expandedEventId === event.id

                      return (
                        <Card 
                          key={event.id}
                          className="border-l-4 border-rogue-forest shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                          onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                        >
                          <CardContent className="p-6">
                            {/* Top Row - Badges & Status */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                              <Badge className="text-xs font-medium bg-rogue-forest text-white">
                                Required
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {formatDate(event.start_time, { month: 'short', day: 'numeric' })}
                              </Badge>
                              {event.location_type === 'virtual' && (
                                <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
                                  <Video className="h-3 w-3 mr-1" />
                                  Virtual
                                </Badge>
                              )}
                              {event.location_type === 'in_person' && (
                                <Badge variant="outline" className="text-xs">
                                  <Building2 className="h-3 w-3 mr-1" />
                                  In-Person
                                </Badge>
                              )}
                              {event.location_type === 'hybrid' && (
                                <Badge variant="outline" className="text-xs border-purple-200 text-purple-600">
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

                            {/* Title - Hero */}
                            <h3 className="text-2xl font-bold text-rogue-forest mb-4">{event.title}</h3>

                            {/* Time & Location Row */}
                            <div className="flex flex-wrap gap-4 text-sm text-rogue-slate mb-6">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-rogue-slate/60" />
                                {formatEventTime(event.start_time, event.end_time)}
                              </div>
                              {event.location_address && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-rogue-slate/60" />
                                  <span className="line-clamp-1">{event.location_address}</span>
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
                                {isRegistered ? 'Unregister' : 'Register for Event'}
                              </Button>

                              {event.zoom_link && isRegistered && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                  asChild
                                  onClick={(e: any) => e.stopPropagation()}
                                >
                                  <a href={event.zoom_link} target="_blank" rel="noopener noreferrer">
                                    <Video className="h-4 w-4 mr-2" />
                                    Join Zoom
                                  </a>
                                </Button>
                              )}

                              <button className="ml-auto p-2 hover:bg-rogue-sage/10 rounded-lg transition-colors">
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5 text-rogue-slate" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-rogue-slate" />
                                )}
                              </button>
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-6 pt-6 border-t border-rogue-sage/20 space-y-5">
                                    {event.description && (
                                      <div>
                                        <h4 className="text-xs font-semibold text-rogue-forest/70 uppercase tracking-wide mb-3">
                                          About This Event
                                        </h4>
                                        <div 
                                          className="text-sm text-rogue-slate leading-relaxed"
                                          dangerouslySetInnerHTML={{ __html: formatEventDescription(event.description) }}
                                        />
                                      </div>
                                    )}

                                    {(event as any).presenter_bio && (
                                      <div className="bg-gradient-to-br from-rogue-sage/10 to-rogue-cream/50 rounded-xl p-5">
                                        <h4 className="text-xs font-semibold text-rogue-forest/70 uppercase tracking-wide mb-3 flex items-center gap-2">
                                          <UserCircle className="h-4 w-4" />
                                          Presenter
                                        </h4>
                                        <div 
                                          className="text-sm text-rogue-slate leading-relaxed"
                                          dangerouslySetInnerHTML={{ __html: formatEventDescription((event as any).presenter_bio) }}
                                        />
                                      </div>
                                    )}

                                    <div className="flex flex-wrap gap-6 text-sm text-rogue-slate/70">
                                      {((event as any).attendance_count || (event as any).max_capacity) && (
                                        <div className="flex items-center gap-2">
                                          <Users className="h-4 w-4" />
                                          {(event as any).attendance_count || 0} registered
                                          {(event as any).max_capacity && ` / ${(event as any).max_capacity} max`}
                                        </div>
                                      )}
                                      {(event as any).resources_url && (
                                        <a
                                          href={(event as any).resources_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 text-rogue-forest hover:text-rogue-pine font-medium"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          Resources
                                          <ExternalLink className="h-3 w-3" />
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

                  {/* Optional Events - Compact, Indented */}
                  {optional.length > 0 && (
                    <div className="mt-4 ml-6 space-y-2">
                      {optional.map((event) => {
                        const isRegistered = registrations.has(event.id)
                        const isExpanded = expandedEventId === event.id

                        return (
                          <Card 
                            key={event.id}
                            className="border-l-2 border-rogue-sage/40 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                            onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                          >
                            <CardContent className="p-4">
                              {/* Compact Layout */}
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1">
                                  <h4 className="text-lg font-semibold text-rogue-forest mb-2">{event.title}</h4>
                                  <div className="flex flex-wrap items-center gap-3 text-xs text-rogue-slate/70">
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="h-3 w-3" />
                                      {formatDate(event.start_time, { month: 'short', day: 'numeric' })}, {formatEventTime(event.start_time, event.end_time)}
                                    </div>
                                    {event.location_type === 'virtual' && (
                                      <Badge variant="outline" className="text-xs h-5">
                                        <Video className="h-3 w-3 mr-1" />
                                        Virtual
                                      </Badge>
                                    )}
                                    {event.location_type === 'hybrid' && (
                                      <Badge variant="outline" className="text-xs h-5 border-purple-200 text-purple-600">
                                        Hybrid
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {isRegistered && (
                                  <Badge className="bg-green-100 text-green-700 flex-shrink-0 h-6">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Registered
                                  </Badge>
                                )}
                              </div>

                              {/* Actions Row */}
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRegister(event.id)
                                  }}
                                  size="sm"
                                  variant={isRegistered ? 'outline' : 'default'}
                                  className={!isRegistered ? 'bg-rogue-forest hover:bg-rogue-pine h-7 text-xs' : 'h-7 text-xs'}
                                >
                                  {isRegistered ? 'Unregister' : 'Register'}
                                </Button>

                                {event.zoom_link && isRegistered && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-blue-200 text-blue-600 hover:bg-blue-50 h-7 text-xs"
                                    asChild
                                    onClick={(e: any) => e.stopPropagation()}
                                  >
                                    <a href={event.zoom_link} target="_blank" rel="noopener noreferrer">
                                      <Video className="h-3 w-3 mr-1" />
                                      Zoom
                                    </a>
                                  </Button>
                                )}

                                <button className="ml-auto p-1 hover:bg-rogue-sage/10 rounded transition-colors">
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-rogue-slate" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-rogue-slate" />
                                  )}
                                </button>
                              </div>

                              {/* Expanded Details */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-4 pt-4 border-t border-rogue-sage/10 space-y-4">
                                      {event.description && (
                                        <div>
                                          <h5 className="text-xs font-semibold text-rogue-forest/70 uppercase tracking-wide mb-2">
                                            Details
                                          </h5>
                                          <div 
                                            className="text-sm text-rogue-slate leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: formatEventDescription(event.description) }}
                                          />
                                        </div>
                                      )}

                                      {(event as any).presenter_bio && (
                                        <div className="bg-rogue-cream/40 rounded-lg p-4">
                                          <h5 className="text-xs font-semibold text-rogue-forest/70 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                            <UserCircle className="h-3 w-3" />
                                            Presenter
                                          </h5>
                                          <div 
                                            className="text-sm text-rogue-slate leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: formatEventDescription((event as any).presenter_bio) }}
                                          />
                                        </div>
                                      )}

                                      {event.location_address && (
                                        <div className="flex items-start gap-2 text-xs text-rogue-slate/70">
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
              )}
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
