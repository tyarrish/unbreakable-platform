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
import { BookCoverUpload } from '@/components/books/book-cover-upload'
import { createBook } from '@/lib/supabase/queries/books'
import { toast } from 'sonner'
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react'

export default function NewBookPage() {
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
  const [isLoading, setIsLoading] = useState(false)
  const [isEnriching, setIsEnriching] = useState(false)
  const router = useRouter()

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

  async function enrichBookDetails() {
    if (!title || !author) {
      toast.error('Please enter title and author first')
      return
    }

    setIsEnriching(true)
    try {
      const res = await fetch('/api/ai/enrich-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author }),
      })

      const result = await res.json()

      if (result.success) {
        setDescription(result.data.description)
        setIsbn(result.data.isbn)
        setAmazonLink(result.data.amazon_link)
        setGoodreadsLink(result.data.goodreads_link)
        toast.success('Book details auto-populated!')
      } else {
        toast.error('Failed to enrich book details')
      }
    } catch (error) {
      console.error('Error enriching book:', error)
      toast.error('Failed to enrich book details')
    } finally {
      setIsEnriching(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createBook({
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

      toast.success('Book added successfully!')
      router.push('/admin/books')
    } catch (error) {
      console.error('Error creating book:', error)
      toast.error('Failed to add book')
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
            Back to Library
          </Button>
        </div>

        <PageHeader
          heading="Add New Book"
          description="Add a book to your curated leadership library"
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
                    placeholder="e.g., Leaders Eat Last"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isLoading || isEnriching}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    placeholder="e.g., Simon Sinek"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                    disabled={isLoading || isEnriching}
                  />
                </div>
              </div>

              {/* AI Enrich Button */}
              {title && author && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={enrichBookDetails}
                    disabled={isEnriching || isLoading}
                    className="border-rogue-gold/30 text-rogue-forest hover:bg-rogue-gold/10"
                  >
                    {isEnriching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 text-rogue-gold" />
                        Auto-Fill with AI
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief overview of the book and why it's valuable for leadership development..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  disabled={isLoading}
                />
                <p className="text-xs text-rogue-slate/70">
                  AI will generate a leadership-focused description explaining why this book matters for the cohort
                </p>
              </div>

              {/* Book Cover Upload Component */}
              <BookCoverUpload
                title={title}
                author={author}
                isbn={isbn}
                coverImageUrl={coverImageUrl}
                onCoverChange={setCoverImageUrl}
                disabled={isLoading}
              />

              <div className="space-y-4">
                <p className="text-sm font-medium text-rogue-forest">Auto-Populated Fields</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      placeholder="Auto-filled"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      disabled={isLoading}
                      className="bg-rogue-sage/5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amazonLink">Amazon Link</Label>
                    <Input
                      id="amazonLink"
                      type="url"
                      placeholder="Auto-filled"
                      value={amazonLink}
                      onChange={(e) => setAmazonLink(e.target.value)}
                      disabled={isLoading}
                      className="bg-rogue-sage/5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goodreadsLink">Goodreads Link</Label>
                    <Input
                      id="goodreadsLink"
                      type="url"
                      placeholder="Auto-filled"
                      value={goodreadsLink}
                      onChange={(e) => setGoodreadsLink(e.target.value)}
                      disabled={isLoading}
                      className="bg-rogue-sage/5"
                    />
                  </div>
                </div>
                <p className="text-xs text-rogue-slate/70">
                  These fields are automatically populated when you click "Auto-Fill with AI"
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="assignedMonth">Assigned Month (Optional)</Label>
                  <Input
                    id="assignedMonth"
                    type="number"
                    min="1"
                    max="8"
                    placeholder="1-8"
                    value={assignedMonth || ''}
                    onChange={(e) => setAssignedMonth(e.target.value ? parseInt(e.target.value) : undefined)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-rogue-slate/70">Assign to a month for featured reading</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category (Optional)</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isLoading}
                    className="w-full h-10 px-3 py-2 rounded-lg border border-rogue-sage/20 bg-white text-rogue-forest focus:outline-none focus:ring-2 focus:ring-rogue-gold/50"
                  >
                    <option value="">Select a category...</option>
                    {BOOK_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <p className="text-xs text-rogue-slate/70">For organizing non-featured books</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reasoning">Why This Book? (Optional)</Label>
                <Textarea
                  id="reasoning"
                  placeholder="Explain why this book is included in the leadership library and what participants will gain from reading it..."
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  rows={4}
                  disabled={isLoading}
                />
                <p className="text-xs text-rogue-slate">
                  This helps participants understand the value and context of the book
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keyTakeaways">Key Leadership Takeaways (Optional)</Label>
                <Textarea
                  id="keyTakeaways"
                  placeholder="Enter each takeaway on a new line&#10;E.g., Understanding servant leadership principles&#10;Building trust through vulnerability&#10;Creating psychological safety in teams"
                  value={keyTakeaways}
                  onChange={(e) => setKeyTakeaways(e.target.value)}
                  rows={6}
                  disabled={isLoading}
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
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-rogue-sage text-rogue-forest focus:ring-rogue-gold"
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">
                  Mark as featured book
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Book'}
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

