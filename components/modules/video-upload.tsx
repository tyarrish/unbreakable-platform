'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Upload, Link as LinkIcon, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface VideoUploadProps {
  lessonId: string
  currentVideoUrl?: string
  currentThumbnailUrl?: string
  onUploadComplete: (videoUrl: string, thumbnailUrl?: string, duration?: number) => void
}

export function VideoUpload({ lessonId, currentVideoUrl, currentThumbnailUrl, onUploadComplete }: VideoUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [externalUrl, setExternalUrl] = useState(currentVideoUrl || '')
  const [thumbnailUrl, setThumbnailUrl] = useState(currentThumbnailUrl || '')
  const [videoDuration, setVideoDuration] = useState<number>()
  const supabase = createClient()

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file')
      return
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Video file must be less than 500MB')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `lessons/${lessonId}/${fileName}`

      // Try lesson-videos bucket first, fall back to attachments
      let uploadBucket = 'lesson-videos'
      let uploadError = null
      
      const { data, error } = await supabase.storage
        .from(uploadBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        // If lesson-videos doesn't exist, try attachments bucket
        console.log('Trying attachments bucket as fallback...')
        uploadBucket = 'attachments'
        const fallback = await supabase.storage
          .from(uploadBucket)
          .upload(`videos/${filePath}`, file, {
            cacheControl: '3600',
            upsert: false,
          })
        
        if (fallback.error) throw fallback.error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(uploadBucket)
        .getPublicUrl(error ? `videos/${filePath}` : filePath)

      // Extract video duration
      const duration = await getVideoDuration(file)

      toast.success('Video uploaded successfully!')
      onUploadComplete(publicUrl, undefined, duration)
      setUploadProgress(100)
    } catch (error: any) {
      console.error('Error uploading video:', error)
      
      // Check if bucket doesn't exist
      if (error.message?.includes('Bucket not found')) {
        toast.error('Please create the "lesson-videos" storage bucket in Supabase first')
      } else {
        toast.error('Failed to upload video')
      }
    } finally {
      setIsUploading(false)
    }
  }

  async function handleExternalUrl() {
    if (!externalUrl.trim()) {
      toast.error('Please enter a video URL')
      return
    }

    // Basic URL validation
    try {
      new URL(externalUrl)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    onUploadComplete(externalUrl, thumbnailUrl || undefined, videoDuration)
    toast.success('Video URL saved!')
  }

  async function getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        resolve(Math.round(video.duration))
      }

      video.onerror = () => {
        resolve(0)
      }

      video.src = URL.createObjectURL(file)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-rogue-gold" />
          Video Source
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="external" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="external">
              <LinkIcon className="h-4 w-4 mr-2" />
              Paste URL
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload Video
            </TabsTrigger>
          </TabsList>

          {/* External URL Tab */}
          <TabsContent value="external" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://example.com/video.mp4 or YouTube/Vimeo URL"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
              />
              <p className="text-xs text-rogue-slate">
                Paste a direct video link, YouTube, Vimeo, or other video platform URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail URL (Optional)</Label>
              <Input
                id="thumbnail"
                type="url"
                placeholder="https://example.com/thumbnail.jpg"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 180 for 3 minutes"
                value={videoDuration || ''}
                onChange={(e) => setVideoDuration(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            {externalUrl && (
              <div className="bg-rogue-cream/50 border border-rogue-sage/20 rounded-lg p-4">
                <p className="text-xs font-medium text-rogue-forest mb-2">Preview</p>
                <div className="aspect-video bg-black rounded overflow-hidden">
                  <video
                    src={externalUrl}
                    poster={thumbnailUrl}
                    controls
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            <Button onClick={handleExternalUrl} className="w-full">
              Save Video URL
            </Button>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="videoFile">Select Video File</Label>
              <Input
                id="videoFile"
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <p className="text-xs text-rogue-slate">
                Accepted: MP4, WebM, OGG. Max 500MB
              </p>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-rogue-slate">Uploading...</span>
                  <span className="font-medium text-rogue-forest">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {uploadProgress === 100 && !isUploading && (
              <div className="flex items-center gap-2 text-rogue-sage">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Upload complete!</span>
              </div>
            )}

            <div className="bg-rogue-gold/10 border border-rogue-gold/30 rounded-lg p-4">
              <p className="text-xs font-medium text-rogue-forest mb-1">
                💡 Tip: Create Storage Bucket First
              </p>
              <p className="text-xs text-rogue-slate">
                Before uploading, create a bucket named "lesson-videos" in your Supabase project
                with public access and 500MB file size limit.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

