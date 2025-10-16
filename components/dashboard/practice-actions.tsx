import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, MessageCircle, BookOpen, Users, Lightbulb } from 'lucide-react'

interface PracticeAction {
  action: string
  why: string
  priority: number
  category: 'connect' | 'reflect' | 'engage' | 'practice' | 'read'
}

interface PracticeActionsProps {
  actions: PracticeAction[]
}

const categoryConfig = {
  connect: {
    icon: Users,
    color: 'bg-rogue-gold/10 text-rogue-gold',
    label: 'Connect',
  },
  reflect: {
    icon: Lightbulb,
    color: 'bg-rogue-sage/10 text-rogue-forest',
    label: 'Reflect',
  },
  engage: {
    icon: MessageCircle,
    color: 'bg-rogue-copper/10 text-rogue-copper',
    label: 'Engage',
  },
  practice: {
    icon: CheckCircle2,
    color: 'bg-rogue-forest/10 text-rogue-forest',
    label: 'Practice',
  },
  read: {
    icon: BookOpen,
    color: 'bg-rogue-pine/10 text-rogue-pine',
    label: 'Read',
  },
}

export function PracticeActions({ actions }: PracticeActionsProps) {
  if (actions.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Your Practice This Week</CardTitle>
          <CardDescription>Specific actions for your growth edge</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-rogue-slate text-center py-8">
            Your personalized practices will appear here.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Sort by priority
  const sortedActions = [...actions].sort((a, b) => a.priority - b.priority)

  return (
    <Card className="border-0 shadow-lg sticky top-8">
      <CardHeader>
        <CardTitle>Your Practice This Week</CardTitle>
        <CardDescription>Specific actions for your growth edge</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedActions.map((action, index) => {
            const config = categoryConfig[action.category]
            const Icon = config.icon

            return (
              <div
                key={index}
                className="p-4 rounded-lg border border-rogue-sage/10 bg-gradient-to-br from-white to-rogue-sage/5 hover:border-rogue-sage/30 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${config.color} flex-shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-rogue-forest leading-snug">
                        {action.action}
                      </p>
                      {action.priority === 1 && (
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          Priority
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-rogue-slate mt-2">{action.why}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {config.label}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

