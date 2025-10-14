'use client'

import { useState } from 'react'
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
  Calendar, 
  Library, 
  Users, 
  Mountain,
  Settings,
  Menu,
  X,
  LogOut,
  UserCog,
  MoreVertical
} from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import { toast } from 'sonner'
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
}

const participantNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/modules', label: 'Modules', icon: BookOpen },
  { href: '/discussions', label: 'Discussions', icon: MessageSquare },
  { href: '/calendar', label: 'Events', icon: Calendar },
  { href: '/members', label: 'Members', icon: Users },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/partner', label: 'My Partner', icon: Users },
  { href: '/capstone', label: 'Capstone', icon: Mountain },
]

const adminNavItems = [
  ...participantNavItems,
  { href: '/admin', label: 'Admin', icon: UserCog },
]

export function Sidebar({ userRole, userProfile }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  
  const navItems = userRole === 'admin' || userRole === 'facilitator' 
    ? adminNavItems 
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
          'fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-rogue-forest to-rogue-pine border-r border-rogue-gold/20 z-40 transition-transform duration-200 flex flex-col shadow-2xl',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-8 border-b border-white/10">
          <Link href="/dashboard" className="flex justify-center group">
            <div className="relative">
              <div className="absolute inset-0 bg-rogue-gold/30 blur-2xl rounded-full"></div>
              <img 
                src="/RLTE-logo.png" 
                alt="Rogue Leadership Training Experience" 
                className="h-40 w-auto relative z-10 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-rogue-gold text-white shadow-lg shadow-rogue-gold/20'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Area Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm">
            <Avatar className="h-10 w-10 border-2 border-rogue-gold/30">
              <AvatarImage src={userProfile.avatar_url} alt={userProfile.full_name} />
              <AvatarFallback className="bg-rogue-gold text-white font-semibold">
                {getInitials(userProfile.full_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {userProfile.full_name}
              </p>
              <p className="text-xs text-white/60 truncate">
                {userProfile.email}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
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

