'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProgressTree } from '@/components/ui/progress-tree'
import { PageLoader } from '@/components/ui/loading-spinner'
import { LessonStatusBadge } from '@/components/ui/status-badge'
import { CurriculumSidebar } from '@/components/modules/curriculum-sidebar'
import { getModule, getModules, getLessons, getLessonProgress } from '@/lib/supabase/queries/modules'
import { calculateProgress } from '@/lib/utils/progress'
import { formatTimeSpent } from '@/lib/utils/progress'
import { ArrowLeft, Clock, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import type { Module, Lesson, LessonProgress } from '@/types/index.types'

export default function ModuleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.id as string
  const supabase = createClient()

  const [module, setModule] = useState<Module | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [allModules, setAllModules] = useState<any[]>([])
  const [progressMap, setProgressMap] = useState<Map<string, LessonProgress>>(new Map())
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

      const [moduleData, lessonsData, modulesData] = await Promise.all([
        getModule(moduleId),
        getLessons(moduleId),
        getModules(true), // Show all modules including unreleased
      ])

      setModule(moduleData)
      setLessons(lessonsData)

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
    <div className="min-h-screen bg-rogue-cream">
      {/* Curriculum Sidebar */}
      <CurriculumSidebar
        modules={allModules}
        progressMap={progressMap}
      />

      {/* Main Content (with sidebar offset) */}
      <div className="lg:ml-80">
        <div className="py-8">
          <Container size="lg">
            <div className="mb-6">
              <Button variant="ghost" onClick={() => router.push('/modules')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Modules
              </Button>
            </div>

        {/* Module Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-3">Module {module.order_number}</Badge>
          <h1 className="text-4xl font-semibold text-rogue-forest mb-4">{module.title}</h1>
          {module.description && (
            <p className="text-lg text-rogue-slate leading-relaxed max-w-3xl">
              {module.description}
            </p>
          )}
        </div>

        {/* Progress Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Module Progress</CardTitle>
            <CardDescription>
              {completedLessons} of {lessons.length} lessons completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressTree progress={progressPercentage} />
          </CardContent>
        </Card>

        {/* Lessons List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-rogue-forest">Lessons</h2>
          
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
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/modules/${moduleId}/lessons/${lesson.id}`)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="text-xs">
                              Lesson {lesson.order_number}
                            </Badge>
                            {lesson.duration_minutes && (
                              <span className="text-xs text-rogue-slate flex items-center gap-1">
                                <Clock size={12} />
                                {lesson.duration_minutes} min
                              </span>
                            )}
                            <LessonStatusBadge status={status} />
                          </div>
                          <h3 className="font-medium text-rogue-forest">{lesson.title}</h3>
                          {progress?.time_spent_minutes && (
                            <p className="text-xs text-rogue-slate mt-1">
                              Time spent: {formatTimeSpent(progress.time_spent_minutes)}
                            </p>
                          )}
                        </div>
                        <Button
                          variant={status === 'completed' ? 'outline' : 'default'}
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
            </div>
          </Container>
        </div>
      </div>
    </div>
  )
}

