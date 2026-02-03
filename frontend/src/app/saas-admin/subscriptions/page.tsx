'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { isSaasAdmin } from '@/utils/checkSaasAdmin'
import { saasAdminService } from '@/services/api'
import DashboardLayout from '@/components/DashboardLayout'
import {
  DollarSign,
  ArrowLeft,
  Users,
  TrendingUp,
  Building,
  ShieldCheck,
  Check,
  X,
  Star,
  Building2,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface PlanStats {
  active_subscriptions: number
  mrr: number
}

interface PlanData {
  id: string
  slug?: string
  name: string
  description?: string
  price: number
  billing_period?: string
  trial_days: number
  highlight_label?: string | null
  color?: string | null
  features: string[]
  limits?: {
    max_users?: number
    max_units?: number
    max_clients?: number
    max_appointments_per_month?: number
  }
  stats: PlanStats
}

interface PlansResponse {
  plans: PlanData[]
  total_plans: number
  total_active_subscriptions: number
  total_mrr: number
  total_companies?: number
  active_companies?: number
  message?: string
}

export default function SubscriptionsManagementPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [plans, setPlans] = useState<PlansResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isSaasAdmin(user)) {
      router.push('/unauthorized')
      return
    }

    loadPlans()
  }, [isAuthenticated, user, router])

  const loadPlans = async () => {
    setLoading(true)
    try {
      const response = await saasAdminService.listPlans()
      setPlans(response.data)
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
      toast.error('Erro ao carregar planos')
    } finally {
      setLoading(false)
    }
  }

  const loadPlanDetails = async (planId: string) => {
    try {
      const response = await saasAdminService.getPlanDetails(planId)
      setSelectedPlan(response.data)
      setShowDetails(true)
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error)
      toast.error('Erro ao carregar detalhes do plano')
    }
  }

  const isAuthorized = isSaasAdmin(user)

  if (!isAuthenticated || !isAuthorized) {
    return null
  }

  const totalMrr = plans?.total_mrr || 0
  const totalActiveSubs = plans?.total_active_subscriptions || 0
  const arpa = totalActiveSubs > 0 ? totalMrr / totalActiveSubs : 0
  const totalCompanies = plans?.total_companies || 0
  const activeCompanies = plans?.active_companies || 0
  const activationRate = totalCompanies > 0 ? (activeCompanies / totalCompanies) * 100 : 0
  const hasPlans = (plans?.plans?.length || 0) > 0

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const planStyles: Record<string, { border: string; button: string; badge: string }> = {
    ESSENCIAL: {
      border: 'border-emerald-200',
      button: 'from-emerald-500 to-green-600',
      badge: 'bg-emerald-500'
    },
    FREE: {
      border: 'border-emerald-200',
      button: 'from-emerald-500 to-green-600',
      badge: 'bg-emerald-500'
    },
    BASIC: {
      border: 'border-emerald-200',
      button: 'from-emerald-500 to-green-600',
      badge: 'bg-emerald-500'
    },
    PRO: {
      border: 'border-blue-200',
      button: 'from-blue-600 to-indigo-600',
      badge: 'bg-blue-600'
    },
    PREMIUM: {
      border: 'border-purple-200',
      button: 'from-purple-600 to-fuchsia-600',
      badge: 'bg-purple-600'
    },
    SCALE: {
      border: 'border-amber-200',
      button: 'from-amber-500 to-orange-500',
      badge: 'bg-amber-500'
    },
    DEFAULT: {
      border: 'border-gray-200',
      button: 'from-gray-700 to-gray-800',
      badge: 'bg-gray-700'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </DashboardLayout>
    )
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Planos e Assinaturas
                </h1>
                <p className="text-gray-600 mt-1">Gerencie os planos disponíveis e veja estatísticas</p>
              </div>
            </div>
          </div>

          {/* Resumo Geral */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <p className="text-white/80 text-sm mb-1">MRR Total</p>
              <p className="text-3xl font-bold">
                {formatCurrency(totalMrr)}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Assinaturas Ativas</p>
              <p className="text-3xl font-bold text-gray-900">
                {plans?.total_active_subscriptions || 0}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">ARPA Médio</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(arpa)}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <Building className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Empresas Ativas</p>
              <p className="text-3xl font-bold text-gray-900">
                {activeCompanies}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Ativação</p>
              <p className="text-3xl font-bold text-gray-900">
                {activationRate.toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-8">
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              Planos disponíveis: <strong className="text-gray-900">{plans?.total_plans || 0}</strong>
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              Empresas totais: <strong className="text-gray-900">{totalCompanies}</strong>
            </span>
            {plans?.message && (
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                {plans.message}
              </span>
            )}
          </div>

          {totalActiveSubs === 0 && (
            <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-gray-600">
                Nenhuma assinatura ativa ainda. Assim que você vincular empresas a um plano pago,
                o MRR e a receita por plano aparecerão aqui.
              </p>
            </div>
          )}

          {!hasPlans && (
            <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
              <p className="font-semibold">Planos não carregados</p>
              <p className="text-sm mt-1">
                Execute o seed de planos para popular a base e habilitar métricas comerciais.
              </p>
            </div>
          )}

          {/* Grid de Planos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans?.plans.map((plan: PlanData) => {
              const planKey = plan.id?.toUpperCase() || 'DEFAULT'
              const style = planStyles[planKey] || planStyles.DEFAULT
              const highlightLabel = plan.highlight_label || null

              return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-lg cursor-pointer ${style.border} ${
                  highlightLabel ? 'relative' : ''
                }`}
                onClick={() => loadPlanDetails(plan.id)}
              >
                {highlightLabel && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className={`${style.badge} text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md`}>
                      <Star className="w-3 h-3 fill-white" />
                      {highlightLabel}
                    </span>
                  </div>
                )}

                <div className="p-6">
                  {/* Header do Plano */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">
                      {plan.name}
                    </h3>
                    {plan.description && (
                      <p className="text-xs text-gray-500 mb-3">
                        {plan.description}
                      </p>
                    )}
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        {formatCurrency(plan.price)}
                      </span>
                      <span className="text-gray-600 text-sm">/mês</span>
                    </div>
                    {plan.trial_days > 0 && (
                      <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {plan.trial_days} dias grátis
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.length > 0 ? (
                      plan.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">Sem features cadastradas</div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600">Assinaturas</span>
                      <span className="font-bold text-gray-900">
                        {plan.stats.active_subscriptions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">MRR</span>
                      <span className="font-bold text-green-600">
                        R$ {plan.stats.mrr.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Botão */}
                  <button
                    className={`w-full mt-6 py-3 rounded-lg font-semibold transition-all bg-gradient-to-r ${style.button} text-white hover:shadow-lg`}
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
              )
            })}
          </div>

          {/* Modal de Detalhes do Plano */}
          {showDetails && selectedPlan && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedPlan.name}</h2>
                      <p className="text-gray-600 mt-1">
                        R$ {selectedPlan.price.toFixed(2)}/mês
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Estatísticas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Assinaturas Ativas</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {selectedPlan.active_subscriptions}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-3 rounded-lg">
                          <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">MRR deste Plano</p>
                          <p className="text-2xl font-bold text-gray-900">
                            R$ {selectedPlan.mrr.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Empresas usando este plano */}
                  {selectedPlan.companies && selectedPlan.companies.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Empresas com este Plano ({selectedPlan.companies.length})
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedPlan.companies.map((company: any) => (
                          <Link key={company.id} href={`/saas-admin/companies/${company.id}`}>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                              <div>
                                <p className="font-semibold text-gray-900">{company.name}</p>
                                <p className="text-xs text-gray-500">@{company.slug}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Membro desde</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {new Date(company.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPlan.companies && selectedPlan.companies.length === 0 && (
                    <div className="text-center py-8">
                      <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma empresa usando este plano ainda</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

