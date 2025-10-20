'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, MapPin, Video, Building2, AlertCircle, CheckCircle, Users, ExternalLink } from 'lucide-react'
import { formatDate, formatEventTime } from '@/lib/utils/format-date'
import { EVENT_TYPES, LOCATION_TYPES } from '@/lib/constants'

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
  zoom_meeting_id?: string
  attendance?: any[]
  max_attendees?: number
  created_by?: string
  speaker_profiles?: Array<{
    full_name: string
    avatar_url?: string
    bio?: string
  }>
}

interface EventDetailsModalProps {
  event: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventDetailsModal({ event, open, onOpenChange }: EventDetailsModalProps) {
  if (!event) return null

  const eventType = EVENT_TYPES.find(t => t.value === event.event_type)
  const locationType = LOCATION_TYPES.find(l => l.value === event.location_type)
  const isPast = new Date(event.end_time) < new Date()
  const attendeeCount = event.attendance?.length || 0
  const spotsLeft = event.max_attendees ? event.max_attendees - attendeeCount : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <DialogTitle className="text-2xl text-rogue-forest mb-3">
                {event.title}
              </DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge 
                  className={`bg-${eventType?.color || 'rogue-forest'} text-white`}
                >
                  {eventType?.label}
                </Badge>
                {event.is_required ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle size={12} />
                    Required
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle size={12} />
                    Optional
                  </Badge>
                )}
                {isPast && <Badge variant="secondary">Past Event</Badge>}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Date & Time */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-rogue-forest mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-rogue-forest">Date</p>
                <p className="text-rogue-slate">{formatDate(event.start_time)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-rogue-forest mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-rogue-forest">Time</p>
                <p className="text-rogue-slate">{formatEventTime(event.start_time, event.end_time)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-3">
            {event.location_type === 'virtual' && (
              <div className="flex items-start gap-3">
                <Video className="h-5 w-5 text-rogue-forest mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-rogue-forest">Location</p>
                  <p className="text-rogue-slate mb-2">Virtual Meeting</p>
                  {event.zoom_link && !isPast && (
                    <Button
                      size="sm"
                      className="bg-rogue-forest hover:bg-rogue-pine"
                      onClick={() => window.open(event.zoom_link, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Join Zoom Meeting
                    </Button>
                  )}
                  {event.zoom_meeting_id && (
                    <p className="text-xs text-rogue-slate mt-2">
                      Meeting ID: {event.zoom_meeting_id}
                    </p>
                  )}
                </div>
              </div>
            )}

            {event.location_type === 'in_person' && (
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-rogue-forest mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-rogue-forest">Location</p>
                  <p className="text-rogue-slate">{event.location_address || 'In Person'}</p>
                  {event.location_address && (
                    <Button
                      variant="link"
                      size="sm"
                      className="text-rogue-gold hover:text-rogue-gold-light p-0 h-auto mt-1"
                      onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(event.location_address!)}`, '_blank')}
                    >
                      <MapPin className="mr-1 h-3 w-3" />
                      Open in Maps
                    </Button>
                  )}
                </div>
              </div>
            )}

            {event.location_type === 'hybrid' && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-rogue-forest mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="font-semibold text-rogue-forest">Location</p>
                    <p className="text-rogue-slate mb-2">Hybrid Event - Join In Person or Virtually</p>
                  </div>
                  
                  {event.location_address && (
                    <div>
                      <p className="text-sm font-medium text-rogue-forest">In Person:</p>
                      <p className="text-sm text-rogue-slate">{event.location_address}</p>
                    </div>
                  )}
                  
                  {event.zoom_link && !isPast && (
                    <div>
                      <p className="text-sm font-medium text-rogue-forest mb-2">Virtual:</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(event.zoom_link, '_blank')}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Join Zoom Meeting
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Capacity */}
          {event.max_attendees && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-rogue-forest mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-rogue-forest">Capacity</p>
                  <p className="text-rogue-slate">
                    {attendeeCount} / {event.max_attendees} attendees
                  </p>
                  {spotsLeft && spotsLeft > 0 && (
                    <p className="text-sm text-rogue-gold mt-1">
                      {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining
                    </p>
                  )}
                  {spotsLeft === 0 && (
                    <p className="text-sm text-red-600 mt-1">Event is full</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Description */}
          {event.description && (
            <>
              <Separator />
              <div>
                <p className="font-semibold text-rogue-forest mb-2">Description</p>
                <div 
                  className="text-rogue-slate prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              </div>
            </>
          )}

          {/* Speakers */}
          {event.speaker_profiles && event.speaker_profiles.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="font-semibold text-rogue-forest mb-3">
                  Speaker{event.speaker_profiles.length > 1 ? 's' : ''}
                </p>
                <div className="space-y-3">
                  {event.speaker_profiles.map((speaker, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {speaker.avatar_url ? (
                        <img 
                          src={speaker.avatar_url} 
                          alt={speaker.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-rogue-forest/10 flex items-center justify-center text-rogue-forest font-semibold">
                          {speaker.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-rogue-forest">{speaker.full_name}</p>
                        {speaker.bio && (
                          <p className="text-sm text-rogue-slate mt-1">{speaker.bio}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!isPast && event.zoom_link && event.location_type !== 'in_person' && (
          <div className="mt-6 pt-6 border-t">
            <Button
              className="w-full bg-rogue-forest hover:bg-rogue-pine"
              onClick={() => window.open(event.zoom_link, '_blank')}
            >
              <Video className="mr-2 h-4 w-4" />
              Join Virtual Meeting
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

