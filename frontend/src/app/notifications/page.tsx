'use client'

import { useState, useEffect } from 'react'
import { notificationService } from '@/services/api'
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await notificationService.list()
      setNotifications(response.data)
    } catch (error) {
      toast.error('Erro ao carregar notificações')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id)
      toast.success('Marcada como lida')
      loadNotifications()
    } catch (error) {
      toast.error('Erro ao marcar como lida')
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      toast.success('Todas marcadas como lidas')
      loadNotifications()
    } catch (error) {
      toast.error('Erro ao marcar todas')
    }
  }

  const getNotificationIcon = (type: string) => {
    return <Bell className="w-5 h-5" />
  }

  const filteredNotifications = notifications.filter((notif: any) => {
    if (filter === 'unread') return notif.status === 'unread'
    return true
  })

  const unreadCount = notifications.filter((n: any) => n.status === 'unread').length

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Notificações</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCheck className="w-5 h-5" />
            Marcar todas como lidas
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' ? 'bg-primary text-white' : 'bg-white text-gray-700'
            }`}
          >
            Todas ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'unread' ? 'bg-primary text-white' : 'bg-white text-gray-700'
            }`}
          >
            Não lidas ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma notificação encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif: any) => (
              <div
                key={notif.id}
                className={`bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow ${
                  notif.status === 'unread' ? 'border-l-4 border-primary' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    notif.status === 'unread' ? 'bg-primary/10' : 'bg-gray-100'
                  }`}>
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                      </div>
                      <div className="flex gap-2">
                        {notif.status === 'unread' && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="text-primary hover:bg-primary/10 p-2 rounded-lg"
                            title="Marcar como lida"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{new Date(notif.created_at).toLocaleString('pt-BR')}</span>
                      <span className="capitalize">{notif.type}</span>
                      {notif.status === 'read' && (
                        <span className="text-green-600 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Lida
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
