'use client'

import { useCallback, useEffect, useState } from 'react'
import { appointmentService, serviceService, userService, clientService, commandService } from '@/services/api'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, X, AlertCircle, RefreshCw, ChevronDown, Check } from 'lucide-react'
import { toast } from 'sonner'
import { showAppointmentToast, showAppointmentUpdatedToast } from '@/utils/toastHelpers'
import { agendaAdapter } from '@/services/agendaAdapter'

interface AppointmentFormProps {
  appointment?: any
  settings?: {
    filterProfessionalsByService?: boolean
  }
  onClose: () => void
  onSuccess: () => void
}

export default function AppointmentForm({ appointment, settings, onClose, onSuccess }: AppointmentFormProps) {
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [services, setServices] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [selectedService, setSelectedService] = useState<any>(null)
  const [conflicts, setConflicts] = useState<any[]>([])

  const [colors, setColors] = useState<any[]>([])
  const [status, setStatus] = useState<string>(appointment?.status || 'confirmed')
  const [selectedColorId, setSelectedColorId] = useState<string>('')

  const [clientSearch, setClientSearch] = useState('')
  const [clientResults, setClientResults] = useState<any[]>([])
  const [showClientResults, setShowClientResults] = useState(false)

  const initialDate = appointment?.start_time ? new Date(appointment.start_time) : new Date()
  const [selectedDay, setSelectedDay] = useState<Date>(new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate()))
  const [selectedTime, setSelectedTime] = useState<string>(appointment?.start_time ? new Date(appointment.start_time).toISOString().slice(11, 16) : '')
  const [showDatePicker, setShowDatePicker] = useState(false)
  
  const [formData, setFormData] = useState({
    service_id: appointment?.service_id || '',
    professional_id: appointment?.professional_id || '',
    client_id: appointment?.client_crm_id || appointment?.client_id || '',
    client_notes: appointment?.client_notes || '',
    resource_id: appointment?.resource_id || null,
  })
  
  const [sendReminder, setSendReminder] = useState(true)
  const [forceFit, setForceFit] = useState(false)
  const [recurrence, setRecurrence] = useState('none')
  const [recurrenceCount, setRecurrenceCount] = useState(4)

  const [reloadKey, setReloadKey] = useState(0)

  const requestClose = useCallback(() => {
    setDrawerOpen(false)
    setTimeout(() => onClose(), 220)
  }, [onClose])

  useEffect(() => {
    setDrawerOpen(true)
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [requestClose])

  useEffect(() => {
    loadData()
  }, [reloadKey])

  useEffect(() => {
    const shouldFilter = Boolean(settings?.filterProfessionalsByService)

    // Se não filtra ou o serviço foi removido, volta para lista completa
    if (!shouldFilter || !formData.service_id) {
      userService
        .getProfessionals()
        .then((res) => setProfessionals(res.data || []))
        .catch(() => {
          // ignore
        })
      return
    }

    const loadProfessionalsForService = async () => {
      try {
        const res = await userService.getAvailableProfessionals({ service_id: parseInt(formData.service_id) })
        setProfessionals(res.data || [])
      } catch {
        // fallback: mantém lista completa
      }
    }

    loadProfessionalsForService()
  }, [formData.service_id, settings?.filterProfessionalsByService])

  useEffect(() => {
    if (formData.service_id && formData.professional_id && selectedTime) {
      checkConflicts()
    }
  }, [formData.service_id, formData.professional_id, selectedTime, selectedDay])

  useEffect(() => {
    const id = setTimeout(async () => {
      const q = clientSearch.trim()
      if (!q) {
        setClientResults([])
        return
      }
      try {
        const res = await clientService.list({ search: q, limit: 20 })
        setClientResults(res.data || [])
      } catch {
        setClientResults([])
      }
    }, 250)

    return () => clearTimeout(id)
  }, [clientSearch])

  const loadData = async () => {
    try {
      const [servicesRes, professionalsRes, clientsRes] = await Promise.all([
        serviceService.list(),
        userService.getProfessionals(),
        clientService.list({ limit: 500 })
      ])
      setServices(servicesRes.data || [])
      setProfessionals(professionalsRes.data || [])
      setClients(clientsRes.data || [])

      try {
        const colorsData = await agendaAdapter.listColors()
        setColors(colorsData || [])
        if (appointment?.status) {
          const match = (colorsData || []).find((c: any) => c.statusKey === appointment.status)
          if (match?.id) setSelectedColorId(match.id)
        }
      } catch {
        setColors([])
      }
      
      if (appointment?.service_id) {
        const service = servicesRes.data.find((s: any) => s.id === appointment.service_id)
        setSelectedService(service)
      }
    } catch (error) {
      toast.error('Erro ao carregar dados')
    }
  }

  const buildStartTimeIso = () => {
    if (!selectedDay || !selectedTime) return null
    const [hh, mm] = selectedTime.split(':').map((v) => parseInt(v, 10))
    const dt = new Date(selectedDay)
    dt.setHours(hh, mm, 0, 0)
    return dt.toISOString()
  }

  const checkConflicts = async () => {
    const startIso = buildStartTimeIso()
    if (!formData.professional_id || !startIso) return
    
    try {
      const service = services.find((s: any) => s.id === parseInt(formData.service_id))
      if (!service) return
      
      const startTime = new Date(startIso)
      
      const response = await appointmentService.checkConflicts({
        professional_id: parseInt(formData.professional_id),
        start_time: startTime.toISOString(),
        duration_minutes: service.duration_minutes,
        ...(appointment?.id && { exclude_appointment_id: appointment.id })
      })

      setConflicts(response.data?.conflicts || [])
    } catch (error) {
      // Ignore errors
    }
  }

  const handleServiceChange = (serviceId: string) => {
    const service = services.find((s: any) => s.id === parseInt(serviceId))
    setSelectedService(service)
    setFormData({ ...formData, service_id: serviceId })
  }

  const handleColorChange = (colorId: string) => {
    setSelectedColorId(colorId)
    if (!colorId) return
    const color = colors.find((c: any) => c.id === colorId)
    if (color?.statusKey) {
      setStatus(color.statusKey)
    }
  }

  const handleSelectClient = (client: any) => {
    setFormData({ ...formData, client_id: String(client.id) })
    setClientSearch(client.full_name)
    setShowClientResults(false)
  }

  const createComanda = async (appointmentId: number) => {
    try {
      const appointmentRes = await appointmentService.get(appointmentId)
      const appointmentData = appointmentRes.data
      const service = services.find((s: any) => s.id === appointmentData.service_id)

      const response = await commandService.create({
        client_id: appointmentData.client_crm_id,
        appointment_id: appointmentId,
        professional_id: appointmentData.professional_id,
        date: appointmentData.start_time,
        items: [{
          item_type: 'service',
          service_id: appointmentData.service_id,
          professional_id: appointmentData.professional_id,
          quantity: 1,
          unit_value: service?.price || 0,
          commission_percentage: service?.commission_rate || 0
        }]
      })

      const command = response.data
      toast.success(`Comanda #${command.number} criada com sucesso!`)
      return command
    } catch (error) {
      console.error('Erro ao criar comanda:', error)
      toast.error('Erro ao criar comanda')
      throw error
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (conflicts.length > 0 && !forceFit) {
      toast.error('Existem conflitos de horário. Por favor, escolha outro horário.')
      return
    }
    
    setLoading(true)
    try {
      const startIso = buildStartTimeIso()
      if (!startIso) {
        toast.error('Selecione data e horário')
        return
      }

      const submitData: any = {
        ...formData,
        service_id: parseInt(formData.service_id),
        professional_id: parseInt(formData.professional_id),
        client_id: formData.client_id ? parseInt(formData.client_id) : null,
        start_time: startIso,
        force_overlap: forceFit, // Permite encaixar agendamento mesmo com conflito
      }

      // Persistência simples da "cor" (enquanto não existir campo próprio no backend)
      if (selectedColorId) {
        const selectedColor = colors.find((c: any) => c.id === selectedColorId)
        const colorName = selectedColor?.name || 'Cor'
        submitData.internal_notes = `${submitData.internal_notes ? submitData.internal_notes + '\n' : ''}COR: ${colorName}`
      }
      
      let appointmentResponse: any
      
      if (appointment) {
        appointmentResponse = await appointmentService.update(appointment.id, submitData)

        if (status && status !== appointment.status) {
          await appointmentService.update(appointment.id, { status })
        }
        
        // Buscar dados do profissional e serviço para o toast
        const professional = professionals.find((p: any) => p.id === parseInt(formData.professional_id))
        const service = services.find((s: any) => s.id === parseInt(formData.service_id))
        const appointmentDate = new Date(startIso)
        
        showAppointmentUpdatedToast({
          date: appointmentDate,
          time: appointmentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          professionalName: professional?.full_name,
          serviceName: service?.name,
        })
      } else {
        appointmentResponse = await appointmentService.create(submitData)

        if (status && status !== 'pending' && status !== 'confirmed') {
          try {
            await appointmentService.update(appointmentResponse.data.id, { status })
          } catch {
            // ignore
          }
        }
        
        // Buscar dados do profissional e serviço para o toast
        const professional = professionals.find((p: any) => p.id === parseInt(formData.professional_id))
        const service = services.find((s: any) => s.id === parseInt(formData.service_id))
        const appointmentDate = new Date(startIso)
        
        showAppointmentToast({
          date: appointmentDate,
          time: appointmentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          professionalName: professional?.full_name,
          serviceName: service?.name,
        })
      }
      
      onSuccess()
      requestClose()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar agendamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={requestClose}
      />

      <div
        className={`absolute inset-y-0 right-0 w-full max-w-3xl bg-white shadow-2xl transition-transform duration-200 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{appointment ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
          <button onClick={requestClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <label className="block text-sm font-medium mb-2">Cliente</label>
              <div className="relative">
                <input
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value)
                    setShowClientResults(true)
                    if (!e.target.value) {
                      setFormData({ ...formData, client_id: '' })
                    }
                  }}
                  onFocus={() => setShowClientResults(true)}
                  placeholder="Busque por um cliente"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                {clientSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setClientSearch('')
                      setFormData({ ...formData, client_id: '' })
                      setClientResults([])
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {showClientResults && (clientSearch.trim().length > 0) && (
                <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-64 overflow-auto">
                  {(clientResults.length > 0 ? clientResults : clients
                    .filter((c: any) => c.full_name?.toLowerCase().includes(clientSearch.toLowerCase()))
                    .slice(0, 20)
                  ).map((client: any) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleSelectClient(client)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{client.full_name}</div>
                        <div className="text-xs text-gray-600">{client.email || client.phone || 'Sem contato'}</div>
                      </div>
                      {String(formData.client_id) === String(client.id) && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {showClientResults && clientSearch.trim().length === 0 && (
                <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-64 overflow-auto">
                  {clients.slice(0, 20).map((client: any) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleSelectClient(client)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{client.full_name}</div>
                        <div className="text-xs text-gray-600">{client.email || client.phone || 'Sem contato'}</div>
                      </div>
                      {String(formData.client_id) === String(client.id) && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setReloadKey(prev => prev + 1)}
                  className="text-primary hover:text-primary/80 text-sm inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Atualizar clientes
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="confirmed">Confirmado</option>
                <option value="pending">Pendente</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDatePicker((v) => !v)}
                  className="w-full px-4 py-2 border rounded-lg flex items-center justify-between"
                >
                  <span className="inline-flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {format(selectedDay, 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                {showDatePicker && (
                  <div className="absolute z-50 mt-2 bg-white border rounded-lg shadow-lg p-3">
                    <DayPicker
                      mode="single"
                      selected={selectedDay}
                      onSelect={(d) => {
                        if (d) setSelectedDay(d)
                        setShowDatePicker(false)
                      }}
                      numberOfMonths={1}
                      locale={ptBR}
                      className="p-2"
                      classNames={{
                        months: 'flex flex-col',
                        month: 'space-y-3',
                        caption: 'flex justify-between items-center px-1',
                        caption_label: 'text-sm font-semibold text-gray-900',
                        nav: 'flex items-center gap-1',
                        nav_button: 'h-8 w-8 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center',
                        table: 'w-full border-collapse',
                        head_row: 'flex',
                        head_cell: 'w-9 text-[11px] font-medium text-gray-500 text-center',
                        row: 'flex w-full mt-1',
                        cell: 'w-9 h-9 text-center text-sm p-0 relative',
                        day: 'w-9 h-9 rounded-md hover:bg-gray-100 aria-selected:bg-primary aria-selected:text-white focus:outline-none',
                        day_selected: 'bg-primary text-white hover:bg-primary/90',
                        day_today: 'border border-primary/40',
                        day_outside: 'text-gray-300 opacity-60',
                        day_disabled: 'text-gray-300 opacity-50',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hora</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cor</label>
              <select
                value={selectedColorId}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Padrão</option>
                {colors.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Além deste, repetir mais</label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="none">Agendamento não se repete</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensalmente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Quantidade</label>
              <input
                type="number"
                min={1}
                max={30}
                value={recurrenceCount}
                onChange={(e) => setRecurrenceCount(parseInt(e.target.value || '1', 10))}
                className="w-full px-4 py-2 border rounded-lg"
                disabled={recurrence === 'none'}
              />
            </div>
          </div>

          <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
            <div className="text-sm font-semibold text-gray-900">Itens do agendamento</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
                <select
                  value={formData.service_id}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {services.map((service: any) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Profissional</label>
                <select
                  value={formData.professional_id}
                  onChange={(e) => setFormData({ ...formData, professional_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Selecione</option>
                  {professionals.map((prof: any) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Duração</label>
                <div className="w-full px-3 py-2 border rounded-lg bg-white text-sm text-gray-700">
                  {selectedService?.duration_minutes ? `${selectedService.duration_minutes} min` : '—'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center justify-between gap-3 bg-white border rounded-lg px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Enviar lembrete</div>
                  <div className="text-xs text-gray-600">Notificar o cliente sobre o agendamento</div>
                </div>
                <span className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    checked={sendReminder}
                    onChange={(e) => setSendReminder(e.target.checked)}
                    className="sr-only peer"
                  />
                  <span className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></span>
                </span>
              </label>

              <label className="flex items-center justify-between gap-3 bg-white border rounded-lg px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Encaixar agendamento</div>
                  <div className="text-xs text-gray-600">Forçar mesmo com conflito</div>
                </div>
                <span className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    checked={forceFit}
                    onChange={(e) => setForceFit(e.target.checked)}
                    className="sr-only peer"
                  />
                  <span className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></span>
                </span>
              </label>
            </div>
          </div>

          {/* Conflicts Warning */}
          {conflicts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 mb-2">Conflito de Horário Detectado!</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {conflicts.map((conflict: any) => (
                      <li key={conflict.id}>
                        • {conflict.client_name} - {conflict.service_name} ({new Date(conflict.start_time).toLocaleString('pt-BR')})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Observações do Cliente
            </label>
            <textarea
              value={formData.client_notes}
              onChange={(e) => setFormData({ ...formData, client_notes: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={3}
              placeholder="Observações, preferências, etc."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={requestClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={async () => {
                try {
                  setLoading(true)
                  const startIso = buildStartTimeIso()
                  if (!startIso) {
                    toast.error('Selecione data e horário')
                    return
                  }

                  let appointmentId = appointment?.id

                  if (!appointmentId) {
                    const submitData = {
                      ...formData,
                      service_id: parseInt(formData.service_id),
                      professional_id: parseInt(formData.professional_id),
                      client_id: formData.client_id ? parseInt(formData.client_id) : null,
                      start_time: startIso,
                    }
                    const created = await appointmentService.create(submitData)
                    appointmentId = created.data.id
                  } else {
                    await appointmentService.update(appointmentId, {
                      ...formData,
                      service_id: parseInt(formData.service_id),
                      professional_id: parseInt(formData.professional_id),
                      client_id: formData.client_id ? parseInt(formData.client_id) : null,
                      start_time: startIso,
                    })
                  }

                  await createComanda(appointmentId)
                  onSuccess()
                  requestClose()
                } catch (err: any) {
                  toast.error(err?.response?.data?.detail || 'Erro ao criar comanda')
                } finally {
                  setLoading(false)
                }
              }}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={loading || (conflicts.length > 0 && !forceFit)}
            >
              Criar comanda
            </button>

            <button
              type="submit"
              className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
              disabled={loading || (conflicts.length > 0 && !forceFit)}
            >
              {loading ? 'Salvando...' : appointment ? 'Atualizar' : 'Criar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

