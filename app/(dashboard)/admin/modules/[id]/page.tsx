'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageLoader } from '@/components/ui/loading-spinner'
import { getModule, updateModule, getLessons } from '@/lib/supabase/queries/modules'
import { getEventsByModule } from '@/lib/supabase/queries/events'
import { getBooksByMonth } from '@/lib/supabase/queries/books'
import { ModuleEventsBanner } from '@/components/modules/module-events-banner'
import { RichTextEditor } from '@/components/discussions/rich-text-editor'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Plus, BookOpen, Eye } from 'lucide-react'
import type { Module, Lesson } from '@/types/index.types'
import { LessonsList } from '@/components/modules/lessons-list'

export default function EditModulePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const moduleId = params.id as string
  const activeTab = searchParams.get('tab') || 'details'

  const supabase = createClient()
  const [module, setModule] = useState<Module | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [books, setBooks] = useState<any[]>([])
  const [userRole, setUserRole] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [descriptionHtml, setDescriptionHtml] = useState('')
  const [orderNumber, setOrderNumber] = useState(1)
  const [releaseDate, setReleaseDate] = useState('')
  const [isPublished, setIsPublished] = useState(false)

  useEffect(() => {
    checkRole()
    loadModule()
    loadLessons()
    loadResources()
  }, [moduleId])

  async function checkRole() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await (supabase
        .from('profiles')
        .select('roles')
        .eq('id', user.id)
        .single() as any)
      // Get primary role from roles array
      const primaryRole = profile?.roles?.[0] || ''
      setUserRole(primaryRole)
    }
  }

  async function loadModule() {
    try {
      const data = await getModule(moduleId)
      setModule(data)
      setTitle(data.title)
      setDescription(data.description || '')
      setDescriptionHtml((data as any).description_html || data.description || '')
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

  async function loadResources() {
    try {
      const data = await getModule(moduleId)
      const [eventsData, booksData] = await Promise.all([
        getEventsByModule(moduleId),
        getBooksByMonth(data.order_number),
      ])
      setEvents(eventsData || [])
      setBooks(booksData || [])
    } catch (error) {
      console.error('Error loading resources:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Update module with both plain text and HTML
      await supabase
        .from('modules')
        .update({
          title,
          description: descriptionHtml.replace(/<[^>]*>/g, ''), // Strip HTML for plain text fallback
          description_html: descriptionHtml,
          order_number: orderNumber,
          release_date: releaseDate || null,
          is_published: isPublished,
          updated_at: new Date().toISOString(),
        })
        .eq('id', moduleId)

      toast.success('Module updated successfully!')
      loadModule() // Reload to get updated data
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
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/admin/modules')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Modules
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.open(`/modules/${moduleId}`, '_blank')}
            className="bg-rogue-gold/10 border-rogue-gold text-rogue-forest hover:bg-rogue-gold/20"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview as Participant
          </Button>
        </div>

        <PageHeader
          heading={`Edit Module ${module.order_number}`}
          description="Update module details and manage lessons"
        />

        {/* Events Banner */}
        {events.length > 0 && (
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-rogue-forest">Associated Events</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/admin/events')}
              >
                Manage Events
              </Button>
            </div>
            <ModuleEventsBanner events={events} />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(value) => router.push(`/admin/modules/${moduleId}?tab=${value}`)} className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Module Details</TabsTrigger>
            <TabsTrigger value="lessons">Lessons ({lessons.length})</TabsTrigger>
            <TabsTrigger value="resources">Reading Materials ({books.length})</TabsTrigger>
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

                  <div className="space-y-3">
                    <Label>Course Introduction / Description</Label>
                    <p className="text-sm text-rogue-slate">
                      Write an engaging introduction that will appear at the top of the module page for participants.
                    </p>
                    
                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Editor */}
                      <div className="space-y-2">
                        <Label className="text-xs text-rogue-slate">Edit</Label>
                        <RichTextEditor
                          content={descriptionHtml}
                          onChange={setDescriptionHtml}
                          placeholder="Write a compelling introduction to this module..."
                        />
                      </div>

                      {/* Preview */}
                      <div className="space-y-2">
                        <Label className="text-xs text-rogue-slate">Preview (How it appears to participants)</Label>
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-rogue-sage/5">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-5 w-5 text-rogue-gold" />
                              <h3 className="text-lg font-semibold text-rogue-forest">Course Introduction</h3>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {descriptionHtml ? (
                              <div 
                                className="prose prose-sm prose-rogue max-w-none text-rogue-slate"
                                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                              />
                            ) : (
                              <p className="text-sm text-rogue-slate/50 italic">
                                Your module introduction will appear here...
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
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

          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen size={20} />
                      Reading Materials
                    </CardTitle>
                    <p className="text-sm text-rogue-slate mt-2">
                      Books assigned to Module {module?.order_number}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/admin/books')}
                  >
                    Manage Books
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {books.length === 0 ? (
                  <div className="py-12 text-center text-rogue-slate">
                    No reading materials assigned to this module yet.
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {books.map((book: any) => (
                      <Card key={book.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            {book.cover_image_url && (
                              <div className="flex-shrink-0">
                                <img
                                  src={book.cover_image_url}
                                  alt={book.title}
                                  className="w-20 h-28 object-cover rounded-md shadow-sm"
                                />
                              </div>
                            )}
                            <div className="flex-1 space-y-2">
                              <h4 className="font-semibold text-rogue-forest">{book.title}</h4>
                              <p className="text-sm text-rogue-slate">{book.author}</p>
                              {book.description && (
                                <p className="text-sm text-rogue-slate line-clamp-2">{book.description}</p>
                              )}
                              <div className="flex gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/admin/books/${book.id}`)}
                                >
                                  Edit Book
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  )
}

