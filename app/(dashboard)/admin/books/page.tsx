'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Plus, Edit, Trash2, Library, ExternalLink } from 'lucide-react'
import { getBooks, deleteBook } from '@/lib/supabase/queries/books'
import { toast } from 'sonner'
import type { Book } from '@/types/index.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadBooks()
  }, [])

  async function loadBooks() {
    try {
      const data = await getBooks()
      setBooks(data)
    } catch (error) {
      console.error('Error loading books:', error)
      toast.error('Failed to load books')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!bookToDelete) return

    try {
      await deleteBook(bookToDelete.id)
      toast.success('Book deleted successfully')
      loadBooks()
    } catch (error) {
      console.error('Error deleting book:', error)
      toast.error('Failed to delete book')
    } finally {
      setDeleteDialogOpen(false)
      setBookToDelete(null)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          heading="Manage Book Library"
          description="Curate leadership books for the cohort"
        >
          <Button onClick={() => router.push('/admin/books/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Book
          </Button>
        </PageHeader>

        {books.length === 0 ? (
          <EmptyState
            icon={<Library size={64} />}
            title="No Books Yet"
            description="Start building your curated library by adding leadership books."
            action={{
              label: 'Add Book',
              onClick: () => router.push('/admin/books/new'),
            }}
          />
        ) : (
          <div className="grid gap-4">
            {books.map((book) => (
              <Card key={book.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Book Cover Placeholder */}
                    <div className="w-20 h-28 bg-rogue-sage/10 rounded flex items-center justify-center flex-shrink-0">
                      {book.cover_image_url ? (
                        <img 
                          src={book.cover_image_url} 
                          alt={book.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Library className="h-8 w-8 text-rogue-sage" />
                      )}
                    </div>

                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {book.assigned_month && (
                              <Badge variant="outline" className="text-xs">
                                Month {book.assigned_month}
                              </Badge>
                            )}
                            {book.is_featured && (
                              <Badge className="bg-rogue-gold text-rogue-forest text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-rogue-forest mb-1">
                            {book.title}
                          </h3>
                          <p className="text-sm text-rogue-slate mb-2">{book.author}</p>
                          {book.description && (
                            <p className="text-sm text-rogue-slate line-clamp-2 mb-2">
                              {book.description}
                            </p>
                          )}
                          <div className="flex gap-2">
                            {book.amazon_link && (
                              <a
                                href={book.amazon_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-rogue-forest hover:text-rogue-pine flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Amazon <ExternalLink size={10} />
                              </a>
                            )}
                            {book.goodreads_link && (
                              <a
                                href={book.goodreads_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-rogue-forest hover:text-rogue-pine flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Goodreads <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/books/${book.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setBookToDelete(book)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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
              <DialogTitle>Delete Book</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{bookToDelete?.title}"? This will also remove all
                user reading progress for this book.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Book
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Container>
    </div>
  )
}

