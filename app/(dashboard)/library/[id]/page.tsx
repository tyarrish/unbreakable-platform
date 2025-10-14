'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading-spinner'
import { BookCommentThread } from '@/components/books/book-comment-thread'
import { getBook, getReadingProgress, updateReadingProgress } from '@/lib/supabase/queries/books'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { ArrowLeft, ExternalLink, BookOpen, Star, Lightbulb, Circle, CheckCircle2 } from 'lucide-react'
import type { Book, ReadingStatus } from '@/types/index.types'

export default function BookDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookId = params.id as string
  const supabase = createClient()

  const [book, setBook] = useState<Book | null>(null)
  const [progress, setProgress] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBookDetails()
  }, [bookId])

  async function loadBookDetails() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      const bookData = await getBook(bookId)
      setBook(bookData)

      const progressData = await getReadingProgress(user.id, bookId)
      setProgress(progressData)
    } catch (error) {
      console.error('Error loading book:', error)
      toast.error('Failed to load book details')
      router.push('/library')
    } finally {
      setIsLoading(false)
    }
  }

  async function updateStatus(status: ReadingStatus) {
    if (!userId) return

    try {
      const updates: any = { status }
      
      if (status === 'reading' && !progress?.started_at) {
        updates.started_at = new Date().toISOString().split('T')[0]
      }
      
      if (status === 'finished') {
        updates.finished_at = new Date().toISOString().split('T')[0]
        if (!progress?.started_at) {
          updates.started_at = new Date().toISOString().split('T')[0]
        }
      }

      await updateReadingProgress(userId, bookId, updates)
      toast.success('Reading status updated!')
      loadBookDetails()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (!book) {
    return null
  }

  const status = progress?.status || 'want_to_read'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="py-8"
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Button variant="ghost" onClick={() => router.push('/library')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Book Info */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <Card className="border-0 shadow-2xl overflow-hidden">
              <CardContent className="pt-6 space-y-6">
                {/* Book Cover with Layout ID for shared element transition */}
                {book.cover_image_url && (
                  <motion.div
                    layoutId={`book-${bookId}`}
                    className="w-full aspect-[2/3] rounded-lg overflow-hidden shadow-xl bg-gradient-to-b from-rogue-sage/5 to-white"
                    transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
                  >
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )}

                {/* Book Title & Author */}
                <div>
                  {book.assigned_month && (
                    <Badge variant="outline" className="mb-2">
                      Month {book.assigned_month}
                    </Badge>
                  )}
                  <h1 className="text-2xl font-bold text-rogue-forest mb-2">
                    {book.title}
                  </h1>
                  <p className="text-lg text-rogue-slate">{book.author}</p>
                </div>

                {/* Reading Status */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-rogue-forest">Update Reading Status</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => updateStatus('want_to_read')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        status === 'want_to_read' 
                          ? 'bg-rogue-forest text-white shadow-md' 
                          : 'bg-white border border-rogue-sage/20 text-rogue-slate hover:border-rogue-forest/30 hover:bg-rogue-forest/5'
                      }`}
                    >
                      <Circle className={`w-4 h-4 flex-shrink-0 ${status === 'want_to_read' ? 'fill-white' : ''}`} />
                      <span className="flex-1 text-left">To Read</span>
                      {status === 'want_to_read' && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => updateStatus('reading')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        status === 'reading' 
                          ? 'bg-rogue-gold text-white shadow-md' 
                          : 'bg-white border border-rogue-sage/20 text-rogue-slate hover:border-rogue-gold/30 hover:bg-rogue-gold/5'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-left">Reading</span>
                      {status === 'reading' && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => updateStatus('finished')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        status === 'finished' 
                          ? 'bg-green-600 text-white shadow-md' 
                          : 'bg-white border border-rogue-sage/20 text-rogue-slate hover:border-green-600/30 hover:bg-green-50'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${status === 'finished' ? 'fill-white' : ''}`} />
                      <span className="flex-1 text-left">Completed</span>
                      {status === 'finished' && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Rating */}
                {progress?.rating && (
                  <div>
                    <label className="text-sm font-medium text-rogue-slate block mb-2">
                      Your Rating
                    </label>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={
                            i < progress.rating
                              ? 'fill-rogue-gold text-rogue-gold'
                              : 'text-rogue-sage/30'
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* External Links */}
                {(book.amazon_link || book.goodreads_link) && (
                  <div className="space-y-2 pt-4 border-t border-rogue-sage/20">
                    {book.amazon_link && (
                      <Button size="sm" variant="outline" asChild className="w-full">
                        <a href={book.amazon_link} target="_blank" rel="noopener noreferrer">
                          Amazon <ExternalLink size={14} className="ml-2" />
                        </a>
                      </Button>
                    )}
                    {book.goodreads_link && (
                      <Button size="sm" variant="outline" asChild className="w-full">
                        <a href={book.goodreads_link} target="_blank" rel="noopener noreferrer">
                          Goodreads <ExternalLink size={14} className="ml-2" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Details & Discussion */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Why This Book */}
            {book.reasoning && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-rogue-gold" />
                    Why This Book?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-rogue-slate leading-relaxed">{book.reasoning}</p>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {book.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Book</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-rogue-slate leading-relaxed">{book.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Key Takeaways */}
            {book.key_takeaways && book.key_takeaways.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Key Leadership Takeaways</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {book.key_takeaways.map((takeaway: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rogue-gold/20 text-rogue-forest flex items-center justify-center text-sm font-semibold mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-rogue-slate leading-relaxed">{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Comments/Discussion */}
            <Card>
              <CardHeader>
                <CardTitle>Book Discussion</CardTitle>
                <p className="text-sm text-rogue-slate">
                  Share your thoughts, insights, and questions about this book with your cohort.
                </p>
              </CardHeader>
              <CardContent>
                {userId && <BookCommentThread bookId={bookId} userId={userId} />}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Container>
    </motion.div>
  )
}

