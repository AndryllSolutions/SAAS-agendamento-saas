'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { isSaasAdmin } from '@/utils/checkSaasAdmin'
import { saasAdminService } from '@/services/api'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Building2,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Power,
  PowerOff,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowLeft,
  LogIn
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function CompaniesListPage() {
  const router = useRouter()
  const { user, isAuthenticated, setAuth } = useAuthStore()
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [showActionsMenu, setShowActionsMenu] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isSaasAdmin(user)) {
      router.push('/unauthorized')
      return
    }

    loadCompanies()
  }, [isAuthenticated, user, router])

  const loadCompanies = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (search) params.search = search
      if (filter !== 'all') params.is_active = filter === 'active'

      const response = await saasAdminService.listAllCompanies(params)
      setCompanies(response.data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      toast.error('Erro ao carregar empresas')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (company: any) => {
    try {
      await saasAdminService.toggleCompanyStatus(company.id, !company.is_active)
      toast.success(`Empresa ${!company.is_active ? 'ativada' : 'desativada'} com sucesso`)
      loadCompanies()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status da empresa')
    }
  }

  const handleImpersonate = async (company: any) => {
    try {
      const response = await saasAdminService.impersonateCompany(company.id)
      const { access_token } = response.data
      
      // Salvar o novo token
      if (user) { setAuth(user, access_token, ""); }
      
      toast.success(`Entrando como ${company.name}...`)
      
      // Redirecionar para o dashboard da empresa
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } catch (error) {
      console.error('Erro ao impersonar empresa:', error)
      toast.error('Erro ao entrar na empresa')
    }
  }

  const filteredCompanies = companies.filter(company => {
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        company.name?.toLowerCase().includes(searchLower) ||
        company.email?.toLowerCase().includes(searchLower) ||
        company.slug?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const saasRole = user?.saas_role?.toUpperCase()
  const isAuthorized = saasRole === 'SAAS_OWNER' || saasRole === 'SAAS_STAFF'

  if (!isAuthenticated || !isAuthorized) {
    return null
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Gerenciar Empresas
                </h1>
                <p className="text-gray-600 mt-1">Visualize e gerencie todas as empresas do SaaS</p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou slug..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Filtros de Status */}
              <div className="flex gap-2">
                {(['all', 'active', 'inactive'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFilter(f)
                      setTimeout(loadCompanies, 100)
                    }}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      filter === f
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'Todas' : f === 'active' ? 'Ativas' : 'Inativas'}
                  </button>
                ))}
              </div>

              <button
                onClick={loadCompanies}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lista de Empresas */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma empresa encontrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className={`bg-white rounded-xl shadow-sm border ${
                    company.is_active ? 'border-gray-100' : 'border-red-200'
                  } p-6 hover:shadow-md transition-all`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Logo/Avatar */}
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl ${
                        company.is_active
                          ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                          : 'bg-gray-400'
                      }`}>
                        {company.name?.charAt(0)?.toUpperCase() || 'E'}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>
                          {company.is_active ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Ativa
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Inativa
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{company.email || '-'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Slug</p>
                            <p className="font-mono text-gray-900">{company.slug}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Telefone</p>
                            <p className="text-gray-900">{company.cellphone || company.phone || '-'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Criada em</p>
                            <p className="text-gray-900">
                              {company.created_at ? new Date(company.created_at).toLocaleDateString() : '-'}
                            </p>
                          </div>
                        </div>

                        {/* Estatísticas */}
                        {company.stats && (
                          <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {company.stats.active_users}/{company.stats.total_users} usuários ativos
                              </span>
                            </div>
                            {company.subscription && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className={`text-sm font-semibold ${
                                  company.subscription.plan_type === 'FREE' ? 'text-gray-600' :
                                  company.subscription.plan_type === 'BASIC' ? 'text-blue-600' :
                                  company.subscription.plan_type === 'PRO' ? 'text-purple-600' :
                                  'text-yellow-600'
                                }`}>
                                  Plano {company.subscription.plan_type || 'FREE'}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleImpersonate(company)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Entrar na empresa"
                      >
                        <LogIn className="w-5 h-5" />
                      </button>

                      <Link href={`/saas-admin/companies/${company.id}`}>
                        <button
                          className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </Link>

                      <button
                        onClick={() => handleToggleStatus(company)}
                        className={`p-2 rounded-lg transition-colors ${
                          company.is_active
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                        title={company.is_active ? 'Desativar' : 'Ativar'}
                      >
                        {company.is_active ? (
                          <PowerOff className="w-5 h-5" />
                        ) : (
                          <Power className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          {!loading && filteredCompanies.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              Mostrando {filteredCompanies.length} empresa(s)
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

