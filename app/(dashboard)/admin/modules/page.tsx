'use client'

import { useEffect, useState } from 'react'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Plus, Edit, Trash2, Eye, EyeOff, TreePine } from 'lucide-react'
import { getModules, deleteModule } from '@/lib/supabase/queries/modules'
import { formatDate } from '@/lib/utils/format-date'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Module } from '@/types/index.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function AdminModulesPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadModules()
  }, [])

  async function loadModules() {
    try {
      const data = await getModules(true) // Include unpublished
      setModules(data)
    } catch (error) {
      console.error('Error loading modules:', error)
      toast.error('Failed to load modules')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!moduleToDelete) return

    try {
      await deleteModule(moduleToDelete.id)
      toast.success('Module deleted successfully')
      loadModules()
    } catch (error) {
      console.error('Error deleting module:', error)
      toast.error('Failed to delete module')
    } finally {
      setDeleteDialogOpen(false)
      setModuleToDelete(null)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          heading="Manage Modules"
          description="Create and manage the 8-month learning curriculum"
        >
          <Button onClick={() => router.push('/admin/modules/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Module
          </Button>
        </PageHeader>

        {modules.length === 0 ? (
          <EmptyState
            icon={<TreePine size={64} />}
            title="No Modules Yet"
            description="Get started by creating your first learning module for the cohort."
            action={{
              label: 'Create Module',
              onClick: () => router.push('/admin/modules/new'),
            }}
          />
        ) : (
          <div className="grid gap-4">
            {modules.map((module) => (
              <Card key={module.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-xs">
                          Module {module.order_number}
                        </Badge>
                        {module.is_published ? (
                          <Badge className="bg-rogue-sage text-white text-xs">
                            <Eye className="mr-1 h-3 w-3" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <EyeOff className="mr-1 h-3 w-3" />
                            Draft
                          </Badge>
                        )}
                        {module.release_date && (
                          <span className="text-xs text-rogue-slate">
                            Releases: {formatDate(module.release_date)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-rogue-forest">
                        {module.title}
                      </h3>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/modules/${module.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setModuleToDelete(module)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Module</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{moduleToDelete?.title}"? This will also delete all
                associated lessons and cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Module
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Container>
    </div>
  )
}

