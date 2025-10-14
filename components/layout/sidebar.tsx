'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
  UserCog
} from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import { toast } from 'sonner'
import type { UserRole } from '@/types/index.types'

interface SidebarProps {
  userRole: UserRole
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

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  
  const navItems = userRole === 'admin' || userRole === 'facilitator' 
    ? adminNavItems 
    : participantNavItems

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

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-1">
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
              pathname === '/profile'
                ? 'bg-rogue-gold text-white shadow-lg shadow-rogue-gold/20'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            )}
          >
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-300 hover:text-red-200 hover:bg-red-500/10"
            onClick={handleSignOut}
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  )
}

