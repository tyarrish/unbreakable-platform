'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Edit, Trash2, BookOpen, Clock } from 'lucide-react'
import { deleteLesson } from '@/lib/supabase/queries/modules'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Lesson } from '@/types/index.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface LessonsListProps {
  lessons: Lesson[]
  moduleId: string
  onUpdate: () => void
}

export function LessonsList({ lessons, moduleId, onUpdate }: LessonsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null)
  const router = useRouter()

  async function handleDelete() {
    if (!lessonToDelete) return

    try {
      await deleteLesson(lessonToDelete.id)
      toast.success('Lesson deleted successfully')
      onUpdate()
    } catch (error) {
      console.error('Error deleting lesson:', error)
      toast.error('Failed to delete lesson')
    } finally {
      setDeleteDialogOpen(false)
      setLessonToDelete(null)
    }
  }

  if (lessons.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen size={48} />}
        title="No Lessons Yet"
        description="Add lessons to this module to build your curriculum."
      />
    )
  }

  return (
    <>
      <div className="space-y-3">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex items-center justify-between p-4 border border-rogue-sage/20 rounded-lg hover:border-rogue-sage/40 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <Badge variant="outline" className="text-xs">
                  Lesson {lesson.order_number}
                </Badge>
                {lesson.duration_minutes && (
                  <span className="text-xs text-rogue-slate flex items-center gap-1">
                    <Clock size={12} />
                    {lesson.duration_minutes} min
                  </span>
                )}
              </div>
              <h4 className="font-medium text-rogue-forest">{lesson.title}</h4>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/modules/${moduleId}/lessons/${lesson.id}`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setLessonToDelete(lesson)
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{lessonToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

