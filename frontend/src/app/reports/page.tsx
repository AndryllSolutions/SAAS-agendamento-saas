'use client'

import { useState, useEffect } from 'react'
import { dashboardService, appointmentService, paymentService } from '@/services/api'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Users,
  Briefcase,
  Download,
  Filter,
  ArrowUp,
  ArrowDown,
  PieChart as PieChartIcon
} from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import { usePermissions } from '@/hooks/usePermissions'

export default function ReportsPage() {
  const permissions = usePermissions()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  })
  
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    totalAppointments: 0,
    averageTicket: 0,
    totalCommissions: 0,
    netRevenue: 0,
    growthRate: 0,
    topServices: [],
    topProfessionals: [],
    revenueByMonth: []
  })

  useEffect(() => {
    loadFinancialData()
  }, [dateRange])

  const loadFinancialData = async () => {
    setLoading(true)
    try {
      // Buscar dados do dashboard
      const overviewRes = await dashboardService.getOverview({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date
      })
      
      const topServicesRes = await dashboardService.getTopServices({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
        limit: 10
      })
      
      const topProfsRes = await dashboardService.getTopProfessionals({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
        limit: 10
      })

      const overview = overviewRes.data
      
      // Calcular métricas
      const totalRevenue = overview?.revenue?.total || 0
      const totalAppointments = overview?.appointments?.total || 0
      const averageTicket = totalAppointments > 0 ? totalRevenue / totalAppointments : 0
      
      // Calcular comissões (média de 40%)
      const totalCommissions = totalRevenue * 0.4
      const netRevenue = totalRevenue - totalCommissions
      
      // Calcular crescimento (simulado - você pode implementar comparação com período anterior)
      const growthRate = 12.5

      setFinancialData({
        totalRevenue,
        totalAppointments,
        averageTicket,
        totalCommissions,
        netRevenue,
        growthRate,
        topServices: topServicesRes.data || [],
        topProfessionals: topProfsRes.data || [],
        revenueByMonth: [] // Implementar depois
      })
    } catch (error) {
      toast.error('Erro ao carregar dados financeiros')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Relatório Financeiro'],
      ['Período', `${dateRange.start_date} até ${dateRange.end_date}`],
      [''],
      ['Métrica', 'Valor'],
      ['Receita Total', `R$ ${financialData.totalRevenue.toFixed(2)}`],
      ['Total de Agendamentos', financialData.totalAppointments],
      ['Ticket Médio', `R$ ${financialData.averageTicket.toFixed(2)}`],
      ['Total de Comissões', `R$ ${financialData.totalCommissions.toFixed(2)}`],
      ['Receita Líquida', `R$ ${financialData.netRevenue.toFixed(2)}`],
      [''],
      ['Top Serviços'],
      ['Serviço', 'Agendamentos', 'Receita'],
      ...financialData.topServices.map((s: any) => [
        s.service_name,
        s.appointment_count,
        `R$ ${s.total_revenue?.toFixed(2) || '0.00'}`
      ]),
      [''],
      ['Top Profissionais'],
      ['Profissional', 'Agendamentos', 'Receita', 'Avaliação'],
      ...financialData.topProfessionals.map((p: any) => [
        p.professional_name,
        p.appointment_count,
        `R$ ${p.total_revenue?.toFixed(2) || '0.00'}`,
        p.average_rating?.toFixed(1) || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio-financeiro-${dateRange.start_date}-${dateRange.end_date}.csv`
    link.click()
    
    toast.success('Relatório exportado!')
  }

  if (!permissions.canManagePayments()) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-600">Você não tem permissão para acessar relatórios financeiros.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Relatórios Financeiros
            </h1>
            <p className="text-gray-600 mt-1">Análise completa de receitas e despesas</p>
          </div>
          
          <button
            onClick={exportToCSV}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <Download className="w-5 h-5" />
            Exportar CSV
          </button>
        </div>

        {/* Filtros de Data */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Data Inicial</label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Data Final</label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <button
              onClick={loadFinancialData}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Cards de Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Receita Total */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>{financialData.growthRate}%</span>
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-1">Receita Total</p>
                <p className="text-3xl font-bold">R$ {financialData.totalRevenue.toFixed(2)}</p>
              </div>

              {/* Receita Líquida */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-1">Receita Líquida</p>
                <p className="text-3xl font-bold text-gray-900">R$ {financialData.netRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">Após comissões</p>
              </div>

              {/* Ticket Médio */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-1">Ticket Médio</p>
                <p className="text-3xl font-bold text-gray-900">R$ {financialData.averageTicket.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">{financialData.totalAppointments} agendamentos</p>
              </div>

              {/* Total de Comissões */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-1">Total de Comissões</p>
                <p className="text-3xl font-bold text-gray-900">R$ {financialData.totalCommissions.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">Pagamento aos profissionais</p>
              </div>
            </div>

            {/* Gráficos e Tabelas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Serviços */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Top Serviços</h2>
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                
                <div className="space-y-4">
                  {financialData.topServices.slice(0, 5).map((service: any, index: number) => {
                    const percentage = (service.total_revenue / financialData.totalRevenue) * 100
                    return (
                      <div key={service.service_id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                              index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                              index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                              index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                              'bg-gradient-to-br from-green-500 to-emerald-600'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{service.service_name}</p>
                              <p className="text-xs text-gray-500">{service.appointment_count} agendamentos</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">R$ {service.total_revenue?.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Top Profissionais */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Top Profissionais</h2>
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                
                <div className="space-y-4">
                  {financialData.topProfessionals.slice(0, 5).map((prof: any, index: number) => {
                    const commission = (prof.total_revenue || 0) * 0.4
                    return (
                      <div key={prof.professional_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                            'bg-gradient-to-br from-purple-500 to-purple-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{prof.professional_name}</p>
                            <p className="text-xs text-gray-500">
                              {prof.appointment_count} agendamentos • Comissão: R$ {commission.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">R$ {prof.total_revenue?.toFixed(2)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Resumo Detalhado */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumo Detalhado</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 mb-3">Receitas</h3>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Receita Bruta</span>
                    <span className="font-semibold text-green-600">R$ {financialData.totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">(-) Comissões</span>
                    <span className="font-semibold text-red-600">R$ {financialData.totalCommissions.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-green-50 px-3 rounded-lg">
                    <span className="font-bold text-gray-900">Receita Líquida</span>
                    <span className="font-bold text-green-600 text-lg">R$ {financialData.netRevenue.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 mb-3">Estatísticas</h3>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Total de Agendamentos</span>
                    <span className="font-semibold">{financialData.totalAppointments}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Ticket Médio</span>
                    <span className="font-semibold">R$ {financialData.averageTicket.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Taxa de Comissão Média</span>
                    <span className="font-semibold">40%</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
