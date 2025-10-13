import * as React from 'react'
import { 
  TreePine, 
  Mountain, 
  Compass, 
  Sprout, 
  TreeDeciduous,
  Leaf,
  type LucideIcon 
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NatureIconType = 'tree-pine' | 'mountain' | 'compass' | 'sprout' | 'tree' | 'leaf'

interface NatureIconProps {
  type: NatureIconType
  className?: string
  size?: number
}

const iconMap: Record<NatureIconType, LucideIcon> = {
  'tree-pine': TreePine,
  'mountain': Mountain,
  'compass': Compass,
  'sprout': Sprout,
  'tree': TreeDeciduous,
  'leaf': Leaf,
}

export function NatureIcon({ type, className, size = 24 }: NatureIconProps) {
  const Icon = iconMap[type]
  
  return (
    <Icon 
      size={size} 
      className={cn('text-rogue-forest', className)} 
    />
  )
}

// Pre-configured nature icons for common use cases
export function ModuleIcon({ className }: { className?: string }) {
  return <NatureIcon type="tree-pine" className={className} />
}

export function ProgressIcon({ className }: { className?: string }) {
  return <NatureIcon type="sprout" className={className} />
}

export function JourneyIcon({ className }: { className?: string }) {
  return <NatureIcon type="compass" className={className} />
}

export function GoalIcon({ className }: { className?: string }) {
  return <NatureIcon type="mountain" className={className} />
}

