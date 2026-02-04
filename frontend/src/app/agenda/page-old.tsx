"use client"

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CalendarGridEnhanced } from '@/components/agenda/CalendarGridEnhanced'
import { SidebarAgenda } from '@/components/agenda/SidebarAgenda'
import { TopbarAgenda } from '@/components/agenda/TopbarAgenda'
import { SettingsDrawer } from '@/components/agenda/SettingsDrawer'
import { MoveConfirmModal } from '@/components/calendar-grid/MoveConfirmModal'
import { AppointmentDrawer } from '@/components/calendar-grid/AppointmentDrawer'
import { DrawerStackProvider } from '@/components/professionals/DrawerStackManager'
import EmployeeDrawer from '@/components/professionals/EmployeeDrawer'
import { agendaAdapter } from '@/services/agendaAdapter'
import { calendarService } from '@/services/calendarService'
import { useAgendaStore } from '@/store/agendaStore'
import { toAbsoluteImageUrl } from '@/utils/apiUrl'
import { CalendarDayResponse, CalendarProfessional, CalendarAppointment, BusyBlock } from '@/types/calendar'

const startHour = 8

const getCompanyName = () => {
  try {
    const stored = localStorage.getItem('auth-storage')
    if (!stored) return 'Sua empresa'
    const parsed = JSON.parse(stored)
    return parsed?.state?.user?.company_name || parsed?.state?.user?.full_name || 'Sua empresa'
  } catch {
    return 'Sua empresa'
  }
}

const toMinutesFromStart = (date: Date) => {
  const minutes = date.getHours() * 60 + date.getMinutes()
  return Math.max(minutes - startHour * 60, 0)
}

export default function AgendaPage() {
  const queryClient = useQueryClient()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<CalendarProfessional | null>(null)
  const [moveModalOpen, setMoveModalOpen] = useState(false)
  const [pendingMove, setPendingMove] = useState<{
    appointmentId: number
    newStartTime: string
    newProfessionalId: number
  } | null>(null)
  const { date } = useAgendaStore()
  const companyName = useMemo(() => getCompanyName(), [])
  const dateStr = date.toISOString().slice(0, 10)

  // Usar novo endpoint /calendar/day
  const { data: calendarData } = useQuery({
    queryKey: ['calendar-day', dateStr],
    queryFn: () => calendarService.getCalendarDay(dateStr),
  })

  const professionals = useMemo(() => {
    if (!calendarData) return []
    return calendarData.professionals.map((prof) => ({
      id: prof.id,
      name: prof.full_name,
      avatarUrl: toAbsoluteImageUrl(prof.avatar_url) || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop',
    }))
  }, [calendarData])

  const events = useMemo(() => {
    if (!calendarData) return []
    const allEvents: AgendaEvent[] = []

    // Appointments
    calendarData.appointments.forEach((appointment) => {
      const startTime = new Date(appointment.start_time)
      const endTime = new Date(appointment.end_time)
      const durationMinutes = Math.max((endTime.getTime() - startTime.getTime()) / 60000, 15)
      const serviceName = appointment.items.map(i => i.service_name).join(', ') || 'Serviço'

      allEvents.push({
        id: appointment.id,
        professionalId: appointment.professional_id!,
        startMinutes: toMinutesFromStart(startTime),
        durationMinutes,
        clientName: appointment.client?.full_name || 'Cliente',
        serviceName,
        status: appointment.status,
        type: 'appointment',
        color: '#6B8794',
        phone: appointment.client?.phone || appointment.client?.cellphone || '',
        appointmentData: appointment,
      })
    })

    // Busy blocks
    calendarData.busy_blocks.forEach((block) => {
      const startTime = new Date(block.start_time)
      const endTime = new Date(block.end_time)
      const durationMinutes = Math.max((endTime.getTime() - startTime.getTime()) / 60000, 15)

      allEvents.push({
        id: block.id || Math.random(),
        professionalId: block.professional_id,
        startMinutes: toMinutesFromStart(startTime),
        durationMinutes,
        clientName: 'Ocupado',
        serviceName: block.reason,
        status: 'blocked',
        type: 'blocked',
        color: '#CBD5E1',
        phone: '',
      })
    })

    return allEvents
  }, [calendarData])

  // Move appointment mutation
  const moveMutation = useMutation({
    mutationFn: ({ appointmentId, newStartTime, professionalId }: {
      appointmentId: number
      newStartTime: string
      professionalId?: number
    }) => calendarService.moveAppointment(appointmentId, {
      start_time: newStartTime,
      professional_id: professionalId,
    }),
    onSuccess: () => {
      toast.success('Agendamento movido com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['calendar-day', dateStr] })
      setMoveModalOpen(false)
      setPendingMove(null)
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao mover agendamento'
      toast.error(message)
    },
  })

  const handleAppointmentDrop = (appointmentId: number, newStartTime: string, newProfessionalId: number) => {
    setPendingMove({ appointmentId, newStartTime, newProfessionalId })
    setMoveModalOpen(true)
  }

  const handleConfirmMove = () => {
    if (!pendingMove) return
    moveMutation.mutate({
      appointmentId: pendingMove.appointmentId,
      newStartTime: pendingMove.newStartTime,
      professionalId: pendingMove.newProfessionalId,
    })
  }

  const handleEventClick = (event: AgendaEvent) => {
    if (event.appointmentData) {
      setSelectedAppointment(event.appointmentData)
    }
  }

  const handleProfessionalClick = (professionalId: number) => {
    const prof = calendarData?.professionals.find(p => p.id === professionalId)
    if (prof) {
      setSelectedProfessional(prof)
    }
  }

  const pendingAppointment = pendingMove
    ? calendarData?.appointments.find((apt) => apt.id === pendingMove.appointmentId)
    : null

  const pendingProfessional = pendingMove
    ? calendarData?.professionals.find((prof) => prof.id === pendingMove.newProfessionalId)
    : null

  return (
    <DrawerStackProvider>
      <div className="min-h-screen bg-[#F4F7FA]">
        <SidebarAgenda companyName={companyName} />

        <div className="ml-[260px] flex min-h-screen flex-col gap-6 px-8 py-8">
          <TopbarAgenda onOpenSettings={() => setSettingsOpen(true)} onNew={() => null} />

          <CalendarGrid 
            professionals={professionals} 
            events={events}
            onEventClick={handleEventClick}
            onProfessionalClick={handleProfessionalClick}
            onAppointmentDrop={handleAppointmentDrop}
          />

          <button className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-lg">
            Calendario
          </button>
        </div>

        <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />

        {/* Move Confirmation Modal */}
        <MoveConfirmModal
          open={moveModalOpen}
          onClose={() => {
            setMoveModalOpen(false)
            setPendingMove(null)
          }}
          onConfirm={handleConfirmMove}
          appointment={pendingAppointment || null}
          newStartTime={pendingMove?.newStartTime || ''}
          newProfessional={pendingProfessional || null}
          loading={moveMutation.isPending}
        />

        {/* Appointment Drawer */}
        {selectedAppointment && (
          <AppointmentDrawer
            appointment={selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
            onSuccess={() => {
              setSelectedAppointment(null)
              queryClient.invalidateQueries({ queryKey: ['calendar-day', dateStr] })
            }}
          />
        )}

        {/* Professional Drawer */}
        {selectedProfessional && (
          <EmployeeDrawer
            employee={{ id: selectedProfessional.id }}
            onClose={() => setSelectedProfessional(null)}
          />
        )}
      </div>
    </DrawerStackProvider>
  )
}
