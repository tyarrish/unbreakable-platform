'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { createEvent, updateEvent } from '@/lib/supabase/queries/events'
import { getModules } from '@/lib/supabase/queries/modules'
import { EVENT_TYPES, LOCATION_TYPES } from '@/lib/constants'
import { toast } from 'sonner'
import { Calendar, Clock, MapPin, Users, Video, Building2 } from 'lucide-react'
import type { Event, Module } from '@/types/index.types'

interface EventFormProps {
  event?: Event
  onSuccess?: () => void
}

export function EventForm({ event, onSuccess }: EventFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [modules, setModules] = useState<Module[]>([])

  // Form state
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    event_type: event?.event_type || 'cohort_call',
    start_time: event?.start_time ? new Date(event.start_time).toISOString().slice(0, 16) : '',
    end_time: event?.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : '',
    is_required: event?.is_required || false,
    location_type: event?.location_type || 'virtual',
    location_address: event?.location_address || '',
    zoom_link: event?.zoom_link || '',
    zoom_meeting_id: event?.zoom_meeting_id || '',
    module_id: event?.module_id || '',
    max_attendees: event?.max_attendees?.toString() || '',
  })

  useEffect(() => {
    loadModules()
  }, [])

  async function loadModules() {
    try {
      const data = await getModules(true) // Include unpublished for admin
      setModules(data)
    } catch (error) {
      console.error('Error loading modules:', error)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in')
        return
      }

      // Validate required fields
      if (!formData.title || !formData.start_time || !formData.end_time) {
        toast.error('Please fill in all required fields')
        return
      }

      // Validate end time is after start time
      if (new Date(formData.end_time) <= new Date(formData.start_time)) {
        toast.error('End time must be after start time')
        return
      }

      // Validate zoom link for virtual/hybrid
      if ((formData.location_type === 'virtual' || formData.location_type === 'hybrid') && !formData.zoom_link) {
        toast.error('Zoom link is required for virtual and hybrid events')
        return
      }

      // Validate location address for in-person/hybrid
      if ((formData.location_type === 'in_person' || formData.location_type === 'hybrid') && !formData.location_address) {
        toast.error('Location address is required for in-person and hybrid events')
        return
      }

      // Prepare data
      const eventData = {
        title: formData.title,
        description: formData.description || null,
        event_type: formData.event_type,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        is_required: formData.is_required,
        location_type: formData.location_type,
        location_address: formData.location_address || null,
        zoom_link: formData.zoom_link || null,
        zoom_meeting_id: formData.zoom_meeting_id || null,
        module_id: formData.module_id || null,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        created_by: user.id,
      }

      if (event?.id) {
        // Update existing event
        await updateEvent(event.id, eventData)
        toast.success('Event updated successfully!')
      } else {
        // Create new event
        await createEvent(eventData)
        toast.success('Event created successfully!')
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/admin/events')
      }
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error('Failed to save event')
    } finally {
      setIsLoading(false)
    }
  }

  const showZoomFields = formData.location_type === 'virtual' || formData.location_type === 'hybrid'
  const showLocationField = formData.location_type === 'in_person' || formData.location_type === 'hybrid'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-rogue-forest flex items-center gap-2">
              <Calendar size={20} />
              Event Details
            </h3>

            <div className="space-y-2">
              <Label htmlFor="title">
                Event Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Month 1 Cohort Call"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="What will be covered in this event?"
                rows={4}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_type">
                  Event Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) => handleChange('event_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="module_id">Associated Module (Optional)</Label>
                <Select
                  value={formData.module_id || 'none'}
                  onValueChange={(value) => handleChange('module_id', value === 'none' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No module</SelectItem>
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        Module {module.order_number}: {module.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-rogue-forest flex items-center gap-2">
              <Clock size={20} />
              Schedule
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">
                  Start Date & Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => handleChange('start_time', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_time">
                  End Date & Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => handleChange('end_time', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_required"
                checked={formData.is_required}
                onChange={(e) => handleChange('is_required', e.target.checked)}
                className="h-4 w-4 rounded border-rogue-sage text-rogue-forest focus:ring-rogue-gold"
              />
              <Label htmlFor="is_required" className="cursor-pointer">
                Required attendance
              </Label>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-rogue-forest flex items-center gap-2">
              <MapPin size={20} />
              Location
            </h3>

            <div className="space-y-2">
              <Label htmlFor="location_type">
                Location Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.location_type}
                onValueChange={(value) => handleChange('location_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        {type.icon} {type.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showLocationField && (
              <div className="space-y-2">
                <Label htmlFor="location_address" className="flex items-center gap-2">
                  <Building2 size={16} />
                  Physical Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location_address"
                  value={formData.location_address}
                  onChange={(e) => handleChange('location_address', e.target.value)}
                  placeholder="e.g., 123 Main St, Conference Room A"
                  required={showLocationField}
                />
              </div>
            )}

            {showZoomFields && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="zoom_link" className="flex items-center gap-2">
                    <Video size={16} />
                    Zoom Link <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="zoom_link"
                    type="url"
                    value={formData.zoom_link}
                    onChange={(e) => handleChange('zoom_link', e.target.value)}
                    placeholder="https://zoom.us/j/..."
                    required={showZoomFields}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zoom_meeting_id">Zoom Meeting ID (Optional)</Label>
                  <Input
                    id="zoom_meeting_id"
                    value={formData.zoom_meeting_id}
                    onChange={(e) => handleChange('zoom_meeting_id', e.target.value)}
                    placeholder="123 456 7890"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-rogue-forest flex items-center gap-2">
              <Users size={20} />
              Capacity
            </h3>

            <div className="space-y-2">
              <Label htmlFor="max_attendees">Maximum Attendees (Optional)</Label>
              <Input
                id="max_attendees"
                type="number"
                min="1"
                value={formData.max_attendees}
                onChange={(e) => handleChange('max_attendees', e.target.value)}
                placeholder="Leave empty for unlimited"
              />
              <p className="text-sm text-rogue-slate">
                Set a capacity limit for this event. Leave empty for unlimited capacity.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  )
}

