'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Library, BookOpen, Star, ExternalLink, Sparkles, BookMarked, Check } from 'lucide-react'
import { getBooks, getReadingProgress, updateReadingProgress } from '@/lib/supabase/queries/books'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import type { Book, ReadingStatus } from '@/types/index.types'

export default function LibraryPage() {
  const router = useRouter()
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

  const currentMonthBooks = books.filter(b => b.assigned_month)
  const generalBooks = books.filter(b => !b.assigned_month)
  const finishedCount = Array.from(progressMap.values()).filter(p => p.status === 'finished').length
  const readingCount = Array.from(progressMap.values()).filter(p => p.status === 'reading').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
      {/* Subtle header background */}
      <div className="bg-white/40 backdrop-blur-sm border-b border-rogue-sage/10">
        <Container>
          <div className="py-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-rogue-forest mb-2">Leadership Library</h1>
                <p className="text-lg text-rogue-slate">
                  Curated reading paired with your monthly curriculum
                </p>
              </div>
              <div className="flex gap-3">
                <Badge className="bg-rogue-pine/10 text-rogue-pine border-0 px-4 py-2">
                  {books.length} Books
                </Badge>
                <Badge className="bg-rogue-gold text-white border-0 px-4 py-2">
                  {readingCount} Reading
                </Badge>
                <Badge className="bg-green-100 text-green-700 border-0 px-4 py-2">
                  {finishedCount} Done
                </Badge>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          {books.length === 0 ? (
            <Card className="border-0 shadow-xl">
              <EmptyState
                icon={<Library size={64} />}
                title="Library Coming Soon"
                description="Your curated book collection will appear here with monthly reading assignments."
              />
            </Card>
          ) : (
            <div className="space-y-12">
              {/* Monthly Assigned Books */}
              {currentMonthBooks.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-rogue-gold/10 rounded-lg">
                      <Sparkles className="h-5 w-5 text-rogue-gold" />
                    </div>
                    <h2 className="text-3xl font-bold text-rogue-forest">Monthly Assignments</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {currentMonthBooks.map((book) => {
                      const progress = progressMap.get(book.id)
                      const status = progress?.status || 'want_to_read'

                      return (
                        <motion.div
                          key={book.id}
                          layoutId={`book-${book.id}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ y: -8, scale: 1.02 }}
                        >
                          <Card 
                            className="group border-0 shadow-lg hover:shadow-2xl transition-shadow cursor-pointer overflow-hidden bg-white"
                            onClick={() => router.push(`/library/${book.id}`)}
                          >
                          {/* Book Cover - Taller for better book proportions */}
                          <div className="relative bg-gradient-to-b from-rogue-sage/5 to-white p-4">
                            {book.cover_image_url ? (
                              <div className="aspect-[2/3] overflow-hidden rounded-lg shadow-md">
                                <img
                                  src={book.cover_image_url}
                                  alt={book.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                            ) : (
                              <div className="aspect-[2/3] bg-gradient-to-br from-rogue-forest/10 to-rogue-gold/10 rounded-lg flex items-center justify-center">
                                <BookOpen className="h-16 w-16 text-rogue-forest/30" />
                              </div>
                            )}
                            
                            {/* Month Badge - Redesigned */}
                            {book.assigned_month && (
                              <div className="absolute top-2 right-2">
                                <div className="bg-rogue-gold text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                  Month {book.assigned_month}
                                </div>
                              </div>
                            )}
                            
                            {/* Status Badge */}
                            {status === 'finished' && (
                              <div className="absolute bottom-2 left-2">
                                <Badge className="bg-green-600 text-white shadow-lg border-0 text-xs">
                                  <Check size={10} className="mr-1" />
                                  Done
                                </Badge>
                              </div>
                            )}
                            {status === 'reading' && (
                              <div className="absolute bottom-2 left-2">
                                <Badge className="bg-rogue-gold text-white shadow-lg border-0 text-xs">
                                  Reading
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* Book Info - Compact */}
                          <CardContent className="pt-4 pb-4 space-y-3">
                            <div>
                              <h3 className="font-bold text-base text-rogue-forest line-clamp-2 leading-tight group-hover:text-rogue-gold transition-colors mb-1">
                                {book.title}
                              </h3>
                              <p className="text-sm text-rogue-slate">{book.author}</p>
                            </div>

                            {/* Star Rating */}
                            {progress?.rating && (
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={i < progress.rating ? 'fill-rogue-gold text-rogue-gold' : 'text-rogue-slate/20'}
                                  />
                                ))}
                              </div>
                            )}

                            {/* Quick Status Toggle */}
                            <div className="flex gap-1.5 pt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateStatus(book.id, 'want_to_read')
                                }}
                                className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                                  status === 'want_to_read' 
                                    ? 'bg-rogue-forest text-white shadow-sm' 
                                    : 'bg-rogue-sage/10 text-rogue-slate hover:bg-rogue-sage/20'
                                }`}
                              >
                                To Read
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateStatus(book.id, 'reading')
                                }}
                                className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                                  status === 'reading' 
                                    ? 'bg-rogue-gold text-white shadow-sm' 
                                    : 'bg-rogue-sage/10 text-rogue-slate hover:bg-rogue-sage/20'
                                }`}
                              >
                                Reading
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateStatus(book.id, 'finished')
                                }}
                                className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                                  status === 'finished' 
                                    ? 'bg-green-600 text-white shadow-sm' 
                                    : 'bg-rogue-sage/10 text-rogue-slate hover:bg-rogue-sage/20'
                                }`}
                              >
                                Done
                              </button>
                            </div>
                          </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Additional Reading */}
              {generalBooks.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-1 w-12 bg-gradient-to-r from-rogue-forest to-rogue-gold rounded-full"></div>
                    <h2 className="text-2xl font-bold text-rogue-forest">Additional Reading</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {generalBooks.map((book) => {
                      const progress = progressMap.get(book.id)
                      const status = progress?.status || 'want_to_read'

                      return (
                        <motion.div
                          key={book.id}
                          layoutId={`book-${book.id}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ y: -6, scale: 1.02 }}
                        >
                          <Card 
                            className="group border-0 shadow-md hover:shadow-xl transition-shadow cursor-pointer bg-white"
                            onClick={() => router.push(`/library/${book.id}`)}
                          >
                          <div className="relative bg-gradient-to-b from-rogue-sage/5 to-white p-3">
                            {book.cover_image_url ? (
                              <div className="aspect-[2/3] overflow-hidden rounded-md shadow">
                                <img
                                  src={book.cover_image_url}
                                  alt={book.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                            ) : (
                              <div className="aspect-[2/3] bg-gradient-to-br from-rogue-forest/10 to-rogue-gold/10 rounded-md flex items-center justify-center">
                                <BookOpen className="h-12 w-12 text-rogue-forest/30" />
                              </div>
                            )}
                            {status === 'finished' && (
                              <div className="absolute bottom-1 left-1">
                                <Badge className="bg-green-600 text-white shadow-md border-0 text-xs">
                                  ✓
                                </Badge>
                              </div>
                            )}
                          </div>
                          <CardContent className="pt-3 pb-3 space-y-1">
                            <h3 className="font-semibold text-xs text-rogue-forest line-clamp-2 leading-tight">{book.title}</h3>
                            <p className="text-xs text-rogue-slate truncate">{book.author}</p>
                          </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
