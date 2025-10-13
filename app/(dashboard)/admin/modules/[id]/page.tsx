'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageLoader } from '@/components/ui/loading-spinner'
import { getModule, updateModule, getLessons } from '@/lib/supabase/queries/modules'
import { toast } from 'sonner'
import { ArrowLeft, Plus } from 'lucide-react'
import type { Module, Lesson } from '@/types/index.types'
import { LessonsList } from '@/components/modules/lessons-list'

export default function EditModulePage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.id as string

  const [module, setModule] = useState<Module | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [orderNumber, setOrderNumber] = useState(1)
  const [releaseDate, setReleaseDate] = useState('')
  const [isPublished, setIsPublished] = useState(false)

  useEffect(() => {
    loadModule()
    loadLessons()
  }, [moduleId])

  async function loadModule() {
    try {
      const data = await getModule(moduleId)
      setModule(data)
      setTitle(data.title)
      setDescription(data.description || '')
      setOrderNumber(data.order_number)
      setReleaseDate(data.release_date ? new Date(data.release_date).toISOString().slice(0, 16) : '')
      setIsPublished(data.is_published)
    } catch (error) {
      console.error('Error loading module:', error)
      toast.error('Failed to load module')
      router.push('/admin/modules')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadLessons() {
    try {
      const data = await getLessons(moduleId)
      setLessons(data)
    } catch (error) {
      console.error('Error loading lessons:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    try {
      await updateModule(moduleId, {
        title,
        description,
        order_number: orderNumber,
        release_date: releaseDate || null,
        is_published: isPublished,
      })

      toast.success('Module updated successfully!')
      router.push('/admin/modules')
    } catch (error) {
      console.error('Error updating module:', error)
      toast.error('Failed to update module')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (!module) {
    return null
  }

  return (
    <div className="py-8">
      <Container size="lg">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/admin/modules')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Modules
          </Button>
        </div>

        <PageHeader
          heading={`Edit Module ${module.order_number}`}
          description="Update module details and manage lessons"
        />

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Module Details</TabsTrigger>
            <TabsTrigger value="lessons">Lessons ({lessons.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Module Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Module Title *</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        disabled={isSaving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderNumber">Module Number *</Label>
                      <Input
                        id="orderNumber"
                        type="number"
                        min="1"
                        max="8"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(parseInt(e.target.value))}
                        required
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="releaseDate">Release Date</Label>
                    <Input
                      id="releaseDate"
                      type="datetime-local"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      disabled={isSaving}
                      className="h-4 w-4 rounded border-rogue-sage text-rogue-forest focus:ring-rogue-gold"
                    />
                    <Label htmlFor="isPublished" className="cursor-pointer">
                      Publish module
                    </Label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/admin/modules')}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lessons</CardTitle>
                <Button 
                  size="sm"
                  onClick={() => router.push(`/admin/modules/${moduleId}/lessons/new`)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lesson
                </Button>
              </CardHeader>
              <CardContent>
                <LessonsList 
                  lessons={lessons} 
                  moduleId={moduleId}
                  onUpdate={loadLessons}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  )
}

