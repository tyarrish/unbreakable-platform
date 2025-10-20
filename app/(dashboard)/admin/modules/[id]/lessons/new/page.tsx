'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from '@/components/modules/rich-text-editor'
import { createLesson, getLessons } from '@/lib/supabase/queries/modules'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export default function NewLessonPage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.id as string
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [orderNumber, setOrderNumber] = useState(1)
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingLessons, setIsLoadingLessons] = useState(true)

  useEffect(() => {
    loadNextLessonNumber()
  }, [moduleId])

  async function loadNextLessonNumber() {
    try {
      const lessons = await getLessons(moduleId)
      // Find the highest lesson number and add 1
      const maxOrderNumber = lessons.reduce((max, lesson) => 
        Math.max(max, lesson.order_number), 0
      )
      setOrderNumber(maxOrderNumber + 1)
    } catch (error) {
      console.error('Error loading lessons:', error)
      // Default to 1 if there's an error
      setOrderNumber(1)
    } finally {
      setIsLoadingLessons(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createLesson({
        module_id: moduleId,
        title,
        content: { html: content },
        order_number: orderNumber,
        duration_minutes: durationMinutes,
      })

      toast.success('Lesson created successfully!')
      // Don't redirect - stay on page for further edits
    } catch (error) {
      console.error('Error creating lesson:', error)
      toast.error('Failed to create lesson')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="py-8">
      <Container size="lg">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push(`/admin/modules/${moduleId}?tab=lessons`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Module
          </Button>
        </div>

        <PageHeader
          heading="Create New Lesson"
          description="Add a lesson to this module"
        />

        <Card>
          <CardHeader>
            <CardTitle>Lesson Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="title">Lesson Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Understanding Your Core Values"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Lesson Number *</Label>
                  <Input
                    id="orderNumber"
                    type="number"
                    min="1"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(parseInt(e.target.value))}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  placeholder="e.g., 30"
                  value={durationMinutes || ''}
                  onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Lesson Content</Label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Write your lesson content here... Use the toolbar to format text, add headings, lists, and links."
                />
                <p className="text-xs text-rogue-slate">
                  Use the rich text editor to create engaging content with formatting, images, and links.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading || isLoadingLessons}>
                  {isLoading ? 'Creating...' : isLoadingLessons ? 'Loading...' : 'Create Lesson'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/admin/modules/${moduleId}?tab=lessons`)}
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

