'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { TreePine, Lock, ArrowRight, Circle } from 'lucide-react'
import { getModules } from '@/lib/supabase/queries/modules'
import { getSetting } from '@/lib/supabase/queries/settings'
import { formatDate, isFuture, isPast } from '@/lib/utils/format-date'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { getMonthColor } from '@/lib/utils/month-colors'
import type { Module } from '@/types/index.types'

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [courseIntroHtml, setCourseIntroHtml] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadModules()
    loadCourseIntroduction()
  }, [])

  async function loadModules() {
    try {
      const data = await getModules(true)
      setModules(data)
      
      // Determine current module (first unlocked, or first if none unlocked)
      const unlocked = data.filter(m => !m.release_date || isPast(m.release_date))
      if (unlocked.length > 0) {
        setCurrentModuleId(unlocked[0].id)
      }
    } catch (error) {
      console.error('Error loading modules:', error)
      toast.error('Failed to load modules')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadCourseIntroduction() {
    try {
      const intro = await getSetting('course_introduction_html')
      setCourseIntroHtml(intro || '')
    } catch (error) {
      console.error('Error loading course introduction:', error)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (modules.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5 py-16">
        <Container>
          <EmptyState
            icon={<TreePine size={64} />}
            title="Modules Coming Soon"
            description="Your learning modules will appear here once they are released."
          />
        </Container>
      </div>
    )
  }

  const availableModules = modules.filter(m => !m.release_date || isPast(m.release_date))
  const upcomingModules = modules.filter(m => m.release_date && isFuture(m.release_date))

  return (
    <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-white/80 via-white/60 to-transparent backdrop-blur-sm border-b border-rogue-sage/20">
        <Container>
          <div className="py-10">
            <div className="flex items-end justify-between flex-wrap gap-6">
              {courseIntroHtml ? (
                <div className="flex-1 max-w-3xl">
                  <div 
                    className="prose prose-rogue max-w-none"
                    dangerouslySetInnerHTML={{ __html: courseIntroHtml }}
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-5xl font-bold text-rogue-forest mb-3 tracking-tight">The Work</h1>
                  <p className="text-lg text-rogue-slate/80">Cohort curriculum</p>
                </div>
              )}
              <div className="flex gap-4">
                <div className="px-5 py-3 bg-white rounded-xl border border-rogue-sage/20 shadow-sm">
                  <p className="text-xs text-rogue-slate/60 uppercase tracking-wider mb-1">Available</p>
                  <p className="text-3xl font-bold text-rogue-forest">{availableModules.length}</p>
                </div>
                <div className="px-5 py-3 bg-rogue-cream rounded-xl border border-rogue-sage/20 shadow-sm">
                  <p className="text-xs text-rogue-slate/60 uppercase tracking-wider mb-1">Coming</p>
                  <p className="text-3xl font-bold text-rogue-slate/70">{upcomingModules.length}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-16 max-w-5xl">
          {/* Available Modules */}
          {availableModules.length > 0 && (
            <div className="mb-16">
              {availableModules.map((module, index) => {
                const monthColor = getMonthColor(module.order_number)
                const isCurrent = module.id === currentModuleId

                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="mb-8"
                  >
                    <Card
                      className={`group cursor-pointer border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-white via-white ${monthColor.lightBg}`}
                      onClick={() => router.push(`/modules/${module.id}`)}
                    >
                      {/* Top Color Accent */}
                      <div className={`h-2 ${monthColor.bg}`} />

                      <CardContent className="p-8">
                        <div className="flex items-start justify-between gap-6 mb-6">
                          <div className="flex-1">
                            {/* Module Number Badge */}
                            <div className="flex items-center gap-3 mb-4">
                              <Badge className={`${monthColor.badge} text-base font-semibold px-4 py-1.5 shadow-md`}>
                                Month {module.order_number}
                              </Badge>
                              {isCurrent && (
                                <Badge className="bg-rogue-cream text-rogue-forest border border-rogue-gold/30">
                                  <Circle className="h-2 w-2 mr-1.5 fill-rogue-gold text-rogue-gold" />
                                  Current Focus
                                </Badge>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className={`text-3xl font-bold ${monthColor.text} mb-4 leading-tight group-hover:opacity-80 transition-opacity`}>
                              {module.title}
                            </h3>

                            {/* Description */}
                            {module.description && (
                              <p className="text-base text-rogue-slate/80 leading-relaxed mb-6 max-w-2xl">
                                {module.description}
                              </p>
                            )}

                            {/* Action Button */}
                            <Button
                              size="lg"
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/modules/${module.id}`)
                              }}
                              className={`${monthColor.bg} hover:opacity-90 text-white shadow-md`}
                            >
                              {isCurrent ? 'Continue' : 'Explore Module'}
                              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </div>

                          {/* Large Month Number */}
                          <div className={`hidden md:block flex-shrink-0 w-32 h-32 rounded-2xl ${monthColor.lightBg} border-2 ${monthColor.border} border-opacity-20 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                            <span className={`text-7xl font-bold ${monthColor.text} opacity-40`}>
                              {module.order_number}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Upcoming Modules */}
          {upcomingModules.length > 0 && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-rogue-slate/70 mb-2">Coming Soon</h2>
                <div className="h-0.5 w-16 bg-rogue-slate/30" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {upcomingModules.map((module, index) => {
                  const monthColor = getMonthColor(module.order_number)

                  return (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Card className="border-dashed border-2 border-rogue-sage/30 bg-white/50 backdrop-blur-sm">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <Badge variant="outline" className={`${monthColor.text} border-current`}>
                              Month {module.order_number}
                            </Badge>
                            <div className="p-2 bg-rogue-sage/10 rounded-lg">
                              <Lock className="h-4 w-4 text-rogue-slate/50" />
                            </div>
                          </div>
                          <CardTitle className="text-xl text-rogue-slate/70 leading-tight">
                            {module.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {module.release_date && (
                            <div className="text-center py-3 px-4 bg-rogue-cream/50 rounded-lg border border-rogue-sage/20">
                              <p className="text-xs text-rogue-slate/60 uppercase tracking-wide mb-1">
                                Unlocks
                              </p>
                              <p className="text-sm font-semibold text-rogue-forest">
                                {formatDate(module.release_date, { month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
