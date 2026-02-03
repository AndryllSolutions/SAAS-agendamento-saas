'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, DollarSign, Calendar, Star, Users, Clock, BarChart3, Filter } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'

interface StatisticsData {
  professional_id: number
  professional_name: string
  professional_avatar_url?: string
  total_appointments: number
  completed_appointments: number
  cancelled_appointments: number
  total_commissions: number
  total_revenue: number
  average_rating: number
  period: {
    start_date: string | null
    end_date: string | null
  }
}

export default function ProfessionalStatisticsPage() {
  const params = useParams()
  const router = useRouter()
  const professionalId = params!.id as string

  const [statistics, setStatistics] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadStatistics()
  }, [professionalId, dateFilter.start, dateFilter.end])

  const loadStatistics = async () => {
    try {
      const { professionalService } = await import('@/services/api')
      const response = await professionalService.getStatistics(
        parseInt(professionalId),
        dateFilter.start,
        dateFilter.end
      )
      setStatistics(response.data)
    } catch (error) {
      toast.error('Erro ao carregar estatísticas do profissional')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const completionRate = statistics ? 
    (statistics.completed_appointments / statistics.total_appointments * 100).toFixed(1) : 0

  const cancellationRate = statistics ? 
    (statistics.cancelled_appointments / statistics.total_appointments * 100).toFixed(1) : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!statistics) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Estatísticas não encontradas</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <div className="flex items-center gap-3">
              {statistics?.professional_avatar_url ? (
                <img
                  src={statistics.professional_avatar_url.startsWith('http') 
                    ? statistics.professional_avatar_url 
                    : `https://72.62.138.239${statistics.professional_avatar_url}`
                  }
                  alt={statistics.professional_name || 'Profissional'}
                  className="w-12 h-12 rounded-full object-cover shadow-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {statistics?.professional_name?.charAt(0)?.toUpperCase() || 'P'}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Estatísticas do Profissional
                </h1>
                <p className="text-gray-600 mt-1">{statistics?.professional_name || 'Profissional'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div>
                <label className="block text-sm font-medium mb-2">Período Início</label>
                <input
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Período Fim</label>
                <input
                  type="date"
                  value={dateFilter.end}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
          {dateFilter.start && dateFilter.end && (
            <div className="mt-4 text-sm text-gray-600">
              Período: {formatDate(dateFilter.start)} até {formatDate(dateFilter.end)}
            </div>
          )}
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Agendamentos</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.total_appointments}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Taxa de Conclusão</p>
                <p className="text-3xl font-bold text-green-600">{completionRate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {statistics.completed_appointments} de {statistics.total_appointments}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Faturamento Total</p>
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(statistics.total_revenue)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avaliação Média</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {statistics.average_rating.toFixed(1)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(statistics.average_rating)
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">Agendamentos Concluídos</p>
                <p className="text-2xl font-bold text-green-800">{statistics.completed_appointments}</p>
              </div>
              <div className="bg-green-200 p-3 rounded-xl">
                <Users className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 mb-1">Agendamentos Cancelados</p>
                <p className="text-2xl font-bold text-red-800">{statistics.cancelled_appointments}</p>
                <p className="text-xs text-red-600 mt-1">Taxa: {cancellationRate}%</p>
              </div>
              <div className="bg-red-200 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-red-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 mb-1">Comissões Totais</p>
                <p className="text-2xl font-bold text-blue-800">
                  {formatCurrency(statistics.total_commissions)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {((statistics.total_commissions / statistics.total_revenue) * 100).toFixed(1)}% do faturamento
                </p>
              </div>
              <div className="bg-blue-200 p-3 rounded-xl">
                <BarChart3 className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Resumo de Performance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Métricas de Qualidade</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxa de Conclusão</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{String(completionRate)}%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxa de Cancelamento</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${cancellationRate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{String(cancellationRate)}%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avaliação Média</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: `${(statistics.average_rating / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{statistics.average_rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Métricas Financeiras</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Faturamento Médio por Agendamento</span>
                  <span className="text-sm font-medium">
                    {statistics.total_appointments > 0 
                      ? formatCurrency(statistics.total_revenue / statistics.total_appointments)
                      : formatCurrency(0)
                    }
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Comissão Média por Agendamento</span>
                  <span className="text-sm font-medium">
                    {statistics.completed_appointments > 0 
                      ? formatCurrency(statistics.total_commissions / statistics.completed_appointments)
                      : formatCurrency(0)
                    }
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxa de Comissão Média</span>
                  <span className="text-sm font-medium">
                    {statistics.total_revenue > 0 
                      ? ((statistics.total_commissions / statistics.total_revenue) * 100).toFixed(1)
                      : 0
                    }%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-primary to-purple-600 rounded-xl p-6 text-white">
          <h2 className="text-lg font-semibold mb-3">Insights e Recomendações</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Performance</h3>
              <ul className="text-sm space-y-1 opacity-90">
                {parseFloat(String(completionRate)) >= 80 && (
                  <li>✅ Excelente taxa de conclusão de agendamentos</li>
                )}
                {parseFloat(String(cancellationRate)) <= 10 && (
                  <li>✅ Baixa taxa de cancelamento</li>
                )}
                {statistics.average_rating >= 4.5 && (
                  <li>✅ Ótima avaliação dos clientes</li>
                )}
                {parseFloat(String(completionRate)) < 70 && (
                  <li>⚠️ Considere revisar o processo de agendamento</li>
                )}
                {parseFloat(String(cancellationRate)) > 20 && (
                  <li>⚠️ Alta taxa de cancelamento merece atenção</li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Financeiro</h3>
              <ul className="text-sm space-y-1 opacity-90">
                {statistics.total_revenue > 0 && (
                  <li>💰 Faturamento total: {formatCurrency(statistics.total_revenue)}</li>
                )}
                {statistics.total_commissions > 0 && (
                  <li>💵 Comissões geradas: {formatCurrency(statistics.total_commissions)}</li>
                )}
                {statistics.total_appointments > 0 && (
                  <li>📊 Ticket médio: {formatCurrency(statistics.total_revenue / statistics.total_appointments)}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
