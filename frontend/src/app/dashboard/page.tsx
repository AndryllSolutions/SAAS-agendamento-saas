'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { usePermissions } from '@/hooks/usePermissions'
import DashboardLayout from '@/components/DashboardLayout'
import { dashboardService } from '@/services/api'
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  ArrowUp,
  ArrowDown,
  Filter,
  RefreshCw
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const permissions = usePermissions()
  const [periodo, setPeriodo] = useState('24 jan, 2026 - 07 fev, 2026')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('agendamentos')
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Carregar todos os dados em paralelo
      const [
        overview,
        dailySales,
        commandsStats,
        appointmentsByStatus,
        averageTicket,
        salesByCategory,
        appointmentsFunnel,
        professionalOccupancy,
        appointmentsTrend,
        revenueTrend,
        commandsTrend,
        growthMetrics
      ] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getDailySales(),
        dashboardService.getCommandsStats(),
        dashboardService.getAppointmentsByStatus(),
        dashboardService.getAverageTicket(),
        dashboardService.getSalesByCategory(),
        dashboardService.getAppointmentsFunnel(),
        dashboardService.getProfessionalOccupancy(),
        dashboardService.getAppointmentsTrend({ days: 15 }),
        dashboardService.getRevenueTrend({ days: 15 }),
        dashboardService.getCommandsTrend({ days: 15 }),
        dashboardService.getGrowthMetrics()
      ])

      setData({
        overview,
        dailySales,
        commandsStats,
        appointmentsByStatus,
        averageTicket,
        salesByCategory,
        appointmentsFunnel,
        professionalOccupancy,
        appointmentsTrend,
        revenueTrend,
        commandsTrend,
        growthMetrics
      })
    } catch (err: any) {
      console.error('Erro ao carregar dashboard:', err)
      setError(err?.response?.data?.detail || 'Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleRefresh = () => {
    loadDashboardData()
  }

  const MetricCard = ({ title, value, subtitle, change, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg shadow p-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 text-sm ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  )

  const TendenciaChart = ({ data, title }: { data: any[], title: string }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-2">
        {(Array.isArray(data) ? data : []).map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 w-12">{item.label}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min((item.value / Math.max(...data.map(d => d.value))) * 100, 100)}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const StatusChart = ({ data, title }: { data: any, title: string }) => {
    const statusData = data.by_status || []
    const total = data.total || 0

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          
          <div className="space-y-3">
            {(Array.isArray(statusData) ? statusData : []).map((status: any) => (
              <div key={status.status} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    status.status === 'confirmed' ? 'bg-green-500' : 
                    status.status === 'cancelled' ? 'bg-red-500' : 
                    status.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-sm capitalize">{status.status}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">{status.count}</span>
                  <span className="text-xs text-gray-500 ml-1">({status.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const TicketMedioCard = ({ data }: { data: any }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket médio</h3>
      <div className="space-y-4">
        <div 
          className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors relative"
          onMouseEnter={() => setShowTooltip('atual')}
          onMouseLeave={() => setShowTooltip(null)}
        >
          <p className="text-sm text-gray-600">Período atual</p>
          <p className="text-2xl font-bold text-gray-900">
            R$ {data.current_period?.average_ticket?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-500">
            {data.current_period?.appointments || 0} comandas • R$ {(data.current_period?.total_revenue || 0).toFixed(2)} total
          </p>
          
          {showTooltip === 'atual' && (
            <div className="absolute z-10 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg top-full left-0 mt-1">
              <div className="space-y-1">
                <p className="font-medium">Detalhes do período atual</p>
                <p>Ticket médio: R$ {(data.current_period?.average_ticket || 0).toFixed(2)}</p>
                <p>Número de comandas: {data.current_period?.appointments || 0}</p>
                <p>Total: R$ {(data.current_period?.total_revenue || 0).toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        <div 
          className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors relative"
          onMouseEnter={() => setShowTooltip('anterior')}
          onMouseLeave={() => setShowTooltip(null)}
        >
          <p className="text-sm text-gray-600">Período anterior</p>
          <p className="text-lg font-semibold text-gray-700">
            R$ {data.previous_period?.average_ticket?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-500">
            {data.previous_period?.appointments || 0} comandas
          </p>
          
          {showTooltip === 'anterior' && (
            <div className="absolute z-10 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg top-full left-0 mt-1">
              <div className="space-y-1">
                <p className="font-medium">Detalhes do período anterior</p>
                <p>Ticket médio: R$ {(data.previous_period?.average_ticket || 0).toFixed(2)}</p>
                <p>Número de comandas: {data.previous_period?.appointments || 0}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const ProfissionaisCard = ({ data }: { data: any[] }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Atendimento por profissional</h3>
      <div className="space-y-4">
        {(Array.isArray(data) ? data : []).slice(0, 5).map((profissional, index) => (
          <div 
            key={profissional.professional_id}
            className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors relative"
            onMouseEnter={() => setShowTooltip(profissional.professional_name)}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{profissional.professional_name}</p>
                <p className="text-sm text-gray-600">
                  {profissional.appointments} serviços • R$ {(profissional.total_revenue / (profissional.appointments || 1)).toFixed(2)} médio
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{profissional.appointments}</p>
                <p className={`text-sm ${
                  profissional.occupancy_rate >= 70 ? 'text-green-600' : 
                  profissional.occupancy_rate >= 40 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {profissional.occupancy_rate.toFixed(1)}%
                </p>
              </div>
            </div>
            
            {showTooltip === profissional.professional_name && (
              <div className="absolute z-10 w-56 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg top-full left-0 mt-1">
                <div className="space-y-1">
                  <p className="font-medium">Ranking #{index + 1}</p>
                  <p>Profissional: {profissional.professional_name}</p>
                  <p>Atendimentos: {profissional.appointments}</p>
                  <p>Taxa de ocupação: {profissional.occupancy_rate.toFixed(1)}%</p>
                  <p>Faturamento: R$ {(profissional.total_revenue || 0).toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  if (loading && !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erro ao carregar dashboard: {error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="text-center text-gray-500">
          <p>Nenhum dado disponível</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Olá, {user?.full_name}</h1>
            <p className="text-gray-600">{periodo}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              <span>Filtrar</span>
            </button>
            <button 
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Cards Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Vendas totais"
            value={`R$ ${(data.overview?.revenue?.total || 0).toFixed(2).replace('.', ',')}`}
            subtitle={`Vendas do dia: R$ ${(data.dailySales?.total_sales || 0).toFixed(2).replace('.', ',')}`}
            change={data.growthMetrics?.revenue?.growth_percentage}
            icon={DollarSign}
            color="bg-blue-500"
          />
          <MetricCard
            title="Agendamentos"
            value={data.overview?.appointments?.total || 0}
            change={data.growthMetrics?.appointments?.growth_percentage}
            icon={Calendar}
            color="bg-green-500"
          />
          <MetricCard
            title="Comandas"
            value={data.commandsStats?.total_commands || 0}
            subtitle={`${(data.commandsStats?.conversion_rate || 0).toFixed(1)}% Taxa de conversão`}
            icon={ShoppingCart}
            color="bg-purple-500"
          />
          <MetricCard
            title="Ticket médio"
            value={`R$ ${(data.averageTicket?.current_period?.average_ticket || 0).toFixed(2).replace('.', ',')}`}
            change={data.averageTicket?.change_percentage}
            icon={TrendingUp}
            color="bg-orange-500"
          />
        </div>

        {/* Abas de Agendamentos e Comandas */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('agendamentos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'agendamentos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Agendamentos
              </button>
              <button
                onClick={() => setActiveTab('comandas')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'comandas'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Comandas
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'agendamentos' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TendenciaChart 
                  data={data.appointmentsTrend?.data || []} 
                  title="Tendência de Visitas" 
                />
                <StatusChart data={data.appointmentsByStatus} title="Agendamentos por status" />
              </div>
            )}
            
            {activeTab === 'comandas' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TendenciaChart 
                  data={data.commandsTrend?.data || []} 
                  title="Comandas por dia" 
                />
                <StatusChart data={data.appointmentsByStatus} title="Status das comandas" />
              </div>
            )}
          </div>
        </div>

        {/* Seções Inferiores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TicketMedioCard data={data.averageTicket} />
          <ProfissionaisCard data={data.professionalOccupancy} />
        </div>

        {/* Seções Adicionais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vendas por Categoria */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por categoria</h3>
            <div className="space-y-3">
              {(Array.isArray(data.salesByCategory?.by_category) ? data.salesByCategory?.by_category : []).map((categoria: any, index: number) => (
                <div key={categoria.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-purple-500'
                    }`}></div>
                    <span className="text-sm font-medium">{categoria.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold">R$ {categoria.total.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 ml-1">({categoria.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Funil de Agendamentos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Funil de agendamentos</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Confirmados</span>
                <span className="text-sm font-bold">{data.appointmentsFunnel?.confirmed?.count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Faturados</span>
                <span className="text-sm font-bold">{data.appointmentsFunnel?.billed?.count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-sm font-bold">{data.appointmentsFunnel?.all?.count || 0}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Taxa de conversão: {((data.appointmentsFunnel?.billed?.count || 0) / (data.appointmentsFunnel?.confirmed?.count || 1) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ocupação da Agenda */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ocupação da agenda</h3>
          <div className="space-y-3">
            {(Array.isArray(data.professionalOccupancy) ? data.professionalOccupancy : []).slice(0, 5).map((item: any, index: number) => (
              <div key={item.professional_id} className="flex items-center space-x-4">
                <span className="text-sm font-medium w-32">{item.professional_name}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${Math.min(item.occupancy_rate, 100)}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                    {item.occupancy_rate.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
