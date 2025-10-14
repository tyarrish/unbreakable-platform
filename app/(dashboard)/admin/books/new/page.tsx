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
import { ArrowLeft } from 'lucide-react'

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
  const [reasoning, setReasoning] = useState('')
  const [keyTakeaways, setKeyTakeaways] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createBook({
        title,
        author,
        description,
        isbn,
        cover_image_url: coverImageUrl || undefined,
        amazon_link: amazonLink || undefined,
        goodreads_link: goodreadsLink || undefined,
        assigned_month: assignedMonth,
        is_featured: isFeatured,
        reasoning: reasoning || undefined,
        key_takeaways: keyTakeaways ? keyTakeaways.split('\n').filter(t => t.trim()) : undefined,
      })

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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief overview of the book and why it's valuable for leadership development..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  disabled={isLoading}
                />
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

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN (Optional)</Label>
                  <Input
                    id="isbn"
                    placeholder="e.g., 978-1591845324"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

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
                  <p className="text-xs text-rogue-slate">Link to specific month (1-8)</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amazonLink">Amazon Link (Optional)</Label>
                <Input
                  id="amazonLink"
                  type="url"
                  placeholder="https://amazon.com/..."
                  value={amazonLink}
                  onChange={(e) => setAmazonLink(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goodreadsLink">Goodreads Link (Optional)</Label>
                <Input
                  id="goodreadsLink"
                  type="url"
                  placeholder="https://goodreads.com/..."
                  value={goodreadsLink}
                  onChange={(e) => setGoodreadsLink(e.target.value)}
                  disabled={isLoading}
                />
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

