'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateUserRole } from '@/lib/supabase/queries/users'
import { toast } from 'sonner'
import type { UserRole } from '@/types/index.types'
import type { UserProfile } from '@/lib/supabase/queries/users'

interface EditRoleModalProps {
  user: UserProfile
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function EditRoleModal({ user, open, onClose, onSuccess }: EditRoleModalProps) {
  const [role, setRole] = useState<UserRole>(user.role)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateUserRole(user.id, role)
      toast.success('User role updated successfully')
      
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>
            Change the role for {user.full_name || user.email}. This will affect their access level and permissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger id="role" disabled={isLoading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="participant">Participant</SelectItem>
                <SelectItem value="facilitator">Facilitator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-rogue-slate space-y-1 mt-2">
              {role === 'admin' && (
                <p className="text-rogue-forest font-medium">
                  • Full access to all platform features and user management
                </p>
              )}
              {role === 'facilitator' && (
                <p className="text-blue-600 font-medium">
                  • Can manage content and moderate discussions
                </p>
              )}
              {role === 'participant' && (
                <p className="text-rogue-sage font-medium">
                  • Regular cohort member with access to learning materials
                </p>
              )}
            </div>
          </div>

          {role !== user.role && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Note:</strong> Changing this user's role will immediately affect their access and permissions.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || role === user.role}>
              {isLoading ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

