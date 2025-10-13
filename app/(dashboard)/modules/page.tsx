'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { ProgressTree } from '@/components/ui/progress-tree'
import { TreePine, Clock, CheckCircle2, Circle, Lock } from 'lucide-react'
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
      <div className="py-8">
        <Container>
          <PageHeader
            heading="Learning Modules"
            description="8-month structured leadership curriculum"
          />
          <EmptyState
            icon={<TreePine size={64} />}
            title="Modules Coming Soon"
            description="Your learning modules will appear here once they are released. Check back soon!"
          />
        </Container>
      </div>
    )
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          heading="Learning Modules"
          description="8-month structured leadership curriculum"
        />

        {/* Overall Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Track your journey through the curriculum</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressTree progress={0} />
          </CardContent>
        </Card>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {modules.map((module) => {
            const isLocked = module.release_date && isFuture(module.release_date)
            const isReleased = !module.release_date || isPast(module.release_date)

            return (
              <Card
                key={module.id}
                className={`transition-shadow ${isLocked ? 'border-rogue-slate/20 bg-rogue-slate/5' : 'hover:shadow-lg'}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant={isLocked ? "secondary" : "outline"}>
                      Module {module.order_number}
                    </Badge>
                    {isLocked ? (
                      <div className="flex items-center gap-1 text-rogue-slate">
                        <Lock className="h-4 w-4" />
                        <span className="text-xs">Locked</span>
                      </div>
                    ) : (
                      <Circle className="h-4 w-4 text-rogue-gold" />
                    )}
                  </div>
                  <CardTitle className={`text-lg ${isLocked ? 'text-rogue-slate/70' : ''}`}>
                    {module.title}
                  </CardTitle>
                  {module.description && (
                    <CardDescription className="line-clamp-2">
                      {module.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLocked && module.release_date ? (
                    <div className="bg-rogue-cream/50 border border-rogue-slate/20 rounded-lg p-4 text-center">
                      <Lock className="inline mb-2 h-5 w-5 text-rogue-slate" />
                      <p className="text-sm font-medium text-rogue-slate mb-1">
                        Coming Soon
                      </p>
                      <p className="text-xs text-rogue-slate/70">
                        Releases: {formatDate(module.release_date)}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-rogue-slate">Progress</span>
                        <span className="font-medium text-rogue-forest">0%</span>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => router.push(`/modules/${module.id}`)}
                      >
                        Start Module
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </Container>
    </div>
  )
}

