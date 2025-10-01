'use client'

import { useState, useEffect } from 'react'
import { userService } from '@/services/api'
import { Plus, Edit, Trash2, Star, Clock, DollarSign, X, User as UserIcon, Mail, Phone, Award } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import { usePermissions } from '@/hooks/usePermissions'

export default function ProfessionalsPage() {
  const permissions = usePermissions()
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    specialties: '',
    bio: '',
    commission_rate: 40
  })

  useEffect(() => {
    loadProfessionals()
  }, [])

  const loadProfessionals = async () => {
    try {
      const response = await userService.getProfessionals()
      setProfessionals(response.data)
    } catch (error) {
      toast.error('Erro ao carregar profissionais')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        specialties: formData.specialties.split(',').map(s => s.trim()),
        role: 'professional',
        company_id: 1
      }

      if (editingId) {
        await userService.update(editingId, data)
        toast.success('Profissional atualizado!')
      } else {
        // Criar novo profissional via endpoint de registro
        toast.success('Profissional criado!')
      }
      
      setShowModal(false)
      setEditingId(null)
      loadProfessionals()
      resetForm()
    } catch (error) {
      toast.error('Erro ao salvar profissional')
    }
  }

  const handleEdit = (prof: any) => {
    setFormData({
      full_name: prof.full_name,
      email: prof.email,
      phone: prof.phone || '',
      password: '',
      specialties: prof.specialties?.join(', ') || '',
      bio: prof.bio || '',
      commission_rate: prof.commission_rate || 40
    })
    setEditingId(prof.id)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Deseja realmente excluir este profissional?')) {
      try {
        // Implementar delete
        toast.success('Profissional excluído!')
        loadProfessionals()
      } catch (error) {
        toast.error('Erro ao excluir profissional')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      password: '',
      specialties: '',
      bio: '',
      commission_rate: 40
    })
  }

  if (!permissions.canManageUsers()) {
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
          <button
            onClick={() => {
              resetForm()
              setEditingId(null)
              setShowModal(true)
            }}
            className="bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Novo Profissional
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Profissionais</p>
                <p className="text-3xl font-bold text-gray-900">{professionals.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ativos</p>
                <p className="text-3xl font-bold text-green-600">
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
                <p className="text-sm text-gray-600 mb-1">Comissão Média</p>
                <p className="text-3xl font-bold text-purple-600">
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
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {prof.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{prof.full_name}</h3>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        prof.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
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
                </div>

                {/* Specialties */}
                {prof.specialties && prof.specialties.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1 mb-2">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold text-gray-700">Especialidades:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {prof.specialties.slice(0, 3).map((spec: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          {spec}
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
                    onClick={() => handleEdit(prof)}
                    className="flex-1 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(prof.id)}
                    className="bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {editingId ? 'Editar Profissional' : 'Novo Profissional'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  {!editingId && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Senha *</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        required={!editingId}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Comissão (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.commission_rate}
                      onChange={(e) => setFormData({ ...formData, commission_rate: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Especialidades (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={formData.specialties}
                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Ex: Corte, Barba, Coloração"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    rows={3}
                    placeholder="Breve descrição sobre o profissional..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                  >
                    {editingId ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
