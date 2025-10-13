'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RichTextEditor } from '@/components/modules/rich-text-editor'
import { ResourceUpload } from '@/components/modules/resource-upload'
import { ResourceList } from '@/components/modules/resource-list'
import { VideoUpload } from '@/components/modules/video-upload'
import { PageLoader } from '@/components/ui/loading-spinner'
import { getLesson, updateLesson } from '@/lib/supabase/queries/modules'
import { toast } from 'sonner'
import { ArrowLeft, Upload } from 'lucide-react'
import type { Lesson } from '@/types/index.types'

export default function EditLessonPage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.id as string
  const lessonId = params.lessonId as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [orderNumber, setOrderNumber] = useState(1)
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>()
  const [videoUrl, setVideoUrl] = useState('')
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState('')
  const [videoDuration, setVideoDuration] = useState<number | undefined>()
  const [resources, setResources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadLesson()
  }, [lessonId])

  async function loadLesson() {
    try {
      const [lessonData, resourcesData] = await Promise.all([
        getLesson(lessonId),
        supabase.from('lesson_attachments').select('*').eq('lesson_id', lessonId),
      ])

      setLesson(lessonData)
      setTitle(lessonData.title)
      setContent((lessonData.content as any)?.html || '')
      setOrderNumber(lessonData.order_number)
      setDurationMinutes(lessonData.duration_minutes || undefined)
      setVideoUrl((lessonData as any).video_url || '')
      setVideoThumbnailUrl((lessonData as any).video_thumbnail_url || '')
      setVideoDuration((lessonData as any).video_duration || undefined)
      setResources(resourcesData.data || [])
    } catch (error) {
      console.error('Error loading lesson:', error)
      toast.error('Failed to load lesson')
      router.push(`/admin/modules/${moduleId}`)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadResources() {
    const { data } = await supabase
      .from('lesson_attachments')
      .select('*')
      .eq('lesson_id', lessonId)
    setResources(data || [])
  }

  async function handleDeleteResource(resourceId: string) {
    try {
      await supabase
        .from('lesson_attachments')
        .delete()
        .eq('id', resourceId)
      
      toast.success('Resource deleted')
      loadResources()
    } catch (error) {
      console.error('Error deleting resource:', error)
      toast.error('Failed to delete resource')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    try {
      await updateLesson(lessonId, {
        title,
        content: { html: content },
        order_number: orderNumber,
        duration_minutes: durationMinutes,
        video_url: videoUrl || null,
        video_thumbnail_url: videoThumbnailUrl || null,
        video_duration: videoDuration,
      } as any)

      toast.success('Lesson updated successfully!')
      router.push(`/admin/modules/${moduleId}`)
    } catch (error) {
      console.error('Error updating lesson:', error)
      toast.error('Failed to update lesson')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (!lesson) {
    return null
  }

  return (
    <div className="py-8">
      <Container size="lg">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push(`/admin/modules/${moduleId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Module
          </Button>
        </div>

        <PageHeader
          heading={`Edit Lesson ${lesson.order_number}`}
          description="Update lesson content and details"
        />

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Details & Content</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="resources">Resources ({resources.length})</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details">
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
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        disabled={isSaving}
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
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={durationMinutes || ''}
                      onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Lesson Content</Label>
                    <RichTextEditor
                      content={content}
                      onChange={setContent}
                      placeholder="Write your lesson content here..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/admin/modules/${moduleId}`)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Tab */}
          <TabsContent value="video">
            <VideoUpload
              lessonId={lessonId}
              currentVideoUrl={videoUrl}
              currentThumbnailUrl={videoThumbnailUrl}
              onUploadComplete={(url, thumbnail, duration) => {
                setVideoUrl(url)
                setVideoThumbnailUrl(thumbnail || '')
                setVideoDuration(duration)
                
                // Auto-save when video is uploaded/changed
                handleSubmit(new Event('submit') as any)
              }}
            />

            {videoUrl && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Current Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                    <video
                      src={videoUrl}
                      poster={videoThumbnailUrl}
                      controls
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-rogue-slate">Video URL:</span>
                    <a 
                      href={videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-rogue-forest hover:text-rogue-pine underline truncate max-w-xs"
                    >
                      {videoUrl}
                    </a>
                  </div>
                  {videoDuration && (
                    <p className="text-xs text-rogue-slate mt-2">
                      Duration: {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <div className="space-y-6">
              <ResourceUpload 
                lessonId={lessonId}
                onUploadComplete={loadResources}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResourceList
                    resources={resources}
                    onDelete={handleDeleteResource}
                    isAdmin
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  )
}

