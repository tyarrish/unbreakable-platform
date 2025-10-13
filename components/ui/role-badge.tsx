import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/index.types'

interface RoleBadgeProps {
  role: UserRole
  className?: string
}

const roleConfig: Record<UserRole, { label: string; className: string }> = {
  admin: {
    label: 'Admin',
    className: 'bg-rogue-forest text-white hover:bg-rogue-pine',
  },
  facilitator: {
    label: 'Facilitator',
    className: 'bg-rogue-sage text-white hover:bg-rogue-steel',
  },
  participant: {
    label: 'Participant',
    className: 'bg-rogue-gold text-rogue-forest hover:bg-rogue-gold-light',
  },
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role]
  
  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}

