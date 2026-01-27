'use client'

import { useState, useEffect } from 'react'
import { whatsappService, WhatsAppCampaign } from '@/services/whatsappService'
import { Plus, Send, MessageSquare, Users, TrendingUp, Calendar, Filter, Search, Edit, Trash2, Play, Pause, BarChart3, Settings, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function WhatsAppPage() {
  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<WhatsAppCampaign | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<WhatsAppCampaign | null>(null)
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSent: 0,
    totalDelivered: 0,
    deliveryRate: 0
  })

  useEffect(() => {
    loadCampaigns()
    loadStats()
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

  const loadStats = async () => {
    try {
      const data = await whatsappService.listCampaigns()
      const totalCampaigns = data.length
      const activeCampaigns = data.filter(c => c.status === 'active').length
      const totalSent = data.reduce((sum, c) => sum + c.total_sent, 0)
      const totalDelivered = data.reduce((sum, c) => sum + c.total_delivered, 0)
      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0
      
      setStats({
        totalCampaigns,
        activeCampaigns,
        totalSent,
        totalDelivered,
        deliveryRate
      })
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error)
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
      loadStats()
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
      loadStats()
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

  const handleViewStats = (campaign: WhatsAppCampaign) => {
    setSelectedCampaign(campaign)
    setShowStatsModal(true)
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
    switch (type) {
      case 'birthday': return '🎂'
      case 'reconquer': return '🔄'
      case 'reminder': return '⏰'
      case 'care': return '💆'
      case 'return': return '🔙'
      case 'informed': return '📢'
      case 'welcome': return '👋'
      case 'invite_online': return '📱'
      default: return '📨'
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const columns = [
    { 
      key: 'name', 
      label: 'Nome',
      render: (c: WhatsAppCampaign) => (
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCampaignTypeIcon(c.campaign_type)}</span>
          <div>
            <div className="font-medium">{c.name}</div>
            {c.description && <div className="text-sm text-gray-500">{c.description}</div>}
          </div>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (c: WhatsAppCampaign) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
          {getStatusText(c.status)}
        </span>
      )
    },
    { 
      key: 'stats', 
      label: 'Estatísticas',
      render: (c: WhatsAppCampaign) => (
        <div className="text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Send className="w-3 h-3" />
              {c.total_sent}
            </span>
            <span className="flex items-center gap-1 text-green-600">
              <TrendingUp className="w-3 h-3" />
              {c.total_delivered}
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <Users className="w-3 h-3" />
              {c.total_failed}
            </span>
          </div>
        </div>
      )
    },
    { 
      key: 'created_at', 
      label: 'Criado em',
      render: (c: WhatsAppCampaign) => (
        <div className="text-sm">
          {format(new Date(c.created_at), "dd/MM/yyyy", { locale: ptBR })}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (c: WhatsAppCampaign) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewStats(c)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Ver estatísticas"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(c)}
            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleAutoSend(c.id)}
            className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
            title={c.auto_send_enabled ? 'Desativar envio automático' : 'Ativar envio automático'}
          >
            {c.auto_send_enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          {c.status === 'active' && (
            <button
              onClick={() => handleSend(c.id)}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
              title="Enviar campanha"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleDelete(c.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">WhatsApp Marketing</h1>
            <p className="text-gray-600 mt-1">Gerencie campanhas de marketing via WhatsApp</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = '/marketing/whatsapp'}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Settings className="w-4 h-4" />
              Configurações Avançadas
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              <Plus className="w-5 h-5" />
              Nova Campanha
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Campanhas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Campanhas Ativas</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeCampaigns}</p>
              </div>
              <Play className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Enviadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSent}</p>
              </div>
              <Send className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Entregues</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalDelivered}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Entrega</p>
                <p className="text-2xl font-bold text-blue-600">{stats.deliveryRate.toFixed(1)}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar campanhas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos os status</option>
                <option value="active">Ativas</option>
                <option value="paused">Pausadas</option>
                <option value="finished">Finalizadas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white rounded-xl border border-gray-200">
          <DataTable
            data={filteredCampaigns}
            columns={columns}
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/marketing/whatsapp/templates'}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-medium">Templates</div>
              <div className="text-sm text-gray-500">Gerenciar modelos de mensagem</div>
            </div>
          </button>
          <button
            onClick={() => window.location.href = '/marketing/whatsapp/automated-campaigns'}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-medium">Campanhas Automáticas</div>
              <div className="text-sm text-gray-500">Configurar gatilhos automáticos</div>
            </div>
          </button>
          <button
            onClick={() => window.location.href = '/marketing/whatsapp/settings'}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="font-medium">Configurações</div>
              <div className="text-sm text-gray-500">API e integrações</div>
            </div>
          </button>
        </div>
      </div>

      {/* Campaign Create/Edit Modal */}
      {showCreateModal && (
        <CampaignModal
          campaign={editingCampaign}
          onClose={() => setShowCreateModal(false)}
          onSave={() => {
            setShowCreateModal(false)
            loadCampaigns()
            loadStats()
          }}
        />
      )}

      {/* Stats Modal */}
      {showStatsModal && selectedCampaign && (
        <StatsModal
          campaign={selectedCampaign}
          onClose={() => setShowStatsModal(false)}
        />
      )}
    </DashboardLayout>
  )
}

// Campaign Modal Component
function CampaignModal({ 
  campaign, 
  onClose, 
  onSave 
}: { 
  campaign: WhatsAppCampaign | null
  onClose: () => void
  onSave: () => void 
}) {
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    description: campaign?.description || '',
    content: campaign?.content || '',
    campaign_type: campaign?.campaign_type || 'custom',
    auto_send_enabled: campaign?.auto_send_enabled || false
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (campaign) {
        await whatsappService.updateCampaign(campaign.id, formData)
        toast.success('Campanha atualizada com sucesso!')
      } else {
        await whatsappService.createCampaign(formData)
        toast.success('Campanha criada com sucesso!')
      }
      onSave()
    } catch (error: any) {
      console.error('Erro ao salvar campanha:', error)
      toast.error('Erro ao salvar campanha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {campaign ? 'Editar Campanha' : 'Nova Campanha'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Campanha
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Campanha
            </label>
            <select
              value={formData.campaign_type}
              onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="custom">Personalizada</option>
              <option value="birthday">Aniversário</option>
              <option value="reconquer">Reconquista</option>
              <option value="reminder">Lembrete</option>
              <option value="care">Cuidados</option>
              <option value="return">Retorno</option>
              <option value="informed">Informações</option>
              <option value="welcome">Boas-vindas</option>
              <option value="invite_online">Convidar Online</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conteúdo da Mensagem
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Digite a mensagem da campanha..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto_send"
              checked={formData.auto_send_enabled}
              onChange={(e) => setFormData({ ...formData, auto_send_enabled: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="auto_send" className="text-sm font-medium text-gray-700">
              Habilitar envio automático
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Stats Modal Component
function StatsModal({ 
  campaign, 
  onClose 
}: { 
  campaign: WhatsAppCampaign
  onClose: () => void 
}) {
  const deliveryRate = campaign.total_sent > 0 
    ? (campaign.total_delivered / campaign.total_sent) * 100 
    : 0
  const readRate = campaign.total_delivered > 0 
    ? (campaign.total_read / campaign.total_delivered) * 100 
    : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Estatísticas da Campanha</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">{campaign.name}</h3>
            <p className="text-sm text-gray-600">{campaign.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{campaign.total_sent}</div>
              <div className="text-sm text-gray-600">Enviadas</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{campaign.total_delivered}</div>
              <div className="text-sm text-gray-600">Entregues</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{campaign.total_read}</div>
              <div className="text-sm text-gray-600">Lidas</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{campaign.total_failed}</div>
              <div className="text-sm text-gray-600">Falhas</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taxa de Entrega</span>
              <span className="font-medium">{deliveryRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taxa de Leitura</span>
              <span className="font-medium">{readRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

