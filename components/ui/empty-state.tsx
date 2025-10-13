import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {icon && (
        <div className="mb-4 text-rogue-sage opacity-50">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-rogue-forest mb-2">{title}</h3>
      {description && (
        <p className="text-rogue-slate max-w-md mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="forest">
          {action.label}
        </Button>
      )}
    </div>
  )
}

