'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Library, BookOpen, Star, ExternalLink } from 'lucide-react'
import { getBooks, getReadingProgress, updateReadingProgress } from '@/lib/supabase/queries/books'
import { toast } from 'sonner'
import type { Book, ReadingStatus } from '@/types/index.types'

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [progressMap, setProgressMap] = useState<Map<string, any>>(new Map())
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadLibrary()
  }, [])

  async function loadLibrary() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }
      setUserId(user.id)

      const booksData = await getBooks()
      setBooks(booksData)

      // Load progress for each book
      const progressPromises = booksData.map(book => 
        getReadingProgress(user.id, book.id)
      )
      const progressData = await Promise.all(progressPromises)
      
      const newProgressMap = new Map()
      progressData.forEach((progress, index) => {
        if (progress) {
          newProgressMap.set(booksData[index].id, progress)
        }
      })
      setProgressMap(newProgressMap)
    } catch (error) {
      console.error('Error loading library:', error)
      toast.error('Failed to load library')
    } finally {
      setIsLoading(false)
    }
  }

  async function updateStatus(bookId: string, status: ReadingStatus) {
    if (!userId) return

    try {
      const updates: any = { status }
      
      if (status === 'reading' && !progressMap.get(bookId)?.started_at) {
        updates.started_at = new Date().toISOString().split('T')[0]
      }
      
      if (status === 'finished') {
        updates.finished_at = new Date().toISOString().split('T')[0]
        if (!progressMap.get(bookId)?.started_at) {
          updates.started_at = new Date().toISOString().split('T')[0]
        }
      }

      await updateReadingProgress(userId, bookId, updates)
      toast.success('Reading status updated!')
      loadLibrary()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          heading="Book Library"
          description="Curated leadership reading with progress tracking"
        />

        {books.length === 0 ? (
          <EmptyState
            icon={<Library size={64} />}
            title="Library Coming Soon"
            description="Your curated book collection will appear here with monthly reading assignments."
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => {
              const progress = progressMap.get(book.id)
              const status = progress?.status || 'want_to_read'

              return (
                <Card key={book.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {book.assigned_month && (
                      <Badge variant="outline" className="mb-2 w-fit">
                        Month {book.assigned_month}
                      </Badge>
                    )}
                    <CardTitle className="text-lg">{book.title}</CardTitle>
                    <CardDescription>{book.author}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {book.description && (
                      <p className="text-sm text-rogue-slate line-clamp-3">{book.description}</p>
                    )}

                    {/* Reading Status */}
                    <div className="space-y-2">
                      <Label className="text-xs text-rogue-slate">Reading Status</Label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={status === 'want_to_read' ? 'default' : 'outline'}
                          onClick={() => updateStatus(book.id, 'want_to_read')}
                          className="flex-1 text-xs"
                        >
                          To Read
                        </Button>
                        <Button
                          size="sm"
                          variant={status === 'reading' ? 'gold' : 'outline'}
                          onClick={() => updateStatus(book.id, 'reading')}
                          className="flex-1 text-xs"
                        >
                          Reading
                        </Button>
                        <Button
                          size="sm"
                          variant={status === 'finished' ? 'sage' : 'outline'}
                          onClick={() => updateStatus(book.id, 'finished')}
                          className="flex-1 text-xs"
                        >
                          Finished
                        </Button>
                      </div>
                    </div>

                    {/* Rating */}
                    {progress?.rating && (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < progress.rating ? 'fill-rogue-gold text-rogue-gold' : 'text-rogue-sage/30'}
                          />
                        ))}
                      </div>
                    )}

                    {/* Links */}
                    <div className="flex gap-2 pt-2">
                      {book.amazon_link && (
                        <Button size="sm" variant="outline" asChild className="flex-1 text-xs">
                          <a href={book.amazon_link} target="_blank" rel="noopener noreferrer">
                            Amazon <ExternalLink size={12} className="ml-1" />
                          </a>
                        </Button>
                      )}
                      {book.goodreads_link && (
                        <Button size="sm" variant="outline" asChild className="flex-1 text-xs">
                          <a href={book.goodreads_link} target="_blank" rel="noopener noreferrer">
                            Goodreads <ExternalLink size={12} className="ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </Container>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}

