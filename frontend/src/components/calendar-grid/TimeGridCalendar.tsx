"use client"

import React, { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CalendarDayResponse,
  CalendarAppointment,
  BusyBlock,
  CalendarProfessional,
} from '@/types/calendar'
import { AppointmentBlock } from './AppointmentBlock'
import { BusyBlockCard } from './BusyBlockCard'
import { ProfessionalHeader } from './ProfessionalHeader'

interface TimeGridCalendarProps {
  data: CalendarDayResponse
  slotMinutes?: number
  startHour?: number
  endHour?: number
  onAppointmentClick?: (appointment: CalendarAppointment) => void
  onProfessionalClick?: (professional: CalendarProfessional) => void
  onAppointmentDrop?: (
    appointmentId: number,
    newStartTime: string,
    newProfessionalId: number
  ) => void
}

export function TimeGridCalendar({
  data,
  slotMinutes = 15,
  startHour = 7,
  endHour = 22,
  onAppointmentClick,
  onProfessionalClick,
  onAppointmentDrop,
}: TimeGridCalendarProps) {
  const [draggedAppointment, setDraggedAppointment] = useState<CalendarAppointment | null>(null)

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots: string[] = []
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotMinutes) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeStr)
      }
    }
    return slots
  }, [startHour, endHour, slotMinutes])

  // Calculate position for appointments
  const calculatePosition = (startTime: string, endTime: string) => {
    const start = parseISO(startTime)
    const end = parseISO(endTime)
    
    const startMinutes = start.getHours() * 60 + start.getMinutes()
    const endMinutes = end.getHours() * 60 + end.getMinutes()
    const gridStartMinutes = startHour * 60
    
    const top = ((startMinutes - gridStartMinutes) / slotMinutes) * 60 // 60px per slot
    const height = ((endMinutes - startMinutes) / slotMinutes) * 60
    
    return { top, height }
  }

  // Group appointments and busy blocks by professional
  const professionalData = useMemo(() => {
    return data.professionals.map((prof) => {
      const appointments = data.appointments.filter(
        (apt) => apt.professional_id === prof.id
      )
      const busyBlocks = data.busy_blocks.filter(
        (block) => block.professional_id === prof.id
      )
      return { professional: prof, appointments, busyBlocks }
    })
  }, [data])

  // Drag handlers
  const handleDragStart = (appointment: CalendarAppointment) => {
    setDraggedAppointment(appointment)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (professionalId: number, timeSlot: string) => {
    if (!draggedAppointment || !onAppointmentDrop) return

    // Calculate new start time
    const [hours, minutes] = timeSlot.split(':').map(Number)
    const newStartTime = new Date(data.date)
    newStartTime.setHours(hours, minutes, 0, 0)

    onAppointmentDrop(
      draggedAppointment.id,
      newStartTime.toISOString(),
      professionalId
    )

    setDraggedAppointment(null)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header with professionals */}
      <div className="flex border-b sticky top-0 bg-white z-20">
        <div className="w-20 flex-shrink-0 border-r bg-gray-50" />
        {professionalData.map(({ professional }) => (
          <ProfessionalHeader
            key={professional.id}
            professional={professional}
            onClick={() => onProfessionalClick?.(professional)}
          />
        ))}
      </div>

      {/* Time grid */}
      <div className="flex flex-1 overflow-auto">
        {/* Time column */}
        <div className="w-20 flex-shrink-0 border-r bg-gray-50">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="h-[60px] border-b px-2 py-1 text-xs text-gray-600 text-right"
            >
              {time}
            </div>
          ))}
        </div>

        {/* Professional columns */}
        {professionalData.map(({ professional, appointments, busyBlocks }) => (
          <div
            key={professional.id}
            className="flex-1 min-w-[200px] border-r relative"
          >
            {/* Time slots */}
            {timeSlots.map((time) => (
              <div
                key={time}
                className="h-[60px] border-b hover:bg-blue-50/30 transition-colors"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(professional.id, time)}
              />
            ))}

            {/* Appointments */}
            {appointments.map((appointment) => {
              const { top, height } = calculatePosition(
                appointment.start_time,
                appointment.end_time
              )
              return (
                <div
                  key={appointment.id}
                  className="absolute left-1 right-1"
                  style={{ top: `${top}px`, height: `${height}px` }}
                >
                  <AppointmentBlock
                    appointment={appointment}
                    onClick={() => onAppointmentClick?.(appointment)}
                    onDragStart={() => handleDragStart(appointment)}
                  />
                </div>
              )
            })}

            {/* Busy blocks */}
            {busyBlocks.map((block, index) => {
              const { top, height } = calculatePosition(
                block.start_time,
                block.end_time
              )
              return (
                <div
                  key={block.id || `busy-${index}`}
                  className="absolute left-1 right-1"
                  style={{ top: `${top}px`, height: `${height}px` }}
                >
                  <BusyBlockCard block={block} />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
