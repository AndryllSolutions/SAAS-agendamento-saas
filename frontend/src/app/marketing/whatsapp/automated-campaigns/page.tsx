'use client'

import { useState, useEffect } from 'react'
import { Loader2, Settings, TrendingUp, MessageCircle, Info } from 'lucide-react'
import { toast } from 'sonner'
import whatsappMarketingService, { AutomatedCampaign, AutomatedCampaignType } from '@/services/whatsappMarketingService'

export default function AutomatedCampaignsPage() {
  const [loading, setLoading] = useState(true)
  const [campaigns, setCampaigns] = useState<AutomatedCampaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<AutomatedCampaign | null>(null)
  const [showCustomizeModal, setShowCustomizeModal] = useState(false)

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const data = await whatsappMarketingService.listAutomatedCampaigns()
      setCampaigns(data)
    } catch (error: any) {
      console.error('Erro ao carregar campanhas:', error)
      toast.error('Erro ao carregar campanhas automáticas')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleCampaign = async (campaign: AutomatedCampaign) => {
    try {
      const newStatus = !campaign.is_enabled
      await whatsappMarketingService.toggleAutomatedCampaign(campaign.campaign_type, newStatus)
      
      toast.success(newStatus ? 'Campanha ativada!' : 'Campanha desativada!')
      loadCampaigns()
    } catch (error: any) {
      console.error('Erro ao alterar campanha:', error)
      toast.error('Erro ao alterar status da campanha')
    }
  }

  const handleCustomize = (campaign: AutomatedCampaign) => {
    setSelectedCampaign(campaign)
    setShowCustomizeModal(true)
  }

  const getCampaignIcon = (type: AutomatedCampaignType) => {
    const icons: { [key: string]: string } = {
      birthday: '🎉',
      reconquer: '🔄',
      reminder: '⏰',
      pre_care: '💆‍♀️',
      post_care: '✨',
      return_guarantee: '🔁',
      status_update: '📢',
      welcome: '👋',
      invite_online: '🌐',
      cashback: '💰',
      package_expiring: '📦',
      billing: '💳'
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Campanhas Automáticas
        </h1>
        <p className="text-gray-600">
          Escolha quais campanhas automáticas pelo WhatsApp você deseja ativar
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Como funciona?</p>
          <p>
            As campanhas automáticas são disparadas automaticamente quando eventos específicos ocorrem no sistema.
            Você pode personalizar as mensagens e configurar horários de envio para cada campanha.
          </p>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((campaign) => (
          <div
            key={campaign.campaign_type}
            className={`bg-white border rounded-lg p-6 transition-all ${
              campaign.is_enabled
                ? 'border-green-300 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Campaign Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-4xl">{getCampaignIcon(campaign.campaign_type)}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {campaign.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {campaign.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            {campaign.is_configured && campaign.total_triggered > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Disparados</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {campaign.total_triggered}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Enviados</div>
                  <div className="text-lg font-semibold text-green-600">
                    {campaign.total_sent}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Falhas</div>
                  <div className="text-lg font-semibold text-red-600">
                    {campaign.total_failed}
                  </div>
                </div>
              </div>
            )}

            {/* Toggle and Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-3">
                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={campaign.is_enabled}
                    onChange={() => handleToggleCampaign(campaign)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">
                  {campaign.is_enabled ? (
                    <span className="text-green-600">✓ Envio automático ativado</span>
                  ) : (
                    <span className="text-gray-500">○ Envio automático desativado</span>
                  )}
                </span>
              </div>

              {/* Customize Button */}
              <button
                onClick={() => handleCustomize(campaign)}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium"
              >
                <Settings className="w-4 h-4" />
                Personalizar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Customize Modal */}
      {showCustomizeModal && selectedCampaign && (
        <CustomizeModal
          campaign={selectedCampaign}
          onClose={() => {
            setShowCustomizeModal(false)
            setSelectedCampaign(null)
            loadCampaigns()
          }}
        />
      )}
    </div>
  )
}

// Modal de Personalização
function CustomizeModal({ campaign, onClose }: { campaign: AutomatedCampaign; onClose: () => void }) {
  const [saving, setSaving] = useState(false)
  const [messageTemplate, setMessageTemplate] = useState(campaign.message_template || campaign.default_message_template)
  const [config, setConfig] = useState(campaign.config || {})
  const [sendTimeStart, setSendTimeStart] = useState(campaign.send_time_start)
  const [sendTimeEnd, setSendTimeEnd] = useState(campaign.send_time_end)
  const [sendWeekdaysOnly, setSendWeekdaysOnly] = useState(campaign.send_weekdays_only)
  const [showPreview, setShowPreview] = useState(false)

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Validar template
      const validation = whatsappMarketingService.validateTemplate(messageTemplate, campaign.available_variables)
      if (!validation.valid) {
        toast.error(validation.errors[0])
        return
      }

      await whatsappMarketingService.updateAutomatedCampaign(campaign.campaign_type, {
        message_template: messageTemplate,
        config,
        send_time_start: sendTimeStart,
        send_time_end: sendTimeEnd,
        send_weekdays_only: sendWeekdaysOnly
      })

      toast.success('Campanha personalizada com sucesso!')
      onClose()
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar personalização')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Deseja realmente resetar para as configurações padrão?')) return

    try {
      setSaving(true)
      await whatsappMarketingService.resetAutomatedCampaign(campaign.campaign_type)
      toast.success('Campanha resetada para o padrão!')
      onClose()
    } catch (error: any) {
      console.error('Erro ao resetar:', error)
      toast.error('Erro ao resetar campanha')
    } finally {
      setSaving(false)
    }
  }

  const insertVariable = (variable: string) => {
    setMessageTemplate(prev => prev + `{${variable}}`)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Personalizar Campanha</h2>
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
        <div className="p-6 space-y-6">
          {/* Message Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem Personalizada
            </label>
            <textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
              placeholder="Digite sua mensagem..."
            />
          </div>

          {/* Variables */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variáveis Disponíveis
            </label>
            <div className="flex flex-wrap gap-2">
              {campaign.available_variables.map((variable) => (
                <button
                  key={variable}
                  onClick={() => insertVariable(variable)}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-100"
                >
                  {`{${variable}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium mb-2"
            >
              <MessageCircle className="w-4 h-4" />
              {showPreview ? 'Ocultar' : 'Ver'} Pré-visualização
            </button>
            {showPreview && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">Exemplo de mensagem:</div>
                <div className="bg-white p-4 rounded-lg shadow-sm whitespace-pre-wrap">
                  {whatsappMarketingService.previewTemplate(messageTemplate)}
                </div>
              </div>
            )}
          </div>

          {/* Schedule Settings */}
          <div className="border-t pt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Configurações de Envio</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário Início
                </label>
                <input
                  type="time"
                  value={sendTimeStart}
                  onChange={(e) => setSendTimeStart(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário Fim
                </label>
                <input
                  type="time"
                  value={sendTimeEnd}
                  onChange={(e) => setSendTimeEnd(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sendWeekdaysOnly}
                onChange={(e) => setSendWeekdaysOnly(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">
                Enviar apenas em dias úteis (Segunda a Sexta)
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleReset}
            disabled={saving}
            className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
          >
            Resetar para Padrão
          </button>
          <div className="flex gap-3">
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
    </div>
  )
}
