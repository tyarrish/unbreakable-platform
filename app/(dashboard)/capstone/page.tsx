'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Mountain, CheckCircle2, Circle } from 'lucide-react'
import { toast } from 'sonner'
import type { CapstoneProject, CapstoneStatus } from '@/types/index.types'

export default function CapstonePage() {
  const [project, setProject] = useState<CapstoneProject | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadCapstone()
  }, [])

  async function loadCapstone() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }
      setUserId(user.id)

      const { data, error } = await supabase
        .from('capstone_projects')
        .select('*')
        .eq('user_id', user.id)
        .single<CapstoneProject>()

      if (data) {
        setProject(data)
        setTitle(data.title || '')
        setDescription(data.description || '')
      }
    } catch (error: any) {
      if (error?.code !== 'PGRST116') {
        console.error('Error loading capstone:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    if (!userId) return

    setIsSaving(true)
    try {
      const { error } = await (supabase
        .from('capstone_projects') as any)
        .upsert({
          user_id: userId,
          title,
          description,
          status: 'in_progress' as CapstoneStatus,
        })

      if (error) throw error

      toast.success('Capstone project saved!')
      loadCapstone()
    } catch (error) {
      console.error('Error saving capstone:', error)
      toast.error('Failed to save project')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSubmit() {
    if (!userId) return

    setIsSaving(true)
    try {
      const { error } = await (supabase
        .from('capstone_projects') as any)
        .update({
          status: 'submitted' as CapstoneStatus,
          submitted_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (error) throw error

      toast.success('Capstone project submitted! 🎉')
      loadCapstone()
    } catch (error) {
      console.error('Error submitting capstone:', error)
      toast.error('Failed to submit project')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  const status = project?.status || 'planning'
  const isSubmitted = status === 'submitted' || status === 'completed'

  return (
    <div className="py-8">
      <Container size="lg">
        <PageHeader
          heading="Capstone Project"
          description="Apply your learning through a meaningful leadership project"
        />

        {/* Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {isSubmitted ? (
                <CheckCircle2 className="h-5 w-5 text-rogue-sage" />
              ) : (
                <Circle className="h-5 w-5 text-rogue-gold" />
              )}
              <div>
                <p className="font-medium text-rogue-forest capitalize">{status.replace('_', ' ')}</p>
                <p className="text-sm text-rogue-slate">
                  {isSubmitted 
                    ? 'Your project has been submitted for review'
                    : 'Continue working on your capstone project'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Define your leadership project and its impact on your community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Youth Leadership Program"
                disabled={isSubmitted || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project, its goals, and expected impact..."
                rows={8}
                disabled={isSubmitted || isSaving}
              />
            </div>

            {!isSubmitted && (
              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button
                  variant="forest"
                  onClick={handleSubmit}
                  disabled={!title || !description || isSaving}
                >
                  Submit Project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback */}
        {project?.feedback && (
          <Card className="bg-rogue-cream/50 border-rogue-gold/20">
            <CardHeader>
              <CardTitle>Facilitator Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-rogue-slate leading-relaxed">{project.feedback}</p>
            </CardContent>
          </Card>
        )}
      </Container>
    </div>
  )
}


