'use client'

import React, { useMemo } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar, Clock, Users, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAgendaStore } from '@/store/agendaStore'
import { toAbsoluteImageUrl } from '@/utils/apiUrl'

interface Professional {
  id: number
  full_name: string
  avatar_url?: string | null
  email?: string | null
  phone?: string | null
  working_hours?: Record<string, any> | null
}

interface Appointment {
  id: number
  professional_id: number
  client: {
    id: number
    full_name: string
    phone?: string | null
  }
  start_time: string
  end_time: string
  status: string
  color?: string
  items: Array<{
    service_name: string
    duration_minutes: number
    price?: number
  }>
  notes?: string
}

interface BusyBlock {
  professional_id: number
  start_time: string
  end_time: string
  reason: string
  color?: string
}

interface CalendarGridProps {
  professionals: Professional[]
  appointments: Appointment[]
  busyBlocks: BusyBlock[]
  onEventClick?: (event: Appointment) => void
  onProfessionalClick?: (professionalId: number) => void
  onAppointmentDrop?: (appointmentId: number, newStartTime: string, newProfessionalId: number) => void
  onCreateAppointment?: (professionalId: number, startTime: string) => void
}

const startHour = 8
const endHour = 20
const slotMinutes = 15
const slotHeight = 60 // pixels por slot (15 min)

export function CalendarGridEnhanced({ 
  professionals, 
  appointments, 
  busyBlocks, 
  onEventClick, 
  onProfessionalClick, 
  onAppointmentDrop,
  onCreateAppointment 
}: CalendarGridProps) {
  const { date } = useAgendaStore()
  const [draggedEvent, setDraggedEvent] = React.useState<Appointment | null>(null)

  const totalSlots = ((endHour - startHour) * 60) / slotMinutes
  const totalHeight = totalSlots * slotHeight
  const minWidth = professionals.length * 320 + 120

  const timeSlots = useMemo(() => {
    return Array.from({ length: totalSlots }, (_, index) => {
      const minutesFromStart = index * slotMinutes
      const hour = Math.floor(minutesFromStart / 60) + startHour
      const minutes = minutesFromStart % 60
      return { 
        label: `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`, 
        minutesFromStart,
        hour,
        minutes
      }
    })
  }, [])

  const now = new Date()
  const nowMinutes = (now.getHours() - startHour) * 60 + now.getMinutes()
  const showNow = nowMinutes >= 0 && nowMinutes <= (endHour - startHour) * 60
  const nowTop = (nowMinutes / slotMinutes) * slotHeight

  const handleDragStart = (event: Appointment) => {
    setDraggedEvent(event)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (professionalId: number, slotMinutes: number) => {
    if (!draggedEvent || !onAppointmentDrop) return

    const hours = Math.floor(slotMinutes / 60) + startHour
    const minutes = slotMinutes % 60
    const newDate = new Date(date)
    newDate.setHours(hours, minutes, 0, 0)

    onAppointmentDrop(draggedEvent.id, newDate.toISOString(), professionalId)
    setDraggedEvent(null)
  }

  const handleSlotClick = (professionalId: number, slotMinutes: number) => {
    if (!onCreateAppointment) return

    const hours = Math.floor(slotMinutes / 60) + startHour
    const minutes = slotMinutes % 60
    const startTime = new Date(date)
    startTime.setHours(hours, minutes, 0, 0)

    onCreateAppointment(professionalId, startTime.toISOString())
  }

  const calculateEventPosition = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    
    const startMinutesFromStart = (start.getHours() - startHour) * 60 + start.getMinutes()
    const durationMinutes = (end.getHours() - start.getHours()) * 60 + (end.getMinutes() - start.getMinutes())
    
    const top = (startMinutesFromStart / slotMinutes) * slotHeight
    const height = (durationMinutes / slotMinutes) * slotHeight
    
    return { top, height }
  }

  return (
    <div className="flex-1 rounded-3xl bg-white p-4 shadow-sm">
      <ScrollArea className="h-[calc(100vh-240px)]">
        <div className="min-w-full" style={{ minWidth }}>
          <div className="flex">
            {/* Coluna de horários */}
            <div className="w-20 shrink-0">
              <div className="h-20" />
              <div className="text-[11px] text-slate-400">
                {timeSlots.map((slot, index) => (
                  <div
                    key={slot.label}
                    className="flex h-[60px] items-start justify-end pr-2"
                  >
                    {index % 4 === 0 ? slot.label : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Colunas dos profissionais */}
            <div className="flex-1">
              {/* Header com profissionais */}
              <div className="flex h-20 items-center gap-4 border-b border-slate-200 pl-4">
                {professionals.map((professional) => (
                  <button
                    key={professional.id}
                    onClick={() => onProfessionalClick?.(professional.id)}
                    className="flex min-w-[300px] items-center gap-3 hover:bg-slate-50 rounded-lg p-3 transition-colors cursor-pointer group"
                  >
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {toAbsoluteImageUrl(professional.avatar_url) ? (
                        <img src={toAbsoluteImageUrl(professional.avatar_url) as string} alt={professional.full_name} className="h-full w-full object-cover" />
                      ) : (
                        <span>{professional.full_name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {professional.full_name}
                      </p>
                      <p className="text-xs text-slate-400">Profissional</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Calendar className="h-4 w-4 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Grid de horários e eventos */}
              <div className="relative flex">
                {/* Linha do horário atual */}
                {showNow && (
                  <div
                    className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                    style={{ top: nowTop + 80 }}
                  >
                    <div className="h-0.5 w-full bg-red-500 shadow-sm" />
                    <div className="absolute left-0 -translate-y-1/2 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                      {now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )}

                {professionals.map((professional) => {
                  const appointmentsForProfessional = appointments.filter(
                    (apt) => apt.professional_id === professional.id
                  )
                  const busyBlocksForProfessional = busyBlocks.filter(
                    (block) => block.professional_id === professional.id
                  )

                  return (
                    <div key={professional.id} className="relative min-w-[300px] border-r border-slate-100">
                      {/* Slots de tempo clicáveis */}
                      <div style={{ height: totalHeight }}>
                        {timeSlots.map((slot) => (
                          <div
                            key={slot.label}
                            className="h-[60px] border-b border-slate-100 hover:bg-blue-50/30 transition-colors cursor-pointer"
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(professional.id, slot.minutesFromStart)}
                            onClick={() => handleSlotClick(professional.id, slot.minutesFromStart)}
                          />
                        ))}
                      </div>

                      {/* Blocos ocupados */}
                      {busyBlocksForProfessional.map((block, index) => {
                        const { top, height } = calculateEventPosition(block.start_time, block.end_time)
                        return (
                          <div
                            key={`busy-${index}`}
                            className="absolute left-2 right-2 bg-slate-100 border border-slate-300 rounded-md p-2 z-10"
                            style={{ top: top + 80, height: height - 4 }}
                          >
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Ban className="h-3 w-3" />
                              <span className="font-medium">Ocupado</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{block.reason}</p>
                          </div>
                        )
                      })}

                      {/* Agendamentos */}
                      {appointmentsForProfessional.map((appointment) => {
                        const { top, height } = calculateEventPosition(appointment.start_time, appointment.end_time)
                        const bgColor = appointment.color || '#3b82f6'
                        
                        return (
                          <div
                            key={appointment.id}
                            className={cn(
                              "absolute left-2 right-2 rounded-md p-2 z-10 cursor-pointer shadow-sm border transition-all hover:shadow-md hover:scale-[1.02]",
                              "bg-blue-500 text-white"
                            )}
                            style={{ 
                              top: top + 80, 
                              height: height - 4,
                              backgroundColor: bgColor
                            }}
                            draggable
                            onDragStart={() => handleDragStart(appointment)}
                            onClick={() => onEventClick?.(appointment)}
                          >
                            <div className="text-xs font-medium">
                              {new Date(appointment.start_time).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })} - {new Date(appointment.end_time).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                              })}
                            </div>
                            <div className="text-xs font-semibold mt-1 truncate">
                              {appointment.client.full_name}
                            </div>
                            {appointment.items.length > 0 && (
                              <div className="text-xs opacity-90 truncate">
                                {appointment.items[0].service_name}
                                {appointment.items.length > 1 && ` +${appointment.items.length - 1}`}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
