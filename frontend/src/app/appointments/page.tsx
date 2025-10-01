'use client'

import { useState, useEffect } from 'react'
import { appointmentService, serviceService, userService } from '@/services/api'
import { Calendar, Clock, User, Plus, X, XCircle, Filter, Search, Grid, List, CheckCircle, AlertCircle, Ban } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import { usePermissions } from '@/hooks/usePermissions'

export default function AppointmentsPage() {
  const permissions = usePermissions()
  const [appointments, setAppointments] = useState([])
  const [services, setServices] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    service_id: '',
    professional_id: '',
    start_time: '',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [aptsRes, servicesRes, profsRes] = await Promise.all([
        appointmentService.list(),
        serviceService.list(),
        userService.getProfessionals()
      ])
      setAppointments(aptsRes.data)
      setServices(servicesRes.data)
      setProfessionals(profsRes.data)
    } catch (error) {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await appointmentService.create(formData)
      toast.success('Agendamento criado!')
      setShowModal(false)
      loadData()
      setFormData({ service_id: '', professional_id: '', start_time: '', notes: '' })
    } catch (error) {
      toast.error('Erro ao criar agendamento')
    }
  }

  const handleCancel = async (id: number) => {
    if (confirm('Deseja cancelar este agendamento?')) {
      try {
        await appointmentService.cancel(id, 'Cancelado pelo usuário')
        toast.success('Agendamento cancelado')
        loadData()
      } catch (error) {
        toast.error('Erro ao cancelar')
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Agendado' },
      confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmado' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Concluído' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelado' },
    }
    const badge = badges[status] || badges.scheduled
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>{badge.label}</span>
  }

  const filteredAppointments = appointments.filter((apt: any) => {
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      apt.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.professional?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const statusCounts = {
    all: appointments.length,
    scheduled: appointments.filter((a: any) => a.status === 'scheduled').length,
    confirmed: appointments.filter((a: any) => a.status === 'confirmed').length,
    completed: appointments.filter((a: any) => a.status === 'completed').length,
    cancelled: appointments.filter((a: any) => a.status === 'cancelled').length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Agendamentos
            </h1>
            <p className="text-gray-600 mt-1">Gerencie seus agendamentos</p>
          </div>
          {permissions.canManageAppointments() && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Novo Agendamento
            </button>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por serviço ou profissional..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({statusCounts.all})
            </button>
            <button
              onClick={() => setFilterStatus('scheduled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'scheduled' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-1" />
              Agendados ({statusCounts.scheduled})
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'confirmed' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Confirmados ({statusCounts.confirmed})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'completed' ? 'bg-gray-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Concluídos ({statusCounts.completed})
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'cancelled' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <Ban className="w-4 h-4 inline mr-1" />
              Cancelados ({statusCounts.cancelled})
            </button>
          </div>
        </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Nenhum agendamento encontrado</p>
          <p className="text-sm text-gray-500 mt-2">Tente ajustar os filtros ou criar um novo agendamento</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-4'}>
          {filteredAppointments.map((apt: any) => (
            <div key={apt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-gradient-to-br from-primary to-purple-600 p-3 rounded-xl text-white group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{apt.service?.name || 'Serviço'}</h3>
                      {getStatusBadge(apt.status)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{new Date(apt.start_time).toLocaleString('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}</span>
                      </div>
                      {apt.professional && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span>{apt.professional.full_name}</span>
                        </div>
                      )}
                      {apt.notes && (
                        <p className="text-gray-500 text-xs mt-2 italic">"{apt.notes}"</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  ID: #{apt.id}
                </div>
                <div className="flex gap-2">
                  {apt.status === 'scheduled' && permissions.canManageAppointments() && (
                    <>
                      <button
                        className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => handleCancel(apt.id)}
                        className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Novo Agendamento</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Serviço</label>
                <select
                  value={formData.service_id}
                  onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="">Selecione</option>
                  {services.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Profissional</label>
                <select
                  value={formData.professional_id}
                  onChange={(e) => setFormData({ ...formData, professional_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="">Selecione</option>
                  {professionals.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Data e Hora</label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg"
                >
                  Criar
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