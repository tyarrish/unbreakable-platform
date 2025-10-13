'use client'

import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressCircleProps {
  progress: number
  size?: number
  showPercentage?: boolean
  className?: string
}

export function ProgressCircle({ progress, size = 24, showPercentage = false, className }: ProgressCircleProps) {
  const radius = (size - 4) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  if (progress === 100) {
    return (
      <CheckCircle2 
        size={size} 
        className={cn('text-rogue-sage flex-shrink-0', className)} 
        fill="currentColor"
      />
    )
  }

  if (progress === 0) {
    return (
      <Circle 
        size={size} 
        className={cn('text-rogue-slate/30 flex-shrink-0', className)} 
      />
    )
  }

  return (
    <div className={cn('relative flex-shrink-0', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(122, 132, 113, 0.2)"
          strokeWidth="2"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#d4af37"
          strokeWidth="2"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
          strokeLinecap="round"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-rogue-gold">
            {Math.round(progress)}
          </span>
        </div>
      )}
    </div>
  )
}

export function LessonCheckbox({ isCompleted, size = 20 }: { isCompleted: boolean; size?: number }) {
  if (isCompleted) {
    return (
      <CheckCircle2 
        size={size} 
        className="text-rogue-sage flex-shrink-0" 
        fill="currentColor"
      />
    )
  }

  return (
    <Circle 
      size={size} 
      className="text-rogue-slate/30 flex-shrink-0" 
    />
  )
}

