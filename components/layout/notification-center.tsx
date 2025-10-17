'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications,
  type Notification
} from '@/lib/supabase/queries/notifications'
import { formatRelativeTime } from '@/lib/utils/format-date'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface NotificationCenterProps {
  userId: string
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadNotifications()
    loadUnreadCount()

    // Subscribe to new notifications
    const channel = subscribeToNotifications(userId, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev])
      setUnreadCount(prev => prev + 1)
      
      // Show toast for new notification
      toast.info(newNotification.title, {
        description: newNotification.message,
        action: newNotification.link ? {
          label: 'View',
          onClick: () => router.push(newNotification.link!)
        } : undefined
      })
    })

    return () => {
      channel.unsubscribe()
    }
  }, [userId])

  async function loadNotifications() {
    try {
      const data = await getNotifications(userId, 10)
      setNotifications(data)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  async function loadUnreadCount() {
    try {
      const count = await getUnreadCount(userId)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  async function handleNotificationClick(notification: Notification) {
    if (!notification.is_read) {
      await markAsRead(notification.id)
      setUnreadCount(prev => Math.max(0, prev - 1))
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      )
    }

    if (notification.link) {
      router.push(notification.link)
    }
    
    setIsOpen(false)
  }

  async function handleMarkAllRead() {
    try {
      await markAllAsRead(userId)
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'mention':
        return '💬'
      case 'reply':
        return '↩️'
      case 'follow':
        return '👥'
      case 'achievement':
        return '🏆'
      case 'event_reminder':
        return '📅'
      case 'partner_message':
        return '✉️'
      default:
        return '🔔'
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-rogue-forest">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-rogue-slate">
              <Bell size={32} className="mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`px-4 py-3 cursor-pointer flex items-start gap-3 ${
                  !notification.is_read ? 'bg-rogue-sage/5' : ''
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-sm">
                      {getNotificationIcon(notification.type)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.is_read ? 'font-semibold' : 'font-medium'} text-rogue-forest`}>
                    {notification.title}
                  </p>
                  {notification.message && (
                    <p className="text-xs text-rogue-slate mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                  )}
                  <p className="text-xs text-rogue-slate/70 mt-1">
                    {formatRelativeTime(notification.created_at)}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-rogue-gold rounded-full flex-shrink-0 mt-2" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}






