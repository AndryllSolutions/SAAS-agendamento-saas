'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Star, Clock, DollarSign, User as UserIcon, Mail, Phone, Award, Calendar, BarChart3, MapPin, Search } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import { usePermissions } from '@/hooks/usePermissions'
import ProfessionalForm from '@/components/ProfessionalForm'

export default function ProfessionalsPage() {
  const permissions = usePermissions()
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null)

  const getFullImageUrl = (url: string | undefined | null): string | null => {
    if (!url) return null

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://72.62.138.239'
    const baseUrl = apiUrl.replace('/api/v1', '')
    const path = url.startsWith('/') ? url : `/${url}`
    return `${baseUrl}${path}`
  }

  useEffect(() => {
    loadProfessionals()
  }, [pagination.page, searchTerm, isActiveFilter])

  const loadProfessionals = async () => {
    try {
      setLoading(true)
      const { professionalService } = await import('@/services/api')
      
      // Calculate skip for pagination
      const skip = (pagination.page - 1) * pagination.limit
      
      // Build params object
      const params: any = {
        skip,
        limit: pagination.limit
      }
      
      // Add search term if exists
      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      }
      
      // Add active filter if set
      if (isActiveFilter !== null) {
        params.is_active = isActiveFilter
      }
      
      const response = await professionalService.list(params)
      setProfessionals(response.data)
      
      // Update pagination info if available
      if (response.headers && response.headers['x-total-count']) {
        const total = parseInt(response.headers['x-total-count'])
        setPagination(prev => ({
          ...prev,
          total,
          totalPages: Math.ceil(total / prev.limit)
        }))
      }
    } catch (error) {
      toast.error('Erro ao carregar profissionais')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (prof: any) => {
    setSelectedProfessional(prof)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este profissional?')) {
      return
    }

    try {
      const { professionalService } = await import('@/services/api')
      await professionalService.delete(id)
      toast.success('Profissional excluído!')
      loadProfessionals()
    } catch (error) {
      toast.error('Erro ao excluir profissional')
    }
  }

  const handleSuccess = () => {
    loadProfessionals()
    setShowModal(false)
    setSelectedProfessional(null)
  }

  // Check permissions
  if (!permissions.canAccessProfessionals) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Profissionais
            </h1>
            <p className="text-gray-600 mt-1">Gerencie sua equipe de profissionais</p>
          </div>
          {permissions.canCreateProfessionals && (
            <button
              onClick={() => {
                setSelectedProfessional(null)
                setShowModal(true)
              }}
              className="bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Novo Profissional
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Profissionais</p>
                <p className="text-2xl font-bold text-gray-900">{professionals.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profissionais Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {professionals.filter((p: any) => p.is_active).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Star className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Comissão Média</p>
                <p className="text-2xl font-bold text-purple-600">
                  {professionals.length > 0 
                    ? Math.round(
                        professionals.reduce((sum: number, p: any) => sum + (p.commission_rate || 0), 0) / 
                        professionals.length
                      )
                    : 0}%
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
                  }}
                  placeholder="Nome ou email..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={isActiveFilter === null ? 'all' : isActiveFilter ? 'active' : 'inactive'}
                onChange={(e) => {
                  const value = e.target.value
                  setIsActiveFilter(value === 'all' ? null : value === 'active')
                  setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
                }}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Itens por página</label>
              <select
                value={pagination.limit}
                onChange={(e) => {
                  setPagination(prev => ({ 
                    ...prev, 
                    limit: parseInt(e.target.value),
                    page: 1 // Reset to first page
                  }))
                }}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value={6}>6 itens</option>
                <option value={12}>12 itens</option>
                <option value={24}>24 itens</option>
                <option value={48}>48 itens</option>
              </select>
            </div>
          </div>
        </div>

        {/* Professionals Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((prof: any) => (
              <div key={prof.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getFullImageUrl(prof.avatar_url) ? (
                      <img
                        src={getFullImageUrl(prof.avatar_url)!}
                        alt={prof.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {prof.full_name?.charAt(0) || 'P'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{prof.full_name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        prof.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {prof.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{prof.email}</span>
                  </div>
                  {prof.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{prof.phone}</span>
                    </div>
                  )}
                  {prof.cpf_cnpj && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserIcon className="w-4 h-4" />
                      <span>CPF/CNPJ: {prof.cpf_cnpj}</span>
                    </div>
                  )}
                  {prof.date_of_birth && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Nasc: {new Date(prof.date_of_birth).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  {(prof.city || prof.state) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{prof.city}{prof.city && prof.state && ', '}{prof.state}</span>
                    </div>
                  )}
                </div>

                {/* Specialties */}
                {prof.specialties && prof.specialties.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1 mb-2">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold text-gray-700">Especialidades:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {prof.specialties.slice(0, 3).map((specialty: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          {specialty}
                        </span>
                      ))}
                      {prof.specialties.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{prof.specialties.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Working Hours */}
                {prof.working_hours && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1 mb-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold text-gray-700">Horários:</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {Object.entries(prof.working_hours)
                        .filter(([_, hours]: [string, any]) => hours.enabled)
                        .slice(0, 3)
                        .map(([day, hours]: [string, any]) => (
                          <div key={day} className="capitalize">
                            {day}: {hours.start} - {hours.end}
                          </div>
                        ))}
                      {Object.entries(prof.working_hours).filter(([_, hours]: [string, any]) => hours.enabled).length > 3 && (
                        <div className="text-gray-400">+ dias...</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {prof.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{prof.bio}</p>
                )}

                {/* Commission */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mb-4">
                  <span className="text-sm text-gray-600">Comissão</span>
                  <span className="text-lg font-bold text-primary">{prof.commission_rate || 0}%</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => window.location.href = `/professionals/${prof.id}/schedule`}
                    className="flex-1 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                    title="Ver Agenda"
                  >
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Agenda</span>
                  </button>
                  <button
                    onClick={() => window.location.href = `/professionals/${prof.id}/statistics`}
                    className="flex-1 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                    title="Ver Estatísticas"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm">Estatísticas</span>
                  </button>
                  {permissions.canEditProfessionals && (
                    <button
                      onClick={() => handleEdit(prof)}
                      className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {permissions.canDeleteProfessionals && (
                    <button
                      onClick={() => handleDelete(prof.id)}
                      className="bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Mostrando {professionals.length} de {pagination.total} profissionais
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    } else {
                      pageNum = pagination.page - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`w-8 h-8 rounded-lg text-sm ${
                          pagination.page === pageNum
                            ? 'bg-primary text-white'
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
        )}
        
        {/* Modal */}
        {showModal && (
          <ProfessionalForm
            professional={selectedProfessional}
            onClose={() => {
              setShowModal(false)
              setSelectedProfessional(null)
            }}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
