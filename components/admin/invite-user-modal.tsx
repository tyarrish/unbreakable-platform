'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Mail, CheckCircle, Clock, XCircle } from 'lucide-react'
import { getInvites } from '@/lib/supabase/queries/users'
import { sendUserInvite } from '@/app/actions/users'
import { formatDate } from '@/lib/utils/format-date'
import { toast } from 'sonner'
import type { UserRole } from '@/types/index.types'
import type { Invite } from '@/lib/supabase/queries/users'

interface InviteUserModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function InviteUserModal({ open, onClose, onSuccess }: InviteUserModalProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('participant')
  const [isLoading, setIsLoading] = useState(false)
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([])
  const [loadingInvites, setLoadingInvites] = useState(false)

  useEffect(() => {
    if (open) {
      loadPendingInvites()
    }
  }, [open])

  async function loadPendingInvites() {
    setLoadingInvites(true)
    try {
      const invites = await getInvites('pending')
      setPendingInvites(invites)
    } catch (error) {
      console.error('Error loading invites:', error)
    } finally {
      setLoadingInvites(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await sendUserInvite(email, fullName, role)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(`Invite sent to ${email}`)
      
      // Reset form
      setFullName('')
      setEmail('')
      setRole('participant')
      
      // Reload pending invites
      await loadPendingInvites()
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invite')
    } finally {
      setIsLoading(false)
    }
  }

  function getRoleBadgeColor(roleValue: UserRole) {
    switch (roleValue) {
      case 'admin':
        return 'bg-rogue-gold text-white'
      case 'facilitator':
        return 'bg-blue-600 text-white'
      case 'participant':
        return 'bg-rogue-sage text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send User Invite</DialogTitle>
          <DialogDescription>
            Send a magic link invitation to a new user. They'll be able to create their account and set their password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

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
            <p className="text-xs text-rogue-slate">
              {role === 'admin' && 'Full access to all platform features and user management'}
              {role === 'facilitator' && 'Can manage content and moderate discussions'}
              {role === 'participant' && 'Regular cohort member with access to learning materials'}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Mail className="mr-2 h-4 w-4" />
              {isLoading ? 'Sending...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </form>

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div className="mt-6 pt-6 border-t border-rogue-sage/20">
            <h3 className="text-sm font-semibold text-rogue-forest mb-3">
              Pending Invites ({pendingInvites.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-rogue-sage/5 border border-rogue-sage/10"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm text-rogue-forest truncate">
                        {invite.full_name}
                      </p>
                      <Badge className={`${getRoleBadgeColor(invite.role)} border-0 text-xs`}>
                        {invite.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-rogue-slate truncate">{invite.email}</p>
                    <p className="text-xs text-rogue-slate mt-1">
                      Sent {formatDate(invite.created_at)} • Expires {formatDate(invite.expires_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    {getStatusIcon(invite.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

