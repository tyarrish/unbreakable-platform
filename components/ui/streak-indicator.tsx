import { Flame, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface StreakIndicatorProps {
  currentStreak: number
  longestStreak?: number
  type?: 'daily' | 'weekly'
  showLongest?: boolean
}

export function StreakIndicator({
  currentStreak,
  longestStreak,
  type = 'daily',
  showLongest = true
}: StreakIndicatorProps) {
  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-500'
    if (streak >= 14) return 'text-orange-500'
    if (streak >= 7) return 'text-yellow-500'
    return 'text-rogue-gold'
  }

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Start your streak today!"
    if (streak === 1) return "Great start! Keep it going!"
    if (streak < 7) return "You're building momentum!"
    if (streak < 14) return "Impressive consistency!"
    if (streak < 30) return "You're on fire! 🔥"
    return "Legendary streak! 🌟"
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Flame className={`h-8 w-8 ${getStreakColor(currentStreak)}`} />
              <div>
                <p className="text-3xl font-bold text-rogue-forest">
                  {currentStreak}
                </p>
                <p className="text-sm text-rogue-slate">
                  {type === 'daily' ? 'Day' : 'Week'} Streak
                </p>
              </div>
            </div>
            <p className="text-xs text-rogue-slate">
              {getStreakMessage(currentStreak)}
            </p>
          </div>

          {showLongest && longestStreak !== undefined && longestStreak > 0 && (
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Zap className="h-4 w-4 text-rogue-slate" />
                <p className="text-xl font-semibold text-rogue-forest">
                  {longestStreak}
                </p>
              </div>
              <p className="text-xs text-rogue-slate">Best Streak</p>
              {currentStreak === longestStreak && currentStreak > 0 && (
                <Badge variant="outline" className="mt-1 text-xs">
                  Personal Best!
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Streak Progress Bar */}
        {currentStreak > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-rogue-slate">
                Next milestone: {Math.ceil(currentStreak / 7) * 7} days
              </span>
              <span className="text-xs font-medium text-rogue-forest">
                {currentStreak % 7}/7
              </span>
            </div>
            <div className="h-2 bg-rogue-slate/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${((currentStreak % 7) / 7) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}





