'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Video, Building2, AlertCircle, CheckCircle } from 'lucide-react'
import { formatDate, formatEventTime } from '@/lib/utils/format-date'
import { EVENT_TYPES, LOCATION_TYPES } from '@/lib/constants'
import { EventDetailsModal } from '@/components/events/event-details-modal'

interface Event {
  id: string
  title: string
  description?: string
  event_type: string
  start_time: string
  end_time: string
  is_required: boolean
  location_type: string
  location_address?: string
  zoom_link?: string
  attendance?: any[]
  max_attendees?: number
}

interface ModuleEventsBannerProps {
  events: Event[]
}

export function ModuleEventsBanner({ events }: ModuleEventsBannerProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (events.length === 0) {
    return null
  }

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="space-y-3">
        {events.map((event) => {
        const eventType = EVENT_TYPES.find(t => t.value === event.event_type)
        const locationType = LOCATION_TYPES.find(l => l.value === event.location_type)
        const isPast = new Date(event.end_time) < new Date()

        return (
          <Card 
            key={event.id} 
            className="border-l-4 border-l-rogue-gold hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => handleViewDetails(event)}
          >
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-4">
                {/* Left side - Event info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Calendar size={16} className="text-rogue-forest flex-shrink-0" />
                    <span className="font-semibold text-rogue-forest">{event.title}</span>
                    <Badge 
                      className={`bg-${eventType?.color || 'rogue-forest'} text-white text-xs`}
                    >
                      {eventType?.label}
                    </Badge>
                    {event.is_required ? (
                      <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                        <AlertCircle size={10} />
                        Required
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                        <CheckCircle size={10} />
                        Optional
                      </Badge>
                    )}
                    {isPast && <Badge variant="secondary" className="text-xs">Past</Badge>}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-rogue-slate flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>{formatDate(event.start_time)} • {formatEventTime(event.start_time, event.end_time)}</span>
                    </div>
                    
                    {event.location_type === 'virtual' && (
                      <div className="flex items-center gap-1.5 text-rogue-forest">
                        <Video size={14} />
                        <span>Virtual</span>
                      </div>
                    )}
                    
                    {event.location_type === 'in_person' && event.location_address && (
                      <div className="flex items-center gap-1.5 text-rogue-forest">
                        <Building2 size={14} />
                        <span className="truncate max-w-xs">{event.location_address}</span>
                      </div>
                    )}
                    
                    {event.location_type === 'hybrid' && (
                      <div className="flex items-center gap-1.5 text-rogue-forest">
                        <MapPin size={14} />
                        <span>Hybrid Event</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewDetails(event)
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
        })}
      </div>

      <EventDetailsModal
        event={selectedEvent}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  )
}





