'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck } from 'lucide-react'
import { notificationService } from '@/services/api'
import { toast } from 'sonner'

interface NotificationItem {
  id: number
  title: string
  message: string
  status: 'read' | 'unread' | 'pending' | 'sent' | 'failed'
  type?: string
  created_at: string
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadNotifications()

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const [listRes, unreadRes] = await Promise.all([
        notificationService.list({ limit: 10 }),
        notificationService.getUnreadCount(),
      ])

      setNotifications(listRes.data || [])
      setUnreadCount(unreadRes.data?.count ?? 0)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleOpen = () => {
    setOpen((prev) => !prev)
    if (!open) {
      loadNotifications()
    }
  }

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return
    try {
      await notificationService.markAllAsRead()
      toast.success('Todas as notificações foram marcadas como lidas')
      await loadNotifications()
    } catch (error) {
      toast.error('Não foi possível marcar todas como lidas')
    }
  }

  const isToday = (dateString: string) => {
    try {
      const d = new Date(dateString)
      const now = new Date()
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      )
    } catch {
      return false
    }
  }

  const relativeTime = (dateString: string) => {
    try {
      const now = new Date()
      const date = new Date(dateString)
      const diffMs = now.getTime() - date.getTime()
      const diffMinutes = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMinutes / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMinutes < 1) return 'agora'
      if (diffMinutes < 60) return `há ${diffMinutes} min`
      if (diffHours < 24) return `há ${diffHours} horas`
      return `há ${diffDays} dias`
    } catch {
      return ''
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggleOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow hover:bg-gray-50 transition-colors"
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[380px] max-h-[70vh] overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 z-50">
          <div className="border-b px-5 py-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">
              Notificações
            </p>
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || loading}
              className="text-[11px] font-semibold uppercase tracking-wide text-primary hover:text-primary/80 disabled:opacity-50"
            >
              Marcar todas como lidas
            </button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                Carregando...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-sm text-gray-500">
                <Bell className="h-6 w-6 mb-2 text-gray-300" />
                Nenhuma notificação encontrada
              </div>
            ) : (
              <>
                {notifications.some((n) => isToday(n.created_at)) && (
                  <div className="px-5 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Hoje
                  </div>
                )}
                <ul className="divide-y divide-gray-100">
                  {notifications.map((notif) => (
                    <li
                      key={notif.id}
                      className={`px-5 py-3 hover:bg-gray-50 cursor-pointer ${
                        notif.status === 'unread' || notif.status === 'pending' ? 'bg-primary/5' : 'bg-white'
                      }`}
                      onClick={() => router.push('/notifications')}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {notif.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                        <span className="ml-2 whitespace-nowrap text-[11px] text-gray-500">
                          {relativeTime(notif.created_at)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false)
              router.push('/notifications')
            }}
            className="w-full border-t px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-primary hover:bg-gray-50"
          >
            Ver todas
          </button>
        </div>
      )}
    </div>
  )
}


