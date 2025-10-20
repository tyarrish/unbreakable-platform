'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProgressTree } from '@/components/ui/progress-tree'
import { PageLoader } from '@/components/ui/loading-spinner'
import { LessonStatusBadge } from '@/components/ui/status-badge'
import { CurriculumSidebar } from '@/components/modules/curriculum-sidebar'
import { ModuleEventsBanner } from '@/components/modules/module-events-banner'
import { EventDetailsModal } from '@/components/events/event-details-modal'
import { getModule, getModules, getLessons, getLessonProgress } from '@/lib/supabase/queries/modules'
import { getEventsByModule } from '@/lib/supabase/queries/events'
import { getBooksByMonth } from '@/lib/supabase/queries/books'
import { calculateProgress } from '@/lib/utils/progress'
import { formatTimeSpent } from '@/lib/utils/progress'
import { formatDate, formatEventTime } from '@/lib/utils/format-date'
import { ArrowLeft, Clock, CheckCircle2, TrendingUp, Calendar, MapPin, Video } from 'lucide-react'
import { toast } from 'sonner'
import type { Module, Lesson, LessonProgress, Event } from '@/types/index.types'

export default function ModuleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.id as string
  const supabase = createClient()

  const [module, setModule] = useState<Module | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [allModules, setAllModules] = useState<any[]>([])
  const [progressMap, setProgressMap] = useState<Map<string, LessonProgress>>(new Map())
  const [events, setEvents] = useState<any[]>([])
  const [books, setBooks] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)

  useEffect(() => {
    loadModuleAndLessons()
  }, [moduleId])

  async function loadModuleAndLessons() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      const [moduleData, lessonsData, modulesData, eventsData] = await Promise.all([
        getModule(moduleId),
        getLessons(moduleId),
        getModules(true), // Show all modules including unreleased
        getEventsByModule(moduleId),
      ])

      // Get books by month after we have module data
      const booksData = await getBooksByMonth(moduleData.order_number)

      setModule(moduleData)
      setLessons(lessonsData)
      setEvents(eventsData || [])
      setBooks(booksData || [])

      // Load all modules with lessons for sidebar
      const modulesWithLessons = await Promise.all(
        modulesData.map(async (mod) => {
          const modLessons = await getLessons(mod.id)
          return { ...mod, lessons: modLessons }
        })
      )
      setAllModules(modulesWithLessons)

      // Load progress for all lessons
      const allLessons = modulesWithLessons.flatMap(m => m.lessons)
      const progressPromises = allLessons.map(lesson => 
        getLessonProgress(user.id, lesson.id)
      )
      const progressData = await Promise.all(progressPromises)
      
      const newProgressMap = new Map()
      progressData.forEach((progress, index) => {
        if (progress) {
          newProgressMap.set(allLessons[index].id, progress)
        }
      })
      setProgressMap(newProgressMap)
    } catch (error) {
      console.error('Error loading module:', error)
      toast.error('Failed to load module')
      router.push('/modules')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (!module) {
    return null
  }

  const completedLessons = lessons.filter(lesson => 
    progressMap.get(lesson.id)?.status === 'completed'
  ).length
  const progressPercentage = calculateProgress(completedLessons, lessons.length)

  return (
    <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
      {/* Curriculum Sidebar */}
      <CurriculumSidebar
        modules={allModules}
        progressMap={progressMap}
      />

      {/* Main Content (with sidebars offset) */}
      <div className="lg:mr-80 py-8 px-6">
        {/* Clean Module Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/modules')}
            className="mb-4 hover:bg-rogue-sage/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Modules
          </Button>

          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-rogue-forest text-white border-0">
              Module {module.order_number}
            </Badge>
            {progressPercentage === 100 && (
              <Badge className="bg-green-600 text-white border-0">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-rogue-forest">{module.title}</h1>
        </div>

        {/* Compact Progress & Events Bar */}
        <div className="mb-8 space-y-3">
          {/* Progress Indicator */}
          <div className="bg-white rounded-lg border border-rogue-sage/20 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-rogue-forest" />
                <span className="text-sm font-medium text-rogue-forest">Your Module Progress</span>
              </div>
              <span className="text-sm font-semibold text-rogue-forest">{completedLessons} of {lessons.length} lessons</span>
            </div>
            <ProgressTree progress={progressPercentage} />
          </div>

          {/* Events Listing */}
          {events.length > 0 && (
            <div className="bg-white rounded-lg border border-rogue-sage/20 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-rogue-gold" />
                  <h3 className="text-sm font-semibold text-rogue-forest">Module Events</h3>
                  <Badge variant="outline" className="border-rogue-gold text-rogue-gold bg-rogue-gold/5 text-xs">
                    {events.length}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                {events.map((event: Event) => (
                  <div
                    key={event.id}
                    onClick={() => router.push(`/calendar?event=${event.id}`)}
                    className="group flex items-start gap-3 p-3 rounded-lg border border-rogue-sage/10 hover:border-rogue-gold/30 hover:bg-rogue-gold/5 cursor-pointer transition-all"
                  >
                    <div className="flex-shrink-0 w-1 h-full bg-rogue-gold rounded-full" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm text-rogue-forest group-hover:text-rogue-gold transition-colors">
                          {event.title}
                        </h4>
                        {event.is_required && (
                          <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50 text-xs flex-shrink-0">
                            Required
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-xs text-rogue-slate">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDate(event.start_time, { month: 'short', day: 'numeric', year: 'numeric' })} • {formatEventTime(event.start_time, event.end_time)}
                          </span>
                        </div>
                        
                        {event.location_type === 'virtual' && event.zoom_link ? (
                          <div className="flex items-center gap-2">
                            <Video className="h-3 w-3" />
                            <span>Virtual Event</span>
                          </div>
                        ) : event.location_address ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{event.location_address}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0 text-xs h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedEvent(event)
                        setIsEventModalOpen(true)
                      }}
                    >
                      Details
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabs for Lessons and Resources */}
        <Tabs defaultValue="lessons" className="space-y-6">
          <TabsList>
            <TabsTrigger value="lessons">Lessons ({lessons.length})</TabsTrigger>
            <TabsTrigger value="resources">
              Reading Materials ({books.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="space-y-4">
            {lessons.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <p className="text-center text-rogue-slate">
                    No lessons yet. Check back soon!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson) => {
                  const progress = progressMap.get(lesson.id)
                  const status = progress?.status || 'not_started'

                  return (
                    <Card
                      key={lesson.id}
                      className="group border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-0.5 bg-gradient-to-br from-white to-rogue-sage/5"
                      onClick={() => router.push(`/modules/${moduleId}/lessons/${lesson.id}`)}
                    >
                      <CardContent className="pt-6 pb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge className={`${status === 'completed' ? 'bg-green-600 text-white' : 'bg-rogue-forest text-white'} border-0`}>
                                Lesson {lesson.order_number}
                              </Badge>
                              {lesson.duration_minutes && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-rogue-sage/10 rounded-md">
                                  <Clock size={12} className="text-rogue-forest" />
                                  <span className="text-xs text-rogue-forest font-medium">{lesson.duration_minutes} min</span>
                                </div>
                              )}
                              <LessonStatusBadge status={status} />
                            </div>
                            <h3 className="font-semibold text-lg text-rogue-forest group-hover:text-rogue-gold transition-colors mb-2">
                              {lesson.title}
                            </h3>
                            {progress?.time_spent_minutes && (
                              <p className="text-sm text-rogue-slate">
                                Time spent: {formatTimeSpent(progress.time_spent_minutes)}
                              </p>
                            )}
                          </div>
                          <Button
                            variant={status === 'completed' ? 'outline' : 'default'}
                            size="lg"
                            className={status === 'completed' ? '' : 'bg-gradient-to-r from-rogue-forest to-rogue-pine'}
                          >
                            {status === 'completed' ? 'Review' : 'Start'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            {books.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <p className="text-center text-rogue-slate">
                    No reading materials assigned to this module yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {books.map((book: any) => (
                  <Card 
                    key={book.id} 
                    className="group border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-1"
                    onClick={() => router.push(`/library/${book.id}`)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        {book.cover_image_url && (
                          <div className="flex-shrink-0">
                            <img
                              src={book.cover_image_url}
                              alt={book.title}
                              className="w-24 h-32 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <div className="flex-1 space-y-2">
                          <h4 className="font-bold text-lg text-rogue-forest group-hover:text-rogue-gold transition-colors">
                            {book.title}
                          </h4>
                          <p className="text-sm text-rogue-slate font-medium">{book.author}</p>
                          {book.description && (
                            <p className="text-sm text-rogue-slate line-clamp-2 leading-relaxed">
                              {book.description}
                            </p>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/library/${book.id}`)
                            }}
                            className="mt-2"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        open={isEventModalOpen}
        onOpenChange={setIsEventModalOpen}
      />
    </div>
  )
}

