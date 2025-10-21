'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { updateUserRoles } from '@/lib/supabase/queries/users'
import { toast } from 'sonner'
import type { UserRole } from '@/types/index.types'
import type { UserProfile } from '@/lib/supabase/queries/users'

interface EditRoleModalProps {
  user: UserProfile
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

const roleDescriptions: Record<UserRole, { label: string; description: string; color: string }> = {
  admin: {
    label: 'Admin',
    description: 'Full access to all platform features and user management',
    color: 'text-rogue-forest',
  },
  facilitator: {
    label: 'Facilitator',
    description: 'Can manage content and moderate discussions',
    color: 'text-blue-600',
  },
  participant: {
    label: 'Participant',
    description: 'Regular cohort member with access to learning materials',
    color: 'text-rogue-sage',
  },
}

export function EditRoleModal({ user, open, onClose, onSuccess }: EditRoleModalProps) {
  // Initialize with user's current roles, or fall back to participant
  const initialRoles = (user.roles && user.roles.length > 0 ? user.roles : ['participant']) as UserRole[]
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(initialRoles)
  const [isLoading, setIsLoading] = useState(false)

  function toggleRole(role: UserRole) {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        // Don't allow removing the last role
        if (prev.length === 1) {
          toast.error('User must have at least one role')
          return prev
        }
        return prev.filter(r => r !== role)
      } else {
        return [...prev, role]
      }
    })
  }

  const hasChanges = JSON.stringify([...selectedRoles].sort()) !== JSON.stringify([...initialRoles].sort())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateUserRoles(user.id, selectedRoles)
      toast.success('User roles updated successfully')
      
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update roles')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Roles</DialogTitle>
          <DialogDescription>
            Select one or more roles for {user.full_name || user.email}. This will affect their access level and permissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Roles (select one or more)</Label>
            
            {(Object.keys(roleDescriptions) as UserRole[]).map((role) => {
              const config = roleDescriptions[role]
              const isChecked = selectedRoles.includes(role)
              
              return (
                <div
                  key={role}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-all ${
                    isChecked 
                      ? 'border-rogue-gold bg-rogue-gold/5' 
                      : 'border-rogue-sage/20 hover:border-rogue-sage/40'
                  }`}
                >
                  <Checkbox
                    id={`role-${role}`}
                    checked={isChecked}
                    onCheckedChange={() => toggleRole(role)}
                    disabled={isLoading}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`role-${role}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {config.label}
                    </label>
                    <p className={`text-xs mt-1 ${config.color}`}>
                      {config.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {hasChanges && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Note:</strong> Changing roles will immediately affect the user's access and permissions.
                {selectedRoles.length > 1 && (
                  <span className="block mt-1">
                    This user will have <strong>{selectedRoles.length} roles</strong> with combined permissions.
                  </span>
                )}
              </p>
            </div>
          )}

          {selectedRoles.length === 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                User must have at least one role.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !hasChanges || selectedRoles.length === 0}>
              {isLoading ? 'Updating...' : 'Update Roles'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

