'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Bell, Calendar, X, Star, MessageSquare, UserCheck, Target, Clock, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import companySettingsService, { NotificationSettings } from '@/services/companySettingsService'

interface Props {
  data?: NotificationSettings
  onUpdate: () => void
}

export default function NotificationsTab({ data, onUpdate }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<NotificationSettings>>({
    notify_new_appointment: true,
    notify_appointment_cancellation: true,
    notify_appointment_deletion: true,
    notify_new_review: true,
    notify_sms_response: false,
    notify_client_return: true,
    notify_goal_achievement: true,
    notify_client_waiting: true,
    notification_sound_enabled: true,
    notification_duration_seconds: 5
  })

  useEffect(() => {
    if (data) {
      setFormData(data)
    }
  }, [data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      await companySettingsService.updateNotificationSettings(formData)
      toast.success('Configurações de notificações atualizadas!')
      onUpdate()
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error(error.response?.data?.detail || 'Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }

  const toggleSetting = (field: keyof NotificationSettings) => {
    setFormData({ ...formData, [field]: !formData[field] })
  }

  const notificationEvents = [
    {
      key: 'notify_new_appointment' as keyof NotificationSettings,
      icon: Calendar,
      title: 'Novo agendamento',
      description: 'Notificar quando um novo agendamento for criado',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      key: 'notify_appointment_cancellation' as keyof NotificationSettings,
      icon: X,
      title: 'Cancelamento de agendamento',
      description: 'Notificar quando um agendamento for cancelado',
      color: 'bg-red-100 text-red-600'
    },
    {
      key: 'notify_appointment_deletion' as keyof NotificationSettings,
      icon: X,
      title: 'Exclusão de agendamento',
      description: 'Notificar quando um agendamento for excluído',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      key: 'notify_new_review' as keyof NotificationSettings,
      icon: Star,
      title: 'Novas avaliações',
      description: 'Notificar quando receber uma nova avaliação',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      key: 'notify_sms_response' as keyof NotificationSettings,
      icon: MessageSquare,
      title: 'Respostas de SMS',
      description: 'Notificar quando receber resposta de SMS',
      color: 'bg-green-100 text-green-600'
    },
    {
      key: 'notify_client_return' as keyof NotificationSettings,
      icon: UserCheck,
      title: 'Retorno de cliente',
      description: 'Notificar quando um cliente retornar',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      key: 'notify_goal_achievement' as keyof NotificationSettings,
      icon: Target,
      title: 'Metas atingidas',
      description: 'Notificar quando uma meta for atingida',
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      key: 'notify_client_waiting' as keyof NotificationSettings,
      icon: Clock,
      title: 'Cliente aguardando',
      description: 'Notificar quando um cliente estiver aguardando',
      color: 'bg-pink-100 text-pink-600'
    }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Notificações Web</h2>
        <p className="text-gray-600">
          Defina quais eventos geram notificações no sistema (desktop/web)
        </p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">
              Notificações Web
            </p>
            <p className="text-sm text-blue-800">
              As notificações aparecem no navegador enquanto você está usando o sistema. 
              Não há suporte para notificações mobile nesta versão.
            </p>
          </div>
        </div>
      </div>

      {/* Eventos Configuráveis */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Eventos Configuráveis
        </h3>

        <div className="space-y-3">
          {notificationEvents.map((event) => (
            <div
              key={event.key}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-lg ${event.color}`}>
                  <event.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={formData[event.key] as boolean}
                  onChange={() => toggleSetting(event.key)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Configurações Adicionais */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configurações Adicionais
        </h3>

        <div className="space-y-4">
          {/* Som */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Volume2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Som de notificação</p>
                <p className="text-sm text-gray-600">Reproduzir som ao receber notificações</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notification_sound_enabled}
                onChange={() => toggleSetting('notification_sound_enabled')}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Duração */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3 mb-3">
              <Clock className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Duração da notificação</p>
                <p className="text-sm text-gray-600">Tempo que a notificação fica visível (segundos)</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="30"
                value={formData.notification_duration_seconds}
                onChange={(e) => setFormData({ ...formData, notification_duration_seconds: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex items-center gap-2 min-w-[80px]">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.notification_duration_seconds}
                  onChange={(e) => setFormData({ ...formData, notification_duration_seconds: parseInt(e.target.value) || 5 })}
                  className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <span className="text-sm text-gray-600">seg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end pt-6 border-t">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Salvar Configurações
            </>
          )}
        </button>
      </div>
    </form>
  )
}
