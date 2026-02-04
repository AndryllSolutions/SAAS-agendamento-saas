"use client"

import { useState, useMemo } from 'react'
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
import { calendarService } from '@/services/calendarService'
import { useAgendaStore } from '@/store/agendaStore'
import { CalendarDayResponse, CalendarProfessional, CalendarAppointment, BusyBlock } from '@/types/calendar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AgendaPage() {
  const queryClient = useQueryClient()
  const { date, setDate } = useAgendaStore()
  
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<CalendarProfessional | null>(null)
  const [moveModalOpen, setMoveModalOpen] = useState(false)
  const [pendingMove, setPendingMove] = useState<{
    appointmentId: number
    newStartTime: string
    newProfessionalId: number
  } | null>(null)

  const dateStr = format(date, 'yyyy-MM-dd')

  // Query para buscar dados do calendário
  const { data: calendarData, isLoading, error } = useQuery({
    queryKey: ['calendar-day', dateStr],
    queryFn: () => calendarService.getCalendarDay(dateStr),
    enabled: !!dateStr
  })

  // Mutation para mover agendamento
  const moveMutation = useMutation({
    mutationFn: ({ appointmentId, data }: { appointmentId: number; data: any }) =>
      calendarService.moveAppointment(appointmentId, data),
    onSuccess: () => {
      toast.success('Agendamento movido com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['calendar-day', dateStr] })
      setMoveModalOpen(false)
      setPendingMove(null)
    },
    onError: (error: any) => {
      toast.error('Erro ao mover agendamento')
      console.error(error)
    }
  })

  // Handlers
  const handleEventClick = (appointment: CalendarAppointment) => {
    setSelectedAppointment(appointment)
  }

  const handleProfessionalClick = (professionalId: number) => {
    const professional = calendarData?.professionals.find(p => p.id === professionalId)
    if (professional) {
      setSelectedProfessional(professional)
    }
  }

  const handleAppointmentDrop = (appointmentId: number, newStartTime: string, newProfessionalId: number) => {
    setPendingMove({
      appointmentId,
      newStartTime,
      newProfessionalId
    })
    setMoveModalOpen(true)
  }

  const handleConfirmMove = () => {
    if (!pendingMove) return

    moveMutation.mutate({
      appointmentId: pendingMove.appointmentId,
      data: {
        start_time: pendingMove.newStartTime,
        professional_id: pendingMove.newProfessionalId
      }
    })
  }

  const handleCreateAppointment = (professionalId: number, startTime: string) => {
    // TODO: Implementar criação de agendamento
    toast.info('Criar agendamento - Funcionalidade em desenvolvimento')
  }

  // Loading e Error states
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando agenda...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar agenda</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (!calendarData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-slate-600">Nenhum dado encontrado</p>
      </div>
    )
  }

  return (
    <DrawerStackProvider>
      <div className="flex h-screen bg-slate-50">
        {/* Sidebar */}
        <SidebarAgenda />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Topbar */}
          <TopbarAgenda 
            date={date}
            onDateChange={setDate}
            onSettingsOpen={() => setSettingsOpen(true)}
          />
          
          {/* Calendar Grid */}
          <CalendarGridEnhanced
            professionals={calendarData.professionals}
            appointments={calendarData.appointments}
            busyBlocks={calendarData.busy_blocks}
            onEventClick={handleEventClick}
            onProfessionalClick={handleProfessionalClick}
            onAppointmentDrop={handleAppointmentDrop}
            onCreateAppointment={handleCreateAppointment}
          />
        </div>
      </div>

      {/* Drawers e Modals */}
      <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Move Confirmation Modal */}
      <MoveConfirmModal
        open={moveModalOpen}
        onClose={() => {
          setMoveModalOpen(false)
          setPendingMove(null)
        }}
        onConfirm={handleConfirmMove}
        appointment={calendarData.appointments.find(a => a.id === pendingMove?.appointmentId) || null}
        newStartTime={pendingMove?.newStartTime || ''}
        newProfessional={calendarData.professionals.find(p => p.id === pendingMove?.newProfessionalId) || null}
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
          employee={{
            id: selectedProfessional.id,
            full_name: selectedProfessional.full_name,
            email: selectedProfessional.email || '',
            is_active: true,
            role: 'PROFESSIONAL'
          }}
          onClose={() => setSelectedProfessional(null)}
        />
      )}
    </DrawerStackProvider>
  )
}
