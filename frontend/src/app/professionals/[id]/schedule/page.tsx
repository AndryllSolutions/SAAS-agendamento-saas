'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, Clock, User, ArrowLeft, Filter, Search, Plus } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'

interface Appointment {
  id: number
  start_time: string
  end_time: string | null
  client_name: string | null
  service_name: string | null
  status: string | null
}

interface Professional {
  id: number
  name: string
  avatar_url?: string
  working_hours: any
}

interface ScheduleData {
  professional: Professional
  appointments: Appointment[]
}

export default function ProfessionalSchedulePage() {
  const params = useParams()
  const router = useRouter()
  const professionalId = params!.id as string

  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  useEffect(() => {
    loadSchedule()
  }, [professionalId, dateFilter.start, dateFilter.end])

  const loadSchedule = async () => {
    try {
      const { professionalService } = await import('@/services/api')
      const response = await professionalService.getSchedule(
        parseInt(professionalId),
        dateFilter.start,
        dateFilter.end
      )
      setScheduleData(response.data)
    } catch (error) {
      toast.error('Erro ao carregar agenda do profissional')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAppointments = scheduleData?.appointments.filter(apt => {
    const matchesSearch = !searchTerm || 
      apt.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter
    
    return matchesSearch && matchesStatus
  }) || []

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'confirmed': return 'bg-blue-100 text-blue-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'completed': return 'Concluído'
      case 'cancelled': return 'Cancelado'
      case 'confirmed': return 'Confirmado'
      case 'pending': return 'Pendente'
      default: return 'Desconhecido'
    }
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!scheduleData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Agenda não encontrada</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <div className="flex items-center gap-3">
              {scheduleData?.professional?.avatar_url ? (
                <img
                  src={scheduleData.professional.avatar_url.startsWith('http') 
                    ? scheduleData.professional.avatar_url 
                    : `https://72.62.138.239${scheduleData.professional.avatar_url}`
                  }
                  alt={scheduleData.professional.name || 'Profissional'}
                  className="w-12 h-12 rounded-full object-cover shadow-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {scheduleData?.professional?.name?.charAt(0)?.toUpperCase() || 'P'}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Agenda do Profissional
                </h1>
                <p className="text-gray-600 mt-1">{scheduleData?.professional?.name || 'Profissional'}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/appointments/new?professional_id=${professionalId}`)}
            className="bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Novo Agendamento
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data Início</label>
              <input
                type="date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Data Fim</label>
              <input
                type="date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cliente ou serviço..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-3xl font-bold text-gray-900">{filteredAppointments.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Confirmados</p>
                <p className="text-3xl font-bold text-blue-600">
                  {filteredAppointments.filter(a => a.status === 'confirmed').length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Concluídos</p>
                <p className="text-3xl font-bold text-green-600">
                  {filteredAppointments.filter(a => a.status === 'completed').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cancelados</p>
                <p className="text-3xl font-bold text-red-600">
                  {filteredAppointments.filter(a => a.status === 'cancelled').length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold">Agendamentos</h2>
          </div>
          
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum agendamento encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-lg">
                          {appointment.client_name || 'Cliente não informado'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <strong>Serviço:</strong> {appointment.service_name || 'Não informado'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Início:</strong> {formatDateTime(appointment.start_time)}
                        </p>
                        {appointment.end_time && (
                          <p className="text-sm text-gray-600">
                            <strong>Fim:</strong> {formatDateTime(appointment.end_time)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/appointments/${appointment.id}`)}
                        className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
