'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, Send, Users, Calendar, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { whatsappService, WhatsAppCampaign } from '@/services/whatsappService'

export default function CustomCampaignsPage() {
  const [loading, setLoading] = useState(false)
  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Campanhas Personalizadas
          </h1>
          <p className="text-gray-600">
            Crie e gerencie campanhas manuais ou programadas
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 shadow-md"
        >
          <Plus className="w-5 h-5" />
          Nova Campanha
        </button>
      </div>

      {/* Empty State */}
      {campaigns.length === 0 && !loading && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma campanha personalizada
          </h3>
          <p className="text-gray-600 mb-6">
            Crie sua primeira campanha personalizada para enviar mensagens específicas aos seus clientes
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" />
            Criar Primeira Campanha
          </button>
        </div>
      )}

      {/* Campaigns List */}
      {campaigns.length > 0 && (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {campaign.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {campaign.description}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{campaign.total_sent} enviados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Criado em {campaign.created_at}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'finished' ? 'bg-green-100 text-green-700' :
                      campaign.status === 'active' ? 'bg-blue-100 text-blue-700' :
                      campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {campaign.status === 'finished' ? 'Finalizada' :
                       campaign.status === 'active' ? 'Ativa' :
                       campaign.status === 'paused' ? 'Pausada' :
                       'Cancelada'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {/* TODO: Implementar edição */}}
                    className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(campaign.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateCampaignModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}

// Modal de Criação de Campanha
function CreateCampaignModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [audience, setAudience] = useState('all')
  const [scheduleType, setScheduleType] = useState('now')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Nova Campanha Personalizada</h2>
            <p className="text-sm text-gray-600">Passo {step} de 3</p>
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
          {step === 1 && (
            <div className="space-y-6">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Digite sua mensagem..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {message.length} caracteres
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Selecione o Público
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="audience"
                      value="all"
                      checked={audience === 'all'}
                      onChange={(e) => setAudience(e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Todos os Clientes</div>
                      <div className="text-sm text-gray-600">Enviar para todos os clientes cadastrados</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="audience"
                      value="active"
                      checked={audience === 'active'}
                      onChange={(e) => setAudience(e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Clientes Ativos</div>
                      <div className="text-sm text-gray-600">Clientes com agendamentos nos últimos 90 dias</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="audience"
                      value="inactive"
                      checked={audience === 'inactive'}
                      onChange={(e) => setAudience(e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Clientes Inativos</div>
                      <div className="text-sm text-gray-600">Clientes sem agendamentos há mais de 90 dias</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="audience"
                      value="custom"
                      checked={audience === 'custom'}
                      onChange={(e) => setAudience(e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Lista Personalizada</div>
                      <div className="text-sm text-gray-600">Selecionar clientes específicos</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Quando Enviar?
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="schedule"
                      value="now"
                      checked={scheduleType === 'now'}
                      onChange={(e) => setScheduleType(e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Enviar Agora</div>
                      <div className="text-sm text-gray-600">Enviar imediatamente após confirmar</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="schedule"
                      value="scheduled"
                      checked={scheduleType === 'scheduled'}
                      onChange={(e) => setScheduleType(e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-2">Agendar Envio</div>
                      {scheduleType === 'scheduled' && (
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="date"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <input
                            type="time"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Resumo da Campanha</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nome:</span>
                    <span className="font-medium text-gray-900">{name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Público:</span>
                    <span className="font-medium text-gray-900">
                      {audience === 'all' ? 'Todos os Clientes' :
                       audience === 'active' ? 'Clientes Ativos' :
                       audience === 'inactive' ? 'Clientes Inativos' :
                       'Lista Personalizada'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envio:</span>
                    <span className="font-medium text-gray-900">
                      {scheduleType === 'now' ? 'Imediato' : 'Agendado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </button>
          <button
            onClick={() => step < 3 ? setStep(step + 1) : toast.success('Campanha criada!')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            {step === 3 ? 'Criar Campanha' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  )
}
