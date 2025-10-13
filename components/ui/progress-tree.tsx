'use client'

import * as React from 'react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { getProgressMetaphor } from '@/lib/utils/progress'

interface ProgressTreeProps {
  progress: number
  className?: string
  showLabel?: boolean
}

export function ProgressTree({ progress, className, showLabel = true }: ProgressTreeProps) {
  const metaphor = getProgressMetaphor(progress)
  
  return (
    <div className={cn("space-y-3", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{metaphor.icon}</span>
            <span className="font-medium text-rogue-forest">{metaphor.label}</span>
          </div>
          <span className="text-rogue-slate">{progress}%</span>
        </div>
      )}
      <div className="relative">
        <Progress 
          value={progress} 
          className="h-3 bg-rogue-sage/20"
        />
        <div 
          className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-rogue-sage to-rogue-gold transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

