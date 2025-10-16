import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Users } from 'lucide-react'

interface ActivityItem {
  author: string
  preview: string
  discussion_id: string
  posted_relative: string
}

interface CohortActivityProps {
  activities: ActivityItem[]
}

export function CohortActivity({ activities }: CohortActivityProps) {
  if (activities.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rogue-sage/10 rounded-lg">
              <Users className="h-5 w-5 text-rogue-forest" />
            </div>
            <CardTitle>What Your Cohort Is Working On</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-rogue-slate text-center py-8">
            No recent discussions. Be the first to share what you're working on.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rogue-sage/10 rounded-lg">
            <Users className="h-5 w-5 text-rogue-forest" />
          </div>
          <div>
            <CardTitle>What Your Cohort Is Working On</CardTitle>
            <CardDescription>The most substantive conversations from the past 48 hours</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <Link
              key={index}
              href={`/discussions/${activity.discussion_id}`}
              className="block p-4 rounded-lg border border-rogue-sage/10 bg-white hover:border-rogue-sage/30 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rogue-copper/10 rounded-lg flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-rogue-copper" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-rogue-forest">{activity.author}</p>
                  <p className="text-sm text-rogue-slate mt-1 line-clamp-2">{activity.preview}</p>
                  <p className="text-xs text-rogue-slate/60 mt-2">{activity.posted_relative}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-rogue-sage/10">
          <Link
            href="/discussions"
            className="text-sm font-medium text-rogue-forest hover:text-rogue-pine transition-colors"
          >
            View all discussions →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

