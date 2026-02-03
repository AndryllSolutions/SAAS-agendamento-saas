'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  Star,
  ArrowUp,
  ArrowDown,
  Activity,
  Receipt,
  ShoppingCart
} from 'lucide-react'

import { dashboardService } from '../services/api'
import { useAuthStore } from '../store/authStore'
import DashboardLayout from '../components/DashboardLayout'
import { DonutChart } from '../components/charts/DonutChart'
import { HeatmapChart } from '../components/charts/HeatmapChart'
import { FunnelChart } from '../components/charts/FunnelChart'
import { LineChart } from '../components/charts/LineChart'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [tempDateRange, setTempDateRange] = useState(dateRange)

  const { data: overview, isLoading: isLoadingOverview, error: errorOverview, refetch: refetchOverview } = useQuery({
    queryKey: ['dashboard-overview', dateRange],
    queryFn: () => dashboardService.getOverview(dateRange),
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Handle errors
  useEffect(() => {
    if (errorOverview) {
      console.error('❌ Erro ao carregar overview:', errorOverview);
      const axiosError = errorOverview as any;
      toast.error(axiosError?.response?.data?.detail || 'Erro ao carregar dados do dashboard');
    }
  }, [errorOverview])

  const { data: topServices, error: errorTopServices, refetch: refetchTopServices } = useQuery({
    queryKey: ['top-services', dateRange],
    queryFn: () => dashboardService.getTopServices({ ...dateRange, limit: 5 }),
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Handle errors
  useEffect(() => {
    if (errorTopServices) {
      console.error('❌ Erro ao carregar top services:', errorTopServices);
    }
  }, [errorTopServices])

  const { data: topProfessionals, error: errorTopProfessionals, refetch: refetchTopProfessionals } = useQuery({
    queryKey: ['top-professionals', dateRange],
    queryFn: () => dashboardService.getTopProfessionals({ ...dateRange, limit: 5 }),
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Handle errors
  useEffect(() => {
    if (errorTopProfessionals) {
      console.error('❌ Erro ao carregar top professionals:', errorTopProfessionals);
    }
  }, [errorTopProfessionals])

  // New dashboard queries
  const { data: dailySales, refetch: refetchDailySales } = useQuery({
    queryKey: ['daily-sales'],
    queryFn: () => dashboardService.getDailySales(),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const { data: commandsStats, refetch: refetchCommandsStats } = useQuery({
    queryKey: ['commands-stats', dateRange],
    queryFn: () => dashboardService.getCommandsStats(dateRange),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const { data: appointmentsByStatus, refetch: refetchAppointmentsByStatus } = useQuery({
    queryKey: ['appointments-by-status', dateRange],
    queryFn: () => dashboardService.getAppointmentsByStatus(dateRange),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const { data: averageTicket, refetch: refetchAverageTicket } = useQuery({
    queryKey: ['average-ticket', dateRange],
    queryFn: () => dashboardService.getAverageTicket(dateRange),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const { data: salesByCategory, refetch: refetchSalesByCategory } = useQuery({
    queryKey: ['sales-by-category', dateRange],
    queryFn: () => dashboardService.getSalesByCategory(dateRange),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const { data: appointmentsFunnel, refetch: refetchAppointmentsFunnel } = useQuery({
    queryKey: ['appointments-funnel', dateRange],
    queryFn: () => dashboardService.getAppointmentsFunnel(dateRange),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const { data: professionalOccupancy, refetch: refetchProfessionalOccupancy } = useQuery({
    queryKey: ['professional-occupancy', dateRange],
    queryFn: () => dashboardService.getProfessionalOccupancy(dateRange),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const { data: heatmapData, refetch: refetchHeatmapData } = useQuery({
    queryKey: ['heatmap', dateRange],
    queryFn: () => dashboardService.getHeatmap(dateRange),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Trend and growth queries
  const { data: appointmentsTrend, refetch: refetchAppointmentsTrend } = useQuery({
    queryKey: ['appointments-trend', 7],
    queryFn: () => dashboardService.getAppointmentsTrend({ days: 7 }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const { data: revenueTrend, refetch: refetchRevenueTrend } = useQuery({
    queryKey: ['revenue-trend', 7],
    queryFn: () => dashboardService.getRevenueTrend({ days: 7 }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const { data: commandsTrend, refetch: refetchCommandsTrend } = useQuery({
    queryKey: ['commands-trend', 7],
    queryFn: () => dashboardService.getCommandsTrend({ days: 7 }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const { data: growthMetrics, refetch: refetchGrowthMetrics } = useQuery({
    queryKey: ['growth-metrics'],
    queryFn: () => dashboardService.getGrowthMetrics(),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const isLoading = isLoadingOverview

  // Mostrar erros se houver
  useEffect(() => {
    if (errorOverview) {
      console.error('❌ Dashboard Overview Error:', errorOverview);
    }
    if (errorTopServices) {
      console.error('❌ Top Services Error:', errorTopServices);
    }
    if (errorTopProfessionals) {
      console.error('❌ Top Professionals Error:', errorTopProfessionals);
    }
  }, [errorOverview, errorTopServices, errorTopProfessionals]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  // Mostrar erro se houver
  if (errorOverview && !overview) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-900 mb-2">Erro ao Carregar Dashboard</h2>
            <p className="text-red-700 mb-4">
              {errorOverview?.response?.data?.detail || errorOverview?.message || 'Erro desconhecido'}
            </p>
            <button
              onClick={handleRefreshAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Calculate growth percentage
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  // Manual refresh function
  const handleRefreshAll = async () => {
    await Promise.all([
      refetchOverview(),
      refetchTopServices(),
      refetchTopProfessionals(),
      refetchDailySales(),
      refetchCommandsStats(),
      refetchAppointmentsByStatus(),
      refetchAverageTicket(),
      refetchSalesByCategory(),
      refetchAppointmentsFunnel(),
      refetchProfessionalOccupancy(),
      refetchHeatmapData(),
      refetchAppointmentsTrend(),
      refetchRevenueTrend(),
      refetchCommandsTrend(),
      refetchGrowthMetrics()
    ])
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header with Date Range */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Olá, {user?.full_name?.split(' ')[0]}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {new Date(dateRange.start_date).toLocaleDateString('pt-BR')} - {new Date(dateRange.end_date).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleRefreshAll}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
            >
              Atualizar
            </button>
          </div>
        </div>

        {/* Main Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Vendas Totais */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Vendas totais</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {formatCurrency(overview?.revenue?.total || 0)}
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span className="font-medium">Vendas do dia</span>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {formatCurrency(dailySales?.total_sales || 0)}
              </p>
            </div>
          </div>

          {/* Agendamentos */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Agendamentos</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {overview?.appointments?.total || 0}
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">Concluídos: {overview?.appointments?.completed || 0}</span>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                Taxa de conclusão: {overview?.appointments?.completion_rate?.toFixed(1) || 0}%
              </p>
            </div>
          </div>

          {/* Comandas */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Receipt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Comandas</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {commandsStats?.total_commands || 0}
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">Ticket médio</span>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {formatCurrency(averageTicket?.current_period?.average_ticket || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointments by Status */}
          {appointmentsByStatus && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <DonutChart
                title="Agendamentos por status"
                total={appointmentsByStatus.total}
                data={appointmentsByStatus.by_status.map((item: any) => ({
                  label: item.status === 'confirmed' ? 'Confirmado' : item.status === 'pending' ? 'Pendente' : 'Cancelado',
                  value: item.count,
                  percentage: item.percentage,
                  color: item.status === 'confirmed' ? '#10b981' : item.status === 'pending' ? '#f59e0b' : '#ef4444'
                }))}
              />
            </div>
          )}

          {/* Sales by Category */}
          {salesByCategory && salesByCategory.by_category.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <DonutChart
                title="Vendas por categoria"
                total={salesByCategory.total}
                data={salesByCategory.by_category.map((item: any, index: number) => ({
                  label: item.category,
                  value: item.total,
                  percentage: item.percentage,
                  color: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
                }))}
              />
            </div>
          )}

          {/* Appointments Funnel */}
          {appointmentsFunnel && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <FunnelChart
                title="Funil de agendamentos"
                data={[
                  { label: `Todos: ${appointmentsFunnel.all.count}`, count: appointmentsFunnel.all.count, percentage: 100 },
                  { label: `Confirmados: ${appointmentsFunnel.confirmed.count}`, count: appointmentsFunnel.confirmed.count, percentage: appointmentsFunnel.confirmed.percentage },
                  { label: `Faturados: ${appointmentsFunnel.billed.count}`, count: appointmentsFunnel.billed.count, percentage: appointmentsFunnel.billed.percentage }
                ]}
              />
            </div>
          )}
        </div>

        {/* Top Services */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              🏆 Serviços Mais Populares
            </h2>
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-4">
            {errorTopServices && (
              <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">
                Erro ao carregar serviços: {errorTopServices?.response?.data?.detail || errorTopServices?.message}
              </div>
            )}
            {topServices?.length === 0 && !errorTopServices && (
              <p className="text-gray-500 text-center py-4">Nenhum serviço encontrado</p>
            )}
            {topServices?.map((service: any, index: number) => (
              <div key={service.service_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                    'bg-gradient-to-br from-primary to-purple-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {service.service_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {service.appointment_count} agendamentos
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    R$ {service.total_revenue?.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
