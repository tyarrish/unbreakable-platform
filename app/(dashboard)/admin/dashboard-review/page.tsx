'use client'

import { useEffect, useState } from 'react'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, Edit2, Save, X, Sparkles, Clock } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format-date'

interface DashboardContent {
  id: string
  content_type: string
  content: any
  generated_at: string
  approved: boolean
  active: boolean
  ai_model: string
  generation_context: any
}

export default function DashboardReviewPage() {
  const [pendingContent, setPendingContent] = useState<DashboardContent[]>([])
  const [activeContent, setActiveContent] = useState<DashboardContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState<any>(null)

  useEffect(() => {
    fetchContent()
  }, [])

  async function fetchContent() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/pending-content')
      const data = await res.json()
      
      if (data.success) {
        setPendingContent(data.content)
        
        // Find currently active content
        const active = data.content.find((c: DashboardContent) => c.active && c.approved)
        setActiveContent(active || null)
      }
    } catch (error) {
      console.error('Error fetching content:', error)
      toast.error('Failed to fetch content')
    } finally {
      setLoading(false)
    }
  }

  async function approveContent(contentId: string) {
    try {
      const res = await fetch('/api/admin/approve-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Content approved and activated!')
        fetchContent()
      } else {
        toast.error('Failed to approve content')
      }
    } catch (error) {
      console.error('Error approving content:', error)
      toast.error('Failed to approve content')
    }
  }

  function startEditing(content: DashboardContent) {
    setEditingId(content.id)
    setEditedContent(content.content)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditedContent(null)
  }

  async function saveEdit(contentId: string) {
    try {
      const res = await fetch('/api/admin/edit-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, content: editedContent }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Content updated!')
        cancelEditing()
        fetchContent()
      } else {
        toast.error('Failed to update content')
      }
    } catch (error) {
      console.error('Error updating content:', error)
      toast.error('Failed to update content')
    }
  }

  if (loading) {
    return (
      <Container>
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rogue-forest mx-auto"></div>
          <p className="mt-4 text-rogue-slate">Loading dashboard content...</p>
        </div>
      </Container>
    )
  }

  const unapprovedContent = pendingContent.filter((c) => !c.approved)

  return (
    <Container>
      <PageHeader
        title="AI Dashboard Review"
        description="Review and approve AI-generated dashboard content before it goes live"
      />

      <div className="space-y-8">
        {/* Currently Active Content */}
        {activeContent && (
          <Card className="border-2 border-rogue-gold/30 bg-gradient-to-br from-rogue-gold/5 to-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rogue-gold/10 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-rogue-gold" />
                  </div>
                  <div>
                    <CardTitle>Currently Active</CardTitle>
                    <CardDescription>
                      Generated {formatRelativeTime(new Date(activeContent.generated_at))} •{' '}
                      {activeContent.ai_model}
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-rogue-gold text-white">Live</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ContentPreview content={activeContent.content} />
            </CardContent>
          </Card>
        )}

        {/* Pending Approval */}
        {unapprovedContent.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-rogue-forest" />
              <h2 className="text-xl font-semibold text-rogue-forest">Pending Approval</h2>
              <Badge variant="outline">{unapprovedContent.length}</Badge>
            </div>

            {unapprovedContent.map((content) => (
              <Card key={content.id} className="border-rogue-sage/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rogue-sage/10 rounded-lg">
                        <Clock className="h-5 w-5 text-rogue-forest" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">New Generation</CardTitle>
                        <CardDescription>
                          Generated {formatRelativeTime(new Date(content.generated_at))} •{' '}
                          {content.ai_model}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingId === content.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="bg-rogue-forest hover:bg-rogue-pine"
                            onClick={() => saveEdit(content.id)}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(content)}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            className="bg-rogue-gold hover:bg-rogue-gold/90 text-white"
                            onClick={() => approveContent(content.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve & Activate
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingId === content.id ? (
                    <ContentEditor content={editedContent} onChange={setEditedContent} />
                  ) : (
                    <ContentPreview content={content.content} />
                  )}

                  {content.generation_context && (
                    <div className="mt-4 p-3 bg-rogue-sage/5 rounded-lg text-sm">
                      <p className="font-medium text-rogue-forest mb-1">Generation Context:</p>
                      <p className="text-rogue-slate">
                        {content.generation_context.discussionCount} discussions analyzed •{' '}
                        Themes: {content.generation_context.themes?.join(', ')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-rogue-sage mx-auto mb-4" />
              <p className="text-lg text-rogue-slate">All content reviewed!</p>
              <p className="text-sm text-rogue-slate/70 mt-1">
                New content will appear here after the next generation run (daily at 5am)
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  )
}

function ContentPreview({ content }: { content: any }) {
  return (
    <div className="space-y-6">
      {/* Hero Message */}
      {content.heroMessage && (
        <div>
          <h3 className="text-sm font-medium text-rogue-slate mb-2">Hero Message</h3>
          <div className="p-4 bg-white rounded-lg border border-rogue-sage/20">
            <p className="text-lg text-rogue-forest leading-relaxed">{content.heroMessage}</p>
          </div>
        </div>
      )}

      {/* Activity Feed */}
      {content.activityFeed && content.activityFeed.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-rogue-slate mb-2">Activity Feed</h3>
          <div className="space-y-2">
            {content.activityFeed.map((item: any, i: number) => (
              <div key={i} className="p-3 bg-white rounded-lg border border-rogue-sage/10">
                <p className="text-sm font-medium text-rogue-forest">{item.author}</p>
                <p className="text-sm text-rogue-slate mt-1">{item.preview}</p>
                <p className="text-xs text-rogue-slate/60 mt-1">{item.posted_relative}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sample Practice Actions */}
      {content.practiceActions && Object.keys(content.practiceActions).length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-rogue-slate mb-2">
            Sample Practice Actions ({Object.keys(content.practiceActions).length} users)
          </h3>
          <div className="p-3 bg-rogue-sage/5 rounded-lg text-sm text-rogue-slate">
            Personalized actions generated for {Object.keys(content.practiceActions).length} users
          </div>
        </div>
      )}
    </div>
  )
}

function ContentEditor({ content, onChange }: { content: any; onChange: (content: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-rogue-forest mb-2">
          Hero Message
        </label>
        <Textarea
          value={content.heroMessage || ''}
          onChange={(e) => onChange({ ...content, heroMessage: e.target.value })}
          rows={3}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-rogue-forest mb-2">
          Activity Feed (JSON)
        </label>
        <Textarea
          value={JSON.stringify(content.activityFeed, null, 2)}
          onChange={(e) => {
            try {
              onChange({ ...content, activityFeed: JSON.parse(e.target.value) })
            } catch (error) {
              // Invalid JSON, don't update
            }
          }}
          rows={10}
          className="w-full font-mono text-xs"
        />
      </div>
    </div>
  )
}

