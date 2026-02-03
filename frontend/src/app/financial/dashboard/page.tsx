'use client'

import { useState, useEffect } from 'react'
import { financialService } from '@/services/api'
import { DollarSign, TrendingUp, TrendingDown, ArrowRight, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import { FeatureWrapper } from '@/components/FeatureWrapper'
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart
} from 'recharts'

type PeriodType = 'today' | '7days' | '30days' | 'custom' | 'month' | 'year'

interface DashboardData {
  to_receive_today: number
  to_pay_today: number
  cash_position: number
  bank_position: number
  total_received_period: number
  total_to_receive_period: number
  total_paid_period: number
  total_to_pay_period: number
  sales_by_day: Array<{ date: string; total: number }>
  cash_flow_by_day: Array<{ date: string; income: number; expense: number; balance: number }>
}

interface Period {
  start_date: string
  end_date: string
}

export default function FinancialDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [periodType, setPeriodType] = useState<PeriodType>('30days')
  const [customPeriod, setCustomPeriod] = useState<Period>({
    start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd')
  })

  const getPeriodDates = (type: PeriodType): Period => {
    const today = new Date()
    switch (type) {
      case 'today':
        return {
          start_date: format(today, 'yyyy-MM-dd'),
          end_date: format(today, 'yyyy-MM-dd')
        }
      case '7days':
        return {
          start_date: format(subDays(today, 7), 'yyyy-MM-dd'),
          end_date: format(today, 'yyyy-MM-dd')
        }
      case '30days':
        return {
          start_date: format(subDays(today, 30), 'yyyy-MM-dd'),
          end_date: format(today, 'yyyy-MM-dd')
        }
      case 'month':
        return {
          start_date: format(startOfMonth(today), 'yyyy-MM-dd'),
          end_date: format(endOfMonth(today), 'yyyy-MM-dd')
        }
      case 'year':
        return {
          start_date: format(startOfYear(today), 'yyyy-MM-dd'),
          end_date: format(endOfYear(today), 'yyyy-MM-dd')
        }
      case 'custom':
        return customPeriod
      default:
        return {
          start_date: format(subDays(today, 30), 'yyyy-MM-dd'),
          end_date: format(today, 'yyyy-MM-dd')
        }
    }
  }

  const loadDashboard = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const period = getPeriodDates(periodType)
      const response = await financialService.getDashboard({
        start_date: period.start_date,
        end_date: period.end_date
      })
      setDashboard(response.data)
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao carregar dados do dashboard financeiro'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [periodType])

  const handleRetry = () => {
    loadDashboard()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState message="Carregando dashboard financeiro..." />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Erro ao carregar dashboard financeiro"
          message={error}
          onRetry={handleRetry}
        />
      </DashboardLayout>
    )
  }

  if (!dashboard) {
    return (
      <DashboardLayout>
        <EmptyState
          title="Nenhum dado disponível"
          message="Não há dados financeiros para o período selecionado."
          actionLabel="Recarregar"
          onAction={handleRetry}
        />
      </DashboardLayout>
    )
  }

  const period = getPeriodDates(periodType)

  // Format data for charts
  const salesChartData = dashboard.sales_by_day.map(item => ({
    date: format(parseISO(item.date), 'dd/MM', { locale: ptBR }),
    total: Number(item.total)
  }))

  const cashFlowChartData = dashboard.cash_flow_by_day.map(item => ({
    date: format(parseISO(item.date), 'dd/MM', { locale: ptBR }),
    entrada: Number(item.income),
    saida: Number(item.expense),
    saldo: Number(item.balance)
  }))

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard Financeiro</h1>
          <p className="text-gray-600 dark:text-gray-400">Visão geral da situação financeira</p>
        </div>

        <FeatureWrapper 
          feature="financial_complete" 
          asCard={true}
        >
          {/* Period Selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value as PeriodType)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="today">Hoje</option>
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="month">Este mês</option>
              <option value="year">Este ano</option>
              <option value="custom">Personalizado</option>
            </select>

            {periodType === 'custom' && (
              <div className="flex gap-2">
                <input
                  type="date"
                  value={customPeriod.start_date}
                  onChange={(e) => setCustomPeriod({ ...customPeriod, start_date: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="date"
                  value={customPeriod.end_date}
                  onChange={(e) => setCustomPeriod({ ...customPeriod, end_date: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={loadDashboard}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Aplicar
                </button>
              </div>
            )}

            <div className="text-sm text-gray-600 flex items-center gap-2 px-3 py-2">
              <Calendar className="w-4 h-4" />
              {format(parseISO(period.start_date), 'dd/MM/yyyy', { locale: ptBR })} - {format(parseISO(period.end_date), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
          </div>

          {/* Resumo Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Resumo</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">A receber hoje</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(dashboard.to_receive_today)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">A pagar hoje</span>
                <span className="text-lg font-semibold text-red-600">
                  {formatCurrency(dashboard.to_pay_today)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Contas</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700 font-medium">Caixa</span>
                <span className="text-xl font-bold text-green-700">
                  {formatCurrency(dashboard.cash_position)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700 font-medium">Banco</span>
                <span className="text-xl font-bold text-green-700">
                  {formatCurrency(dashboard.bank_position)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Totais Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Recebidos</span>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(dashboard.total_received_period)}
            </p>
            <p className="text-xs text-gray-500 mt-1">No período</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">A Receber</span>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(dashboard.total_to_receive_period)}
            </p>
            <p className="text-xs text-gray-500 mt-1">No período</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Pagos</span>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(dashboard.total_paid_period)}
            </p>
            <p className="text-xs text-gray-500 mt-1">No período</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">A Pagar</span>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(dashboard.total_to_pay_period)}
            </p>
            <p className="text-xs text-gray-500 mt-1">No período</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cash Flow Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Fluxo de caixa</h2>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(parseISO(period.start_date), 'dd/MM/yyyy', { locale: ptBR })} - {format(parseISO(period.end_date), 'dd/MM/yyyy', { locale: ptBR })}
              </div>
            </div>
            {cashFlowChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={cashFlowChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="entrada" fill="#10b981" name="Entrada" />
                  <Bar dataKey="saida" fill="#ef4444" name="Saída" />
                  <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={2} name="Saldo acumulado" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum dado disponível para o período</p>
            )}
          </div>

          {/* Sales by Day Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Vendas por dia</h2>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(parseISO(period.start_date), 'dd/MM/yyyy', { locale: ptBR })} - {format(parseISO(period.end_date), 'dd/MM/yyyy', { locale: ptBR })}
              </div>
            </div>
            {salesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Bar dataKey="total" fill="#3b82f6" name="Vendas" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum dado disponível para o período</p>
            )}
          </div>
        </div>
        </FeatureWrapper>
      </div>
    </DashboardLayout>
  )
}
