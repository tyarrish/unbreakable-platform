'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award } from 'lucide-react'
import { getLeaderboard } from '@/lib/supabase/queries/achievements'
import { PageLoader } from '@/components/ui/loading-spinner'
import { useRouter } from 'next/navigation'

interface LeaderboardProps {
  limit?: number
  currentUserId?: string
}

export function Leaderboard({ limit = 10, currentUserId }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadLeaderboard()
  }, [limit])

  async function loadLeaderboard() {
    try {
      const data = await getLeaderboard(limit)
      setLeaderboard(data)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-semibold text-rogue-slate">#{rank}</span>
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-rogue-gold" />
          Leaderboard
        </CardTitle>
        <CardDescription>Top performers in your cohort</CardDescription>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <p className="text-sm text-rogue-slate py-8 text-center">
            No leaderboard data yet. Start earning achievements!
          </p>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => {
              const rank = index + 1
              const isCurrentUser = entry.user_id === currentUserId

              return (
                <div
                  key={entry.user_id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer
                    ${isCurrentUser
                      ? 'bg-rogue-gold/10 border-2 border-rogue-gold'
                      : 'bg-rogue-sage/5 hover:bg-rogue-sage/10'
                    }
                  `}
                  onClick={() => router.push(`/members/${entry.user_id}`)}
                >
                  <div className="flex-shrink-0 w-8 flex items-center justify-center">
                    {getRankIcon(rank)}
                  </div>

                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.user?.avatar_url || undefined} />
                    <AvatarFallback className="bg-rogue-forest text-white">
                      {entry.user?.full_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-rogue-forest truncate">
                      {entry.user?.full_name || 'Member'}
                      {isCurrentUser && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          You
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-rogue-slate">
                      {entry.achievement_count} achievements
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-rogue-gold">{entry.total_points}</p>
                    <p className="text-xs text-rogue-slate">points</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}




