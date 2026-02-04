'use client'

import { useState, useEffect } from 'react'
import { userService } from '@/services/api'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  Mail, 
  Phone, 
  Calendar,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: number
  full_name: string
  email: string
  phone?: string
  role: string
  is_active: boolean
  created_at: string
  last_login?: string
  avatar_url?: string
}

const roleOptions = [
  { value: 'client', label: 'Cliente', color: 'bg-gray-500' },
  { value: 'professional', label: 'Profissional', color: 'bg-blue-500' },
  { value: 'receptionist', label: 'Recepcionista', color: 'bg-green-500' },
  { value: 'manager', label: 'Gerente', color: 'bg-purple-500' },
  { value: 'finance', label: 'Financeiro', color: 'bg-orange-500' },
  { value: 'admin', label: 'Admin', color: 'bg-red-500' },
  { value: 'saas_admin', label: 'SaaS Admin', color: 'bg-red-600' },
  { value: 'owner', label: 'Proprietário', color: 'bg-purple-600' }
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'professional',
    password: '',
    is_active: true
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await userService.list()
      setUsers(response.data || [])
    } catch (error) {
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      await userService.createClient(formData)
      toast.success('Usuário criado com sucesso!')
      setShowCreateModal(false)
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        role: 'professional',
        password: '',
        is_active: true
      })
      loadUsers()
    } catch (error) {
      toast.error('Erro ao criar usuário')
    }
  }

  const handleUpdateUser = async (userId: number, updates: Partial<User>) => {
    try {
      await userService.update(userId, updates)
      toast.success('Usuário atualizado com sucesso!')
      setEditingUser(null)
      loadUsers()
    } catch (error) {
      toast.error('Erro ao atualizar usuário')
    }
  }

  const handleToggleStatus = async (userId: number, isActive: boolean) => {
    try {
      await userService.update(userId, { is_active: !isActive })
      toast.success(`Usuário ${!isActive ? 'ativado' : 'desativado'} com sucesso!`)
      loadUsers()
    } catch (error) {
      toast.error('Erro ao alterar status do usuário')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    // TODO: Implementar método delete no userService
    // if (!confirm('Tem certeza que deseja excluir este usuário?')) return
    
    // try {
    //   await userService.delete(userId)
    //   toast.success('Usuário excluído com sucesso!')
    //   loadUsers()
    // } catch (error) {
    //   toast.error('Erro ao excluir usuário')
    // }
    toast.info('Função de exclusão não implementada ainda')
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !selectedRole || user.role === selectedRole
    const matchesStatus = showInactive || user.is_active
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleInfo = (role: string) => {
    return roleOptions.find(r => r.value === role) || roleOptions[0]
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
              <p className="text-gray-600">Administre funções e permissões dos usuários</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <UserPlus className="w-4 h-4" />
              Novo Usuário
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todas as Funções</option>
              {roleOptions.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Mostrar inativos</span>
            </label>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Função
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Desde
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const roleInfo = getRoleInfo(user.role)
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 mt-1">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {editingUser?.id === user.id ? (
                          <select
                            value={editingUser.role}
                            onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary"
                          >
                            {roleOptions.map(role => (
                              <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Shield className={`w-4 h-4 text-white p-1 rounded ${roleInfo.color}`} />
                            <span className="text-sm font-medium text-gray-900">
                              {roleInfo.label}
                            </span>
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.is_active ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-600">Ativo</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-red-600">Inativo</span>
                            </>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {editingUser?.id === user.id ? (
                            <>
                              <button
                                onClick={() => handleUpdateUser(user.id, { role: editingUser.role })}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingUser(user)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Editar função"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(user.id, user.is_active)}
                                className={`hover:${user.is_active ? 'text-red-900' : 'text-green-900'} ${
                                  user.is_active ? 'text-orange-600' : 'text-green-600'
                                }`}
                                title={user.is_active ? 'Desativar' : 'Ativar'}
                              >
                                {user.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Criar Novo Usuário</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    {roleOptions.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateUser}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Criar Usuário
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}