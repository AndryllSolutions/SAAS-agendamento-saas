'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Eye, Zap, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import api from '@/services/api'

interface NotificationTemplate {
  id: number
  name: string
  description: string | null
  event_type: string
  channel: string
  title_template: string
  body_template: string
  is_active: boolean
  is_default: boolean
  created_at: string
}

interface NotificationTrigger {
  id: number
  name: string
  event_type: string
  trigger_condition: string
  trigger_offset_minutes: number | null
  is_active: boolean
  send_to_client: boolean
  send_to_professional: boolean
  send_to_manager: boolean
  trigger_count: number
  template_id: number
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  appointment_created: '📅 Agendamento Criado',
  appointment_updated: '✏️ Agendamento Atualizado',
  appointment_cancelled: '❌ Agendamento Cancelado',
  appointment_reminder: '⏰ Lembrete de Agendamento',
  appointment_confirmed: '✅ Agendamento Confirmado',
  payment_received: '💰 Pagamento Recebido',
  payment_failed: '❌ Pagamento Falhou',
  command_created: '📋 Comanda Criada',
  command_closed: '✅ Comanda Fechada',
  package_expiring: '⚠️ Pacote Expirando',
  package_expired: '❌ Pacote Expirado',
  welcome_message: '👋 Mensagem de Boas-vindas',
  birthday: '🎂 Aniversário',
  review_request: '⭐ Solicitação de Avaliação',
  custom: '🔧 Personalizado',
}

const TRIGGER_CONDITION_LABELS: Record<string, string> = {
  immediate: 'Imediato',
  before_event: 'Antes do Evento',
  after_event: 'Após o Evento',
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
}

export default function NotificationTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [triggers, setTriggers] = useState<NotificationTrigger[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'templates' | 'triggers'>('templates')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_type: 'appointment_created',
    channel: 'push',
    title_template: '',
    body_template: '',
    is_active: true,
    is_default: false,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [templatesRes, triggersRes] = await Promise.all([
        api.get('/notification-system/templates'),
        api.get('/notification-system/triggers'),
      ])
      setTemplates(templatesRes.data)
      setTriggers(triggersRes.data)
    } catch (error) {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    try {
      await api.post('/notification-system/templates', formData)
      toast.success('Template criado com sucesso!')
      setShowCreateModal(false)
      resetForm()
      loadData()
    } catch (error) {
      toast.error('Erro ao criar template')
    }
  }

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return
    try {
      await api.put(`/notification-system/templates/${editingTemplate.id}`, formData)
      toast.success('Template atualizado!')
      setEditingTemplate(null)
      resetForm()
      loadData()
    } catch (error) {
      toast.error('Erro ao atualizar template')
    }
  }

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return
    try {
      await api.delete(`/notification-system/templates/${id}`)
      toast.success('Template excluído!')
      loadData()
    } catch (error) {
      toast.error('Erro ao excluir template')
    }
  }

  const handleToggleTrigger = async (triggerId: number) => {
    try {
      await api.post(`/notification-system/triggers/${triggerId}/toggle`)
      toast.success('Status alterado!')
      loadData()
    } catch (error) {
      toast.error('Erro ao alterar status')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      event_type: 'appointment_created',
      channel: 'push',
      title_template: '',
      body_template: '',
      is_active: true,
      is_default: false,
    })
  }

  const openEditModal = (template: NotificationTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description || '',
      event_type: template.event_type,
      channel: template.channel,
      title_template: template.title_template,
      body_template: template.body_template,
      is_active: template.is_active,
      is_default: template.is_default,
    })
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/notifications')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Bell className="w-8 h-8 text-primary" />
                Gerenciar Notificações
              </h1>
              <p className="text-gray-600 mt-1">Configure templates e triggers automáticos</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" />
            Novo Template
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'templates' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            📝 Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('triggers')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'triggers' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Zap className="w-4 h-4 inline mr-1" />
            Triggers ({triggers.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : activeTab === 'templates' ? (
          <div className="grid gap-4">
            {templates.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">Nenhum template criado</h3>
                <p className="text-gray-500 mt-2">Crie seu primeiro template de notificação</p>
              </div>
            ) : (
              templates.map((template) => (
                <div key={template.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs ${template.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {template.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                        {template.is_default && (
                          <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">Padrão</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{EVENT_TYPE_LABELS[template.event_type] || template.event_type}</span>
                        <span className="capitalize">📱 {template.channel}</span>
                      </div>
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-sm">{template.title_template}</p>
                        <p className="text-sm text-gray-600 mt-1">{template.body_template}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => openEditModal(template)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {triggers.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">Nenhum trigger configurado</h3>
                <p className="text-gray-500 mt-2">Crie um template primeiro, depois configure triggers</p>
              </div>
            ) : (
              triggers.map((trigger) => (
                <div key={trigger.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{trigger.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                        <span>{EVENT_TYPE_LABELS[trigger.event_type] || trigger.event_type}</span>
                        <span>{TRIGGER_CONDITION_LABELS[trigger.trigger_condition]}</span>
                        {trigger.trigger_offset_minutes && (
                          <span>({trigger.trigger_offset_minutes} min)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        {trigger.send_to_client && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Cliente</span>}
                        {trigger.send_to_professional && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">Profissional</span>}
                        {trigger.send_to_manager && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded">Gerente</span>}
                        <span className="text-gray-500">• {trigger.trigger_count} disparos</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleTrigger(trigger.id)}
                      className={`p-2 rounded-lg ${trigger.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                      {trigger.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || editingTemplate) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">
                  {editingTemplate ? 'Editar Template' : 'Novo Template'}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Ex: Confirmação de Agendamento"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Descrição opcional"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Evento</label>
                    <select
                      value={formData.event_type}
                      onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Canal</label>
                    <select
                      value={formData.channel}
                      onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="push">📱 Push Notification</option>
                      <option value="email">📧 Email</option>
                      <option value="sms">💬 SMS</option>
                      <option value="whatsapp">📲 WhatsApp</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <input
                    type="text"
                    value={formData.title_template}
                    onChange={(e) => setFormData({ ...formData, title_template: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Ex: Olá {client_name}!"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Placeholders: {'{client_name}'}, {'{professional_name}'}, {'{service_name}'}, {'{appointment_date}'}, {'{appointment_time}'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mensagem</label>
                  <textarea
                    value={formData.body_template}
                    onChange={(e) => setFormData({ ...formData, body_template: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Ex: Seu agendamento para {service_name} foi confirmado para {appointment_date} às {appointment_time}."
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Ativo</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_default}
                      onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Template Padrão</span>
                  </label>
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingTemplate(null)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  {editingTemplate ? 'Salvar' : 'Criar Template'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}