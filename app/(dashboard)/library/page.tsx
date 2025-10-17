'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Library, BookOpen } from 'lucide-react'
import { getBooks, getReadingProgress } from '@/lib/supabase/queries/books'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { getMonthColor } from '@/lib/utils/month-colors'
import type { Book } from '@/types/index.types'

const BOOK_CATEGORIES = [
  'Stoicism',
  'Team Leadership',
  'Decision Making',
  'Communication',
  'Personal Development',
  'Biography',
  'Strategy',
  'General Leadership',
]

export default function LibraryPage() {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [progressMap, setProgressMap] = useState<Map<string, any>>(new Map())
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredBook, setHoveredBook] = useState<string | null>(null)
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

      // Get reading progress for all books
      const progressPromises = booksData.map(book => getReadingProgress(user.id, book.id))
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

  if (isLoading) {
    return <PageLoader />
  }

  // Split books: Featured (assigned to months) vs General (bookshelf)
  const featuredBooks = books.filter(b => b.is_featured || b.assigned_month).sort((a, b) => (a.assigned_month || 99) - (b.assigned_month || 99))
  const generalBooks = books.filter(b => !b.is_featured && !b.assigned_month)

  // Group general books by category
  const booksByCategory: Record<string, Book[]> = {}
  generalBooks.forEach(book => {
    const category = (book as any).category || 'General Leadership'
    if (!booksByCategory[category]) {
      booksByCategory[category] = []
    }
    booksByCategory[category].push(book)
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-white/80 via-white/60 to-transparent backdrop-blur-sm border-b border-rogue-sage/20">
        <Container>
          <div className="py-10">
            <div className="flex items-end justify-between flex-wrap gap-6">
              <div>
                <h1 className="text-5xl font-bold text-rogue-forest mb-3 tracking-tight">Library</h1>
                <p className="text-lg text-rogue-slate/80">Curated leadership reading</p>
              </div>
              <div className="px-5 py-3 bg-white rounded-xl border border-rogue-sage/20 shadow-sm">
                <p className="text-xs text-rogue-slate/60 uppercase tracking-wider mb-1">Total Books</p>
                <p className="text-3xl font-bold text-rogue-forest">{books.length}</p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-12">
          {books.length === 0 ? (
            <EmptyState
              icon={<Library size={64} />}
              title="No Books Yet"
              description="Your curated library will appear here."
            />
          ) : (
            <div className="space-y-16">
              {/* Featured Books - Assigned to Months */}
              {featuredBooks.length > 0 && (
                <div>
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-rogue-forest mb-2">Monthly Reading</h2>
                    <div className="h-1 w-20 bg-rogue-gold rounded-full" />
                  </div>

                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {featuredBooks.map((book, index) => {
                      const monthColor = book.assigned_month ? getMonthColor(book.assigned_month) : null
                      const progress = progressMap.get(book.id)
                      const status = progress?.status || 'want_to_read'

                      return (
                        <motion.div
                          key={book.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          className="group cursor-pointer"
                          onClick={() => router.push(`/library/${book.id}`)}
                        >
                          <div className="relative">
                            {/* Book Cover */}
                            <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-rogue-sage/5 to-white">
                              {book.cover_image_url ? (
                                <img
                                  src={book.cover_image_url}
                                  alt={book.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-rogue-forest/10 to-rogue-gold/10 flex items-center justify-center">
                                  <BookOpen className="h-8 w-8 text-rogue-forest/30" />
                                </div>
                              )}

                              {/* Reading Status Overlay - Bottom */}
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                {status === 'finished' && (
                                  <div className="flex items-center gap-1 text-white text-xs font-semibold">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                    <span>Done</span>
                                  </div>
                                )}
                                {status === 'reading' && (
                                  <div className="flex items-center gap-1 text-white text-xs font-semibold">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                    <span>Reading</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Month Badge */}
                            {book.assigned_month && monthColor && (
                              <div className="absolute top-2 right-2">
                                <Badge className={`${monthColor.badge} shadow-md text-xs`}>
                                  M{book.assigned_month}
                                </Badge>
                              </div>
                            )}

                            {/* Title & Author - Below Cover (visible on hover) */}
                            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <h3 className="font-semibold text-xs text-rogue-forest line-clamp-2">
                                {book.title}
                              </h3>
                              <p className="text-xs text-rogue-slate/70 mt-0.5 truncate">{book.author}</p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Bookshelf - Non-Featured Books */}
              {Object.keys(booksByCategory).length > 0 && (
                <div className="bg-gradient-to-b from-rogue-forest/5 to-rogue-pine/5 -mx-6 px-6 py-12 rounded-2xl">
                  <div className="mb-10">
                    <h2 className="text-3xl font-bold text-rogue-forest mb-2">Community Bookshelf</h2>
                    <p className="text-rogue-slate/70">Additional recommended reading</p>
                  </div>

                  <div className="space-y-12">
                    {Object.entries(booksByCategory).map(([category, categoryBooks]) => (
                      <div key={category}>
                        {/* Category Header */}
                        <h3 className="text-xl font-semibold text-rogue-forest mb-6 flex items-center gap-3">
                          <div className="h-px flex-1 bg-rogue-sage/20 max-w-12" />
                          {category}
                          <div className="h-px flex-1 bg-rogue-sage/20" />
                        </h3>

                        {/* Books Grid - Cover Only with Hover */}
                        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                          {categoryBooks.map((book) => {
                            const progress = progressMap.get(book.id)
                            const status = progress?.status || 'want_to_read'

                            return (
                              <motion.div
                                key={book.id}
                                className="group cursor-pointer relative"
                                onClick={() => router.push(`/library/${book.id}`)}
                                onMouseEnter={() => setHoveredBook(book.id)}
                                onMouseLeave={() => setHoveredBook(null)}
                                whileHover={{ scale: 1.05, y: -4 }}
                                transition={{ duration: 0.2 }}
                              >
                                {/* Book Cover */}
                                <div className="aspect-[2/3] rounded-md overflow-hidden shadow-sm group-hover:shadow-lg transition-shadow duration-300 bg-gradient-to-b from-rogue-sage/5 to-white">
                                  {book.cover_image_url ? (
                                    <img
                                      src={book.cover_image_url}
                                      alt={book.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-rogue-forest/10 to-rogue-gold/10 flex items-center justify-center">
                                      <BookOpen className="h-6 w-6 text-rogue-forest/30" />
                                    </div>
                                  )}
                                </div>

                                {/* Reading Status Circle - Top Right */}
                                <div className="absolute top-1.5 right-1.5">
                                  {status === 'finished' ? (
                                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-md border-2 border-white" />
                                  ) : status === 'reading' ? (
                                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-md border-2 border-white animate-pulse" />
                                  ) : (
                                    <div className="w-3 h-3 rounded-full bg-gray-300 shadow-sm border-2 border-white" />
                                  )}
                                </div>

                                {/* Hover Overlay - Title, Author, Submitter */}
                                {hoveredBook === book.id && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-gradient-to-t from-rogue-forest via-rogue-forest/95 to-rogue-forest/80 rounded-md p-2 flex flex-col justify-end text-white"
                                  >
                                    <h4 className="font-bold text-xs line-clamp-2 mb-1">{book.title}</h4>
                                    <p className="text-xs opacity-90 mb-1.5">{book.author}</p>
                                    {(book as any).submitted_by_profile && (
                                      <p className="text-xs opacity-70">
                                        Added by {(book as any).submitted_by_profile.full_name}
                                      </p>
                                    )}
                                  </motion.div>
                                )}
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty States */}
              {featuredBooks.length === 0 && generalBooks.length === 0 && (
                <EmptyState
                  icon={<Library size={64} />}
                  title="No Books Yet"
                  description="Your curated library will appear here."
                />
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
