"use client"

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { TimeGridCalendar } from '@/components/calendar-grid/TimeGridCalendar'
import { MoveConfirmModal } from '@/components/calendar-grid/MoveConfirmModal'
import { AppointmentDrawer } from '@/components/calendar-grid/AppointmentDrawer'
import { DrawerStackProvider } from '@/components/professionals/DrawerStackManager'
import EmployeeDrawer from '@/components/professionals/EmployeeDrawer'
import { calendarService } from '@/services/calendarService'
import { CalendarAppointment, CalendarProfessional } from '@/types/calendar'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

export default function AgendaNewPage() {
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<CalendarProfessional | null>(null)
  const [moveModalOpen, setMoveModalOpen] = useState(false)
  const [pendingMove, setPendingMove] = useState<{
    appointmentId: number
    newStartTime: string
    newProfessionalId: number
  } | null>(null)

  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  // Fetch calendar data
  const { data, isLoading, error } = useQuery({
    queryKey: ['calendar-day', dateStr],
    queryFn: () => calendarService.getCalendarDay(dateStr),
  })

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

  // Handlers
  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate)
  }

  const handleAppointmentDrop = (
    appointmentId: number,
    newStartTime: string,
    newProfessionalId: number
  ) => {
    const appointment = data?.appointments.find((apt) => apt.id === appointmentId)
    if (!appointment) return

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

  const pendingAppointment = pendingMove
    ? data?.appointments.find((apt) => apt.id === pendingMove.appointmentId)
    : null

  const pendingProfessional = pendingMove
    ? data?.professionals.find((prof) => prof.id === pendingMove.newProfessionalId)
    : null

  return (
    <DrawerStackProvider>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDateChange(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Hoje
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDateChange(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-lg font-medium text-gray-700">
              {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Carregando agenda...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-500">Erro ao carregar agenda</div>
            </div>
          )}

          {data && (
            <TimeGridCalendar
              data={data}
              slotMinutes={15}
              startHour={7}
              endHour={22}
              onAppointmentClick={setSelectedAppointment}
              onProfessionalClick={setSelectedProfessional}
              onAppointmentDrop={handleAppointmentDrop}
            />
          )}
        </div>

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

        {/* Professional Drawer (reuso do existente) */}
        {selectedProfessional && (
          <EmployeeDrawer
            employeeId={selectedProfessional.id}
            onClose={() => setSelectedProfessional(null)}
          />
        )}
      </div>
    </DrawerStackProvider>
  )
}
