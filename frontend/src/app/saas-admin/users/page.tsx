'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { isSaasAdmin } from '@/utils/checkSaasAdmin'
import { saasAdminService } from '@/services/api'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Users,
  Search,
  Filter,
  Building2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Crown,
  User,
  Mail,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Star,
  RefreshCw,
  MoreVertical
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface UserData {
  id: number
  email: string
  full_name: string
  phone?: string
  role?: string
  saas_role?: string
  company_id?: number
  is_active: boolean
  is_verified: boolean
  created_at: string
  company?: {
    id: number
    name: string
  }
}

export default function SaaSUsersPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'saas_admins' | 'regular'>('all')
  const [showPromoteModal, setShowPromoteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [promoteRole, setPromoteRole] = useState<'SAAS_OWNER' | 'SAAS_STAFF'>('SAAS_STAFF')
  const [promoting, setPromoting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isSaasAdmin(user)) {
      router.push('/unauthorized')
      return
    }

    loadUsers()
  }, [isAuthenticated, user, router])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const params: any = { limit: 500 }
      if (filter === 'saas_admins') {
        params.saas_role = 'SAAS_OWNER,SAAS_STAFF'
      }

      const response = await saasAdminService.listAllUsers(params)
      setUsers(response.data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const handlePromote = async () => {
    if (!selectedUser) return

    setPromoting(true)
    try {
      await saasAdminService.promoteUserToSaaS(selectedUser.id, promoteRole)
      toast.success(`${selectedUser.full_name} promovido a ${promoteRole}`)
      setShowPromoteModal(false)
      setSelectedUser(null)
      loadUsers()
    } catch (error: any) {
      console.error('Erro ao promover usuário:', error)
      toast.error(error.response?.data?.detail || 'Erro ao promover usuário')
    } finally {
      setPromoting(false)
    }
  }

  const filteredUsers = users.filter(u => {
    // Filtro de busca
    if (search) {
      const searchLower = search.toLowerCase()
      if (
        !u.full_name?.toLowerCase().includes(searchLower) &&
        !u.email?.toLowerCase().includes(searchLower)
      ) {
        return false
      }
    }

    // Filtro de tipo
    if (filter === 'saas_admins') {
      return u.saas_role === 'SAAS_OWNER' || u.saas_role === 'SAAS_STAFF'
    }
    if (filter === 'regular') {
      return !u.saas_role
    }

    return true
  })

  const saasRole = user?.saas_role?.toUpperCase()
  const isAuthorized = saasRole === 'SAAS_OWNER' || saasRole === 'SAAS_STAFF'
  const canPromote = saasRole === 'SAAS_OWNER' // Apenas SAAS_OWNER pode promover

  if (!isAuthenticated || !isAuthorized) {
    return null
  }

  const getRoleIcon = (saasRole?: string) => {
    if (saasRole === 'SAAS_OWNER') {
      return <Crown className="w-4 h-4 text-yellow-500" />
    }
    if (saasRole === 'SAAS_STAFF') {
      return <ShieldCheck className="w-4 h-4 text-blue-500" />
    }
    return <User className="w-4 h-4 text-gray-400" />
  }

  const getRoleBadge = (saasRole?: string) => {
    if (saasRole === 'SAAS_OWNER') {
      return (
        <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
          <Crown className="w-3 h-3" />
          SaaS Owner
        </span>
      )
    }
    if (saasRole === 'SAAS_STAFF') {
      return (
        <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          SaaS Staff
        </span>
      )
    }
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
        Usuário Regular
      </span>
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Gerenciar Usuários
                </h1>
                <p className="text-gray-600 mt-1">
                  Visualize todos os usuários do SaaS e gerencie permissões globais
                </p>
              </div>
            </div>
            <button
              onClick={loadUsers}
              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              title="Recarregar"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Usuários</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">SaaS Owners</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {users.filter(u => u.saas_role === 'SAAS_OWNER').length}
                  </p>
                </div>
                <Crown className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">SaaS Staff</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {users.filter(u => u.saas_role === 'SAAS_STAFF').length}
                  </p>
                </div>
                <ShieldCheck className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.is_active).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
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
                  placeholder="Buscar por nome ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filtros de Tipo */}
              <div className="flex gap-2">
                {(['all', 'saas_admins', 'regular'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      filter === f
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'Todos' : f === 'saas_admins' ? 'SaaS Admins' : 'Regulares'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de Usuários */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role Global
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                    {canPromote && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                            {u.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {u.full_name}
                              </span>
                              {getRoleIcon(u.saas_role)}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.company_id ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="w-4 h-4" />
                            {u.company?.name || `ID: ${u.company_id}`}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(u.saas_role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {u.is_active ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Ativo
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Inativo
                            </span>
                          )}
                          {u.is_verified && (
                            <Star className="w-4 h-4 text-yellow-500" title="Verificado" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(u.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      {canPromote && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {/* Não permitir promover a si mesmo */}
                          {u.id !== user?.id && (
                            <button
                              onClick={() => {
                                setSelectedUser(u)
                                setShowPromoteModal(true)
                              }}
                              className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-medium rounded-lg hover:shadow-lg transition-all"
                            >
                              {u.saas_role ? 'Alterar' : 'Promover'}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Total */}
          {!loading && filteredUsers.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              Mostrando {filteredUsers.length} de {users.length} usuário(s)
            </div>
          )}
        </div>
      </div>

      {/* Modal de Promoção */}
      {showPromoteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Promover Usuário</h3>
                <p className="text-sm text-gray-500">Atribuir role global de SaaS</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {selectedUser.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedUser.full_name}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Selecione o Role Global
              </label>
              <div className="space-y-2">
                <label
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    promoteRole === 'SAAS_OWNER'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="SAAS_OWNER"
                    checked={promoteRole === 'SAAS_OWNER'}
                    onChange={() => setPromoteRole('SAAS_OWNER')}
                    className="sr-only"
                  />
                  <Crown className={`w-6 h-6 ${promoteRole === 'SAAS_OWNER' ? 'text-yellow-500' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">SaaS Owner</p>
                    <p className="text-xs text-gray-500">Acesso total. Pode promover outros usuários.</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    promoteRole === 'SAAS_STAFF'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="SAAS_STAFF"
                    checked={promoteRole === 'SAAS_STAFF'}
                    onChange={() => setPromoteRole('SAAS_STAFF')}
                    className="sr-only"
                  />
                  <ShieldCheck className={`w-6 h-6 ${promoteRole === 'SAAS_STAFF' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">SaaS Staff</p>
                    <p className="text-xs text-gray-500">Acesso ao painel SaaS. Não pode promover usuários.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPromoteModal(false)
                  setSelectedUser(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePromote}
                disabled={promoting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {promoting ? 'Promovendo...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

