'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  MessageSquare,
  Calendar,
  Trophy,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import {
  getActivityFeed,
  subscribeToActivityFeed,
  type ActivityItem
} from '@/lib/supabase/queries/activity'
import { formatRelativeTime } from '@/lib/utils/format-date'
import { useRouter } from 'next/navigation'
import { PageLoader } from '@/components/ui/loading-spinner'

interface ActivityFeedProps {
  userId?: string
  limit?: number
  showFilters?: boolean
}

export function ActivityFeed({ userId, limit = 20, showFilters = true }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<ActivityItem['activity_type'] | 'all'>('all')
  const router = useRouter()

  useEffect(() => {
    loadActivities()

    // Subscribe to new activities
    const channel = subscribeToActivityFeed((newActivity) => {
      setActivities(prev => [newActivity, ...prev])
    })

    return () => {
      channel.unsubscribe()
    }
  }, [userId])

  async function loadActivities() {
    try {
      setIsLoading(true)
      const data = await getActivityFeed(limit)
      setActivities(data)
    } catch (error) {
      console.error('Error loading activity feed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: ActivityItem['activity_type']) => {
    switch (type) {
      case 'lesson_completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'discussion_post':
        return <MessageSquare className="h-4 w-4 text-rogue-gold" />
      case 'event_registered':
        return <Calendar className="h-4 w-4 text-rogue-copper" />
      case 'book_progress':
        return <BookOpen className="h-4 w-4 text-rogue-pine" />
      case 'achievement_earned':
        return <Trophy className="h-4 w-4 text-rogue-gold" />
      case 'module_completed':
        return <BookOpen className="h-4 w-4 text-rogue-forest" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: ActivityItem['activity_type']) => {
    switch (type) {
      case 'lesson_completed':
        return 'bg-green-100 text-green-800'
      case 'discussion_post':
        return 'bg-rogue-gold/20 text-rogue-gold'
      case 'event_registered':
        return 'bg-rogue-copper/20 text-rogue-copper'
      case 'book_progress':
        return 'bg-rogue-pine/20 text-rogue-pine'
      case 'achievement_earned':
        return 'bg-rogue-gold/20 text-rogue-gold'
      case 'module_completed':
        return 'bg-rogue-forest/20 text-rogue-forest'
      default:
        return 'bg-rogue-sage/20 text-rogue-forest'
    }
  }

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.activity_type === filter)

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Activity
          </Button>
          <Button
            variant={filter === 'lesson_completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('lesson_completed')}
          >
            <CheckCircle size={14} className="mr-1" />
            Lessons
          </Button>
          <Button
            variant={filter === 'discussion_post' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('discussion_post')}
          >
            <MessageSquare size={14} className="mr-1" />
            Discussions
          </Button>
          <Button
            variant={filter === 'achievement_earned' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('achievement_earned')}
          >
            <Trophy size={14} className="mr-1" />
            Achievements
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadActivities}
            className="ml-auto"
          >
            <RefreshCw size={14} className="mr-1" />
            Refresh
          </Button>
        </div>
      )}

      {filteredActivities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-rogue-slate">No activity yet. Start your journey!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <Card
              key={activity.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => activity.link && router.push(activity.link)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.user?.avatar_url || undefined} />
                    <AvatarFallback className="bg-rogue-forest text-white">
                      {activity.user?.full_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-rogue-forest">
                        {activity.user?.full_name || 'Member'}
                      </p>
                      <Badge variant="outline" className={`text-xs ${getActivityColor(activity.activity_type)}`}>
                        <span className="mr-1">{getActivityIcon(activity.activity_type)}</span>
                        {activity.activity_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-rogue-slate mb-1">{activity.title}</p>
                    {activity.description && (
                      <p className="text-xs text-rogue-slate/70">{activity.description}</p>
                    )}
                    <p className="text-xs text-rogue-slate/70 mt-2">
                      {formatRelativeTime(activity.created_at)}
                    </p>
                  </div>

                  {activity.metadata?.icon && (
                    <div className="text-2xl">{activity.metadata.icon}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}









