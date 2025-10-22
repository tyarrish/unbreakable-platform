import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, MessageSquare, Calendar, TrendingUp, Target } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format-date'

interface PracticeGridProps {
  currentModule: {
    title: string
    id: string | null
  }
  liveConversations: {
    count: number
    hottestTopic?: string
  }
  nextEvent: {
    id: string
    title: string
    startTime: string
    location?: string
  } | null
  yourRhythm: {
    daysActive: number
  }
  personalizedActions: any[]
}

export function PracticeGrid({
  currentModule,
  liveConversations,
  nextEvent,
  yourRhythm,
  personalizedActions,
}: PracticeGridProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Current Focus */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-rogue-forest/5 hover:shadow-2xl transition-all hover:scale-[1.02] duration-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rogue-forest/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-rogue-forest" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-rogue-slate mb-1">Current Focus</p>
              {currentModule.id ? (
                <Link 
                  href={`/modules/${currentModule.id}`}
                  className="text-lg font-semibold text-rogue-forest hover:text-rogue-pine transition-colors"
                >
                  {currentModule.title}
                </Link>
              ) : (
                <p className="text-lg font-semibold text-rogue-forest">
                  {currentModule.title}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Conversations */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-rogue-copper/5 hover:shadow-2xl transition-all hover:scale-[1.02] duration-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rogue-copper/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-rogue-copper" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-rogue-slate mb-1">Live Conversations</p>
              <Link
                href="/discussions"
                className="text-lg font-semibold text-rogue-forest hover:text-rogue-pine transition-colors"
              >
                {liveConversations.count} active discussions
              </Link>
              {liveConversations.hottestTopic && (
                <p className="text-sm text-rogue-slate mt-1 line-clamp-1">
                  Direct Message
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Rhythm */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-rogue-sage/5 hover:shadow-2xl transition-all hover:scale-[1.02] duration-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rogue-sage/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-rogue-forest" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-rogue-slate mb-1">Your Rhythm</p>
              <p className="text-lg font-semibold text-rogue-forest">
                {yourRhythm.daysActive} {yourRhythm.daysActive === 1 ? 'day' : 'days'} active this week
              </p>
              <p className="text-sm text-rogue-slate mt-1">
                {yourRhythm.daysActive >= 5
                  ? 'Strong consistent practice'
                  : yourRhythm.daysActive >= 3
                  ? 'Building momentum'
                  : 'Room to engage more deeply'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Practice This Week */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-rogue-gold/5 hover:shadow-2xl transition-all hover:scale-[1.02] duration-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rogue-gold/10 rounded-lg">
              <Target className="h-5 w-5 text-rogue-gold" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-rogue-slate mb-1">Your Practice This Week</p>
              {personalizedActions && personalizedActions.length > 0 ? (
                <div className="space-y-2">
                  {personalizedActions.slice(0, 2).map((action: any, index: number) => (
                    <div key={index} className="text-sm text-rogue-slate">
                      • {action.action || action.title || action}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-rogue-slate">
                  Your personalized practices will appear here.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

