'use client'

import React, { useMemo } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EventCard, AgendaEvent } from './EventCard'
import { useAgendaStore } from '@/store/agendaStore'

interface Professional {
  id: number
  name: string
  avatarUrl: string
}

interface CalendarGridProps {
  professionals: Professional[]
  events: AgendaEvent[]
  onEventClick?: (event: AgendaEvent) => void
  onProfessionalClick?: (professionalId: number) => void
  onAppointmentDrop?: (appointmentId: number, newStartTime: string, newProfessionalId: number) => void
}

const startHour = 8
const endHour = 20
const slotHeight = 36

export function CalendarGrid({ professionals, events, onEventClick, onProfessionalClick, onAppointmentDrop }: CalendarGridProps) {
  const { settings, date } = useAgendaStore()
  const slotMinutes = settings.slotMinutes
  const [draggedEvent, setDraggedEvent] = React.useState<AgendaEvent | null>(null)

  const totalSlots = ((endHour - startHour) * 60) / slotMinutes
  const totalHeight = totalSlots * slotHeight
  const minWidth = professionals.length * 260 + 120

  const timeSlots = useMemo(() => {
    return Array.from({ length: totalSlots }, (_, index) => {
      const minutesFromStart = index * slotMinutes
      const hour = Math.floor(minutesFromStart / 60) + startHour
      const minutes = minutesFromStart % 60
      return { label: `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`, minutesFromStart }
    })
  }, [slotMinutes, totalSlots])

  const now = new Date()
  const nowMinutes = (now.getHours() - startHour) * 60 + now.getMinutes()
  const showNow = nowMinutes >= 0 && nowMinutes <= (endHour - startHour) * 60
  const nowTop = (nowMinutes / slotMinutes) * slotHeight

  const handleDragStart = (event: AgendaEvent) => {
    setDraggedEvent(event)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (professionalId: number, slotMinutes: number) => {
    if (!draggedEvent || !onAppointmentDrop) return

    const hours = Math.floor(slotMinutes / 60) + startHour
    const minutes = slotMinutes % 60
    const newStartTime = new Date(date)
    newStartTime.setHours(hours, minutes, 0, 0)

    onAppointmentDrop(draggedEvent.id, newStartTime.toISOString(), professionalId)
    setDraggedEvent(null)
  }

  return (
    <div className="flex-1 rounded-3xl bg-white p-4 shadow-sm">
      <ScrollArea className="h-[calc(100vh-240px)]">
        <div className="min-w-full" style={{ minWidth }}>
          <div className="flex">
            <div className="w-20 shrink-0">
              <div className="h-16" />
              <div className="text-[11px] text-slate-400">
                {timeSlots.map((slot, index) => (
                  <div
                    key={slot.label}
                    className="flex h-[36px] items-start justify-end pr-2"
                  >
                    {index % 4 === 0 ? slot.label : ''}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex h-16 items-center gap-4 border-b border-slate-200 pl-4">
                {professionals.map((professional) => (
                  <button
                    key={professional.id}
                    onClick={() => onProfessionalClick?.(professional.id)}
                    className="flex min-w-[240px] items-center gap-3 hover:bg-slate-50 rounded-lg p-2 transition-colors cursor-pointer"
                  >
                    {settings.showAvatars && (
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                        <img src={professional.avatarUrl} alt={professional.name} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-800">{professional.name}</p>
                      <p className="text-xs text-slate-400">Profissional</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="relative flex">
                {showNow && (
                  <div
                    className="absolute left-0 right-0 z-20 flex items-center"
                    style={{ top: nowTop + 64 }}
                  >
                    <div className="h-0.5 w-full bg-red-500" />
                  </div>
                )}

                {professionals.map((professional) => {
                  const eventsForProfessional = events.filter((event) => event.professionalId === professional.id)

                  return (
                    <div key={professional.id} className="relative min-w-[240px] border-r border-slate-100">
                      <div style={{ height: totalHeight }}>
                        {timeSlots.map((slot) => (
                          <div
                            key={slot.label}
                            className="h-[36px] border-b border-slate-100 hover:bg-blue-50/30 transition-colors"
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(professional.id, slot.minutesFromStart)}
                          />
                        ))}
                      </div>

                      {eventsForProfessional.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          slotHeight={slotHeight}
                          slotMinutes={slotMinutes}
                          onDragStart={() => handleDragStart(event)}
                          onClick={() => onEventClick?.(event)}
                        />
                      ))}
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
