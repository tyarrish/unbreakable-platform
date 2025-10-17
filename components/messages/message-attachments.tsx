'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Paperclip, X, FileText, Download, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface MessageAttachmentsProps {
  onAttachmentsChange: (urls: string[]) => void
  attachments: string[]
}

export function MessageAttachmentUpload({ onAttachmentsChange, attachments }: MessageAttachmentsProps) {
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate files
    const maxSize = 10 * 1024 * 1024 // 10MB
    const invalidFiles = files.filter(f => f.size > maxSize)
    if (invalidFiles.length > 0) {
      toast.error('Some files are too large (max 10MB)')
      return
    }

    setIsUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const uploadedUrls: string[] = []

      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { data, error } = await supabase.storage
          .from('message-attachments')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('message-attachments')
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrl)
      }

      onAttachmentsChange([...attachments, ...uploadedUrls])
      toast.success(`${files.length} file(s) uploaded`)
    } catch (error) {
      console.error('Error uploading files:', error)
      toast.error('Failed to upload files')
    } finally {
      setIsUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  function removeAttachment(url: string) {
    onAttachmentsChange(attachments.filter(a => a !== url))
  }

  return (
    <div>
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 bg-rogue-cream/30 rounded-lg">
          {attachments.map((url, index) => {
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
            return (
              <Badge
                key={index}
                variant="secondary"
                className="pl-2 pr-1 py-1 gap-2 max-w-[200px]"
              >
                {isImage ? <ImageIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                <span className="truncate text-xs">
                  {url.split('/').pop()?.split('-').pop() || 'File'}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeAttachment(url)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}

      <div className="relative">
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
          id="message-file-upload"
          accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isUploading}
          onClick={() => document.getElementById('message-file-upload')?.click()}
          className="text-rogue-slate hover:text-rogue-forest"
        >
          <Paperclip className="h-4 w-4" />
          {isUploading && <span className="ml-1 text-xs">Uploading...</span>}
        </Button>
      </div>
    </div>
  )
}

interface AttachmentDisplayProps {
  urls: string[]
  compact?: boolean
}

export function AttachmentDisplay({ urls, compact = false }: AttachmentDisplayProps) {
  if (!urls || urls.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? 'mt-1' : 'mt-2'}`}>
      {urls.map((url, index) => {
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
        const fileName = url.split('/').pop()?.split('-').pop() || 'File'

        if (isImage) {
          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={url}
                alt={fileName}
                className={`rounded-lg object-cover border border-rogue-sage/20 hover:border-rogue-sage/40 transition-all ${
                  compact ? 'max-w-[150px] max-h-[150px]' : 'max-w-[300px] max-h-[300px]'
                }`}
              />
            </a>
          )
        }

        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className={`flex items-center gap-2 px-3 py-2 bg-rogue-cream/50 border border-rogue-sage/20 rounded-lg hover:bg-rogue-cream hover:border-rogue-sage/40 transition-all ${
              compact ? 'text-xs' : 'text-sm'
            }`}
          >
            <FileText className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
            <span className="truncate max-w-[150px]">{fileName}</span>
            <Download className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} ml-auto`} />
          </a>
        )
      })}
    </div>
  )
}

