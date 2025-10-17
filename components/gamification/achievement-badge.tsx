import { Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Achievement } from '@/lib/supabase/queries/achievements'

interface AchievementBadgeProps {
  achievement: Achievement
  earned?: boolean
  showPoints?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function AchievementBadge({
  achievement,
  earned = false,
  showPoints = true,
  size = 'md'
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-20 h-20 text-4xl'
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`
              relative flex items-center justify-center rounded-lg
              ${sizeClasses[size]}
              ${earned
                ? 'bg-gradient-to-br from-rogue-gold/20 to-rogue-gold/10 border-2 border-rogue-gold'
                : 'bg-rogue-slate/10 border-2 border-rogue-slate/20 grayscale opacity-50'
              }
              transition-all duration-200 hover:scale-105 cursor-pointer
            `}
          >
            {achievement.icon ? (
              <span className="select-none">{achievement.icon}</span>
            ) : (
              <Trophy
                className={`${size === 'sm' ? 'h-6 w-6' : size === 'md' ? 'h-8 w-8' : 'h-10 w-10'} ${
                  earned ? 'text-rogue-gold' : 'text-rogue-slate/50'
                }`}
              />
            )}
            {showPoints && earned && (
              <Badge
                variant="secondary"
                className="absolute -bottom-2 -right-2 h-6 px-2 bg-rogue-gold text-white text-xs font-bold"
              >
                +{achievement.points}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{achievement.name}</p>
            <p className="text-sm text-rogue-slate">{achievement.description}</p>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="outline" className="text-xs">
                {achievement.category}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {achievement.points} points
              </Badge>
              {!earned && (
                <Badge variant="outline" className="text-xs text-rogue-slate">
                  Locked
                </Badge>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}







