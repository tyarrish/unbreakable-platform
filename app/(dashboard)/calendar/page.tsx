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
import { Calendar, Clock, MapPin, Users, Video, Building2, CheckCircle, ChevronDown, ChevronUp, UserCircle, ExternalLink, Mic, Linkedin, Globe } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getEvents, registerForEvent, unregisterFromEvent, isRegisteredForEvent, getEventAttendees } from '@/lib/supabase/queries/events'
import { formatDate, formatEventTime } from '@/lib/utils/format-date'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { getMonthColorFromString } from '@/lib/utils/month-colors'
import { EVENT_TYPES } from '@/lib/constants'
import type { Event } from '@/types/index.types'

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [registrations, setRegistrations] = useState<Set<string>>(new Set())
  const [eventAttendees, setEventAttendees] = useState<Map<string, any[]>>(new Map())
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

      // Load attendees for each event
      const attendeePromises = eventsData.map(event => getEventAttendees(event.id))
      const attendeeResults = await Promise.all(attendeePromises)
      
      const newAttendees = new Map<string, any[]>()
      attendeeResults.forEach((attendees, index) => {
        newAttendees.set(eventsData[index].id, attendees)
      })
      setEventAttendees(newAttendees)
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
        
        // Send confirmation email with calendar links
        try {
          await fetch('/api/events/send-registration-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId }),
          })
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError)
          // Don't show error to user - registration still succeeded
        }
      }
      
      // Reload attendees for this event
      const attendees = await getEventAttendees(eventId)
      setEventAttendees(prev => new Map(prev).set(eventId, attendees))
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
      {/* Header - Enhanced */}
      <div className="bg-gradient-to-r from-white/80 via-white/60 to-transparent backdrop-blur-sm border-b border-rogue-sage/20">
        <Container>
          <div className="py-10">
            <div className="flex items-end justify-between flex-wrap gap-6">
              <div>
                <h1 className="text-5xl font-bold text-rogue-forest mb-3 tracking-tight">Events</h1>
                <p className="text-lg text-rogue-slate/80">Your cohort calendar</p>
              </div>
              <div className="flex gap-4">
                <div className="px-5 py-3 bg-white rounded-xl border border-rogue-sage/20 shadow-sm">
                  <p className="text-xs text-rogue-slate/60 uppercase tracking-wider mb-1">Upcoming</p>
                  <p className="text-3xl font-bold text-rogue-forest">{totalUpcoming}</p>
                </div>
                <div className="px-5 py-3 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200 shadow-sm">
                  <p className="text-xs text-green-700/60 uppercase tracking-wider mb-1">Registered</p>
                  <p className="text-3xl font-bold text-green-700">{totalRegistered}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-16 max-w-4xl">
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
                <motion.div 
                  key={moduleName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Module Header - Elevated with Color */}
                  <div className="mb-8 relative">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${moduleColor.bg} rounded-full`} />
                    <div className="pl-6">
                      <h2 className={`text-2xl font-bold ${moduleColor.text} mb-2`}>{moduleName}</h2>
                      <div className={`h-1 w-16 ${moduleColor.bg} rounded-full opacity-30`} />
                    </div>
                  </div>

                  {/* Required Events - Premium Cards */}
                  <div className="space-y-4">
                    {required.map((event, index) => {
                      const isRegistered = registrations.has(event.id)
                      const isExpanded = expandedEventId === event.id

                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                          <Card 
                            className={`group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden bg-gradient-to-br from-white via-white to-${moduleColor.bg}/5`}
                            onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                          >
                            {/* Color Accent Top Border */}
                            <div className={`h-1.5 ${moduleColor.bg}`} />
                            
                            <CardContent className="p-5">
                              {/* Date Box - Prominent */}
                              <div className="flex items-center gap-3 mb-4">
                                <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg ${moduleColor.bg} text-white shadow-md flex-shrink-0`}>
                                  <div className="text-[10px] font-medium opacity-90">
                                    {new Date(event.start_time).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                                  </div>
                                  <div className="text-xl font-bold leading-none">
                                    {new Date(event.start_time).getDate()}
                                  </div>
                                </div>

                                {/* Top Row - Badges */}
                                <div className="flex flex-wrap items-center gap-2 flex-1">
                                  <Badge className={`${moduleColor.badge} text-xs font-semibold px-2.5 py-0.5 shadow-sm`}>
                                    Required
                                  </Badge>
                                  <Badge variant="outline" className="text-xs border-rogue-sage/30 font-medium">
                                    {EVENT_TYPES.find(t => t.value === event.event_type)?.label || event.event_type}
                                  </Badge>
                                {event.location_type === 'virtual' && (
                                  <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                                    <Video className="h-3 w-3 mr-1" />
                                    Virtual
                                  </Badge>
                                )}
                                {event.location_type === 'in_person' && (
                                  <Badge className="bg-rogue-forest/10 text-rogue-forest border border-rogue-forest/20 text-xs">
                                    <Building2 className="h-3 w-3 mr-1" />
                                    In-Person
                                  </Badge>
                                )}
                                {event.location_type === 'hybrid' && (
                                  <Badge className="bg-purple-50 text-purple-700 border border-purple-200 text-xs">
                                    Hybrid
                                  </Badge>
                                )}
                                  {isRegistered && (
                                    <Badge className="bg-green-100 text-green-700 border border-green-200 shadow-sm">
                                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                      Registered
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Title */}
                              <h3 className="text-2xl font-bold text-rogue-forest mb-3 leading-tight group-hover:text-rogue-pine transition-colors">
                                {event.title}
                              </h3>

                              {/* Speakers - NEW */}
                              {(event as any).speakers && (event as any).speakers.length > 0 && (
                                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-rogue-sage/10">
                                  <Mic size={14} className="text-rogue-copper flex-shrink-0" />
                                  <div className="flex items-center gap-3 flex-wrap">
                                    {(event as any).speakers.slice(0, 3).map((speaker: any, idx: number) => {
                                      const speakerData = speaker.speaker_type === 'guest' ? speaker.guest_speaker : speaker.profile
                                      return (
                                        <div key={idx} className="flex items-center gap-1.5 bg-rogue-sage/5 px-2 py-1 rounded-full">
                                          <Avatar className="h-6 w-6 border border-white">
                                            <AvatarImage src={speakerData?.avatar_url} />
                                            <AvatarFallback className="bg-rogue-copper text-white text-xs">
                                              {speakerData?.full_name?.[0]}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="text-sm font-semibold text-rogue-forest">
                                            {speakerData?.full_name}
                                          </span>
                                        </div>
                                      )
                                    })}
                                    {(event as any).speakers.length > 3 && (
                                      <span className="text-xs text-rogue-slate font-medium">+{(event as any).speakers.length - 3} more</span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Time & Location - Refined */}
                              <div className="flex flex-wrap gap-4 text-sm text-rogue-slate mb-4">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-rogue-forest" />
                                  <span className="font-medium">{formatEventTime(event.start_time, event.end_time)}</span>
                                </div>
                                {event.location_address && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-rogue-forest" />
                                    <span className="font-medium line-clamp-1">{event.location_address}</span>
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
                                  size="default"
                                  variant={isRegistered ? 'outline' : 'default'}
                                  className={!isRegistered ? `${moduleColor.bg} hover:opacity-90 text-white shadow-md` : 'border-rogue-sage/30'}
                                >
                                  {isRegistered ? 'Unregister' : 'Register for Event'}
                                </Button>

                                {event.zoom_link && isRegistered && (
                                  <Button
                                    size="default"
                                    variant="outline"
                                    className="border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 shadow-sm"
                                    asChild
                                    onClick={(e: any) => e.stopPropagation()}
                                  >
                                    <a href={event.zoom_link} target="_blank" rel="noopener noreferrer">
                                      <Video className="h-4 w-4 mr-2" />
                                      Join Zoom
                                    </a>
                                  </Button>
                                )}

                                <button className="ml-auto p-2.5 hover:bg-rogue-sage/10 rounded-xl transition-all">
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
                                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-6 pt-6 border-t border-rogue-sage/20 space-y-4">
                                      {event.description && (
                                        <div>
                                          <h4 className="text-xs font-bold text-rogue-forest/60 uppercase tracking-widest mb-4">
                                            About This Event
                                          </h4>
                                          <div 
                                            className="text-base text-rogue-slate leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: formatEventDescription(event.description) }}
                                          />
                                        </div>
                                      )}

                                      {(event as any).presenter_bio && (
                                        <div className={`bg-gradient-to-br ${moduleColor.lightBg} to-transparent rounded-2xl p-6 border ${moduleColor.border}/20`}>
                                          <h4 className="text-xs font-bold text-rogue-forest/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <UserCircle className="h-4 w-4" />
                                            Presenter
                                          </h4>
                                          <div 
                                            className="text-base text-rogue-slate leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: formatEventDescription((event as any).presenter_bio) }}
                                          />
                                        </div>
                                      )}

                                      <div className="flex flex-wrap gap-8 text-sm text-rogue-slate/70 pt-4">
                                        {((event as any).attendance_count || (event as any).max_capacity) && (
                                          <div className="flex items-center gap-2.5">
                                            <Users className="h-4 w-4" />
                                            <span className="font-medium">
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
                                            className="inline-flex items-center gap-2 text-rogue-forest hover:text-rogue-pine font-semibold transition-colors"
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
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Optional Events - Elevated Compact Design */}
                  {optional.length > 0 && (
                    <div className="mt-6 ml-8 space-y-2.5">
                      {optional.map((event, index) => {
                        const isRegistered = registrations.has(event.id)
                        const isExpanded = expandedEventId === event.id

                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <Card 
                              className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden bg-white"
                              onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                            >
                              {/* Subtle Color Accent */}
                              <div className={`h-0.5 ${moduleColor.bg} opacity-50`} />
                              
                              <CardContent className="p-4">
                                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                                  <Badge variant="outline" className="text-xs border-rogue-sage/30 font-medium">
                                    {EVENT_TYPES.find(t => t.value === event.event_type)?.label || event.event_type}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs border-rogue-sage/30">
                                    {formatDate(event.start_time, { month: 'short', day: 'numeric' })}
                                  </Badge>
                                  {event.location_type === 'virtual' && (
                                    <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                                      <Video className="h-3 w-3 mr-1" />
                                      Virtual
                                    </Badge>
                                  )}
                                  {event.location_type === 'in_person' && (
                                    <Badge className="bg-rogue-forest/10 text-rogue-forest border border-rogue-forest/20 text-xs">
                                      <Building2 className="h-3 w-3 mr-1" />
                                      In-Person
                                    </Badge>
                                  )}
                                  {event.location_type === 'hybrid' && (
                                    <Badge className="bg-purple-50 text-purple-700 border border-purple-200 text-xs">
                                      Hybrid
                                    </Badge>
                                  )}
                                  {isRegistered && (
                                    <Badge className="bg-green-100 text-green-700 border border-green-200 ml-auto shadow-sm">
                                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                      Registered
                                    </Badge>
                                  )}
                                </div>

                                <h4 className="text-lg font-bold text-rogue-forest mb-2 group-hover:text-rogue-pine transition-colors">
                                  {event.title}
                                </h4>

                                {/* Speakers - Compact */}
                                {(event as any).speakers && (event as any).speakers.length > 0 && (
                                  <div className="flex items-center gap-2 mb-3">
                                    <Mic size={12} className="text-rogue-copper flex-shrink-0" />
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {(event as any).speakers.slice(0, 2).map((speaker: any, idx: number) => {
                                        const speakerData = speaker.speaker_type === 'guest' ? speaker.guest_speaker : speaker.profile
                                        return (
                                          <div key={idx} className="flex items-center gap-1 bg-rogue-sage/5 px-1.5 py-0.5 rounded-full">
                                            <Avatar className="h-5 w-5">
                                              <AvatarImage src={speakerData?.avatar_url} />
                                              <AvatarFallback className="bg-rogue-copper text-white text-[10px]">
                                                {speakerData?.full_name?.[0]}
                                              </AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs font-semibold text-rogue-forest">
                                              {speakerData?.full_name}
                                            </span>
                                          </div>
                                        )
                                      })}
                                      {(event as any).speakers.length > 2 && (
                                        <span className="text-xs text-rogue-slate">+{(event as any).speakers.length - 2}</span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 text-sm text-rogue-slate/70 mb-3">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span className="font-medium">{formatEventTime(event.start_time, event.end_time)}</span>
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
                                    className={!isRegistered ? `${moduleColor.bg} hover:opacity-90 text-white shadow-sm` : 'border-rogue-sage/30'}
                                  >
                                    {isRegistered ? 'Unregister' : 'Register'}
                                  </Button>

                                  {event.zoom_link && isRegistered && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100"
                                      asChild
                                      onClick={(e: any) => e.stopPropagation()}
                                    >
                                      <a href={event.zoom_link} target="_blank" rel="noopener noreferrer">
                                        <Video className="h-3.5 w-3.5 mr-2" />
                                        Zoom
                                      </a>
                                    </Button>
                                  )}

                                  <button className="ml-auto p-2 hover:bg-rogue-sage/10 rounded-lg transition-all">
                                    {isExpanded ? (
                                      <ChevronUp className="h-5 w-5 text-rogue-slate" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5 text-rogue-slate" />
                                    )}
                                  </button>
                                </div>

                                {/* Registered Attendees */}
                                {eventAttendees.get(event.id) && eventAttendees.get(event.id)!.length > 0 && (
                                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-rogue-sage/10">
                                    <span className="text-xs text-rogue-slate font-medium">
                                      {eventAttendees.get(event.id)!.length} registered
                                    </span>
                                    <TooltipProvider>
                                      <div className="flex items-center">
                                        {eventAttendees.get(event.id)!.map((attendee: any, idx: number) => (
                                          <Tooltip key={attendee.user_id} delayDuration={0}>
                                            <TooltipTrigger asChild>
                                              <div className="-ml-2 first:ml-0">
                                                <Avatar className="h-6 w-6 border-2 border-white ring-1 ring-rogue-sage/20">
                                                  <AvatarImage src={attendee.user?.avatar_url} alt={attendee.user?.full_name} />
                                                  <AvatarFallback className="bg-rogue-forest text-white text-xs">
                                                    {attendee.user?.full_name?.charAt(0) || '?'}
                                                  </AvatarFallback>
                                                </Avatar>
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p className="text-xs">{attendee.user?.full_name || 'Unknown'}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        ))}
                                      </div>
                                    </TooltipProvider>
                                  </div>
                                )}

                                {/* Expanded Details */}
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                      className="overflow-hidden"
                                    >
                                      <div className="mt-4 pt-4 border-t border-rogue-sage/20 space-y-4">
                                        {event.description && (
                                          <div>
                                            <h5 className="text-xs font-bold text-rogue-forest/60 uppercase tracking-widest mb-3">
                                              Details
                                            </h5>
                                            <div 
                                              className="text-sm text-rogue-slate leading-relaxed"
                                              dangerouslySetInnerHTML={{ __html: formatEventDescription(event.description) }}
                                            />
                                          </div>
                                        )}

                                        {/* Speakers Section */}
                                        {(event as any).speakers && (event as any).speakers.length > 0 && (
                                          <div className="bg-gradient-to-br from-rogue-cream/50 to-white rounded-xl p-5 border border-rogue-gold/20">
                                            <h5 className="text-xs font-bold text-rogue-forest/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                                              <Mic className="h-3.5 w-3.5 text-rogue-gold" />
                                              {(event as any).speakers.length === 1 ? 'Speaker' : 'Speakers'}
                                            </h5>
                                            <div className="space-y-4">
                                              {(event as any).speakers.map((speaker: any, idx: number) => {
                                                const speakerData = speaker.speaker_type === 'guest' ? speaker.guest_speaker : speaker.profile
                                                const isGuest = speaker.speaker_type === 'guest'
                                                
                                                return (
                                                  <div key={idx} className="flex gap-4">
                                                    <Avatar className="h-16 w-16 flex-shrink-0">
                                                      <AvatarImage src={speakerData?.avatar_url} />
                                                      <AvatarFallback className="bg-rogue-copper text-white text-xl">
                                                        {speakerData?.full_name?.[0]}
                                                      </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                      <h6 className="font-semibold text-rogue-forest mb-0.5">
                                                        {speakerData?.full_name}
                                                      </h6>
                                                      {isGuest && speakerData?.title && (
                                                        <p className="text-sm text-rogue-slate/80">
                                                          {speakerData.title}
                                                          {speakerData.organization && ` at ${speakerData.organization}`}
                                                        </p>
                                                      )}
                                                      {!isGuest && speakerData?.current_role && (
                                                        <p className="text-sm text-rogue-slate/80">
                                                          {speakerData.current_role}
                                                          {speakerData.employer && ` at ${speakerData.employer}`}
                                                        </p>
                                                      )}
                                                      {speakerData?.bio && (
                                                        <p className="text-sm text-rogue-slate mt-2 leading-relaxed">
                                                          {speakerData.bio}
                                                        </p>
                                                      )}
                                                      {/* Links for guest speakers */}
                                                      {isGuest && (speakerData?.linkedin_url || speakerData?.website_url) && (
                                                        <div className="flex gap-2 mt-2">
                                                          {speakerData.linkedin_url && (
                                                            <a
                                                              href={speakerData.linkedin_url}
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              className="text-xs flex items-center gap-1 text-rogue-forest hover:text-rogue-pine transition-colors"
                                                            >
                                                              <Linkedin size={12} />
                                                              LinkedIn
                                                            </a>
                                                          )}
                                                          {speakerData.website_url && (
                                                            <a
                                                              href={speakerData.website_url}
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              className="text-xs flex items-center gap-1 text-rogue-forest hover:text-rogue-pine transition-colors"
                                                            >
                                                              <Globe size={12} />
                                                              Website
                                                            </a>
                                                          )}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                )
                                              })}
                                            </div>
                                          </div>
                                        )}

                                        {event.location_address && (
                                          <div className="flex items-start gap-2.5 text-sm text-rogue-slate/70">
                                            <MapPin className="h-4 w-4 mt-0.5" />
                                            {event.location_address}
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              )
              })}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
