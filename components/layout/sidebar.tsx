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
          'fixed left-0 top-0 h-full w-64 bg-white border-r border-rogue-sage/20 z-40 transition-transform duration-200 flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-rogue-sage/20">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rogue-forest rounded-lg flex items-center justify-center">
              <TreePine className="h-6 w-6 text-rogue-gold" />
            </div>
            <div>
              <h1 className="font-semibold text-rogue-forest">RLTE</h1>
              <p className="text-xs text-rogue-slate">Leadership Journey</p>
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
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-rogue-forest text-white'
                    : 'text-rogue-slate hover:bg-rogue-sage/10'
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-rogue-sage/20 space-y-1">
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              pathname === '/profile'
                ? 'bg-rogue-forest text-white'
                : 'text-rogue-slate hover:bg-rogue-sage/10'
            )}
          >
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-rogue-terracotta hover:text-rogue-copper hover:bg-rogue-terracotta/10"
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

