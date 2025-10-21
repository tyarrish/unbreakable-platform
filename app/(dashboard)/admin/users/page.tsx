'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Users,
  Search,
  UserPlus,
  MoreVertical,
  Edit,
  Ban,
  CheckCircle,
  Trash2,
  Mail,
} from 'lucide-react'
import { getUsers, deactivateUser, reactivateUser, bulkDeactivateUsers } from '@/lib/supabase/queries/users'
import { deleteUserCompletely } from '@/app/actions/users'
import { InviteUserModal } from '@/components/admin/invite-user-modal'
import { EditRoleModal } from '@/components/admin/edit-role-modal'
import { formatDate } from '@/lib/utils/format-date'
import { toast } from 'sonner'
import type { UserRole } from '@/types/index.types'
import type { UserProfile } from '@/lib/supabase/queries/users'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [editRoleUser, setEditRoleUser] = useState<UserProfile | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<UserProfile | null>(null)
  const [bulkActionConfirm, setBulkActionConfirm] = useState<'deactivate' | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdminAccess()
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, roleFilter, statusFilter])

  async function checkAdminAccess() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .single<{ roles: string[] }>()

    // Only admins can access user management
    const hasAdminRole = profile?.roles?.includes('admin')
    if (!hasAdminRole) {
      router.push('/admin')
    }
  }

  async function loadUsers() {
    try {
      const data = await getUsers()
      setUsers(data)
      setFilteredUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  function filterUsers() {
    let filtered = [...users]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        u => u.full_name?.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => {
        // Check if user has this role in their roles array
        return u.roles?.includes(roleFilter as UserRole)
      })
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(u => u.is_active)
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(u => !u.is_active)
    }

    setFilteredUsers(filtered)
  }

  function toggleUserSelection(userId: string) {
    const newSelection = new Set(selectedUsers)
    if (newSelection.has(userId)) {
      newSelection.delete(userId)
    } else {
      newSelection.add(userId)
    }
    setSelectedUsers(newSelection)
  }

  function toggleSelectAll() {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)))
    }
  }

  async function handleDeactivate(userId: string) {
    try {
      await deactivateUser(userId)
      toast.success('User deactivated successfully')
      loadUsers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to deactivate user')
    }
  }

  async function handleReactivate(userId: string) {
    try {
      await reactivateUser(userId)
      toast.success('User reactivated successfully')
      loadUsers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reactivate user')
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return

    try {
      const result = await deleteUserCompletely(deleteConfirm.id, deleteConfirm.email)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('User deleted successfully from both auth and database')
      setDeleteConfirm(null)
      loadUsers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user')
    }
  }

  async function handleBulkDeactivate() {
    if (selectedUsers.size === 0) return

    try {
      await bulkDeactivateUsers(Array.from(selectedUsers))
      toast.success(`${selectedUsers.size} users deactivated successfully`)
      setSelectedUsers(new Set())
      setBulkActionConfirm(null)
      loadUsers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to deactivate users')
    }
  }

  function getRoleBadgeColor(role: UserRole) {
    switch (role) {
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

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          heading="User Management"
          description="Manage users, send invites, and control access"
        />

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rogue-slate" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="facilitator">Facilitator</SelectItem>
                  <SelectItem value="participant">Participant</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Invite Button */}
              <Button onClick={() => setInviteModalOpen(true)} className="w-full lg:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                Send Invite
              </Button>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.size > 0 && (
              <div className="mt-4 flex items-center gap-3 p-3 bg-rogue-sage/10 rounded-lg">
                <span className="text-sm font-medium text-rogue-forest">
                  {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkActionConfirm('deactivate')}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Deactivate Selected
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUsers(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={<Users size={64} />}
            title="No users found"
            description={searchQuery || roleFilter !== 'all' || statusFilter !== 'all' 
              ? "Try adjusting your filters" 
              : "Start by inviting users to your cohort"}
            action={
              <Button onClick={() => setInviteModalOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Send First Invite
              </Button>
            }
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-rogue-sage/5 border-b border-rogue-sage/20">
                    <tr>
                      <th className="text-left p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-rogue-sage/30 text-rogue-forest focus:ring-rogue-gold"
                        />
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-rogue-forest">User</th>
                      <th className="text-left p-4 text-sm font-semibold text-rogue-forest">Role</th>
                      <th className="text-left p-4 text-sm font-semibold text-rogue-forest">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-rogue-forest">Joined</th>
                      <th className="text-right p-4 text-sm font-semibold text-rogue-forest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rogue-sage/10">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-rogue-sage/5 transition-colors">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="rounded border-rogue-sage/30 text-rogue-forest focus:ring-rogue-gold"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar_url} alt={user.full_name} />
                              <AvatarFallback className="bg-rogue-sage text-white">
                                {getInitials(user.full_name || user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-rogue-forest">{user.full_name || 'No name'}</div>
                              <div className="text-sm text-rogue-slate">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <Badge key={role} className={`${getRoleBadgeColor(role)} border-0`}>
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </Badge>
                              ))
                            ) : (
                              <Badge className="bg-gray-200 text-gray-600 border-0">
                                No Role
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {user.is_active ? (
                            <Badge className="bg-green-100 text-green-700 border-0">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-gray-300 text-gray-600">
                              <Ban className="mr-1 h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 text-sm text-rogue-slate">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditRoleUser(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.is_active ? (
                                <DropdownMenuItem onClick={() => handleDeactivate(user.id)}>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Deactivate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleReactivate(user.id)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Reactivate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => setDeleteConfirm(user)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Invite Modal */}
      <InviteUserModal 
        open={inviteModalOpen} 
        onClose={() => setInviteModalOpen(false)}
        onSuccess={() => {
          setInviteModalOpen(false)
          loadUsers()
        }}
      />

      {/* Edit Role Modal */}
      {editRoleUser && (
        <EditRoleModal
          user={editRoleUser}
          open={!!editRoleUser}
          onClose={() => setEditRoleUser(null)}
          onSuccess={() => {
            setEditRoleUser(null)
            loadUsers()
          }}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteConfirm?.full_name || deleteConfirm?.email}? 
              This action cannot be undone and will permanently remove all their data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Confirmation */}
      <Dialog open={!!bulkActionConfirm} onOpenChange={() => setBulkActionConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Users</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''}? 
              They will lose access to the platform until reactivated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionConfirm(null)}>
              Cancel
            </Button>
            <Button onClick={handleBulkDeactivate}>
              Deactivate Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

