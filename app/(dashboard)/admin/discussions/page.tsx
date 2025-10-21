'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  MessageSquare,
  Search,
  Pin,
  Lock,
  Unlock,
  Trash2,
  Eye,
  MessageCircle,
} from 'lucide-react'
import { formatDate } from '@/lib/utils/format-date'
import { toast } from 'sonner'

export default function AdminDiscussionsPage() {
  const [threads, setThreads] = useState<any[]>([])
  const [filteredThreads, setFilteredThreads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAccess()
    loadThreads()
  }, [])

  useEffect(() => {
    filterThreads()
  }, [threads, searchQuery, statusFilter])

  async function checkAccess() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .single<{ roles: string[] }>()

    if (!profile?.roles?.some(r => ['admin', 'facilitator'].includes(r))) {
      router.push('/dashboard')
    }
  }

  async function loadThreads() {
    try {
      const { data, error } = await supabase
        .from('discussion_threads')
        .select('*, created_by_profile:profiles!discussion_threads_created_by_fkey(full_name)')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get post counts
      const threadsWithCounts = await Promise.all(
        (data || []).map(async (thread: any) => {
          const { count } = await supabase
            .from('discussion_posts')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', thread.id)

          return { ...thread, post_count: count || 0 }
        })
      )

      setThreads(threadsWithCounts)
    } catch (error) {
      console.error('Error loading threads:', error)
      toast.error('Failed to load discussions')
    } finally {
      setIsLoading(false)
    }
  }

  function filterThreads() {
    let filtered = [...threads]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.content?.toLowerCase().includes(query)
      )
    }

    if (statusFilter === 'pinned') {
      filtered = filtered.filter(t => t.is_pinned)
    } else if (statusFilter === 'locked') {
      filtered = filtered.filter(t => t.is_locked)
    }

    setFilteredThreads(filtered)
  }

  async function handleTogglePin(threadId: string, isPinned: boolean) {
    try {
      const { error } = await (supabase as any)
        .from('discussion_threads')
        .update({ is_pinned: !isPinned })
        .eq('id', threadId)

      if (error) throw error

      toast.success(isPinned ? 'Thread unpinned' : 'Thread pinned')
      loadThreads()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update thread')
    }
  }

  async function handleToggleLock(threadId: string, isLocked: boolean) {
    try {
      const { error } = await (supabase as any)
        .from('discussion_threads')
        .update({ is_locked: !isLocked })
        .eq('id', threadId)

      if (error) throw error

      toast.success(isLocked ? 'Thread unlocked' : 'Thread locked')
      loadThreads()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update thread')
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return

    try {
      const { error } = await supabase
        .from('discussion_threads')
        .delete()
        .eq('id', deleteConfirm.id)

      if (error) throw error

      toast.success('Thread deleted successfully')
      setDeleteConfirm(null)
      loadThreads()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete thread')
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          heading="Manage Discussions"
          description="Moderate discussion threads, pin important topics, and manage community engagement"
        />

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rogue-slate" />
                <Input
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Discussions</SelectItem>
                  <SelectItem value="pinned">Pinned Only</SelectItem>
                  <SelectItem value="locked">Locked Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Threads Table */}
        {filteredThreads.length === 0 ? (
          <EmptyState
            icon={<MessageSquare size={64} />}
            title="No discussions found"
            description={searchQuery || statusFilter !== 'all' 
              ? "Try adjusting your filters" 
              : "No discussion threads have been created yet"}
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-rogue-sage/5 border-b border-rogue-sage/20">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-rogue-forest">Thread</th>
                      <th className="text-left p-4 text-sm font-semibold text-rogue-forest">Author</th>
                      <th className="text-center p-4 text-sm font-semibold text-rogue-forest">Posts</th>
                      <th className="text-center p-4 text-sm font-semibold text-rogue-forest">Views</th>
                      <th className="text-left p-4 text-sm font-semibold text-rogue-forest">Created</th>
                      <th className="text-right p-4 text-sm font-semibold text-rogue-forest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rogue-sage/10">
                    {filteredThreads.map((thread) => (
                      <tr key={thread.id} className="hover:bg-rogue-sage/5 transition-colors">
                        <td className="p-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              {thread.is_pinned && (
                                <Pin className="h-3 w-3 text-rogue-gold" />
                              )}
                              {thread.is_locked && (
                                <Lock className="h-3 w-3 text-rogue-slate" />
                              )}
                              <button
                                onClick={() => router.push(`/discussions/${thread.id}`)}
                                className="font-medium text-rogue-forest hover:text-rogue-gold transition-colors text-left"
                              >
                                {thread.title}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-rogue-slate">
                          {thread.created_by_profile?.full_name || 'Unknown'}
                        </td>
                        <td className="p-4 text-center text-sm text-rogue-slate">
                          {thread.post_count}
                        </td>
                        <td className="p-4 text-center text-sm text-rogue-slate">
                          {thread.views_count || 0}
                        </td>
                        <td className="p-4 text-sm text-rogue-slate">
                          {formatDate(thread.created_at)}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePin(thread.id, thread.is_pinned)}
                              title={thread.is_pinned ? 'Unpin thread' : 'Pin thread'}
                            >
                              <Pin className={`h-4 w-4 ${thread.is_pinned ? 'fill-current text-rogue-gold' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleLock(thread.id, thread.is_locked)}
                              title={thread.is_locked ? 'Unlock thread' : 'Lock thread'}
                            >
                              {thread.is_locked ? (
                                <Unlock className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(thread)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete thread"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Discussion Thread</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirm?.title}"? 
              This will permanently delete the thread and all its comments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Thread
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

