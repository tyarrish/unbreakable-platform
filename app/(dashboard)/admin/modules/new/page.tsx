'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createModule } from '@/lib/supabase/queries/modules'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export default function NewModulePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [orderNumber, setOrderNumber] = useState(1)
  const [releaseDate, setReleaseDate] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createModule({
        title,
        description,
        order_number: orderNumber,
        release_date: releaseDate || undefined,
        is_published: isPublished,
      })

      toast.success('Module created successfully!')
      router.push('/admin/modules')
    } catch (error) {
      console.error('Error creating module:', error)
      toast.error('Failed to create module')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="py-8">
      <Container size="md">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Modules
          </Button>
        </div>

        <PageHeader
          heading="Create New Module"
          description="Add a new learning module to your curriculum"
        />

        <Card>
          <CardHeader>
            <CardTitle>Module Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Module Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Self-Awareness & Personal Values"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  <p className="text-xs text-rogue-slate">1-8 for the 8-month curriculum</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief overview of what participants will learn in this module..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="releaseDate">Release Date</Label>
                <Input
                  id="releaseDate"
                  type="datetime-local"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-rogue-slate">
                  Leave blank to make available immediately when published
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-rogue-sage text-rogue-forest focus:ring-rogue-gold"
                />
                <Label htmlFor="isPublished" className="cursor-pointer">
                  Publish module immediately
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Module'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}

