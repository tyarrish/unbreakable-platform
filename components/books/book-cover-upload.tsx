'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Download, Upload, Image as ImageIcon, X } from 'lucide-react'
import { fetchBookCover } from '@/lib/utils/book-cover'
import { uploadBookCover } from '@/lib/utils/upload-book-cover'
import { toast } from 'sonner'

interface BookCoverUploadProps {
  title: string
  author: string
  isbn: string
  coverImageUrl: string
  onCoverChange: (url: string) => void
  disabled?: boolean
}

export function BookCoverUpload({
  title,
  author,
  isbn,
  coverImageUrl,
  onCoverChange,
  disabled = false,
}: BookCoverUploadProps) {
  const [isFetchingCover, setIsFetchingCover] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFetchCover() {
    if (!title || !author) {
      toast.error('Please enter book title and author first')
      return
    }

    setIsFetchingCover(true)
    try {
      const metadata = await fetchBookCover(title, author, isbn)
      
      if (metadata?.coverUrl) {
        onCoverChange(metadata.coverUrl)
        toast.success('Book cover found!')
      } else {
        toast.error('Could not find book cover. Try entering ISBN or uploading an image.')
      }
    } catch (error) {
      console.error('Error fetching cover:', error)
      toast.error('Failed to fetch book cover')
    } finally {
      setIsFetchingCover(false)
    }
  }

  async function handleFileUpload(file: File) {
    if (!file) return

    setIsUploading(true)
    try {
      const result = await uploadBookCover(file)
      onCoverChange(result.url)
      toast.success('Cover uploaded successfully!')
    } catch (error) {
      console.error('Error uploading cover:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload cover')
    } finally {
      setIsUploading(false)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file)
    } else {
      toast.error('Please drop an image file')
    }
  }

  return (
    <div className="space-y-4 p-4 border border-rogue-sage/30 rounded-lg bg-rogue-cream/30">
      <div className="flex items-center justify-between">
        <Label className="text-base">Book Cover</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFetchCover}
            disabled={!title || !author || isFetchingCover || isUploading || disabled}
          >
            <Download className="mr-2 h-4 w-4" />
            {isFetchingCover ? 'Fetching...' : 'Auto-Fetch'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || disabled}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Drop Zone / Preview */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg overflow-hidden transition-all
          ${isDragging ? 'border-rogue-gold bg-rogue-gold/5' : 'border-rogue-sage/30'}
          ${!coverImageUrl && !disabled ? 'cursor-pointer hover:border-rogue-sage/50' : ''}
        `}
        onClick={() => !coverImageUrl && !disabled && fileInputRef.current?.click()}
      >
        {coverImageUrl ? (
          <div className="flex items-start gap-4 p-4">
            <div className="relative w-32 h-48 rounded-lg overflow-hidden border-2 border-rogue-sage/30 flex-shrink-0">
              <img
                src={coverImageUrl}
                alt={title || 'Book cover'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm text-rogue-slate">
                Cover image set! You can auto-fetch, upload a new one, or enter a custom URL below.
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onCoverChange('')
                }}
                disabled={disabled}
              >
                <X className="mr-2 h-4 w-4" />
                Remove Cover
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 p-6 text-center">
            <div className={`transition-transform ${isDragging ? 'scale-110' : ''}`}>
              <ImageIcon className="mx-auto h-12 w-12 text-rogue-slate/40 mb-3" />
            </div>
            <p className="text-sm font-medium text-rogue-forest mb-1">
              {isDragging ? 'Drop image here' : 'No cover image yet'}
            </p>
            <p className="text-xs text-rogue-slate">
              {isDragging 
                ? 'Release to upload' 
                : 'Drag & drop an image, or click buttons above'}
            </p>
          </div>
        )}
      </div>

      {/* Manual URL Input */}
      <div className="space-y-2">
        <Label htmlFor="coverImageUrl">Or Enter Custom Cover URL</Label>
        <Input
          id="coverImageUrl"
          type="url"
          placeholder="https://..."
          value={coverImageUrl}
          onChange={(e) => onCoverChange(e.target.value)}
          disabled={disabled}
        />
        <p className="text-xs text-rogue-slate">
          💡 Tip: Enter ISBN first for best auto-fetch results, or drag & drop your own image
        </p>
      </div>
    </div>
  )
}




