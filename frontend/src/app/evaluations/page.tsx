'use client'

import { useState, useEffect } from 'react'
import { evaluationService, clientService, userService } from '@/services/api'
import { Star, MessageSquare, Eye, BarChart3, Settings as SettingsIcon, Palette, User } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'

export default function EvaluationsPage() {
  const [activeTab, setActiveTab] = useState<'panel' | 'reviews' | 'customization' | 'settings'>('panel')
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [autoSendEnabled, setAutoSendEnabled] = useState(false)
  const [primaryColor, setPrimaryColor] = useState('#3B82F6')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [evaluationsRes, clientsRes, professionalsRes] = await Promise.all([
        evaluationService.list(),
        clientService.list(),
        userService.getProfessionals(),
      ])
      setEvaluations(evaluationsRes.data || [])
      setClients(clientsRes.data || [])
      setProfessionals(professionalsRes.data || [])
      
      // Calcular estatísticas
      const evals = evaluationsRes.data || []
      const avgRating = evals.length > 0 
        ? evals.reduce((sum: number, e: any) => sum + e.rating, 0) / evals.length 
        : 0
      const answered = evals.filter((e: any) => e.is_answered).length
      const responseRate = evals.length > 0 ? (answered / evals.length) * 100 : 0
      
      setStats({
        averageRating: avgRating,
        totalEvaluations: evals.length,
        responseRate: responseRate,
      })
    } catch (error: any) {
      toast.error('Erro ao carregar avaliações')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (id: number, answer: string) => {
    try {
      await evaluationService.respond(id, { answer_text: answer })
      toast.success('Resposta enviada!')
      loadData()
      setShowModal(false)
    } catch (error: any) {
      toast.error('Erro ao responder avaliação')
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'client_id', 
      label: 'Cliente',
      render: (e: any) => {
        const client = clients.find(c => c.id === e.client_id)
        return client?.full_name || 'N/A'
      }
    },
    { 
      key: 'professional_id', 
      label: 'Profissional',
      render: (e: any) => {
        if (!e.professional_id) return 'N/A'
        const prof = professionals.find(p => p.id === e.professional_id)
        return prof?.full_name || 'N/A'
      }
    },
    { 
      key: 'rating', 
      label: 'Avaliação',
      render: (e: any) => renderStars(e.rating)
    },
    { 
      key: 'comment', 
      label: 'Comentário',
      render: (e: any) => e.comment ? (
        <span className="truncate max-w-xs">{e.comment}</span>
      ) : 'Sem comentário'
    },
    { 
      key: 'is_answered', 
      label: 'Status',
      render: (e: any) => (
        <span className={e.is_answered ? 'text-green-600' : 'text-yellow-600'}>
          {e.is_answered ? 'Respondida' : 'Pendente'}
        </span>
      )
    },
  ]

  const tabs = [
    { id: 'panel' as const, label: 'Painel', icon: BarChart3 },
    { id: 'reviews' as const, label: 'Avaliações', icon: MessageSquare },
    { id: 'customization' as const, label: 'Personalização', icon: Palette },
    { id: 'settings' as const, label: 'Configurações', icon: SettingsIcon },
  ]

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Avaliações</h1>
          <p className="text-gray-600 mt-1">Gerencie as avaliações dos seus clientes</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Panel Tab */}
        {activeTab === 'panel' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Média Geral</h3>
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">{stats?.averageRating?.toFixed(1) || '0.0'}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Baseado em {stats?.totalEvaluations || 0} avaliações</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Total de Avaliações</h3>
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats?.totalEvaluations || 0}</p>
              <p className="text-sm text-gray-600 mt-2">Últimos 30 dias</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Taxa de Resposta</h3>
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats?.responseRate?.toFixed(0) || 0}%</p>
              <p className="text-sm text-gray-600 mt-2">Respondidas</p>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {evaluations.slice(0, 5).map((review) => {
              const client = clients.find(c => c.id === review.client_id)
              return (
                <div key={review.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
                      {client?.full_name?.substring(0, 2).toUpperCase() || 'NA'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{client?.full_name || 'N/A'}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700">{review.comment || 'Sem comentário'}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Customization Tab - Preview Público */}
        {activeTab === 'customization' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Aparência</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor Primária
                  </label>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-20 rounded border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo da Empresa
                  </label>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Alterar Logo
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Público */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-2xl mx-auto mb-4">
                    MS
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Maria Silva</h3>
                  <div className="flex justify-center my-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic">
                    "Excelente atendimento! Muito profissional e atenciosa."
                  </p>
                  <p className="text-sm text-gray-500 mt-4">10/01/2024</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Configurações de Avaliações</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Envio automático ativado</p>
                  <p className="text-sm text-gray-600">Solicitar avaliação automaticamente após atendimento</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoSendEnabled}
                    onChange={(e) => setAutoSendEnabled(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo de espera (horas após atendimento)
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="1">1 hora</option>
                  <option value="2">2 horas</option>
                  <option value="24">24 horas</option>
                  <option value="48">48 horas</option>
                </select>
              </div>

              <div className="pt-4">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        )}


        {showModal && selectedEvaluation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Detalhes da Avaliação</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cliente</label>
                  <p className="text-gray-700">
                    {clients.find(c => c.id === selectedEvaluation.client_id)?.full_name || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Avaliação</label>
                  {renderStars(selectedEvaluation.rating)}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Comentário</label>
                  <p className="text-gray-700">{selectedEvaluation.comment || 'Sem comentário'}</p>
                </div>
                
                {selectedEvaluation.is_answered && selectedEvaluation.answer_text && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Resposta</label>
                    <p className="text-gray-700">{selectedEvaluation.answer_text}</p>
                  </div>
                )}

                {!selectedEvaluation.is_answered && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Responder</label>
                    <textarea
                      id="answer"
                      className="w-full border rounded-lg px-3 py-2"
                      rows={3}
                      placeholder="Digite sua resposta..."
                    />
                    <button
                      onClick={() => {
                        const answer = (document.getElementById('answer') as HTMLTextAreaElement).value
                        if (answer.trim()) {
                          handleAnswer(selectedEvaluation.id, answer)
                        } else {
                          toast.error('Digite uma resposta')
                        }
                      }}
                      className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Enviar Resposta
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedEvaluation(null)
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

