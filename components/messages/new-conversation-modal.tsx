'use client'

import { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Users, MessageCircle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createDirectMessage, createGroupChat } from '@/lib/supabase/queries/conversations'
import { toast } from 'sonner'
import type { User } from '@/types/index.types'

interface NewConversationModalProps {
  isOpen: boolean
  onClose: () => void
  currentUserId: string
  onConversationCreated: (conversationId: string) => void
}

export function NewConversationModal({
  isOpen,
  onClose,
  currentUserId,
  onConversationCreated
}: NewConversationModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [groupName, setGroupName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'direct' | 'group'>('direct')

  useEffect(() => {
    if (isOpen) {
      loadUsers()
      setSelectedUsers([])
      setGroupName('')
      setSearchQuery('')
    }
  }, [isOpen])

  async function loadUsers() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email, roles')
        .neq('id', currentUserId)
        .order('full_name')
      
      if (error) throw error
      setUsers(data as any as User[])
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    }
  }

  function getInitials(name: string) {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  }

  function handleSelectUser(user: User) {
    if (activeTab === 'direct') {
      setSelectedUsers([user])
    } else {
      if (selectedUsers.find(u => u.id === user.id)) {
        setSelectedUsers(selectedUsers.filter(u => u.id !== user.id))
      } else {
        setSelectedUsers([...selectedUsers, user])
      }
    }
  }

  function handleRemoveUser(userId: string) {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId))
  }

  async function handleCreateDM() {
    if (selectedUsers.length === 0) return
    
    try {
      setIsLoading(true)
      console.log('Creating DM between:', currentUserId, 'and', selectedUsers[0].id)
      const conversation = await createDirectMessage(currentUserId, selectedUsers[0].id)
      console.log('DM created successfully:', conversation)
      toast.success('Conversation started')
      onConversationCreated(conversation.id)
      onClose()
    } catch (error: any) {
      console.error('Error creating DM:', error)
      console.error('Error details:', error.message, error.details, error.hint)
      toast.error(error.message || 'Failed to create conversation')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateGroup() {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one member')
      return
    }
    
    if (!groupName.trim()) {
      toast.error('Please enter a group name')
      return
    }
    
    try {
      setIsLoading(true)
      console.log('Creating group:', groupName, 'with members:', selectedUsers.map(u => u.id))
      const conversation = await createGroupChat(
        currentUserId,
        selectedUsers.map(u => u.id),
        groupName
      )
      console.log('Group created successfully:', conversation)
      toast.success('Group created')
      onConversationCreated(conversation.id)
      onClose()
    } catch (error: any) {
      console.error('Error creating group:', error)
      console.error('Error details:', error.message, error.details, error.hint)
      toast.error(error.message || 'Failed to create group')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      user.full_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    )
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Start a direct message or create a group chat
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'direct' | 'group')} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="direct">
              <MessageCircle className="h-4 w-4 mr-2" />
              Direct Message
            </TabsTrigger>
            <TabsTrigger value="group">
              <Users className="h-4 w-4 mr-2" />
              Group Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="flex-1 flex flex-col mt-0">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rogue-slate/50" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search people..."
                className="pl-9"
              />
            </div>

            {/* Selected User */}
            {selectedUsers.length > 0 && (
              <div className="mb-4 p-3 bg-rogue-cream/50 rounded-lg border border-rogue-sage/20">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    {selectedUsers[0].avatar_url ? (
                      <AvatarImage src={selectedUsers[0].avatar_url} />
                    ) : null}
                    <AvatarFallback className="bg-rogue-forest text-white text-xs">
                      {getInitials(selectedUsers[0].full_name || '')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-rogue-forest flex-1">
                    {selectedUsers[0].full_name}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedUsers([])}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* User List */}
            <div className="flex-1 overflow-y-auto border border-rogue-sage/20 rounded-lg">
              {filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full p-8 text-center">
                  <p className="text-sm text-rogue-slate/70">No users found</p>
                </div>
              ) : (
                <div className="divide-y divide-rogue-sage/10">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={`
                        p-3 cursor-pointer transition-colors hover:bg-rogue-cream/30
                        ${selectedUsers.find(u => u.id === user.id) ? 'bg-rogue-cream/50' : ''}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {user.avatar_url ? (
                            <AvatarImage src={user.avatar_url} />
                          ) : null}
                          <AvatarFallback className="bg-rogue-sage text-white">
                            {getInitials(user.full_name || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-rogue-forest truncate">
                            {user.full_name}
                          </p>
                          <p className="text-sm text-rogue-slate/70 truncate">
                            {user.email}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateDM}
                disabled={selectedUsers.length === 0 || isLoading}
                className="bg-rogue-forest hover:bg-rogue-pine"
              >
                {isLoading ? 'Creating...' : 'Start Conversation'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="group" className="flex-1 flex flex-col mt-0">
            {/* Group Name */}
            <div className="mb-4">
              <Label htmlFor="group-name" className="mb-2 block">
                Group Name
              </Label>
              <Input
                id="group-name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Leadership Team"
              />
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rogue-slate/50" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search people to add..."
                className="pl-9"
              />
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="mb-4 p-3 bg-rogue-cream/50 rounded-lg border border-rogue-sage/20">
                <p className="text-sm text-rogue-slate/70 mb-2">
                  {selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''} selected
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <Badge
                      key={user.id}
                      variant="secondary"
                      className="pl-2 pr-1 py-1 gap-2"
                    >
                      <span>{user.full_name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveUser(user.id)}
                        className="h-4 w-4 p-0 hover:bg-transparent"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* User List */}
            <div className="flex-1 overflow-y-auto border border-rogue-sage/20 rounded-lg">
              {filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full p-8 text-center">
                  <p className="text-sm text-rogue-slate/70">No users found</p>
                </div>
              ) : (
                <div className="divide-y divide-rogue-sage/10">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedUsers.find(u => u.id === user.id)
                    
                    return (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={`
                          p-3 cursor-pointer transition-colors hover:bg-rogue-cream/30
                          ${isSelected ? 'bg-rogue-cream/50' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              {user.avatar_url ? (
                                <AvatarImage src={user.avatar_url} />
                              ) : null}
                              <AvatarFallback className="bg-rogue-sage text-white">
                                {getInitials(user.full_name || '')}
                              </AvatarFallback>
                            </Avatar>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 h-5 w-5 bg-rogue-forest rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-rogue-forest truncate">
                              {user.full_name}
                            </p>
                            <p className="text-sm text-rogue-slate/70 truncate">
                              {user.email}
                            </p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateGroup}
                disabled={selectedUsers.length === 0 || !groupName.trim() || isLoading}
                className="bg-rogue-forest hover:bg-rogue-pine"
              >
                {isLoading ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

