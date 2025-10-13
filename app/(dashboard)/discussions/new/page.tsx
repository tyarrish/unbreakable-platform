'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createThread, createPost } from '@/lib/supabase/queries/discussions'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export default function NewDiscussionPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getUser()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    setIsLoading(true)

    try {
      // Create thread
      const thread = await createThread({
        title,
        created_by: userId,
      })

      // Create first post
      await createPost({
        thread_id: thread.id,
        author_id: userId,
        content,
      })

      toast.success('Discussion created successfully!')
      router.push(`/discussions/${thread.id}`)
    } catch (error) {
      console.error('Error creating discussion:', error)
      toast.error('Failed to create discussion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="py-8">
      <Container size="md">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Discussions
          </Button>
        </div>

        <PageHeader
          heading="Start a Discussion"
          description="Share thoughts, ask questions, and engage with your cohort"
        />

        <Card>
          <CardHeader>
            <CardTitle>New Discussion Thread</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Discussion Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Thoughts on Module 1: Self-Awareness"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Your Message *</Label>
                <Textarea
                  id="content"
                  placeholder="Share your thoughts, questions, or insights..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-rogue-slate">
                  Use @username to mention other participants
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Discussion'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}

