'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Lock } from 'lucide-react'
import Link from 'next/link'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string | null
  category: 'learning' | 'community' | 'consistency' | 'special'
  points: number
  earned: boolean
  earned_at?: string
}

interface AchievementsPreviewProps {
  userId: string
}

export function AchievementsPreview({ userId }: AchievementsPreviewProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAchievements()
  }, [userId])

  async function loadAchievements() {
    try {
      const supabase = createClient()

      // Get all achievements with user's earned status
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: false })

      // Get user's earned achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id, earned_at')
        .eq('user_id', userId)

      const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || [])
      const earnedMap = new Map(userAchievements?.map(ua => [ua.achievement_id, ua.earned_at]))

      // Combine data
      const combinedAchievements = allAchievements?.map(achievement => ({
        ...achievement,
        earned: earnedIds.has(achievement.id),
        earned_at: earnedMap.get(achievement.id)
      })) || []

      // Calculate total points
      const points = combinedAchievements
        .filter(a => a.earned)
        .reduce((sum, a) => sum + a.points, 0)

      setAchievements(combinedAchievements)
      setTotalPoints(points)
    } catch (error) {
      console.error('Error loading achievements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const earnedCount = achievements.filter(a => a.earned).length
  const totalCount = achievements.length

  // Show first 8 achievements (4 earned, 4 locked or all earned if more than 4)
  const earnedAchievements = achievements.filter(a => a.earned).slice(0, 4)
  const lockedAchievements = achievements.filter(a => !a.earned).slice(0, 4)
  const displayAchievements = [...earnedAchievements, ...lockedAchievements].slice(0, 8)

  if (isLoading) {
    return (
      <div className="text-sm text-rogue-slate animate-pulse">
        Loading achievements...
      </div>
    )
  }

  if (earnedCount === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-rogue-slate">
          Start your journey to unlock achievements
        </p>
        <Link
          href="/profile"
          className="inline-block text-xs text-rogue-gold hover:text-rogue-gold-light transition-colors"
        >
          View all achievements →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-rogue-forest">
            {earnedCount} of {totalCount} earned
          </p>
          <p className="text-xs text-rogue-slate">
            {totalPoints} points
          </p>
        </div>
        <Link
          href="/profile"
          className="text-xs text-rogue-gold hover:text-rogue-gold-light transition-colors"
        >
          View all →
        </Link>
      </div>

      {/* Achievement Grid */}
      <TooltipProvider>
        <div className="grid grid-cols-4 gap-2">
          {displayAchievements.map((achievement) => (
            <Tooltip key={achievement.id}>
              <TooltipTrigger asChild>
                <div
                  className={`
                    relative aspect-square rounded-lg flex items-center justify-center text-2xl
                    transition-all duration-200 cursor-help
                    ${achievement.earned
                      ? 'bg-gradient-to-br from-rogue-gold/20 to-rogue-gold/5 border-2 border-rogue-gold/30 hover:scale-105'
                      : 'bg-rogue-slate/5 border-2 border-rogue-slate/10 hover:border-rogue-slate/20'
                    }
                  `}
                >
                  {achievement.earned ? (
                    <span>{achievement.icon || '🏆'}</span>
                  ) : (
                    <Lock className="h-5 w-5 text-rogue-slate/40" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{achievement.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {achievement.points} pts
                    </Badge>
                  </div>
                  <p className="text-xs text-rogue-slate">{achievement.description}</p>
                  {achievement.earned && achievement.earned_at && (
                    <p className="text-xs text-rogue-gold">
                      Earned {new Date(achievement.earned_at).toLocaleDateString()}
                    </p>
                  )}
                  {!achievement.earned && (
                    <p className="text-xs text-rogue-slate/70">🔒 Locked</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-2 bg-rogue-sage/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rogue-gold to-rogue-gold-light transition-all duration-500"
            style={{ width: `${(earnedCount / totalCount) * 100}%` }}
          />
        </div>
        <p className="text-xs text-rogue-slate text-center">
          {Math.round((earnedCount / totalCount) * 100)}% complete
        </p>
      </div>
    </div>
  )
}

