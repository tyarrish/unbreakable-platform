'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ProgressCircle, LessonCheckbox } from '@/components/modules/progress-circle'
import { ChevronDown, ChevronRight, Lock, Menu, X, TreePine } from 'lucide-react'
import { calculateProgress } from '@/lib/utils/progress'
import type { Module, Lesson, LessonProgress } from '@/types/index.types'

interface CurriculumSidebarProps {
  modules: Array<Module & { lessons: Lesson[] }>
  progressMap: Map<string, LessonProgress>
  currentLessonId?: string
  className?: string
}

export function CurriculumSidebar({ modules, progressMap, currentLessonId, className }: CurriculumSidebarProps) {
  const router = useRouter()
  const params = useParams()
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [isOpen, setIsOpen] = useState(false)

  // Calculate overall progress
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const completedLessons = modules.reduce((sum, m) => {
    return sum + m.lessons.filter(l => progressMap.get(l.id)?.status === 'completed').length
  }, 0)
  const overallProgress = calculateProgress(completedLessons, totalLessons)

  // Auto-expand current module
  useEffect(() => {
    if (params.id) {
      setExpandedModules(prev => new Set(prev).add(params.id as string))
    }
  }, [params.id])

  // Load expanded state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('curriculum-expanded')
    if (saved) {
      try {
        setExpandedModules(new Set(JSON.parse(saved)))
      } catch {}
    }
  }, [])

  // Save expanded state
  useEffect(() => {
    localStorage.setItem('curriculum-expanded', JSON.stringify(Array.from(expandedModules)))
  }, [expandedModules])

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  const navigateToLesson = (moduleId: string, lessonId: string) => {
    router.push(`/modules/${moduleId}/lessons/${lessonId}`)
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 lg:hidden bg-white shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed right-0 top-0 h-screen w-80 bg-white border-l border-rogue-sage/20 z-30 transition-transform duration-300 flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          'lg:translate-x-0',
          className
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-rogue-sage/20 bg-gradient-to-b from-rogue-cream/50 to-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rogue-forest rounded-lg flex items-center justify-center">
              <TreePine className="h-6 w-6 text-rogue-gold" />
            </div>
            <div>
              <h2 className="font-semibold text-rogue-forest">Curriculum</h2>
              <p className="text-xs text-rogue-slate">8-Month Journey</p>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-rogue-slate">Overall Progress</span>
              <span className="font-semibold text-rogue-forest">{overallProgress}%</span>
            </div>
            <div className="relative h-2 bg-rogue-sage/10 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-rogue-sage to-rogue-gold rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-xs text-rogue-slate">
              {completedLessons} of {totalLessons} lessons completed
            </p>
          </div>
        </div>

        {/* Modules Tree */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {modules.map((module) => {
            const isExpanded = expandedModules.has(module.id)
            const isLocked = module.release_date && new Date(module.release_date) > new Date()
            const completedCount = module.lessons.filter(
              l => progressMap.get(l.id)?.status === 'completed'
            ).length
            const moduleProgress = calculateProgress(completedCount, module.lessons.length)

            return (
              <div key={module.id} className="space-y-1">
                {/* Module Header */}
                <button
                  onClick={() => !isLocked && toggleModule(module.id)}
                  disabled={isLocked}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-all duration-200',
                    isLocked 
                      ? 'opacity-50 cursor-not-allowed bg-rogue-slate/5'
                      : 'hover:bg-rogue-sage/5 cursor-pointer'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Expand/Collapse Icon */}
                    {isLocked ? (
                      <Lock className="h-4 w-4 text-rogue-slate mt-0.5 flex-shrink-0" />
                    ) : isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-rogue-forest mt-0.5 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-rogue-slate mt-0.5 flex-shrink-0" />
                    )}

                    {/* Module Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-rogue-slate">
                          Module {module.order_number}
                        </span>
                        <ProgressCircle progress={moduleProgress} size={16} />
                      </div>
                      <h3 className="font-semibold text-sm text-rogue-forest leading-tight">
                        {module.title}
                      </h3>
                      {!isLocked && (
                        <div className="mt-2">
                          <div className="h-1 bg-rogue-sage/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-rogue-gold rounded-full transition-all duration-500"
                              style={{ width: `${moduleProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>

                {/* Lessons List */}
                {isExpanded && !isLocked && (
                  <div className="ml-7 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {module.lessons.map((lesson) => {
                      const lessonProgress = progressMap.get(lesson.id)
                      const isCompleted = lessonProgress?.status === 'completed'
                      const isActive = lesson.id === currentLessonId

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => navigateToLesson(module.id, lesson.id)}
                          className={cn(
                            'w-full text-left p-2.5 pl-4 rounded-lg transition-all duration-200 flex items-start gap-3 group',
                            isActive 
                              ? 'bg-rogue-forest/5 border-l-4 border-rogue-gold' 
                              : 'hover:bg-rogue-sage/5 border-l-4 border-transparent'
                          )}
                        >
                          <LessonCheckbox isCompleted={isCompleted} size={18} />
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-sm leading-tight',
                              isActive 
                                ? 'font-medium text-rogue-forest' 
                                : 'text-rogue-slate group-hover:text-rogue-forest'
                            )}>
                              {lesson.order_number}. {lesson.title}
                            </p>
                            {lesson.duration_minutes && (
                              <p className="text-xs text-rogue-slate/70 mt-0.5">
                                {lesson.duration_minutes} min
                              </p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-rogue-sage/20 bg-gradient-to-t from-rogue-cream/30 to-white">
          <div className="flex items-center justify-between text-xs text-rogue-slate">
            <span>Journey Progress</span>
            <span className="font-semibold text-rogue-forest">{overallProgress}%</span>
          </div>
        </div>
      </aside>
    </>
  )
}

