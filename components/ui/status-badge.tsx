import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default'

interface StatusBadgeProps {
  status: StatusType
  label: string
  className?: string
}

const statusConfig: Record<StatusType, { className: string; icon?: string }> = {
  success: {
    className: 'bg-rogue-sage text-white',
    icon: '✓',
  },
  warning: {
    className: 'bg-rogue-ochre text-white',
    icon: '!',
  },
  error: {
    className: 'bg-rogue-terracotta text-white',
    icon: '×',
  },
  info: {
    className: 'bg-rogue-steel text-white',
    icon: 'i',
  },
  default: {
    className: 'bg-rogue-cream text-rogue-forest',
  },
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge className={cn(config.className, className)}>
      {config.icon && <span className="mr-1">{config.icon}</span>}
      {label}
    </Badge>
  )
}

// Lesson status badge
export function LessonStatusBadge({ status }: { status: 'not_started' | 'in_progress' | 'completed' }) {
  const statusMap: Record<string, { type: StatusType; label: string }> = {
    not_started: { type: 'default', label: 'Not Started' },
    in_progress: { type: 'warning', label: 'In Progress' },
    completed: { type: 'success', label: 'Completed' },
  }
  
  const config = statusMap[status]
  return <StatusBadge status={config.type} label={config.label} />
}

// Event status badge
export function EventStatusBadge({ status }: { status: 'registered' | 'attended' | 'missed' }) {
  const statusMap: Record<string, { type: StatusType; label: string }> = {
    registered: { type: 'info', label: 'Registered' },
    attended: { type: 'success', label: 'Attended' },
    missed: { type: 'error', label: 'Missed' },
  }
  
  const config = statusMap[status]
  return <StatusBadge status={config.type} label={config.label} />
}

