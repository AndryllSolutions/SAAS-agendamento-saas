'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, Send, Users, Calendar, Edit, Trash2, Play, Pause, BarChart3, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { whatsappService, WhatsAppCampaign } from '@/services/whatsappService'

export default function WhatsAppCampaignsPage() {
  const [loading, setLoading] = useState(false)
  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<WhatsAppCampaign | null>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<WhatsAppCampaign | null>(null)
  const [showStatsModal, setShowStatsModal] = useState(false)

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const data = await whatsappService.listCampaigns()
      setCampaigns(data)
    } catch (error: any) {
      console.error('Erro ao carregar campanhas:', error)
      toast.error('Erro ao carregar campanhas')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCampaign(null)
    setShowCreateModal(true)
  }

  const handleEdit = (campaign: WhatsAppCampaign) => {
    setEditingCampaign(campaign)
    setShowCreateModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir esta campanha?')) return

    try {
      await whatsappService.deleteCampaign(id)
      toast.success('Campanha excluída com sucesso!')
      loadCampaigns()
    } catch (error: any) {
      console.error('Erro ao excluir campanha:', error)
      toast.error('Erro ao excluir campanha')
    }
  }

  const handleSend = async (id: number) => {
    if (!confirm('Deseja enviar esta campanha agora?')) return

    try {
      const result = await whatsappService.sendCampaign(id)
      toast.success(`Campanha enviada! ${result.sent} enviados, ${result.failed} falhas`)
      loadCampaigns()
    } catch (error: any) {
      console.error('Erro ao enviar campanha:', error)
      toast.error('Erro ao enviar campanha')
    }
  }

  const handleToggleAutoSend = async (id: number) => {
    try {
      const campaign = await whatsappService.toggleAutoSend(id)
      toast.success(`Envio automático ${campaign.auto_send_enabled ? 'ativado' : 'desativado'}!`)
      loadCampaigns()
    } catch (error: any) {
      console.error('Erro ao alterar envio automático:', error)
      toast.error('Erro ao alterar envio automático')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'paused': return 'bg-yellow-100 text-yellow-700'
      case 'finished': return 'bg-blue-100 text-blue-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa'
      case 'paused': return 'Pausada'
      case 'finished': return 'Finalizada'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
  }

  const getCampaignTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      birthday: '🎂',
      reconquer: '🔄',
      reminder: '⏰',
      care: '💅',
      return: '🔧',
      custom: '✏️'
    }
    return icons[type] || '📱'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Campanhas de WhatsApp
          </h1>
          <p className="text-gray-600">
            Gerencie campanhas manuais e programadas para seus clientes
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 shadow-md"
        >
          <Plus className="w-5 h-5" />
          Nova Campanha
        </button>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">{getCampaignTypeIcon(campaign.campaign_type)}</div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {campaign.name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {getStatusText(campaign.status)}
                  </span>
                </div>

                {campaign.description && (
                  <p className="text-gray-600 mb-4">
                    {campaign.description}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Enviados</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {campaign.total_sent}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Entregues</div>
                    <div className="text-lg font-semibold text-green-600">
                      {campaign.total_delivered}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Lidos</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {campaign.total_read}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Falhas</div>
                    <div className="text-lg font-semibold text-red-600">
                      {campaign.total_failed}
                    </div>
                  </div>
                </div>

                {/* Campaign Info */}
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Criado em {new Date(campaign.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {campaign.auto_send_enabled && (
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      <span>Envio automático ativo</span>
                    </div>
                  )}
                  {campaign.template_id && (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Usa template</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCampaign(campaign)}
                  className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                  title="Ver estatísticas"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleToggleAutoSend(campaign.id)}
                  className={`p-2 rounded-lg ${
                    campaign.auto_send_enabled
                      ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                      : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                  }`}
                  title={campaign.auto_send_enabled ? 'Pausar envio automático' : 'Ativar envio automático'}
                >
                  {campaign.auto_send_enabled ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => handleSend(campaign.id)}
                  disabled={campaign.status === 'finished' || campaign.status === 'cancelled'}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                  title="Enviar campanha"
                >
                  <Send className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleEdit(campaign)}
                  className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                  title="Editar"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(campaign.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Excluir"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {campaigns.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma campanha encontrada
          </h3>
          <p className="text-gray-600 mb-6">
            Crie sua primeira campanha para enviar mensagens em massa para seus clientes
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" />
            Criar Primeira Campanha
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CampaignModal
          campaign={editingCampaign}
          onClose={() => {
            setShowCreateModal(false)
            setEditingCampaign(null)
            loadCampaigns()
          }}
        />
      )}

      {/* Stats Modal */}
      {showStatsModal && selectedCampaign && (
        <StatsModal
          campaign={selectedCampaign}
          onClose={() => {
            setShowStatsModal(false)
            setSelectedCampaign(null)
          }}
        />
      )}
    </div>
  )
}

// Modal de Campanha
function CampaignModal({ 
  campaign, 
  onClose 
}: { 
  campaign: WhatsAppCampaign | null
  onClose: () => void 
}) {
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(campaign?.name || '')
  const [description, setDescription] = useState(campaign?.description || '')
  const [campaignType, setCampaignType] = useState(campaign?.campaign_type || 'custom')
  const [content, setContent] = useState(campaign?.content || '')
  const [autoSendEnabled, setAutoSendEnabled] = useState(campaign?.auto_send_enabled ?? false)
  const [scheduleConfig, setScheduleConfig] = useState(campaign?.schedule_config || {})
  const [clientFilters, setClientFilters] = useState(campaign?.client_filters || {})

  const campaignTypes = [
    { value: 'birthday', label: 'Aniversário', icon: '🎂' },
    { value: 'reconquer', label: 'Reconquista', icon: '🔄' },
    { value: 'reminder', label: 'Lembrete', icon: '⏰' },
    { value: 'care', label: 'Cuidados', icon: '💅' },
    { value: 'return', label: 'Retorno', icon: '🔙' },
    { value: 'custom', label: 'Personalizada', icon: '✏️' }
  ]

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('O nome é obrigatório')
      return
    }

    try {
      setSaving(true)
      
      const data = {
        name: name.trim(),
        description: description.trim(),
        campaign_type: campaignType,
        content: content.trim(),
        auto_send_enabled: autoSendEnabled,
        schedule_config: scheduleConfig,
        client_filters: clientFilters
      }

      if (campaign) {
        await whatsappService.updateCampaign(campaign.id, data)
        toast.success('Campanha atualizada com sucesso!')
      } else {
        await whatsappService.createCampaign(data)
        toast.success('Campanha criada com sucesso!')
      }

      onClose()
    } catch (error: any) {
      console.error('Erro ao salvar campanha:', error)
      toast.error('Erro ao salvar campanha')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {campaign ? 'Editar Campanha' : 'Nova Campanha'}
            </h2>
            <p className="text-sm text-gray-600">
              {campaign ? 'Altere as informações da campanha' : 'Crie uma nova campanha manual'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Campanha
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ex: Promoção de Verão"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Descreva o objetivo desta campanha..."
            />
          </div>

          {/* Campaign Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Campanha
            </label>
            <div className="grid grid-cols-3 gap-3">
              {campaignTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setCampaignType(type.value)}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    campaignType === type.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <div className="font-medium">{type.label}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Digite sua mensagem... Use {variável} para personalização"
            />
            <p className="text-xs text-gray-500 mt-1">
              {content.length} caracteres
            </p>
          </div>

          {/* Auto Send */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoSendEnabled}
                onChange={(e) => setAutoSendEnabled(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">
                Habilitar envio automático
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              A campanha será enviada automaticamente conforme as configurações de agendamento
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal de Estatísticas
function StatsModal({ 
  campaign, 
  onClose 
}: { 
  campaign: WhatsAppCampaign
  onClose: () => void 
}) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadStats()
  }, [campaign.id])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await whatsappService.getCampaignStats(campaign.id)
      setStats(data)
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error)
      toast.error('Erro ao carregar estatísticas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Estatísticas da Campanha</h2>
            <p className="text-sm text-gray-600">{campaign.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.total_sent}</div>
                  <div className="text-sm text-gray-600">Total Enviados</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.total_delivered}</div>
                  <div className="text-sm text-green-600">Entregues</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total_read}</div>
                  <div className="text-sm text-blue-600">Lidos</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.total_failed}</div>
                  <div className="text-sm text-red-600">Falhas</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxa de Entrega:</span>
                  <span className="text-sm font-medium text-gray-900">{stats.delivery_rate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxa de Leitura:</span>
                  <span className="text-sm font-medium text-gray-900">{stats.read_rate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxa de Falha:</span>
                  <span className="text-sm font-medium text-gray-900">{stats.failed_rate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
