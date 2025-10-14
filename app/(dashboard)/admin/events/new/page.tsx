import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { EventForm } from '@/components/events/event-form'

export default function NewEventPage() {
  return (
    <div className="py-8">
      <Container>
        <PageHeader
          heading="Create Event"
          description="Schedule a new cohort call, workshop, or event"
        />
        <EventForm />
      </Container>
    </div>
  )
}




