'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { MessageSquare, Pin, Lock, Plus } from 'lucide-react'
import { getThreads } from '@/lib/supabase/queries/discussions'
import { formatRelativeTime } from '@/lib/utils/format-date'
import { toast } from 'sonner'

export default function DiscussionsPage() {
  const [threads, setThreads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadThreads()
  }, [])

  async function loadThreads() {
    try {
      const data = await getThreads()
      setThreads(data)
    } catch (error) {
      console.error('Error loading discussions:', error)
      toast.error('Failed to load discussions')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          heading="Discussions"
          description="Connect with your cohort and share insights"
        >
          <Button onClick={() => router.push('/discussions/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Thread
          </Button>
        </PageHeader>

        {threads.length === 0 ? (
          <EmptyState
            icon={<MessageSquare size={64} />}
            title="No Discussions Yet"
            description="Start engaging with your cohort by creating the first discussion thread."
            action={{
              label: 'Create Discussion',
              onClick: () => router.push('/discussions/new'),
            }}
          />
        ) : (
          <div className="space-y-3">
            {threads.map((thread) => {
              const postCount = thread.posts?.[0]?.count || 0
              const author = thread.created_by_profile

              return (
                <Card
                  key={thread.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/discussions/${thread.id}`)}
                >
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={author?.avatar_url} />
                        <AvatarFallback className="bg-rogue-forest text-white">
                          {author?.full_name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {thread.is_pinned && (
                                <Pin className="h-4 w-4 text-rogue-gold" />
                              )}
                              {thread.is_locked && (
                                <Lock className="h-4 w-4 text-rogue-slate" />
                              )}
                              <h3 className="font-semibold text-rogue-forest">
                                {thread.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-rogue-slate">
                              <span>{author?.full_name || 'Unknown'}</span>
                              <span>•</span>
                              <span>{formatRelativeTime(thread.created_at)}</span>
                              {postCount > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <MessageSquare size={14} />
                                    {postCount} {postCount === 1 ? 'reply' : 'replies'}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </Container>
    </div>
  )
}

