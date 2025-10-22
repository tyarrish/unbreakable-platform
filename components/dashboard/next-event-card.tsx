import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

interface NextEventCardProps {
  nextEvent: {
    id: string
    title: string
    startTime: string
    location?: string
  } | null
}

export function NextEventCard({ nextEvent }: NextEventCardProps) {
  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-rogue-gold/5 hover:shadow-2xl transition-all hover:scale-[1.02] duration-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rogue-gold/10 rounded-lg">
            <Calendar className="h-5 w-5 text-rogue-gold" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-rogue-slate mb-1">Next Gathering</p>
            {nextEvent ? (
              <>
                <Link
                  href={`/calendar?event=${nextEvent.id}`}
                  className="text-lg font-semibold text-rogue-forest hover:text-rogue-pine transition-colors block"
                >
                  {nextEvent.title}
                </Link>
                <p className="text-sm text-rogue-slate mt-1">
                  {new Date(nextEvent.startTime).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZone: 'America/Los_Angeles',
                  })} PT
                </p>
                {nextEvent.location && (
                  <p className="text-xs text-rogue-slate/70 mt-1">
                    {nextEvent.location}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-rogue-slate">None scheduled</p>
                <Link
                  href="/calendar"
                  className="text-sm text-rogue-forest/70 hover:text-rogue-forest transition-colors mt-1 inline-block"
                >
                  View calendar →
                </Link>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

