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
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  Video,
  Building2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { getEvents, deleteEvent } from '@/lib/supabase/queries/events'
import { formatDate, formatEventTime } from '@/lib/utils/format-date'
import { toast } from 'sonner'
import { EVENT_TYPES, LOCATION_TYPES } from '@/lib/constants'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdminAccess()
    loadEvents()
  }, [])

  async function checkAdminAccess() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single<{ role: string }>()

    if (profile?.role !== 'admin' && profile?.role !== 'facilitator') {
      router.push('/dashboard')
    }
  }

  async function loadEvents() {
    try {
      const eventsData = await getEvents()
      setEvents(eventsData)
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Failed to load events')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteEventId) return

    setIsDeleting(true)
    try {
      await deleteEvent(deleteEventId)
      toast.success('Event deleted successfully')
      setEvents(events.filter(e => e.id !== deleteEventId))
      setDeleteEventId(null)
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    } finally {
      setIsDeleting(false)
    }
  }

  const getLocationIcon = (locationType: string) => {
    const location = LOCATION_TYPES.find(l => l.value === locationType)
    return location?.icon || '📍'
  }

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          heading="Manage Events"
          description="Create and manage cohort calls, workshops, and events"
        >
          <Button onClick={() => router.push('/admin/events/new')}>
            <Plus size={16} className="mr-2" />
            Create Event
          </Button>
        </PageHeader>

        {events.length === 0 ? (
          <EmptyState
            icon={<Calendar size={64} />}
            title="No Events Created"
            description="Create your first event to get started"
            action={
              <Button onClick={() => router.push('/admin/events/new')}>
                <Plus size={16} className="mr-2" />
                Create Event
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6">
            {events.map((event) => {
              const eventType = EVENT_TYPES.find(t => t.value === event.event_type)
              const attendeeCount = event.attendance?.[0]?.count || 0
              const isPast = new Date(event.end_time) < new Date()
              const locationType = LOCATION_TYPES.find(l => l.value === event.location_type)

              return (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge className={`bg-${eventType?.color || 'rogue-forest'} text-white`}>
                            {eventType?.label || event.event_type}
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
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getLocationIcon(event.location_type)} {locationType?.label}
                          </Badge>
                          {isPast && <Badge variant="secondary">Past</Badge>}
                          {event.module && (
                            <Badge variant="outline">
                              Module {event.module.order_number}
                            </Badge>
                          )}
                        </div>
                        <CardTitle>{event.title}</CardTitle>
                        {event.description && (
                          <CardDescription className="mt-2">{event.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/events/${event.id}`)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteEventId(event.id)}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
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
                          <span>
                            {attendeeCount} registered
                            {event.max_attendees && ` / ${event.max_attendees} max`}
                          </span>
                        </div>
                      )}
                      {event.location_type === 'virtual' && event.zoom_link && (
                        <div className="flex items-center gap-2 text-rogue-forest">
                          <Video size={16} />
                          <span>Virtual via Zoom</span>
                        </div>
                      )}
                      {event.location_type === 'in_person' && event.location_address && (
                        <div className="flex items-center gap-2 text-rogue-forest">
                          <Building2 size={16} />
                          <span className="truncate" title={event.location_address}>
                            {event.location_address}
                          </span>
                        </div>
                      )}
                      {event.location_type === 'hybrid' && (
                        <div className="flex items-center gap-2 text-rogue-forest">
                          <MapPin size={16} />
                          <span>Hybrid Event</span>
                        </div>
                      )}
                    </div>

                    {event.location_type === 'hybrid' && (
                      <div className="grid sm:grid-cols-2 gap-2 text-sm">
                        {event.location_address && (
                          <div className="flex items-center gap-2 text-rogue-slate">
                            <Building2 size={14} />
                            <span className="truncate">{event.location_address}</span>
                          </div>
                        )}
                        {event.zoom_link && (
                          <div className="flex items-center gap-2 text-rogue-slate">
                            <Video size={14} />
                            <span>Online option available</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
              All registrations will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteEventId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




