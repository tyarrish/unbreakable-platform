'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { validateFileUpload, ALLOWED_DOCUMENT_TYPES } from '@/lib/utils/validation'

interface ResourceUploadProps {
  onUploadComplete: () => void
  lessonId?: string
  moduleId?: string
}

export function ResourceUpload({ onUploadComplete, lessonId, moduleId }: ResourceUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  async function handleUpload() {
    if (!file || (!lessonId && !moduleId)) return

    setIsUploading(true)

    try {
      // Validate file
      const validation = validateFileUpload(
        file,
        [...ALLOWED_DOCUMENT_TYPES, 'image/*'],
        10 * 1024 * 1024
      )

      if (!validation.valid) {
        toast.error(validation.error!)
        setIsUploading(false)
        return
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${file.name}`
      const filePath = lessonId 
        ? `lessons/${lessonId}/${fileName}`
        : `modules/${moduleId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath)

      // Save to database
      const table = lessonId ? 'lesson_attachments' : 'module_attachments'
      const idColumn = lessonId ? 'lesson_id' : 'module_id'
      const idValue = lessonId || moduleId

      const { error: dbError } = await (supabase
        .from(table) as any)
        .insert({
          [idColumn]: idValue,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          description,
        })

      if (dbError) throw dbError

      toast.success('Resource uploaded successfully!')
      setFile(null)
      setDescription('')
      onUploadComplete()
    } catch (error) {
      console.error('Error uploading resource:', error)
      toast.error('Failed to upload resource')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upload Resource</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file">Select File</Label>
          <Input
            id="file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={isUploading}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
          />
          <p className="text-xs text-rogue-slate">
            Accepted: PDF, Word, Excel, PowerPoint, Images. Max 10MB
          </p>
        </div>

        {file && (
          <>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="What is this resource for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={isUploading}
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={isUploading || !file}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resource
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

