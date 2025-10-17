'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/loading-spinner'
import { BookCoverUpload } from '@/components/books/book-cover-upload'
import { getBook, updateBook } from '@/lib/supabase/queries/books'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import type { Book } from '@/types/index.types'

export default function EditBookPage() {
  const params = useParams()
  const router = useRouter()
  const bookId = params.id as string

  const [book, setBook] = useState<Book | null>(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [isbn, setIsbn] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [amazonLink, setAmazonLink] = useState('')
  const [goodreadsLink, setGoodreadsLink] = useState('')
  const [assignedMonth, setAssignedMonth] = useState<number | undefined>()
  const [isFeatured, setIsFeatured] = useState(false)
  const [category, setCategory] = useState('')
  const [reasoning, setReasoning] = useState('')
  const [keyTakeaways, setKeyTakeaways] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const BOOK_CATEGORIES = [
    'Philosophy',
    'Team Leadership',
    'Decision Making',
    'Communication',
    'Personal Development',
    'Biography',
    'Strategy',
    'General Leadership',
  ]

  useEffect(() => {
    loadBook()
  }, [bookId])

  async function loadBook() {
    try {
      const data = await getBook(bookId)
      setBook(data)
      setTitle(data.title)
      setAuthor(data.author)
      setDescription(data.description || '')
      setIsbn(data.isbn || '')
      setCoverImageUrl(data.cover_image_url || '')
      setAmazonLink(data.amazon_link || '')
      setGoodreadsLink(data.goodreads_link || '')
      setAssignedMonth(data.assigned_month || undefined)
      setIsFeatured(data.is_featured)
      setCategory((data as any).category || '')
      setReasoning(data.reasoning || '')
      setKeyTakeaways(data.key_takeaways?.join('\n') || '')
    } catch (error) {
      console.error('Error loading book:', error)
      toast.error('Failed to load book')
      router.push('/admin/books')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    try {
      await updateBook(bookId, {
        title,
        author,
        description,
        isbn,
        category: category || undefined,
        cover_image_url: coverImageUrl || undefined,
        amazon_link: amazonLink || undefined,
        goodreads_link: goodreadsLink || undefined,
        assigned_month: assignedMonth,
        is_featured: isFeatured,
        reasoning: reasoning || undefined,
        key_takeaways: keyTakeaways ? keyTakeaways.split('\n').filter(t => t.trim()) : undefined,
      } as any)

      toast.success('Book updated successfully!')
      router.push('/admin/books')
    } catch (error) {
      console.error('Error updating book:', error)
      toast.error('Failed to update book')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (!book) {
    return null
  }

  return (
    <div className="py-8">
      <Container size="md">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/admin/books')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Button>
        </div>

        <PageHeader
          heading="Edit Book"
          description="Update book details and assignment"
        />

        <Card>
          <CardHeader>
            <CardTitle>Book Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Book Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  disabled={isSaving}
                />
              </div>

              {/* Book Cover Upload Component */}
              <BookCoverUpload
                title={title}
                author={author}
                isbn={isbn}
                coverImageUrl={coverImageUrl}
                onCoverChange={setCoverImageUrl}
                disabled={isSaving}
              />

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedMonth">Assigned Month</Label>
                  <Input
                    id="assignedMonth"
                    type="number"
                    min="1"
                    max="8"
                    placeholder="1-8"
                    value={assignedMonth || ''}
                    onChange={(e) => setAssignedMonth(e.target.value ? parseInt(e.target.value) : undefined)}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isSaving}
                    className="w-full h-10 px-3 py-2 rounded-lg border border-rogue-sage/20 bg-white text-rogue-forest focus:outline-none focus:ring-2 focus:ring-rogue-gold/50"
                  >
                    <option value="">Select a category...</option>
                    {BOOK_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amazonLink">Amazon Link</Label>
                <Input
                  id="amazonLink"
                  type="url"
                  value={amazonLink}
                  onChange={(e) => setAmazonLink(e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goodreadsLink">Goodreads Link</Label>
                <Input
                  id="goodreadsLink"
                  type="url"
                  value={goodreadsLink}
                  onChange={(e) => setGoodreadsLink(e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reasoning">Why This Book?</Label>
                <Textarea
                  id="reasoning"
                  placeholder="Explain why this book is included in the leadership library and what participants will gain from reading it..."
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  rows={4}
                  disabled={isSaving}
                />
                <p className="text-xs text-rogue-slate">
                  This helps participants understand the value and context of the book
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keyTakeaways">Key Leadership Takeaways</Label>
                <Textarea
                  id="keyTakeaways"
                  placeholder="Enter each takeaway on a new line&#10;E.g., Understanding servant leadership principles&#10;Building trust through vulnerability&#10;Creating psychological safety in teams"
                  value={keyTakeaways}
                  onChange={(e) => setKeyTakeaways(e.target.value)}
                  rows={6}
                  disabled={isSaving}
                />
                <p className="text-xs text-rogue-slate">
                  Enter one takeaway per line. These will be displayed as a numbered list.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  disabled={isSaving}
                  className="h-4 w-4 rounded border-rogue-sage text-rogue-forest focus:ring-rogue-gold"
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">
                  Mark as featured book
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/books')}
                  disabled={isSaving}
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

