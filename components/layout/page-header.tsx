import * as React from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  heading: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ heading, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn('space-y-4 pb-8', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-rogue-forest">{heading}</h1>
          {description && (
            <p className="text-lg text-rogue-slate leading-relaxed max-w-3xl">
              {description}
            </p>
          )}
        </div>
        {children && <div>{children}</div>}
      </div>
    </div>
  )
}

