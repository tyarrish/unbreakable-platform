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
import { Mail, CheckCircle, Clock, XCircle, Trash2, Copy, CheckCheck } from 'lucide-react'
import { getInvites } from '@/lib/supabase/queries/users'
import { sendUserInvite, deletePendingInvite } from '@/app/actions/users'
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
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

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

      // Store the invite URL and email status to display
      if (result.inviteUrl) {
        setInviteUrl(result.inviteUrl)
        setEmailSent(result.emailSent || false)
        
        if (result.emailSent) {
          toast.success(`Invite email sent to ${email}! Link also available below.`)
        } else {
          toast.success(`Invite created! Copy the link below and send it to ${email}`)
        }
      } else {
        toast.success(`Invite created for ${email}`)
      }
      
      // Don't reset form yet - let them see the invite link
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
  
  function handleCreateAnother() {
    // Reset form for next invite
    setFullName('')
    setEmail('')
    setRole('participant')
    setInviteUrl(null)
    setCopied(false)
    setEmailSent(false)
  }
  
  async function copyInviteLink() {
    if (!inviteUrl) return
    
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      toast.success('Invite link copied to clipboard!')
      
      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      toast.error('Failed to copy link')
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

  async function handleDeleteInvite(inviteId: string, email: string) {
    try {
      const result = await deletePendingInvite(inviteId, email)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Invite deleted successfully')
      await loadPendingInvites()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete invite')
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
            <Button type="submit" disabled={isLoading || !!inviteUrl}>
              <Mail className="mr-2 h-4 w-4" />
              {isLoading ? 'Creating...' : 'Create Invite'}
            </Button>
          </DialogFooter>
        </form>

        {/* Invite Link Display */}
        {inviteUrl && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-800 mb-1">Invite Created Successfully!</h4>
                {emailSent ? (
                  <p className="text-sm text-green-700 mb-3">
                    ✅ Invite email sent to <strong>{email}</strong>! You can also copy the link below as a backup.
                  </p>
                ) : (
                  <p className="text-sm text-green-700 mb-3">
                    Copy the link below and send it to <strong>{email}</strong> via email, Slack, or any messaging platform.
                  </p>
                )}
                
                <div className="flex gap-2">
                  <Input
                    value={inviteUrl}
                    readOnly
                    className="font-mono text-xs bg-white"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyInviteLink}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <>
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
                
                <p className="text-xs text-green-600 mt-2">
                  This link expires in 7 days
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2 border-t border-green-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCreateAnother}
                className="flex-1"
              >
                Create Another Invite
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onClose()
                  handleCreateAnother()
                }}
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </div>
        )}

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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteInvite(invite.id, invite.email)}
                      title="Delete invite"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
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

