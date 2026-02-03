'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { isSaasAdmin } from '@/utils/checkSaasAdmin'
import { saasAdminService } from '@/services/api'
import DashboardLayout from '@/components/DashboardLayout'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  Users,
  Calendar,
  ArrowLeft,
  RefreshCw,
  PieChart,
  Activity,
  Target
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface MonthlyData {
  month: string
  companies: number
  users: number
}

interface GrowthData {
  monthly_data: MonthlyData[]
  company_growth_rate: number
  period: string
}

interface RevenueData {
  current_mrr: number
  mrr_by_plan: Record<string, number>
  subscription_count_by_plan: Record<string, number>
  total_active_subscriptions: number
  new_subscriptions: number
  churned_subscriptions: number
  churn_rate: number
  period_days: number
}

interface MetricsData {
  total_companies: number
  active_companies: number
  new_companies_30d: number
  total_users: number
  active_users: number
  saas_admins: number
  mrr: number
  churn_rate: number
}

export default function SaaSAnalyticsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [growth, setGrowth] = useState<GrowthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(30)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isSaasAdmin(user)) {
      router.push('/unauthorized')
      return
    }

    loadAnalytics()
  }, [isAuthenticated, user, router, selectedPeriod])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const [metricsRes, revenueRes, growthRes] = await Promise.all([
        saasAdminService.getMetricsOverview(),
        saasAdminService.getRevenueAnalytics(selectedPeriod),
        saasAdminService.getGrowthAnalytics()
      ])
      setMetrics(metricsRes.data)
      setRevenue(revenueRes.data)
      setGrowth(growthRes.data)
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
      toast.error('Erro ao carregar analytics')
    } finally {
      setLoading(false)
    }
  }

  const saasRole = user?.saas_role?.toUpperCase()
  const isAuthorized = saasRole === 'SAAS_OWNER' || saasRole === 'SAAS_STAFF'

  if (!isAuthenticated || !isAuthorized) {
    return null
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const planColors: Record<string, { bg: string; text: string; border: string }> = {
    FREE: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
    BASIC: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    PRO: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
    PREMIUM: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' }
  }

  const getMaxValue = (data: MonthlyData[], key: 'companies' | 'users') => {
    return Math.max(...data.map(d => d[key]), 1)
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/saas-admin">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Analytics Avançado
                </h1>
                <p className="text-gray-600 mt-1">
                  Métricas e estatísticas detalhadas do SaaS
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Seletor de Período */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={7}>Últimos 7 dias</option>
                <option value={30}>Últimos 30 dias</option>
                <option value={90}>Últimos 90 dias</option>
                <option value={365}>Último ano</option>
              </select>
              <button
                onClick={loadAnalytics}
                className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                title="Recarregar"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : (
            <>
              {/* KPIs Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* MRR */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                      MRR
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(revenue?.current_mrr || 0)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Receita Mensal Recorrente
                  </p>
                </div>

                {/* Empresas Ativas */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                      metrics?.new_companies_30d && metrics.new_companies_30d > 0
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-50 text-gray-600'
                    }`}>
                      {metrics?.new_companies_30d && metrics.new_companies_30d > 0 ? (
                        <>
                          <TrendingUp className="w-3 h-3" />
                          +{metrics.new_companies_30d}
                        </>
                      ) : (
                        '30d'
                      )}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {metrics?.active_companies || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Empresas Ativas
                  </p>
                </div>

                {/* Usuários Ativos */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                      Total: {metrics?.total_users || 0}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {metrics?.active_users || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Usuários Ativos
                  </p>
                </div>

                {/* Churn Rate */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${
                      (revenue?.churn_rate || 0) > 5 ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      {(revenue?.churn_rate || 0) > 5 ? (
                        <TrendingDown className="w-6 h-6 text-red-600" />
                      ) : (
                        <Activity className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      (revenue?.churn_rate || 0) > 5
                        ? 'bg-red-50 text-red-700'
                        : 'bg-green-50 text-green-700'
                    }`}>
                      {(revenue?.churn_rate || 0) > 5 ? 'Alto' : 'Saudável'}
                    </span>
                  </div>
                  <p className={`text-3xl font-bold ${
                    (revenue?.churn_rate || 0) > 5 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {revenue?.churn_rate?.toFixed(1) || '0.0'}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Taxa de Churn ({selectedPeriod}d)
                  </p>
                </div>
              </div>

              {/* Grid de 2 colunas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Distribuição por Plano */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-indigo-600" />
                      Distribuição por Plano
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {revenue && Object.entries(revenue.subscription_count_by_plan || {}).map(([plan, count]) => {
                      const colors = planColors[plan] || planColors.FREE
                      const total = revenue.total_active_subscriptions || 1
                      const percentage = ((count as number) / total) * 100

                      return (
                        <div key={plan} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 ${colors.bg} ${colors.text} text-sm font-semibold rounded-full`}>
                                {plan}
                              </span>
                              <span className="text-sm text-gray-500">
                                {count} assinatura(s)
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(revenue.mrr_by_plan?.[plan] || 0)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all ${
                                plan === 'FREE' ? 'bg-gray-400' :
                                plan === 'BASIC' ? 'bg-blue-500' :
                                plan === 'PRO' ? 'bg-purple-500' :
                                'bg-yellow-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Assinaturas Ativas</span>
                      <span className="text-lg font-bold text-gray-900">
                        {revenue?.total_active_subscriptions || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Métricas de Assinatura */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Target className="w-5 h-5 text-indigo-600" />
                      Métricas de Assinatura
                    </h2>
                    <span className="text-sm text-gray-500">
                      Últimos {selectedPeriod} dias
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Novas Assinaturas */}
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Novas</span>
                      </div>
                      <p className="text-3xl font-bold text-green-700">
                        {revenue?.new_subscriptions || 0}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        assinaturas criadas
                      </p>
                    </div>

                    {/* Cancelamentos */}
                    <div className="bg-red-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-700">Churn</span>
                      </div>
                      <p className="text-3xl font-bold text-red-700">
                        {revenue?.churned_subscriptions || 0}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        cancelamentos
                      </p>
                    </div>

                    {/* Net New */}
                    <div className="col-span-2 bg-indigo-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-indigo-700 mb-1">
                            Net New (Crescimento Líquido)
                          </p>
                          <p className="text-2xl font-bold text-indigo-700">
                            {(revenue?.new_subscriptions || 0) - (revenue?.churned_subscriptions || 0)}
                          </p>
                        </div>
                        <div className={`p-3 rounded-xl ${
                          ((revenue?.new_subscriptions || 0) - (revenue?.churned_subscriptions || 0)) >= 0
                            ? 'bg-green-100'
                            : 'bg-red-100'
                        }`}>
                          {((revenue?.new_subscriptions || 0) - (revenue?.churned_subscriptions || 0)) >= 0 ? (
                            <TrendingUp className="w-6 h-6 text-green-600" />
                          ) : (
                            <TrendingDown className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráfico de Crescimento */}
              {growth && growth.monthly_data && growth.monthly_data.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                      Crescimento Mensal
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full" />
                        <span className="text-sm text-gray-600">Empresas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="text-sm text-gray-600">Usuários</span>
                      </div>
                      {growth.company_growth_rate !== 0 && (
                        <span className={`text-sm font-medium flex items-center gap-1 ${
                          growth.company_growth_rate > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {growth.company_growth_rate > 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {growth.company_growth_rate > 0 ? '+' : ''}{growth.company_growth_rate.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Gráfico de Barras Simples */}
                  <div className="h-64 flex items-end justify-between gap-2">
                    {growth.monthly_data.slice(-12).map((month, index) => {
                      const maxCompanies = getMaxValue(growth.monthly_data, 'companies')
                      const maxUsers = getMaxValue(growth.monthly_data, 'users')
                      const companyHeight = (month.companies / maxCompanies) * 100
                      const userHeight = (month.users / maxUsers) * 100

                      return (
                        <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex items-end justify-center gap-1 h-48">
                            {/* Barra de Empresas */}
                            <div className="flex flex-col items-center w-1/2">
                              <span className="text-xs text-purple-600 font-medium mb-1">
                                {month.companies}
                              </span>
                              <div
                                className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all"
                                style={{ height: `${Math.max(companyHeight, 5)}%` }}
                              />
                            </div>
                            {/* Barra de Usuários */}
                            <div className="flex flex-col items-center w-1/2">
                              <span className="text-xs text-blue-600 font-medium mb-1">
                                {month.users}
                              </span>
                              <div
                                className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all"
                                style={{ height: `${Math.max(userHeight, 5)}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 mt-2">
                            {month.month.split('-')[1]}/{month.month.split('-')[0].slice(2)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Info Card */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">📊 Insights</h3>
                    <ul className="space-y-2 text-indigo-100">
                      <li>
                        • {metrics?.saas_admins || 0} administrador(es) SaaS configurado(s)
                      </li>
                      <li>
                        • Taxa de atividade: {metrics?.total_companies ? 
                          ((metrics.active_companies / metrics.total_companies) * 100).toFixed(1) : 0}%
                        das empresas ativas
                      </li>
                      <li>
                        • Média de {metrics?.total_companies && metrics.total_companies > 0 ?
                          ((metrics.total_users || 0) / metrics.total_companies).toFixed(1) : 0} 
                        usuários por empresa
                      </li>
                      <li>
                        • {revenue?.new_subscriptions || 0} nova(s) assinatura(s) nos últimos {selectedPeriod} dias
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

