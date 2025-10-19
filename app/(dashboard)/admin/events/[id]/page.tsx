'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EventForm } from '@/components/events/event-form'
import { getEvent } from '@/lib/supabase/queries/events'
import { toast } from 'sonner'
import type { Event } from '@/types/index.types'

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAdminAccess()
    loadEvent()
  }, [params.id])

  async function checkAdminAccess() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .single<{ roles: string[] }>()

    if (!profile?.roles?.some(r => ['admin', 'facilitator'].includes(r))) {
      router.push('/dashboard')
    }
  }

  async function loadEvent() {
    try {
      const eventData = await getEvent(params.id as string)
      setEvent(eventData as Event)
    } catch (error) {
      console.error('Error loading event:', error)
      toast.error('Failed to load event')
      router.push('/admin/events')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (!event) {
    return null
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          heading="Edit Event"
          description="Update event details and settings"
        />
        <EventForm event={event} />
      </Container>
    </div>
  )
}




