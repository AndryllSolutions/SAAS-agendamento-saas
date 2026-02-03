'use client'

import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EventPopover } from './EventPopover'

export interface AgendaEvent {
  id: number
  professionalId: number
  startMinutes: number
  durationMinutes: number
  clientName: string
  serviceName: string
  status: string
  type: 'appointment' | 'blocked'
  color: string
  phone: string
  appointmentData?: any
}

interface EventCardProps {
  event: AgendaEvent
  slotHeight: number
  slotMinutes: number
  onDragStart?: () => void
  onClick?: () => void
}

const statusOptions = [
  { label: 'Confirmado', value: 'confirmed', color: '#16A34A' },
  { label: 'Nao confirmado', value: 'unconfirmed', color: '#2563EB' },
  { label: 'Aguardando', value: 'waiting', color: '#D97706' },
  { label: 'Cancelado', value: 'cancelled', color: '#DC2626' },
]

const colorTags = [
  { label: 'Cliente VIP', value: 'vip', color: '#F59E0B' },
  { label: 'Check In', value: 'checkin', color: '#10B981' },
  { label: 'Em atendimento', value: 'in_progress', color: '#3B82F6' },
  { label: 'Retrabalho', value: 'redo', color: '#F97316' },
  { label: 'Pago', value: 'paid', color: '#22C55E' },
]

export function EventCard({ event, slotHeight, slotMinutes, onDragStart, onClick }: EventCardProps) {
  const top = (event.startMinutes / slotMinutes) * slotHeight
  const height = Math.max((event.durationMinutes / slotMinutes) * slotHeight, slotHeight)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          draggable={event.type === 'appointment'}
          onDragStart={onDragStart}
          onClick={onClick}
          className={`absolute left-3 right-3 rounded-2xl px-3 py-2 text-left text-xs font-medium shadow-sm transition hover:shadow-md ${
            event.type === 'blocked' ? 'bg-slate-200 text-slate-500' : 'bg-[#6B8794] text-white'
          }`}
          style={{ top, height }}
        >
          <p className="text-[11px] font-semibold">
            {`${String(Math.floor(event.startMinutes / 60) + 8).padStart(2, '0')}:${String(
              event.startMinutes % 60
            ).padStart(2, '0')}`}
            {' - '}
            {`${String(Math.floor((event.startMinutes + event.durationMinutes) / 60) + 8).padStart(2, '0')}:${String(
              (event.startMinutes + event.durationMinutes) % 60
            ).padStart(2, '0')}`}
          </p>
          <p>{event.clientName}</p>
          <p className="text-[11px] text-white/80">{event.serviceName}</p>
        </button>
      </DropdownMenuTrigger>
      <EventPopover
        clientName={event.clientName}
        phone={event.phone}
        timeLabel="Hoje, 10 de Outubro"
        serviceName={event.serviceName}
        statusOptions={statusOptions}
        colorTags={colorTags}
      />
    </DropdownMenu>
  )
}
