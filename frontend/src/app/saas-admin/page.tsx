'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { isSaasAdmin } from '@/utils/checkSaasAdmin'
import { saasAdminService } from '@/services/api'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  Shield, 
  Users, 
  Building2, 
  Settings, 
  Key,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Database,
  Server,
  Globe,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Puzzle,
  GraduationCap
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function SaasAdminPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [metrics, setMetrics] = useState<any>(null)
  const [revenue, setRevenue] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Verificar se o usuário tem permissão de saas_admin
    if (!isSaasAdmin(user)) {
      router.push('/unauthorized')
      return
    }

    loadMetrics()
  }, [isAuthenticated, user, router])

  const loadMetrics = async () => {
    try {
      const [metricsRes, revenueRes] = await Promise.all([
        saasAdminService.getMetricsOverview(),
        saasAdminService.getRevenueAnalytics(30)
      ])
      setMetrics(metricsRes.data)
      setRevenue(revenueRes.data)
    } catch (error) {
      console.error('Erro ao carregar métricas:', error)
      toast.error('Erro ao carregar métricas do SaaS')
    } finally {
      setLoading(false)
    }
  }

  const saasRole = user?.saas_role?.toUpperCase()
  const isAuthorized = saasRole === 'SAAS_OWNER' || saasRole === 'SAAS_STAFF'

  if (!isAuthenticated || !isAuthorized) {
    return null
  }

  const adminCards = [
    {
      icon: Building2,
      title: 'Gerenciar Empresas',
      description: 'Visualizar e gerenciar todas as empresas do SaaS',
      href: '/saas-admin/companies',
      color: 'bg-purple-500',
      iconColor: 'text-purple-600'
    },
    {
      icon: Users,
      title: 'Gerenciar Usuários',
      description: 'Visualizar e promover usuários do sistema',
      href: '/saas-admin/users',
      color: 'bg-blue-500',
      iconColor: 'text-blue-600'
    },
    {
      icon: DollarSign,
      title: 'Assinaturas',
      description: 'Gerenciar assinaturas e planos das empresas',
      href: '/saas-admin/subscriptions',
      color: 'bg-green-500',
      iconColor: 'text-green-600'
    },
    {
      icon: BarChart3,
      title: 'Analytics Avançado',
      description: 'Métricas e estatísticas globais do SaaS',
      href: '/saas-admin/analytics',
      color: 'bg-indigo-500',
      iconColor: 'text-indigo-600'
    },
    {
      icon: Puzzle,
      title: 'Gerenciar Add-ons',
      description: 'Gerenciar add-ons e ver métricas de receita',
      href: '/saas-admin/addons',
      color: 'bg-cyan-500',
      iconColor: 'text-cyan-600'
    },
    {
      icon: GraduationCap,
      title: 'Serviços & Consultorias',
      description: 'Gerenciar consultorias e Programa Crescer',
      href: '/saas-admin/services',
      color: 'bg-violet-500',
      iconColor: 'text-violet-600'
    },
    {
      icon: Key,
      title: 'Configurações de Notificação',
      description: 'Configurar SMTP, Twilio, WhatsApp e VAPID',
      href: '/admin/notifications-config',
      color: 'bg-orange-500',
      iconColor: 'text-orange-600'
    },
    {
      icon: Database,
      title: 'Backup e Restauração',
      description: 'Gerenciar backups do banco de dados',
      href: '#',
      color: 'bg-red-500',
      iconColor: 'text-red-600',
      comingSoon: true
    },
    {
      icon: Server,
      title: 'Status do Servidor',
      description: 'Monitorar saúde e performance do servidor',
      href: '#',
      color: 'bg-teal-500',
      iconColor: 'text-teal-600',
      comingSoon: true
    },
    {
      icon: Globe,
      title: 'Configurações Globais',
      description: 'Configurações aplicadas a todas as empresas',
      href: '#',
      color: 'bg-pink-500',
      iconColor: 'text-pink-600',
      comingSoon: true
    }
  ]

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-lg p-8 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Shield className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Painel SaaS Admin</h1>
                  <p className="text-red-100 mt-2">Gerencie configurações do sistema e administre a plataforma</p>
                </div>
              </div>
              {user && (
                <div className="text-right">
                  <p className="text-sm text-red-100">Logado como</p>
                  <p className="font-bold">{user.full_name}</p>
                  <p className="text-xs text-red-200">{saasRole}</p>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            </div>
          ) : (
            <>
              {/* Métricas Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Total de Empresas</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics?.total_companies || 0}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {metrics?.active_companies || 0} ativas
                    </span>
                    <span className="text-xs text-gray-500">
                      +{metrics?.new_companies_30d || 0} este mês
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Total de Usuários</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics?.total_users || 0}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {metrics?.active_users || 0} ativos
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">MRR (Receita Recorrente)</p>
                  <p className="text-3xl font-bold text-gray-900">
                    R$ {revenue?.current_mrr?.toFixed(2) || '0.00'}
                  </p>
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">
                      {revenue?.total_active_subscriptions || 0} assinaturas ativas
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${
                      (revenue?.churn_rate || 0) > 5 ? 'bg-red-100' : 'bg-green-100'
                    } p-3 rounded-lg`}>
                      {(revenue?.churn_rate || 0) > 5 ? (
                        <TrendingDown className="w-6 h-6 text-red-600" />
                      ) : (
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Taxa de Churn</p>
                  <p className={`text-3xl font-bold ${
                    (revenue?.churn_rate || 0) > 5 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {revenue?.churn_rate?.toFixed(1) || '0.0'}%
                  </p>
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">
                      {revenue?.churned_subscriptions || 0} cancelamentos (30d)
                    </span>
                  </div>
                </div>
              </div>

              {/* MRR por Plano */}
              {revenue && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Distribuição por Plano</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Object.entries(revenue.subscription_count_by_plan || {}).map(([plan, count]: [string, any]) => (
                      <div key={plan} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">{plan}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            plan === 'FREE' ? 'bg-gray-100 text-gray-700' :
                            plan === 'BASIC' ? 'bg-blue-100 text-blue-700' :
                            plan === 'PRO' ? 'bg-purple-100 text-purple-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {count}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          R$ {revenue.mrr_by_plan?.[plan]?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">MRR</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {adminCards.map((card, index) => {
                  const Icon = card.icon
                  const CardContent = (
                    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col ${
                      card.comingSoon ? 'opacity-75' : ''
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 ${card.color} bg-opacity-10 rounded-lg`}>
                          <Icon className={`w-6 h-6 ${card.iconColor}`} />
                        </div>
                        {card.comingSoon && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            Em breve
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                      <p className="text-sm text-gray-600 flex-1">{card.description}</p>
                      {!card.comingSoon && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <span className="text-sm text-red-600 font-medium">Acessar →</span>
                        </div>
                      )}
                    </div>
                  )

                  if (card.comingSoon || card.href === '#') {
                    return (
                      <div key={index} className="relative">
                        {CardContent}
                      </div>
                    )
                  }

                  return (
                    <Link key={index} href={card.href}>
                      {CardContent}
                    </Link>
                  )
                })}
              </div>

              {/* Alert Section */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-2">⚠️ Aviso Importante</h3>
                    <p className="text-amber-800 text-sm">
                      Você está acessando o painel administrativo do SaaS. Alterações aqui podem afetar <strong>todas as empresas e usuários</strong> da plataforma. 
                      Use com cuidado e sempre verifique as configurações antes de salvar.
                    </p>
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
