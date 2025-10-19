'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Sparkles, TrendingUp, Users } from 'lucide-react'

interface DiscussionEngagementCardProps {
  userId: string
}

export function DiscussionEngagementCard({ userId }: DiscussionEngagementCardProps) {
  const [hasPostedThisWeek, setHasPostedThisWeek] = useState(false)
  const [activeDiscussionCount, setActiveDiscussionCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (userId) {
      checkUserEngagement()
    }
  }, [userId])

  async function checkUserEngagement() {
    try {
      // Check if user has posted in past 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      
      const { count: userPosts } = await supabase
        .from('discussion_posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId)
        .gte('created_at', sevenDaysAgo)

      setHasPostedThisWeek((userPosts || 0) > 0)

      // Get active discussion count
      const { count: discussionCount } = await supabase
        .from('discussion_threads')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_type', 'public_discussion')
        .gte('created_at', sevenDaysAgo)

      setActiveDiscussionCount(discussionCount || 0)
    } catch (error) {
      console.error('Error checking engagement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show if user has already posted this week
  if (isLoading || hasPostedThisWeek) {
    return null
  }

  return (
    <Card className="border-2 border-rogue-gold/40 bg-gradient-to-br from-rogue-gold/10 via-white to-rogue-cream/30 shadow-lg overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(212,175,55,0.15),transparent)]"></div>
          
          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-rogue-gold/20 rounded-xl">
                <MessageSquare className="h-6 w-6 text-rogue-gold" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-rogue-forest">
                    Your Cohort Needs Your Voice
                  </h3>
                  <Badge className="bg-rogue-gold text-white">
                    Action Needed
                  </Badge>
                </div>
                <p className="text-rogue-slate leading-relaxed">
                  {activeDiscussionCount > 0 
                    ? `${activeDiscussionCount} active ${activeDiscussionCount === 1 ? 'conversation' : 'conversations'} happening now. Your perspective matters.`
                    : "Be the first to share what you're working on this week."
                  }
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6 p-4 bg-white/50 rounded-lg border border-rogue-sage/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-rogue-forest" />
                <div>
                  <p className="text-xs text-rogue-slate">Active This Week</p>
                  <p className="text-lg font-bold text-rogue-forest">{activeDiscussionCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-rogue-sage" />
                <div>
                  <p className="text-xs text-rogue-slate">Leaders Engaging</p>
                  <p className="text-lg font-bold text-rogue-forest">See Discussions</p>
                </div>
              </div>
            </div>

            {/* Prompts */}
            <div className="space-y-3 mb-6">
              <p className="text-sm font-semibold text-rogue-forest">What to share:</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-rogue-slate">
                  <Sparkles className="h-4 w-4 text-rogue-gold flex-shrink-0 mt-0.5" />
                  <p>A specific challenge you're facing in your leadership right now</p>
                </div>
                <div className="flex items-start gap-2 text-sm text-rogue-slate">
                  <Sparkles className="h-4 w-4 text-rogue-gold flex-shrink-0 mt-0.5" />
                  <p>A question from this month's module that's stuck with you</p>
                </div>
                <div className="flex items-start gap-2 text-sm text-rogue-slate">
                  <Sparkles className="h-4 w-4 text-rogue-gold flex-shrink-0 mt-0.5" />
                  <p>How you're applying what you're learning in real situations</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3">
              <Button 
                onClick={() => router.push('/discussions')}
                className="flex-1 bg-gradient-to-r from-rogue-forest to-rogue-pine hover:from-rogue-pine hover:to-rogue-forest shadow-md"
                size="lg"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                View Discussions
              </Button>
              <Button 
                onClick={() => router.push('/discussions')}
                variant="outline"
                className="border-rogue-forest/30 hover:bg-rogue-forest hover:text-white"
              >
                Start New Discussion
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

