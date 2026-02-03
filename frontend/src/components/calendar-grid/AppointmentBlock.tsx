"use client"

import React from 'react'
import { format, parseISO } from 'date-fns'
import { CalendarAppointment } from '@/types/calendar'
import { cn } from '@/lib/utils'

interface AppointmentBlockProps {
  appointment: CalendarAppointment
  onClick?: () => void
  onDragStart?: () => void
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 border-yellow-400 text-yellow-900',
  confirmed: 'bg-blue-100 border-blue-400 text-blue-900',
  checked_in: 'bg-purple-100 border-purple-400 text-purple-900',
  in_progress: 'bg-green-100 border-green-400 text-green-900',
  completed: 'bg-gray-100 border-gray-400 text-gray-700',
  cancelled: 'bg-red-100 border-red-400 text-red-900',
  no_show: 'bg-orange-100 border-orange-400 text-orange-900',
}

export function AppointmentBlock({
  appointment,
  onClick,
  onDragStart,
}: AppointmentBlockProps) {
  const startTime = format(parseISO(appointment.start_time), 'HH:mm')
  const endTime = format(parseISO(appointment.end_time), 'HH:mm')
  
  const colorClass = statusColors[appointment.status] || statusColors.pending
  
  // Get service names from items
  const serviceNames = appointment.items.map((item) => item.service_name).join(', ')
  
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={cn(
        'h-full rounded-md border-l-4 p-2 cursor-pointer hover:shadow-md transition-shadow overflow-hidden',
        colorClass
      )}
    >
      <div className="text-xs font-semibold mb-1">
        {startTime} - {endTime}
      </div>
      {appointment.client && (
        <div className="text-sm font-medium truncate mb-1">
          {appointment.client.full_name}
        </div>
      )}
      {serviceNames && (
        <div className="text-xs truncate opacity-80">
          {serviceNames}
        </div>
      )}
    </div>
  )
}
