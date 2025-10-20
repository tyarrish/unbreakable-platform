'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  saveReflection,
} from '@/lib/supabase/queries/modules'
import { Clock, CheckCircle2, BookOpen, FileText, ArrowLeft, Sparkles, Target, TrendingUp } from 'lucide-react'
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
      const [moduleData, lessonData, progressData, resourcesData] = await Promise.all([
        getModule(moduleId),
        getLesson(lessonId),
        getLessonProgress(user.id, lessonId),
        supabase.from('lesson_attachments').select('*').eq('lesson_id', lessonId),
      ])

      setModule(moduleData)
      setLesson(lessonData)
      setProgress(progressData)
      
      // Set reflection from progress data
      setReflection(progressData?.reflection || '')
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
      toast.success('Reflection saved successfully!')
      
      // Reload to update progress
      await loadLessonData()
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
      
      // Refresh the page to show updated state
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      console.error('Error completing lesson:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      toast.error(error?.message || 'Failed to complete lesson')
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
    <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
      {/* Curriculum Sidebar */}
      <CurriculumSidebar
        modules={allModules}
        progressMap={progressMap}
        currentLessonId={lessonId}
      />

      {/* Main Content (with sidebars offset) */}
      <div className="lg:mr-80 py-8 px-6">
        {/* Clean Lesson Header with Breadcrumb */}
        <div className="mb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-rogue-slate mb-4">
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

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge className={`${isCompleted ? 'bg-green-600' : 'bg-rogue-forest'} text-white border-0`}>
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completed
                </>
              ) : (
                <>
                  Lesson {lesson.order_number}
                </>
              )}
            </Badge>
            {lesson.duration_minutes && (
              <Badge variant="outline" className="border-rogue-forest/20">
                <Clock size={14} className="mr-1" />
                {lesson.duration_minutes} min
              </Badge>
            )}
            {progress?.time_spent_minutes && (
              <Badge variant="outline" className="border-rogue-slate/20">
                {Math.floor(progress.time_spent_minutes)} min spent
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-rogue-forest">{lesson.title}</h1>
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
              <Card className="mb-8 border-0 shadow-xl bg-white">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-rogue-forest/10 rounded-lg">
                      <BookOpen className="h-5 w-5 text-rogue-forest" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">Lesson Content</CardTitle>
                </CardHeader>
                <CardContent className="px-8 md:px-12 py-8">
                  <div
                    className="prose-rogue prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: (lesson.content as any)?.html || '' }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Resources Section */}
            {resources.length > 0 && (
              <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-white to-rogue-copper/5">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-rogue-copper/10 rounded-lg">
                      <FileText className="h-5 w-5 text-rogue-copper" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">Lesson Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResourceList resources={resources} />
                </CardContent>
              </Card>
            )}

            {/* Reflection Journal */}
            <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-rogue-gold/5 to-white">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-rogue-gold/10 rounded-lg">
                    <FileText className="h-5 w-5 text-rogue-gold" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Reflection Journal</CardTitle>
                <CardDescription className="text-base mt-2">
                  Take a moment to reflect on what you've learned and how you'll apply it.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={10}
                  placeholder="What insights stood out to you? What commitments will you make? How will you apply this learning?"
                  className="bg-white border-rogue-sage/20 focus:border-rogue-gold resize-none text-base leading-relaxed"
                  disabled={isSavingReflection}
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-rogue-slate">
                    {reflection.trim().split(/\s+/).filter(w => w).length} words
                  </p>
                  {reflection.trim().split(/\s+/).filter(w => w).length >= 100 && (
                    <Badge className="bg-green-100 text-green-700 border-0">
                      <Target className="w-3 h-3 mr-1" />
                      Great depth!
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={handleSaveReflection}
                  disabled={isSavingReflection || !reflection.trim()}
                  size="lg"
                  className="bg-rogue-gold hover:bg-rogue-gold/90"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isSavingReflection ? 'Saving...' : 'Save Reflection'}
                </Button>
              </CardContent>
            </Card>

            {/* Video Progress Warning */}
            {(lesson as any)?.video_url && (progress?.video_watch_percentage || 0) < 80 && !isCompleted && (
              <Card className="mb-6 border-0 bg-amber-50 border-amber-200">
                <CardContent className="pt-4 pb-4">
                  <p className="text-sm text-amber-800 text-center">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Watch at least 80% of the video to complete ({progress?.video_watch_percentage || 0}% watched)
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Complete Lesson */}
            {!isCompleted && (
              <Card className="sticky bottom-4 border-0 shadow-2xl bg-gradient-to-r from-rogue-forest to-rogue-pine text-white">
                <CardContent className="pt-6 pb-6">
                  <Button
                    onClick={handleMarkComplete}
                    disabled={isCompletingLesson}
                    className="w-full bg-white text-rogue-forest hover:bg-rogue-cream shadow-lg font-semibold"
                    size="lg"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    {isCompletingLesson ? 'Completing...' : 'Mark Lesson Complete'}
                    <Sparkles className="ml-2 h-5 w-5" />
                  </Button>
                  <p className="text-center text-sm text-white/95 mt-3">
                    Complete this lesson to continue your journey
                  </p>
                </CardContent>
              </Card>
            )}
            
            {isCompleted && (
              <Card className="sticky bottom-4 border-0 shadow-xl bg-gradient-to-br from-rogue-sage/20 to-white border-rogue-sage/30">
                <CardContent className="pt-5 pb-5">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-rogue-forest">
                      <CheckCircle2 className="h-6 w-6" />
                      <span className="font-semibold text-lg">Lesson Completed!</span>
                    </div>
                    <p className="text-sm text-rogue-slate">
                      {progress?.completed_at ? `Completed on ${new Date(progress.completed_at).toLocaleDateString()}` : 'Great work!'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
    </div>
  )
}
