'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookPlus, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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

interface SubmitBookModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onSuccess?: () => void
}

export function SubmitBookModal({ isOpen, onClose, userId, onSuccess }: SubmitBookModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    amazon_link: '',
    description: '',
    reason_for_recommendation: '',
    category: 'General Leadership',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.author.trim()) {
      toast.error('Please fill in title and author')
      return
    }

    if (!formData.reason_for_recommendation.trim()) {
      toast.error('Please explain why you recommend this book')
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      
      const { error } = await (supabase as any)
        .from('book_submissions')
        .insert({
          ...formData,
          submitted_by: userId,
        })

      if (error) throw error

      toast.success('Book submitted for review! Admins will review your recommendation.')
      
      // Reset form
      setFormData({
        title: '',
        author: '',
        isbn: '',
        amazon_link: '',
        description: '',
        reason_for_recommendation: '',
        category: 'General Leadership',
      })
      
      if (onSuccess) onSuccess()
      onClose()
    } catch (error) {
      console.error('Error submitting book:', error)
      toast.error('Failed to submit book')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rogue-forest">
            <BookPlus className="h-5 w-5" />
            Recommend a Book
          </DialogTitle>
          <DialogDescription>
            Suggest a leadership book for the community library. Admins will review your recommendation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Book Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-rogue-forest">Book Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">
                Book Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Extreme Ownership"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">
                Author <span className="text-red-500">*</span>
              </Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => handleChange('author', e.target.value)}
                placeholder="e.g., Jocko Willink"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN (Optional)</Label>
                <Input
                  id="isbn"
                  value={formData.isbn}
                  onChange={(e) => handleChange('isbn', e.target.value)}
                  placeholder="ISBN-13 or ISBN-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOK_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amazon_link">Amazon Link (Optional)</Label>
              <Input
                id="amazon_link"
                type="url"
                value={formData.amazon_link}
                onChange={(e) => handleChange('amazon_link', e.target.value)}
                placeholder="https://www.amazon.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Brief Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="What is this book about?"
                rows={3}
              />
            </div>
          </div>

          {/* Recommendation Reason */}
          <div className="space-y-4 pt-4 border-t border-rogue-sage/20">
            <h3 className="text-sm font-semibold text-rogue-forest">Your Recommendation</h3>
            
            <div className="space-y-2">
              <Label htmlFor="reason">
                Why do you recommend this book? <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                value={formData.reason_for_recommendation}
                onChange={(e) => handleChange('reason_for_recommendation', e.target.value)}
                placeholder="What leadership lessons does this book offer? How has it impacted you? Why would it benefit other cohort members?"
                rows={4}
                required
                className="resize-none"
              />
              <p className="text-xs text-rogue-slate/70">
                This helps admins understand the value this book would bring to the community.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-rogue-sage/20">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-rogue-forest hover:bg-rogue-pine"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Recommendation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

