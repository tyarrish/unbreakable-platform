'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { ProgressTree } from '@/components/ui/progress-tree'
import { TreePine, Clock, CheckCircle2, Lock, Sparkles, ArrowRight, BookOpen, TrendingUp } from 'lucide-react'
import { getModules } from '@/lib/supabase/queries/modules'
import { formatDate, isFuture, isPast } from '@/lib/utils/format-date'
import { toast } from 'sonner'
import type { Module } from '@/types/index.types'

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadModules()
  }, [])

  async function loadModules() {
    try {
      const data = await getModules(true) // Show all modules (including future/locked)
      setModules(data)
    } catch (error) {
      console.error('Error loading modules:', error)
      toast.error('Failed to load modules')
    } finally {
      setIsLoading(false)
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
            description="Your learning modules will appear here once they are released. Check back soon!"
          />
        </Container>
      </div>
    )
  }

  const unlockedModules = modules.filter(m => !m.release_date || isPast(m.release_date))
  const lockedModules = modules.filter(m => m.release_date && isFuture(m.release_date))

  return (
    <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
      {/* Subtle header background */}
      <div className="bg-white/40 backdrop-blur-sm border-b border-rogue-sage/10">
        <Container>
          <div className="py-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-rogue-forest mb-2">Learning Modules</h1>
                <p className="text-lg text-rogue-slate">
                  Your 8-month structured leadership curriculum
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-rogue-forest/10 text-rogue-forest border-0 text-sm px-4 py-2">
                  {modules.length} Total Modules
                </Badge>
                <Badge className="bg-rogue-gold text-white border-0 text-sm px-4 py-2">
                  {unlockedModules.length} Available
                </Badge>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8">

          {/* Overall Progress Card */}
          <Card className="mb-8 shadow-xl border-0 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Your Learning Progress</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Track your journey through the 8-month curriculum
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-rogue-forest/5 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-rogue-forest" />
                  <span className="text-2xl font-bold text-rogue-forest">0%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ProgressTree progress={0} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 bg-rogue-sage/5 rounded-lg">
                  <div className="text-2xl font-bold text-rogue-forest">0</div>
                  <div className="text-xs text-rogue-slate mt-1">Lessons Completed</div>
                </div>
                <div className="text-center p-3 bg-rogue-gold/5 rounded-lg">
                  <div className="text-2xl font-bold text-rogue-forest">0h</div>
                  <div className="text-xs text-rogue-slate mt-1">Time Invested</div>
                </div>
                <div className="text-center p-3 bg-rogue-copper/5 rounded-lg">
                  <div className="text-2xl font-bold text-rogue-forest">0</div>
                  <div className="text-xs text-rogue-slate mt-1">Reflections</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">0/8</div>
                  <div className="text-xs text-green-600 mt-1">Modules Done</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Modules Section */}
          {unlockedModules.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-gradient-to-r from-rogue-forest to-rogue-gold rounded-full"></div>
                <h2 className="text-2xl font-bold text-rogue-forest">Available Modules</h2>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-6">
                {unlockedModules.map((module) => (
                  <Card
                    key={module.id}
                    className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-rogue-sage/5"
                    onClick={() => router.push(`/modules/${module.id}`)}
                  >
                    {/* Decorative gradient overlay */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rogue-gold/10 via-transparent to-transparent rounded-bl-[100px]"></div>
                    
                    {/* Module number badge */}
                    <div className="absolute top-6 right-6 w-16 h-16 bg-gradient-to-br from-rogue-forest to-rogue-pine rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-2xl font-bold text-white">{module.order_number}</span>
                    </div>

                    <CardHeader className="pb-4 relative z-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-rogue-forest text-white border-0 shadow-sm">
                            Module {module.order_number}
                          </Badge>
                          <Badge variant="outline" className="border-rogue-gold text-rogue-gold bg-rogue-gold/5">
                            <Clock size={12} className="mr-1" />
                            4-6 weeks
                          </Badge>
                        </div>
                        
                        <CardTitle className="text-2xl md:text-3xl leading-tight group-hover:text-rogue-forest transition-colors pr-20">
                          {module.title}
                        </CardTitle>
                        
                        {module.description && (
                          <CardDescription className="text-base leading-relaxed">
                            {module.description}
                          </CardDescription>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6 relative z-10">
                      {/* Progress bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-rogue-slate font-medium">Module Progress</span>
                          <span className="text-lg font-bold text-rogue-forest">0%</span>
                        </div>
                        <div className="h-3 bg-rogue-sage/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-rogue-forest to-rogue-gold rounded-full transition-all duration-500"
                            style={{ width: '0%' }}
                          />
                        </div>
                      </div>

                      {/* Module stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-rogue-slate">
                          <BookOpen size={16} className="text-rogue-forest" />
                          <span>8 lessons</span>
                        </div>
                        <div className="flex items-center gap-2 text-rogue-slate">
                          <CheckCircle2 size={16} className="text-green-600" />
                          <span>0 completed</span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Button 
                        size="lg"
                        className="w-full bg-gradient-to-r from-rogue-forest to-rogue-pine hover:from-rogue-pine hover:to-rogue-forest text-white shadow-lg group-hover:shadow-xl transition-all"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/modules/${module.id}`)
                        }}
                      >
                        <Sparkles className="mr-2 h-5 w-5" />
                        Start Learning
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Locked Modules Section */}
          {lockedModules.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-rogue-slate/30 rounded-full"></div>
                <h2 className="text-2xl font-bold text-rogue-slate">Coming Soon</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lockedModules.map((module) => (
                  <Card
                    key={module.id}
                    className="relative overflow-hidden border-dashed border-2 border-rogue-slate/20 bg-rogue-slate/5"
                  >
                    {/* Lock icon overlay */}
                    <div className="absolute top-4 right-4 p-3 bg-rogue-slate/10 rounded-full">
                      <Lock className="h-6 w-6 text-rogue-slate/50" />
                    </div>

                    <CardHeader>
                      <Badge variant="secondary" className="w-fit mb-2">
                        Module {module.order_number}
                      </Badge>
                      <CardTitle className="text-xl text-rogue-slate/70">
                        {module.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <div className="bg-white border border-rogue-slate/20 rounded-lg p-4 text-center">
                        <Lock className="inline mb-2 h-5 w-5 text-rogue-slate" />
                        <p className="text-sm font-medium text-rogue-slate mb-1">
                          Unlocks Soon
                        </p>
                        {module.release_date && (
                          <p className="text-xs text-rogue-slate/70">
                            {formatDate(module.release_date)}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
