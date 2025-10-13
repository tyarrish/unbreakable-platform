'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, FileImage, File, Download, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Resource {
  id: string
  file_name: string
  file_url: string
  file_type?: string
  file_size?: number
  description?: string
}

interface ResourceListProps {
  resources: Resource[]
  onDelete?: (resourceId: string) => void
  isAdmin?: boolean
  className?: string
}

const getFileIcon = (fileType?: string) => {
  if (!fileType) return File
  if (fileType.startsWith('image/')) return FileImage
  if (fileType.includes('pdf')) return FileText
  return File
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return ''
  const mb = bytes / (1024 * 1024)
  if (mb < 1) return `${(bytes / 1024).toFixed(0)} KB`
  return `${mb.toFixed(1)} MB`
}

export function ResourceList({ resources, onDelete, isAdmin = false, className }: ResourceListProps) {
  if (resources.length === 0) {
    return (
      <p className="text-sm text-rogue-slate text-center py-8">
        No resources available
      </p>
    )
  }

  return (
    <div className={cn('grid md:grid-cols-2 gap-4', className)}>
      {resources.map((resource) => {
        const Icon = getFileIcon(resource.file_type)

        return (
          <Card key={resource.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rogue-forest/5 rounded-lg">
                  <Icon className="h-5 w-5 text-rogue-forest" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-rogue-forest mb-1 truncate">
                    {resource.file_name}
                  </h4>
                  {resource.description && (
                    <p className="text-xs text-rogue-slate mb-2 line-clamp-2">
                      {resource.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    {resource.file_size && (
                      <span className="text-xs text-rogue-slate">
                        {formatFileSize(resource.file_size)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  asChild
                >
                  <a 
                    href={resource.file_url} 
                    download={resource.file_name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-3 w-3" />
                    Download
                  </a>
                </Button>
                {isAdmin && onDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(resource.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

