'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  TreePine, 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  MessageCircle,
  Calendar, 
  Library, 
  Users, 
  Mountain,
  Settings,
  Menu,
  X,
  LogOut,
  UserCog,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { signOut } from '@/app/actions/auth'
import { toast } from 'sonner'
import { getUnreadCount, subscribeToUserConversations } from '@/lib/supabase/queries/conversations'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/index.types'

interface UserProfile {
  full_name: string
  email: string
  avatar_url?: string
  role: UserRole
}

interface SidebarProps {
  userRole: UserRole
  userProfile: UserProfile
  userId: string
}

const participantNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/modules', label: 'Modules', icon: BookOpen },
  { href: '/discussions', label: 'Discussions', icon: MessageSquare },
  { href: '/messages', label: 'Messages', icon: MessageCircle, hasUnreadBadge: true },
  { href: '/calendar', label: 'Events', icon: Calendar },
  { href: '/members', label: 'Members', icon: Users },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/partner', label: 'My Partner', icon: Users },
]

const facilitatorNavItems = [
  ...participantNavItems,
  { href: '/capstone', label: 'Capstone', icon: Mountain },
  { href: '/admin', label: 'Manage', icon: UserCog },
]

const adminNavItems = [
  ...participantNavItems,
  { href: '/capstone', label: 'Capstone', icon: Mountain },
  { href: '/admin', label: 'Admin', icon: UserCog },
]

export function Sidebar({ userRole, userProfile, userId }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false) // Mobile menu
  const [isCollapsed, setIsCollapsed] = useState(false) // Desktop collapse
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()
  
  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved === 'true') {
      setIsCollapsed(true)
    }
  }, [])

  // Load unread message count
  useEffect(() => {
    if (userId) {
      loadUnreadCount()
      
      // Subscribe to conversation updates
      const channel = subscribeToUserConversations(userId, loadUnreadCount)
      
      // Also listen for manual read events
      const handleConversationRead = () => {
        console.log('🔔 Conversation marked as read, updating badge')
        loadUnreadCount()
      }
      window.addEventListener('conversation-read', handleConversationRead)
      
      return () => {
        supabase.removeChannel(channel)
        window.removeEventListener('conversation-read', handleConversationRead)
      }
    }
  }, [userId])

  async function loadUnreadCount() {
    try {
      const count = await getUnreadCount(userId)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  // Save collapsed state to localStorage and dispatch event
  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
    // Dispatch custom event so other components can react
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { isCollapsed: newState } }))
  }
  
  const navItems = userRole === 'admin'
    ? adminNavItems
    : userRole === 'facilitator'
    ? facilitatorNavItems
    : participantNavItems

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  async function handleSignOut() {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
      console.error(error)
    }
  }

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-gradient-to-b from-rogue-forest to-rogue-pine border-r border-rogue-gold/20 z-40 flex flex-col shadow-2xl transition-all duration-300',
          // Mobile behavior
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64',
          // Desktop behavior
          'md:translate-x-0',
          isCollapsed ? 'md:w-20' : 'md:w-64'
        )}
      >
        {/* Toggle Button (Desktop only) */}
        <button
          onClick={toggleCollapse}
          className="hidden md:block absolute -right-3 top-8 z-50 bg-white border border-rogue-sage/20 rounded-full p-1.5 shadow-lg hover:bg-rogue-cream transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-rogue-forest" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-rogue-forest" />
          )}
        </button>

        {/* Logo */}
        <div className={cn(
          'border-b border-white/10 transition-all duration-300',
          isCollapsed ? 'p-4' : 'p-8'
        )}>
          <Link href="/dashboard" className="flex justify-center group">
            <div className="relative">
              <div className="absolute inset-0 bg-rogue-gold/30 blur-2xl rounded-full"></div>
              <img 
                src="/RLTE-logo.png" 
                alt="Rogue Leadership Training Experience" 
                className={cn(
                  'w-auto relative z-10 group-hover:scale-105 transition-all duration-300',
                  isCollapsed ? 'h-12' : 'h-40'
                )}
              />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const showUnreadBadge = (item as any).hasUnreadBadge && unreadCount > 0
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center rounded-lg transition-all duration-200 group relative',
                  isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3',
                  isActive
                    ? 'bg-rogue-gold text-white shadow-lg shadow-rogue-gold/20'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="relative flex-shrink-0">
                  <Icon size={20} />
                  {showUnreadBadge && isCollapsed && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-white text-[10px] border-2 border-rogue-forest">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </div>
                <span className={cn(
                  'font-medium transition-all duration-200 flex-1',
                  isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                )}>
                  {item.label}
                </span>
                {showUnreadBadge && !isCollapsed && (
                  <Badge className="bg-red-500 text-white text-xs h-5 min-w-[20px] flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
                
                {/* Tooltip on hover when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-rogue-forest border border-rogue-gold/30 rounded-lg text-sm text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                    {item.label}
                    {showUnreadBadge && ` (${unreadCount})`}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Area Footer */}
        <div className="p-4 border-t border-white/10">
          <div className={cn(
            'flex items-center rounded-lg bg-white/5 backdrop-blur-sm transition-all duration-300',
            isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2'
          )}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full text-left focus:outline-none group">
                  <Avatar className={cn(
                    'border-2 border-rogue-gold/30 flex-shrink-0 transition-all',
                    isCollapsed ? 'h-9 w-9' : 'h-10 w-10'
                  )}>
                    <AvatarImage src={userProfile.avatar_url} alt={userProfile.full_name} />
                    <AvatarFallback className="bg-rogue-gold text-white font-semibold">
                      {getInitials(userProfile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={cn(
                    'flex-1 min-w-0 transition-all duration-200',
                    isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                  )}>
                    <p className="text-sm font-semibold text-white truncate">
                      {userProfile.full_name}
                    </p>
                    <p className="text-xs text-white/60 truncate">
                      {userProfile.email}
                    </p>
                  </div>

                  <MoreVertical className={cn(
                    'h-4 w-4 text-white/80 group-hover:text-white flex-shrink-0 transition-all duration-200',
                    isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                  )} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                side="top"
                className="w-56 bg-white border-rogue-sage/20"
              >
                <DropdownMenuItem asChild>
                  <Link 
                    href="/profile" 
                    className="flex items-center cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </>
  )
}

