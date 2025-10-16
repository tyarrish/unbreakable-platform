import { Badge } from '@/components/ui/badge'
import { CheckCircle2, MessageCircle, BookOpen, Users, Lightbulb, ArrowRight } from 'lucide-react'

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
    color: 'from-rogue-gold/20 to-rogue-gold/5',
    iconBg: 'bg-rogue-gold text-white',
    border: 'border-rogue-gold/30',
    label: 'Connect',
  },
  reflect: {
    icon: Lightbulb,
    color: 'from-rogue-sage/20 to-rogue-sage/5',
    iconBg: 'bg-rogue-forest text-white',
    border: 'border-rogue-sage/30',
    label: 'Reflect',
  },
  engage: {
    icon: MessageCircle,
    color: 'from-rogue-copper/20 to-rogue-copper/5',
    iconBg: 'bg-rogue-copper text-white',
    border: 'border-rogue-copper/30',
    label: 'Engage',
  },
  practice: {
    icon: CheckCircle2,
    color: 'from-rogue-forest/20 to-rogue-forest/5',
    iconBg: 'bg-rogue-forest text-white',
    border: 'border-rogue-forest/30',
    label: 'Practice',
  },
  read: {
    icon: BookOpen,
    color: 'from-rogue-pine/20 to-rogue-pine/5',
    iconBg: 'bg-rogue-pine text-white',
    border: 'border-rogue-pine/30',
    label: 'Read',
  },
}

export function PracticeActions({ actions }: PracticeActionsProps) {
  if (actions.length === 0) {
    return (
      <div className="sticky top-8">
        <div className="border-l-4 border-rogue-gold/30 pl-6 py-8">
          <h2 className="text-xl font-bold text-rogue-forest mb-2">Your Practice This Week</h2>
          <p className="text-rogue-slate/70">
            Your personalized practices will appear here.
          </p>
        </div>
      </div>
    )
  }

  // Sort by priority
  const sortedActions = [...actions].sort((a, b) => a.priority - b.priority)

  return (
    <div className="sticky top-8">
      {/* Header */}
      <div className="border-l-4 border-rogue-gold/50 pl-6 mb-8">
        <h2 className="text-2xl font-bold text-rogue-forest mb-1">Your Practice This Week</h2>
        <p className="text-sm text-rogue-slate/70">Specific actions for your growth edge</p>
      </div>

      {/* Actions List */}
      <div className="space-y-4 pl-6">
        {sortedActions.map((action, index) => {
          const config = categoryConfig[action.category]
          const Icon = config.icon

          return (
            <div
              key={index}
              className={`group relative bg-gradient-to-br ${config.color} border ${config.border} rounded-xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer`}
            >
              {/* Priority indicator */}
              {action.priority === 1 && (
                <div className="absolute -left-6 top-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 bg-rogue-gold rounded-full shadow-lg shadow-rogue-gold/50" />
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={`${config.iconBg} p-3 rounded-lg shadow-md flex-shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-base font-semibold text-rogue-forest leading-tight pr-2">
                      {action.action}
                    </p>
                    <ArrowRight className="h-5 w-5 text-rogue-forest/40 group-hover:text-rogue-forest group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                  
                  <p className="text-sm text-rogue-slate/80 leading-relaxed mb-3">
                    {action.why}
                  </p>
                  
                  <Badge 
                    variant="outline" 
                    className="text-xs border-rogue-forest/20 text-rogue-forest/70"
                  >
                    {config.label}
                  </Badge>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

