import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/index.types'

interface RoleBadgeProps {
  role?: UserRole // Support for single role (deprecated)
  roles?: UserRole[] // Support for multiple roles
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

export function RoleBadge({ role, roles, className }: RoleBadgeProps) {
  // Determine which roles to display
  const displayRoles = roles ? roles : (role ? [role] : [])
  
  // If no roles, return null
  if (displayRoles.length === 0) return null
  
  // Display priority: admin > facilitator > participant
  const priorityOrder: UserRole[] = ['admin', 'facilitator', 'participant']
  const sortedRoles = displayRoles.sort((a, b) => 
    priorityOrder.indexOf(a) - priorityOrder.indexOf(b)
  )
  
  // If only one role, display as before
  if (sortedRoles.length === 1) {
    const config = roleConfig[sortedRoles[0]]
    return (
      <Badge className={cn(config.className, className)}>
        {config.label}
      </Badge>
    )
  }
  
  // Multiple roles - display each badge
  return (
    <div className={cn('flex gap-1 flex-wrap', className)}>
      {sortedRoles.map((r) => {
        const config = roleConfig[r]
        return (
          <Badge key={r} className={config.className}>
            {config.label}
          </Badge>
        )
      })}
    </div>
  )
}

