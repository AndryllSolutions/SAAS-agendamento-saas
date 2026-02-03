'use client'

/**
 * Agenda Diária por Profissionais
 * 
 * Visualização estilo Google Calendar / Agenda de Salão
 * - Coluna fixa de horários (08:00 → 20:00)
 * - Uma coluna por profissional
 * - Cards de agendamento com altura proporcional ao tempo
 * - Linha vermelha indicando o horário atual
 */

import { useState, useEffect, useMemo, useRef, useCallback, Suspense } from 'react'
import { appointmentService, userService } from '@/services/api'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Settings, Ban, Play, SlidersHorizontal, LayoutGrid, MoreHorizontal, CheckCircle, XCircle, X, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import AppointmentForm from '@/components/AppointmentForm'
import ProfessionalForm from '@/components/ProfessionalForm'
import { AgendaSettingsDrawer } from '@/components/agenda/AgendaSettingsDrawer'
import { BlockForm } from '@/components/agenda/BlockForm'
import { agendaAdapter } from '@/services/agendaAdapter'
import { toAbsoluteImageUrl } from '@/utils/apiUrl'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import * as Dialog from '@radix-ui/react-dialog'
import FullCalendar from '@fullcalendar/react'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { EventInput } from '@fullcalendar/core'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import { DayPicker } from 'react-day-picker'
import { ptBR } from 'date-fns/locale'

// Tipos TypeScript
interface Professional {
  id: number
  full_name: string
  avatar_url?: string | null
  email?: string | null
  phone?: string | null
  cpf_cnpj?: string | null
  bio?: string | null
}

interface CalendarResource {
  id: string
  title: string
  extendedProps?: {
    avatar_url?: string | null
  }
}

interface Appointment {
  id: number
  start_time: string
  end_time: string
  service_id?: number | null
  internal_notes?: string | null
  status: 'pending' | 'confirmed' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  professional?: Professional | null
  client?: {
    id?: number
    full_name: string
    phone?: string | null
    cellphone?: string | null
  } | null
  service?: {
    id?: number
    name: string
  } | null
  professional_id?: number | null
}

type PendingReschedule = {
  appointmentId: number
  startIso: string
  professionalId?: number
  clientName: string
  professionalName: string
  dateStr: string
  timeStr: string
  revert: () => void
}

// Função helper para obter data no formato YYYY-MM-DD
const getDateKey = (date: Date = new Date()) => date.toISOString().split('T')[0]

// Cores por status
const STATUS_COLORS: Record<string, string> = {
  confirmed: '#5E7C88',
  pending: '#F2C94C',
  cancelled: '#EB5757',
  completed: '#27AE60'
}

function CalendarPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Estado da data como string para evitar re-renders
  const [currentDateStr, setCurrentDateStr] = useState(() => getDateKey())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showBlockForm, setShowBlockForm] = useState(false)
  const [settings, setSettings] = useState({ slotMinutes: 15, columnWidthMode: 'auto', defaultStatusKey: 'confirmed', showAvatars: true, filterProfessionalsByService: false, blockCancelledAppointments: true })
  const [colors, setColors] = useState<any[]>([])
  const [pendingReschedule, setPendingReschedule] = useState<PendingReschedule | null>(null)
  const [rescheduleSaving, setRescheduleSaving] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [hoveredAppointment, setHoveredAppointment] = useState<{ appointment: Appointment; rect: DOMRect } | null>(null)
  const hoverCloseTimeoutRef = useRef<number | null>(null)

  type CalendarViewKey = 'resourceTimeGridDay' | 'resourceTimeGridWeek' | 'dayGridMonth'
  const [calendarView, setCalendarView] = useState<CalendarViewKey>('resourceTimeGridDay')
  const [selectedProfessionalIds, setSelectedProfessionalIds] = useState<number[] | null>(null)
  const [selectedStatusKeys, setSelectedStatusKeys] = useState<string[]>([
    'confirmed',
    'pending',
    'checked_in',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
    'blocked'
  ])

  type CalendarOverlayStatus = 'loading' | 'saving' | 'success' | 'error'
  type CalendarOverlayState = {
    status: CalendarOverlayStatus
    title: string
    message?: string
  }
  const [calendarOverlay, setCalendarOverlay] = useState<CalendarOverlayState | null>(null)
  const overlayAutoCloseTimeoutRef = useRef<number | null>(null)
  
  // Refs para controle de estado sem causar re-render
  const fetchedDateRef = useRef<string>('')
  const isFetchingRef = useRef(false)
  const calendarRef = useRef<FullCalendar | null>(null)
  
  // Converter string para Date (memorizado)
  const currentDate = useMemo(() => new Date(currentDateStr + 'T12:00:00'), [currentDateStr])

  useEffect(() => {
    if (professionals.length === 0) return
    setSelectedProfessionalIds((prev) => {
      if (prev === null) return professionals.map((p) => p.id)
      const setPrev = new Set(prev)
      return professionals.map((p) => p.id).filter((id) => setPrev.has(id))
    })
  }, [professionals])

  useEffect(() => {
    const api = calendarRef.current?.getApi?.()
    if (!api) return
    api.changeView(calendarView)
  }, [calendarView])

  const currentSelectedProfessionalIds = useMemo(() => {
    return selectedProfessionalIds ?? professionals.map((p) => p.id)
  }, [professionals, selectedProfessionalIds])

  const toggleProfessionalFilter = useCallback(
    (id: number) => {
      setSelectedProfessionalIds((prev) => {
        const current = prev ?? professionals.map((p) => p.id)
        const exists = current.includes(id)
        return exists ? current.filter((v) => v !== id) : [...current, id]
      })
    },
    [professionals]
  )

  const selectAllProfessionals = useCallback(() => {
    setSelectedProfessionalIds(professionals.map((p) => p.id))
  }, [professionals])

  const clearProfessionals = useCallback(() => {
    setSelectedProfessionalIds([])
  }, [])

  const toggleStatusFilter = useCallback((statusKey: string) => {
    setSelectedStatusKeys((prev) => {
      const exists = prev.includes(statusKey)
      return exists ? prev.filter((v) => v !== statusKey) : [...prev, statusKey]
    })
  }, [])

  const statusOptions = useMemo(
    () => [
      { label: 'Confirmado', value: 'confirmed' },
      { label: 'Pendente', value: 'pending' },
      { label: 'Check-in', value: 'checked_in' },
      { label: 'Em andamento', value: 'in_progress' },
      { label: 'Concluído', value: 'completed' },
      { label: 'Cancelado', value: 'cancelled' },
      { label: 'Não compareceu', value: 'no_show' },
      { label: 'Bloqueado', value: 'blocked' }
    ],
    []
  )

  const clearOverlayAutoClose = useCallback(() => {
    if (overlayAutoCloseTimeoutRef.current) {
      window.clearTimeout(overlayAutoCloseTimeoutRef.current)
      overlayAutoCloseTimeoutRef.current = null
    }
  }, [])

  const closeCalendarOverlay = useCallback(() => {
    clearOverlayAutoClose()
    setCalendarOverlay(null)
  }, [clearOverlayAutoClose])

  const openCalendarOverlay = useCallback(
    (status: CalendarOverlayStatus, title: string, message?: string) => {
      clearOverlayAutoClose()
      setCalendarOverlay({ status, title, message })
    },
    [clearOverlayAutoClose]
  )

  const showCalendarOverlaySuccess = useCallback(
    (message?: string) => {
      clearOverlayAutoClose()
      setCalendarOverlay({ status: 'success', title: 'Concluído', message })
      overlayAutoCloseTimeoutRef.current = window.setTimeout(() => {
        setCalendarOverlay(null)
        overlayAutoCloseTimeoutRef.current = null
      }, 1200)
    },
    [clearOverlayAutoClose]
  )

  const showCalendarOverlayError = useCallback(
    (message?: string) => {
      clearOverlayAutoClose()
      setCalendarOverlay({ status: 'error', title: 'Erro', message })
    },
    [clearOverlayAutoClose]
  )

  // Função de fetch memorizada
  const fetchData = useCallback(async (dateStr: string, showLoading = false, options?: { suppressOverlay?: boolean }) => {
    // Evita chamadas duplicadas
    if (isFetchingRef.current) return
    const fetchKey = `${dateStr}|${calendarView}`
    if (fetchKey === fetchedDateRef.current) return

    if (!options?.suppressOverlay) {
      openCalendarOverlay('loading', 'Carregando agenda...', 'Buscando profissionais e agendamentos')
    }
    
    isFetchingRef.current = true
    if (showLoading) setLoading(true)
    
    try {
      const anchor = new Date(dateStr + 'T12:00:00')
      let start: Date
      let end: Date

      if (calendarView === 'resourceTimeGridWeek') {
        const day = anchor.getDay()
        const diffToMonday = (day + 6) % 7
        start = new Date(anchor)
        start.setDate(start.getDate() - diffToMonday)
        start.setHours(0, 0, 0, 0)
        end = new Date(start)
        end.setDate(end.getDate() + 6)
        end.setHours(23, 59, 59, 999)
      } else if (calendarView === 'dayGridMonth') {
        start = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
        start.setHours(0, 0, 0, 0)
        end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)
        end.setHours(23, 59, 59, 999)
      } else {
        start = new Date(dateStr + 'T00:00:00')
        end = new Date(dateStr + 'T23:59:59')
      }
      
      const [profsRes, aptsRes] = await Promise.all([
        userService.getProfessionals(),
        appointmentService.list({
          start_date: start.toISOString(),
          end_date: end.toISOString()
        })
      ])
      
      setProfessionals(profsRes.data || [])
      setAppointments(aptsRes.data || [])
      fetchedDateRef.current = fetchKey

      if (!options?.suppressOverlay) {
        showCalendarOverlaySuccess('Agenda carregada')
      }
    } catch (error) {
      toast.error('Erro ao carregar dados da agenda')
      console.error('Erro ao carregar agenda:', error)

      if (!options?.suppressOverlay) {
        showCalendarOverlayError('Não foi possível carregar a agenda')
      }
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [calendarView, openCalendarOverlay, showCalendarOverlayError, showCalendarOverlaySuccess])

  const handleEventDrop = useCallback(
    async (info: any) => {
      const appointment = info.event?.extendedProps?.appointment as Appointment | undefined
      const isBlock = Boolean(info.event?.extendedProps?.isBlock)
      if (!appointment || isBlock) {
        info.revert()
        return
      }

      if (pendingReschedule) {
        info.revert()
        return
      }

      const start: Date | null = info.event?.start || null
      if (!start) {
        info.revert()
        return
      }

      const resourceId = String(info.event?.getResources?.()?.[0]?.id || info.event?.getResourceId?.() || appointment.professional_id || '')
      const professionalName = professionals.find((p) => String(p.id) === resourceId)?.full_name || 'Profissional'
      const clientName = (appointment as any)?.client?.full_name || info.event?.extendedProps?.clientName || 'Cliente'
      const dateStr = start.toLocaleDateString('pt-BR')
      const timeStr = start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

      setPendingReschedule({
        appointmentId: appointment.id,
        startIso: start.toISOString(),
        professionalId: resourceId ? parseInt(resourceId, 10) : undefined,
        clientName,
        professionalName,
        dateStr,
        timeStr,
        revert: () => info.revert()
      })
    },
    [pendingReschedule, professionals]
  )

  const cancelReschedule = useCallback(() => {
    if (rescheduleSaving) return
    const pending = pendingReschedule
    setPendingReschedule(null)
    if (pending) pending.revert()
  }, [pendingReschedule, rescheduleSaving])

  const confirmReschedule = useCallback(async () => {
    if (!pendingReschedule || rescheduleSaving) return
    setRescheduleSaving(true)
    openCalendarOverlay('saving', 'Salvando...', 'Atualizando o agendamento')
    try {
      await appointmentService.update(pendingReschedule.appointmentId, {
        start_time: pendingReschedule.startIso,
        professional_id: pendingReschedule.professionalId
      })

      toast.success('Agendamento atualizado!')

      setPendingReschedule(null)
      fetchedDateRef.current = ''
      await fetchData(currentDateStr, false, { suppressOverlay: true })
      showCalendarOverlaySuccess('Agendamento atualizado')
    } catch {
      toast.error('Erro ao atualizar agendamento')
      const pending = pendingReschedule
      setPendingReschedule(null)
      pending.revert()
      showCalendarOverlayError('Não foi possível salvar a alteração')
    } finally {
      setRescheduleSaving(false)
    }
  }, [currentDateStr, fetchData, openCalendarOverlay, pendingReschedule, rescheduleSaving, showCalendarOverlayError, showCalendarOverlaySuccess])

  // Carregar configurações e cores
  useEffect(() => {
    loadSettings()
  }, [])

  // Abrir modal de novo agendamento via /calendar?new=1
  useEffect(() => {
    const shouldOpenNew = searchParams?.get('new') === '1'
    if (!shouldOpenNew) return

    setSelectedAppointment(null)
    setSelectedDate(new Date())
    setShowModal(true)

    // Limpar a query para evitar reabrir ao recarregar
    router.replace('/calendar')
  }, [router, searchParams])

  const loadSettings = async () => {
    try {
      const [settingsData, colorsData] = await Promise.all([
        agendaAdapter.getAgendaSettings(),
        agendaAdapter.listColors()
      ])
      setSettings(settingsData)
      setColors(colorsData)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  // Efeito para carregar dados quando a data muda
  useEffect(() => {
    const fetchKey = `${currentDateStr}|${calendarView}`
    if (fetchKey !== fetchedDateRef.current) {
      const isFirstLoad = fetchedDateRef.current === ''
      fetchData(currentDateStr, isFirstLoad)
    }
  }, [calendarView, currentDateStr, fetchData])

  // Resources do FullCalendar (memorizado)
  const resources: CalendarResource[] = useMemo(() => {
    const allowed = new Set(selectedProfessionalIds ?? professionals.map((p) => p.id))
    return [
      {
        id: 'unit',
        title: 'IMPERIO',
        extendedProps: { avatar_url: null }
      },
      ...professionals
        .filter((prof) => allowed.has(prof.id))
        .map((prof) => ({
          id: String(prof.id),
          title: prof.full_name,
          extendedProps: { avatar_url: toAbsoluteImageUrl(prof.avatar_url) }
        }))
    ]
  }, [professionals, selectedProfessionalIds])

  // Events do FullCalendar (memorizado)
  const events: EventInput[] = useMemo(() => {
    const allowedProfessionals = new Set(selectedProfessionalIds ?? professionals.map((p) => p.id))
    const allowedStatuses = new Set(selectedStatusKeys)

    return appointments
      .filter((apt) => apt.professional_id && allowedProfessionals.has(apt.professional_id))
      .map((apt) => {
        const professionalName = professionals.find((p) => p.id === apt.professional_id)?.full_name || 'Profissional'

        // Bloqueio (sem service_id)
        if (!apt.service_id) {
          const reason = apt.internal_notes?.replace('BLOQUEIO: ', '') || 'Bloqueio'
          const filterStatusKey = 'blocked'
          if (!allowedStatuses.has(filterStatusKey)) return null

          const title = calendarView === 'dayGridMonth' ? `${professionalName}: Ocupado` : 'Ocupado'
          return {
            id: String(apt.id),
            ...(calendarView === 'dayGridMonth' ? {} : { resourceId: String(apt.professional_id) }),
            start: apt.start_time,
            end: apt.end_time,
            title,
            backgroundColor: '#6B7280',
            borderColor: '#6B7280',
            extendedProps: {
              appointment: apt,
              isBlock: true,
              reason,
              filterStatusKey
            }
          }
        }

        // Cancelado como bloqueio (configurável)
        if (apt.status === 'cancelled' && settings.blockCancelledAppointments) {
          const filterStatusKey = 'blocked'
          if (!allowedStatuses.has(filterStatusKey)) return null
          const title = calendarView === 'dayGridMonth' ? `${professionalName}: Ocupado` : 'Ocupado'
          return {
            id: String(apt.id),
            ...(calendarView === 'dayGridMonth' ? {} : { resourceId: String(apt.professional_id) }),
            start: apt.start_time,
            end: apt.end_time,
            title,
            backgroundColor: '#6B7280',
            borderColor: '#6B7280',
            extendedProps: {
              appointment: apt,
              isBlock: true,
              reason: 'Cancelado',
              filterStatusKey
            }
          }
        }

        // Agendamento normal
        const clientName = apt.client?.full_name || 'Cliente'
        const serviceName = apt.service?.name || 'Serviço'
        const filterStatusKey = apt.status
        if (!allowedStatuses.has(filterStatusKey)) return null

        // Buscar cor customizada ou usar cor padrão
        const statusColor = colors.find((c) => c.statusKey === apt.status)
        const backgroundColor = statusColor?.hex || STATUS_COLORS[apt.status] || STATUS_COLORS.confirmed

        const title =
          calendarView === 'dayGridMonth'
            ? `${professionalName}: ${clientName} - ${serviceName}`
            : `${clientName} - ${serviceName}`

        return {
          id: String(apt.id),
          ...(calendarView === 'dayGridMonth' ? {} : { resourceId: String(apt.professional_id) }),
          start: apt.start_time,
          end: apt.end_time,
          title,
          backgroundColor,
          borderColor: backgroundColor,
          extendedProps: {
            appointment: apt,
            status: apt.status,
            clientName,
            serviceName,
            filterStatusKey
          }
        }
      })
      .filter(Boolean) as EventInput[]
  }, [appointments, calendarView, colors, professionals, selectedProfessionalIds, selectedStatusKeys, settings.blockCancelledAppointments])

  const scrollToNow = useCallback(() => {
    const now = new Date()
    const time = now.toTimeString().slice(0, 8) // HH:mm:ss
    // scrollToTime existe no timeGrid/resourceTimeGrid
    ;(calendarRef.current as any)?.getApi?.()?.scrollToTime?.(time)
  }, [])

  const renderResourceLabel = useCallback(
    (info: any) => {
      const title: string = info.resource?.title || ''
      const avatarUrl: string | null = info.resource?.extendedProps?.avatar_url || null
      const initial = title.trim().charAt(0).toUpperCase() || 'A'

      const resourceId: string | undefined = info.resource?.id
      const professional = professionals.find((p) => String(p.id) === String(resourceId)) || null

      return (
        <div className="flex flex-col items-center justify-center px-2 py-1">
          {settings.showAvatars && resourceId !== 'unit' && (
            <button
              type="button"
              onClick={() => professional && setSelectedProfessional(professional)}
              className="mb-1 h-9 w-9 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-primary/30"
              title={title}
            >
              <div className="relative h-full w-full flex items-center justify-center">
                {avatarUrl && avatarUrl !== 'null' && avatarUrl !== '' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={title}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.style.display = 'none';
                      img.onerror = null;
                    }}
                    onLoad={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.style.display = 'block';
                    }}
                  />
                ) : null}
                <span className="text-xs font-bold text-gray-700">{initial}</span>
              </div>
            </button>
          )}
          <span className="text-[11px] font-semibold text-gray-800 truncate max-w-[120px] text-center leading-tight">
            {title}
          </span>
        </div>
      )
    },
    [professionals, settings.showAvatars]
  )

  const handleEventMouseEnter = useCallback((info: any) => {
    if (hoverCloseTimeoutRef.current) {
      window.clearTimeout(hoverCloseTimeoutRef.current)
      hoverCloseTimeoutRef.current = null
    }

    const appointment = info.event?.extendedProps?.appointment as Appointment | undefined
    const isBlock = Boolean(info.event?.extendedProps?.isBlock)
    if (!appointment || isBlock) return

    const rect: DOMRect = info.el?.getBoundingClientRect?.() as DOMRect
    if (!rect) return
    setHoveredAppointment({ appointment, rect })
  }, [])

  const handleEventMouseLeave = useCallback(() => {
    if (hoverCloseTimeoutRef.current) {
      window.clearTimeout(hoverCloseTimeoutRef.current)
    }
    hoverCloseTimeoutRef.current = window.setTimeout(() => {
      setHoveredAppointment(null)
      hoverCloseTimeoutRef.current = null
    }, 120)
  }, [])

  const renderEventContent = useCallback((eventInfo: any) => {
    const isBlock = Boolean(eventInfo.event.extendedProps?.isBlock)
    const reason: string = eventInfo.event.extendedProps?.reason || ''
    const clientName: string = eventInfo.event.extendedProps?.clientName || ''
    const serviceName: string = eventInfo.event.extendedProps?.serviceName || ''
    const timeText: string = eventInfo.timeText || ''

    if (isBlock) {
      return (
        <div className="h-full w-full px-2 py-1">
          <div className="text-[10px] font-semibold text-white/90">{timeText}</div>
          <div className="text-[11px] font-bold text-white">Ocupado</div>
          {reason && <div className="text-[10px] text-white/90 leading-snug">{reason}</div>}
        </div>
      )
    }

    return (
      <div className="h-full w-full px-2 py-1">
        <div className="text-[10px] font-semibold text-white/90">{timeText}</div>
        <div className="text-[11px] font-bold text-white leading-snug">{clientName || 'Cliente'}</div>
        <div className="text-[10px] text-white/90 leading-snug">{serviceName || 'Serviço'}</div>
      </div>
    )
  }, [])

  // Navegação de datas (memorizada)
  const goToToday = useCallback(() => {
    const newDateStr = getDateKey()
    if (newDateStr !== currentDateStr) {
      setCurrentDateStr(newDateStr)
      calendarRef.current?.getApi().gotoDate(newDateStr)
    }
  }, [currentDateStr])

  const goToPreviousDay = useCallback(() => {
    const prevDate = new Date(currentDate)
    if (calendarView === 'resourceTimeGridWeek') {
      prevDate.setDate(prevDate.getDate() - 7)
    } else if (calendarView === 'dayGridMonth') {
      prevDate.setMonth(prevDate.getMonth() - 1)
    } else {
      prevDate.setDate(prevDate.getDate() - 1)
    }
    const newDateStr = getDateKey(prevDate)
    setCurrentDateStr(newDateStr)
    calendarRef.current?.getApi().gotoDate(newDateStr)
  }, [calendarView, currentDate])

  const goToNextDay = useCallback(() => {
    const nextDate = new Date(currentDate)
    if (calendarView === 'resourceTimeGridWeek') {
      nextDate.setDate(nextDate.getDate() + 7)
    } else if (calendarView === 'dayGridMonth') {
      nextDate.setMonth(nextDate.getMonth() + 1)
    } else {
      nextDate.setDate(nextDate.getDate() + 1)
    }
    const newDateStr = getDateKey(nextDate)
    setCurrentDateStr(newDateStr)
    calendarRef.current?.getApi().gotoDate(newDateStr)
  }, [calendarView, currentDate])

  // Handler para clique em evento
  const handleEventClick = useCallback((info: any) => {
    const appointment = info.event.extendedProps.appointment as Appointment
    if (appointment) {
      setSelectedAppointment(appointment)
      setSelectedDate(new Date(appointment.start_time))
      setShowModal(true)
    }
  }, [])

  // Handler para clique em slot vazio
  const handleDateClick = useCallback((info: any) => {
    setSelectedAppointment(null)
    setSelectedDate(info.date)
    setShowModal(true)
  }, [])

  // Handler de sucesso após criar/editar
  const handleSuccess = useCallback(async () => {
    setShowModal(false)
    setSelectedAppointment(null)
    setSelectedDate(null)
    
    // Força recarregar dados
    fetchedDateRef.current = ''
    await fetchData(currentDateStr, false)
    toast.success('Agendamento salvo!')
  }, [currentDateStr, fetchData])

  // Handler para fechar modal
  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setSelectedAppointment(null)
    setSelectedDate(null)
  }, [])

  // Handler para abrir modal de novo agendamento
  const handleNewAppointment = useCallback(() => {
    setSelectedAppointment(null)
    setSelectedDate(new Date())
    setShowModal(true)
  }, [])

  // Formatação da data
  const formattedDate = useMemo(() => {
    if (calendarView === 'dayGridMonth') {
      return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    }

    if (calendarView === 'resourceTimeGridWeek') {
      return `Semana de ${currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`
    }

    return currentDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }, [calendarView, currentDate])

  // Loading inicial
  if (loading && fetchedDateRef.current === '') {
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
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-7 h-7 text-primary" />
            <div className="flex items-center gap-2 bg-white rounded-full shadow px-3 py-1.5">
              <button
                onClick={goToPreviousDay}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Dia anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm font-semibold hover:bg-gray-100 rounded-full transition-colors"
              >
                Hoje
              </button>
              <button
                onClick={goToNextDay}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Próximo dia"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={scrollToNow}
                className="ml-1 p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Ir para agora"
                title="Ir para agora"
              >
                <Play className="w-4 h-4" />
              </button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-gray-700 bg-white rounded-full shadow px-4 py-2 hover:bg-gray-50"
                  title="Selecionar data"
                >
                  {formattedDate}
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={10} align="start" className="p-3">
                <DayPicker
                  mode="single"
                  selected={new Date(currentDateStr + 'T12:00:00')}
                  onSelect={(d) => {
                    if (!d) return
                    const newDateStr = getDateKey(d)
                    setCurrentDateStr(newDateStr)
                    calendarRef.current?.getApi().gotoDate(newDateStr)
                  }}
                  locale={ptBR}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 bg-white rounded-full shadow px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  title="Visualização"
                >
                  <LayoutGrid className="w-4 h-4" />
                  Visualização
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={10} align="end" className="min-w-[220px]">
                <DropdownMenuLabel>Visualização</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    setCalendarView('resourceTimeGridDay')
                  }}
                >
                  Diário
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    setCalendarView('resourceTimeGridWeek')
                  }}
                >
                  Semanal
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    setCalendarView('dayGridMonth')
                  }}
                >
                  Mensal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 bg-white rounded-full shadow px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  title="Filtrar"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtrar
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={10} align="end" className="w-[320px] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">Profissionais</div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={selectAllProfessionals} className="text-xs font-medium text-slate-500 hover:text-slate-900">
                      Marcar todos
                    </button>
                    <button type="button" onClick={clearProfessionals} className="text-xs font-medium text-slate-500 hover:text-slate-900">
                      Limpar
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-2 max-h-[220px] overflow-auto pr-1">
                  {professionals.map((prof) => (
                    <label key={prof.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <span className="truncate pr-3">{prof.full_name}</span>
                      <Checkbox
                        checked={currentSelectedProfessionalIds.includes(prof.id)}
                        onCheckedChange={() => toggleProfessionalFilter(prof.id)}
                      />
                    </label>
                  ))}
                </div>

                <div className="my-4 h-px bg-slate-200" />

                <div className="text-sm font-semibold text-slate-900">Status</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {statusOptions.map((st) => (
                    <label key={st.value} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <span>{st.label}</span>
                      <Checkbox checked={selectedStatusKeys.includes(st.value)} onCheckedChange={() => toggleStatusFilter(st.value)} />
                    </label>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              onClick={() => {
                toast.info('Menu de ações em desenvolvimento')
              }}
              className="inline-flex items-center gap-2 bg-white rounded-full shadow px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              title="Ações"
            >
              <MoreHorizontal className="w-4 h-4" />
              Ações
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-3 bg-white rounded-full shadow hover:bg-gray-50 transition-colors"
              title="Configurações da Agenda"
            >
              <Settings className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={() => setShowBlockForm(true)}
              className="bg-gray-700 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-gray-800 transition-all"
              title="Bloquear horário"
            >
              <Ban className="w-4 h-4" />
              Bloqueio
            </button>

            <button
              onClick={handleNewAppointment}
              className="bg-gradient-to-r from-primary to-purple-600 text-white px-5 py-2 rounded-full flex items-center gap-2 hover:shadow-lg transition-all"
              title="+ Novo"
            >
              <Plus className="w-4 h-4" />
              + Novo
            </button>
          </div>
        </div>

        {/* FullCalendar */}
        <div className="flex-1 bg-white rounded-lg shadow overflow-hidden relative">
          {calendarOverlay && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
              <div className="w-[92vw] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    {calendarOverlay.status === 'loading' || calendarOverlay.status === 'saving' ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-b-slate-700" />
                    ) : calendarOverlay.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div className="text-sm font-semibold text-slate-900">{calendarOverlay.title}</div>
                  </div>

                  <button
                    type="button"
                    onClick={closeCalendarOverlay}
                    disabled={calendarOverlay.status === 'loading' || calendarOverlay.status === 'saving'}
                    className="rounded-md p-1 hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Fechar"
                    title={calendarOverlay.status === 'loading' || calendarOverlay.status === 'saving' ? 'Aguarde concluir' : 'Fechar'}
                  >
                    <X className="h-4 w-4 text-slate-700" />
                  </button>
                </div>

                <div className="px-4 py-4 text-sm text-slate-600">
                  {calendarOverlay.message ||
                    (calendarOverlay.status === 'loading'
                      ? 'Carregando...'
                      : calendarOverlay.status === 'saving'
                        ? 'Salvando...'
                        : calendarOverlay.status === 'success'
                          ? 'Concluído.'
                          : 'Ocorreu um erro.')}
                </div>

                {(calendarOverlay.status === 'success' || calendarOverlay.status === 'error') && (
                  <div className="flex justify-end px-4 pb-4">
                    <button
                      type="button"
                      onClick={closeCalendarOverlay}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                    >
                      Fechar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          <FullCalendar
            ref={calendarRef}
            plugins={[resourceTimeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView={calendarView}
            locale={ptBrLocale}
            headerToolbar={false}
            height="auto"
            initialDate={currentDateStr}
            resources={resources}
            events={events}
            resourceLabelContent={renderResourceLabel}
            eventContent={renderEventContent}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            slotDuration={`00:${settings.slotMinutes.toString().padStart(2, '0')}:00`}
            slotLabelInterval="01:00:00"
            nowIndicator={true}
            editable={true}
            eventDurationEditable={false}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={false}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            eventDrop={handleEventDrop}
            eventMouseEnter={handleEventMouseEnter}
            eventMouseLeave={handleEventMouseLeave}
            eventDisplay="block"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            eventClassNames="appointment-card"
            resourceLabelClassNames="professional-header"
            scrollTime="08:00:00"
            scrollTimeReset={false}
            allDaySlot={false}
            weekends={true}
          />
        </div>

        {/* Legenda de Status */}
        <div className="mt-4 flex items-center gap-6 text-sm bg-white rounded-lg shadow px-6 py-3">
          <span className="font-semibold text-gray-700">Legenda:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#5E7C88' }}></div>
            <span>Confirmado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F2C94C' }}></div>
            <span>Pendente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#27AE60' }}></div>
            <span>Concluído</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EB5757' }}></div>
            <span>Cancelado</span>
          </div>
        </div>

        <Dialog.Root open={Boolean(pendingReschedule)} onOpenChange={(open) => !open && cancelReschedule()}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
            <Dialog.Content className="fixed z-50 left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b">
                <Dialog.Title className="text-lg font-bold text-gray-900">Atualizar agendamento?</Dialog.Title>
                <Dialog.Description className="mt-2 text-sm text-gray-600">
                  {pendingReschedule ? (
                    <>
                      Você confirma a alteração do agendamento de <span className="font-semibold text-gray-900">{pendingReschedule.clientName}</span> para{' '}
                      <span className="font-semibold text-gray-900">{pendingReschedule.dateStr}, {pendingReschedule.timeStr}</span> com{' '}
                      <span className="font-semibold text-gray-900">{pendingReschedule.professionalName}</span>?
                    </>
                  ) : null}
                </Dialog.Description>
              </div>

              <div className="p-4 flex gap-3 justify-end bg-gray-50">
                <button
                  type="button"
                  onClick={cancelReschedule}
                  disabled={rescheduleSaving}
                  className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmReschedule}
                  disabled={rescheduleSaving}
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  Confirmar
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {selectedProfessional && (
          <ProfessionalForm
            professional={selectedProfessional}
            onClose={() => setSelectedProfessional(null)}
            onSuccess={async () => {
              setSelectedProfessional(null)
              await fetchData(currentDateStr, false)
              toast.success('Profissional atualizado!')
            }}
          />
        )}

        {hoveredAppointment && (
          <div
            className="fixed z-50"
            style={{
              top: Math.min(hoveredAppointment.rect.bottom + 10, window.innerHeight - 320),
              left: Math.min(hoveredAppointment.rect.left, window.innerWidth - 320)
            }}
            onMouseEnter={() => {
              if (hoverCloseTimeoutRef.current) {
                window.clearTimeout(hoverCloseTimeoutRef.current)
                hoverCloseTimeoutRef.current = null
              }
            }}
            onMouseLeave={handleEventMouseLeave}
          >
            <div className="w-[300px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {hoveredAppointment.appointment.client?.full_name || 'Cliente'}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {hoveredAppointment.appointment.client?.phone || hoveredAppointment.appointment.client?.cellphone || 'Sem telefone'}
                  </div>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white"
                >
                  Conversar
                </button>
              </div>

              <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <div>
                  {(() => {
                    const start = new Date(hoveredAppointment.appointment.start_time)
                    const end = new Date(hoveredAppointment.appointment.end_time)
                    const day = start.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
                    const startTime = start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    const endTime = end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    return `${startTime} - ${endTime} · ${day}`
                  })()}
                </div>
                <div className="mt-1">{hoveredAppointment.appointment.service?.name || 'Serviço'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Formulário */}
        {showModal && (
          <AppointmentForm
            appointment={selectedAppointment}
            settings={settings}
            onClose={handleCloseModal}
            onSuccess={handleSuccess}
          />
        )}

        {/* Drawer de Configurações */}
        {showSettings && (
          <AgendaSettingsDrawer
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            settings={settings}
            colors={colors}
            onSaveSettings={async (newSettings) => {
              await agendaAdapter.saveAgendaSettings(newSettings)
              setSettings(newSettings)
              toast.success('Configurações salvas!')
            }}
            onSaveColors={async (newColors) => {
              setColors(newColors)
              localStorage.setItem(`agenda_colors_${localStorage.getItem('company_id') || '1'}`, JSON.stringify(newColors))
              toast.success('Cores atualizadas!')
            }}
          />
        )}

        {/* Modal de Bloqueio */}
        {showBlockForm && (
          <BlockForm
            isOpen={showBlockForm}
            onClose={() => setShowBlockForm(false)}
            onSuccess={async () => {
              setShowBlockForm(false)
              fetchedDateRef.current = ''
              await fetchData(currentDateStr, false)
              toast.success('Bloqueio criado!')
            }}
            professionals={professionals}
            selectedDate={selectedDate || new Date()}
          />
        )}
      </div>

      {/* Estilos CSS customizados */}
      <style jsx global>{`
        .appointment-card {
          border-radius: 6px !important;
          padding: 4px 6px !important;
          font-size: 11px !important;
          line-height: 1.3 !important;
          font-weight: 500 !important;
          white-space: normal !important;
          word-wrap: break-word !important;
          overflow: hidden !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
        }

        .appointment-card:hover {
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-1px) !important;
        }

        .appointment-card .fc-event-title {
          white-space: normal !important;
          word-wrap: break-word !important;
          overflow: visible !important;
          line-height: 1.3 !important;
          padding: 0 !important;
        }

        .fc-timegrid-now-indicator-line {
          border-color: #EB5757 !important;
          border-width: 2px !important;
          z-index: 10 !important;
        }

        .fc-timegrid-now-indicator-arrow {
          border-left-color: #EB5757 !important;
          border-right-color: #EB5757 !important;
        }

        .fc-resource-cell {
          padding: 8px 4px !important;
          text-align: center !important;
          border-right: 1px solid #e5e7eb !important;
          vertical-align: middle !important;
        }

        .fc-timegrid-slot {
          height: 40px !important;
        }

        .fc-timegrid-col {
          border-right: 1px solid #e5e7eb !important;
        }

        .fc-timegrid-axis {
          border-right: 2px solid #d1d5db !important;
        }

        .fc-scroller {
          overflow-y: auto !important;
          scrollbar-width: thin;
        }

        .fc-scroller::-webkit-scrollbar {
          width: 8px;
        }

        .fc-scroller::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .fc-scroller::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .fc-scroller::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </DashboardLayout>
  )
}

export default function CalendarPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    }>
      <CalendarPageContent />
    </Suspense>
  )
}
