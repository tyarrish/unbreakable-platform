'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { PageLoader } from '@/components/ui/loading-spinner'
import { LessonStatusBadge } from '@/components/ui/status-badge'
import { VideoPlayer } from '@/components/modules/video-player'
import { CurriculumSidebar } from '@/components/modules/curriculum-sidebar'
import { ResourceList } from '@/components/modules/resource-list'
import {
  getLesson,
  getModule,
  getModules,
  getLessons,
  getLessonProgress,
  updateLessonProgress,
  markLessonComplete,
  getReflection,
  saveReflection,
} from '@/lib/supabase/queries/modules'
import { Clock, CheckCircle2, BookOpen, FileText } from 'lucide-react'
import { toast } from 'sonner'
import type { Module, Lesson, LessonProgress } from '@/types/index.types'

export default function LessonViewPage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.id as string
  const lessonId = params.lessonId as string
  const supabase = createClient()

  const [module, setModule] = useState<Module | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [allModules, setAllModules] = useState<any[]>([])
  const [progress, setProgress] = useState<LessonProgress | null>(null)
  const [progressMap, setProgressMap] = useState<Map<string, LessonProgress>>(new Map())
  const [resources, setResources] = useState<any[]>([])
  const [reflection, setReflection] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingReflection, setIsSavingReflection] = useState(false)
  const [isCompletingLesson, setIsCompletingLesson] = useState(false)

  useEffect(() => {
    loadLessonData()
  }, [lessonId])

  async function loadLessonData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      // Load current lesson data
      const [moduleData, lessonData, progressData, reflectionData, resourcesData] = await Promise.all([
        getModule(moduleId),
        getLesson(lessonId),
        getLessonProgress(user.id, lessonId),
        getReflection(user.id, lessonId),
        supabase.from('lesson_attachments').select('*').eq('lesson_id', lessonId),
      ])

      setModule(moduleData)
      setLesson(lessonData)
      setProgress(progressData)
      setReflection(reflectionData?.content || '')
      setResources(resourcesData.data || [])

      // Load all modules with lessons for sidebar
      const modulesData = await getModules(true) // Show all modules including unreleased
      const modulesWithLessons = await Promise.all(
        modulesData.map(async (mod) => {
          const lessons = await getLessons(mod.id)
          return { ...mod, lessons }
        })
      )
      setAllModules(modulesWithLessons)

      // Load all progress for sidebar
      const allLessons = modulesWithLessons.flatMap(m => m.lessons)
      const allProgress = await Promise.all(
        allLessons.map(l => getLessonProgress(user.id, l.id))
      )
      const newProgressMap = new Map()
      allProgress.forEach((p, idx) => {
        if (p) newProgressMap.set(allLessons[idx].id, p)
      })
      setProgressMap(newProgressMap)

      // Mark as in progress if not started
      if (!progressData) {
        await updateLessonProgress(user.id, lessonId, {
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error('Error loading lesson:', error)
      toast.error('Failed to load lesson')
      router.push(`/modules/${moduleId}`)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleVideoProgress(percentage: number) {
    if (!userId) return

    try {
      await updateLessonProgress(userId, lessonId, {
        video_watch_percentage: Math.round(percentage),
      })
    } catch (error) {
      console.error('Error updating video progress:', error)
    }
  }

  async function handleSaveReflection() {
    if (!userId) return

    setIsSavingReflection(true)
    try {
      await saveReflection(userId, lessonId, reflection)
      
      // Update word count
      const wordCount = reflection.trim().split(/\s+/).length
      await updateLessonProgress(userId, lessonId, {
        reflection_word_count: wordCount,
      })

      toast.success('Reflection saved successfully!')
    } catch (error) {
      console.error('Error saving reflection:', error)
      toast.error('Failed to save reflection')
    } finally {
      setIsSavingReflection(false)
    }
  }

  async function handleMarkComplete() {
    if (!userId) return

    // Check if video needs to be watched
    if ((lesson as any)?.video_url && (progress?.video_watch_percentage || 0) < 80) {
      toast.error('Please watch at least 80% of the video before completing this lesson')
      return
    }

    setIsCompletingLesson(true)
    try {
      await markLessonComplete(userId, lessonId)
      toast.success('Lesson marked as complete! 🎉')
      
      // Reload to update sidebar
      loadLessonData()
    } catch (error) {
      console.error('Error completing lesson:', error)
      toast.error('Failed to complete lesson')
    } finally {
      setIsCompletingLesson(false)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (!module || !lesson) {
    return null
  }

  const status = progress?.status || 'not_started'
  const isCompleted = status === 'completed'

  return (
    <div className="min-h-screen bg-rogue-cream">
      {/* Curriculum Sidebar */}
      <CurriculumSidebar
        modules={allModules}
        progressMap={progressMap}
        currentLessonId={lessonId}
      />

      {/* Main Content (with sidebar offset) */}
      <div className="lg:ml-80">
        <div className="py-8">
          <Container size="lg">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-rogue-slate mb-6">
              <button 
                onClick={() => router.push('/modules')}
                className="hover:text-rogue-forest transition-colors"
              >
                Modules
              </button>
              <span>/</span>
              <button 
                onClick={() => router.push(`/modules/${moduleId}`)}
                className="hover:text-rogue-forest transition-colors"
              >
                Module {module.order_number}
              </button>
              <span>/</span>
              <span className="text-rogue-forest font-medium">Lesson {lesson.order_number}</span>
            </div>

            {/* Lesson Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <LessonStatusBadge status={status} />
                {lesson.duration_minutes && (
                  <span className="text-sm text-rogue-slate flex items-center gap-1">
                    <Clock size={14} />
                    {lesson.duration_minutes} min
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-semibold text-rogue-forest mb-2">{lesson.title}</h1>
            </div>

            {/* Video Player */}
            {(lesson as any).video_url && (
              <div className="mb-8">
                <VideoPlayer
                  videoUrl={(lesson as any).video_url}
                  thumbnailUrl={(lesson as any).video_thumbnail_url}
                  onProgressUpdate={handleVideoProgress}
                  initialProgress={progress?.video_watch_percentage || 0}
                />
              </div>
            )}

            {/* Lesson Content */}
            {lesson.content && (
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <div
                    className="prose-rogue prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: (lesson.content as any)?.html || '' }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Resources Section */}
            {resources.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-rogue-copper" />
                  <h2 className="text-2xl font-semibold text-rogue-forest">Lesson Resources</h2>
                </div>
                <ResourceList resources={resources} />
              </div>
            )}

            {/* Reflection Journal */}
            <Card className="mb-8 bg-gradient-to-br from-rogue-cream to-white border-rogue-gold/30 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-rogue-gold/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-rogue-forest">
                  <BookOpen className="h-5 w-5 text-rogue-gold" />
                  Reflection Journal
                </CardTitle>
                <p className="text-sm text-rogue-slate mt-2">
                  Take a moment to reflect on what you've learned and how you'll apply it.
                </p>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={8}
                  placeholder="What insights stood out to you? What commitments will you make? How will you apply this learning?"
                  className="bg-white border-rogue-sage/20 focus:border-rogue-gold resize-none text-base leading-relaxed"
                  disabled={isSavingReflection}
                />
                {reflection && (
                  <p className="text-xs text-rogue-slate">
                    {reflection.trim().split(/\s+/).length} words
                  </p>
                )}
                <Button
                  variant="outline"
                  onClick={handleSaveReflection}
                  disabled={isSavingReflection || !reflection.trim()}
                >
                  {isSavingReflection ? 'Saving...' : 'Save Reflection'}
                </Button>
              </CardContent>
            </Card>

            {/* Complete Lesson */}
            <div className="flex justify-between items-center py-6">
              <div>
                {isCompleted && (
                  <div className="flex items-center gap-2 text-rogue-sage">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">
                      Completed {progress.completed_at ? new Date(progress.completed_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                )}
                {(lesson as any)?.video_url && (progress?.video_watch_percentage || 0) < 80 && !isCompleted && (
                  <p className="text-sm text-rogue-slate">
                    Watch at least 80% of the video to complete ({progress?.video_watch_percentage || 0}% watched)
                  </p>
                )}
              </div>
              {!isCompleted && (
                <Button
                  onClick={handleMarkComplete}
                  disabled={isCompletingLesson}
                  size="lg"
                  variant="forest"
                  className="shadow-lg hover:shadow-xl transition-all"
                >
                  {isCompletingLesson ? 'Completing...' : 'Mark as Complete'}
                </Button>
              )}
            </div>
          </Container>
        </div>
      </div>
    </div>
  )
}
