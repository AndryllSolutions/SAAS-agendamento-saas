"use client"

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarGrid } from '@/components/agenda/CalendarGrid'
import { SidebarAgenda } from '@/components/agenda/SidebarAgenda'
import { TopbarAgenda } from '@/components/agenda/TopbarAgenda'
import { SettingsDrawer } from '@/components/agenda/SettingsDrawer'
import { AgendaEvent } from '@/components/agenda/EventCard'
import { agendaAdapter } from '@/services/agendaAdapter'
import { useAgendaStore } from '@/store/agendaStore'
import { toAbsoluteImageUrl } from '@/utils/apiUrl'

const startHour = 8

interface CalendarAppointment {
  id: number
  professional_id: number
  start_time: string
  end_time: string
  service_id: number | null
  status: string
  internal_notes?: string | null
  client?: {
    id: number
    full_name: string
    phone?: string | null
    cellphone?: string | null
  } | null
  service?: {
    id: number
    name: string
    duration_minutes?: number | null
  } | null
}

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
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { date } = useAgendaStore()
  const companyName = useMemo(() => getCompanyName(), [])

  const { data: professionals = [] } = useQuery({
    queryKey: ['agenda-professionals'],
    queryFn: async () => {
      const response = await agendaAdapter.listProfessionals()
      return response.map((professional) => ({
        id: professional.id,
        name: professional.full_name,
        avatarUrl:
          toAbsoluteImageUrl(professional.avatar_url) ||
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop',
      }))
    },
  })

  const { data: events = [] } = useQuery({
    queryKey: ['agenda-events', date.toISOString().slice(0, 10)],
    queryFn: async () => {
      const response = await agendaAdapter.listAppointments(date.toISOString())
      const appointments = (response.data || []) as CalendarAppointment[]

      return appointments.map((appointment) => {
        const startTime = new Date(appointment.start_time)
        const endTime = new Date(appointment.end_time)
        const durationMinutes = Math.max((endTime.getTime() - startTime.getTime()) / 60000, 15)
        const isBlocked = appointment.service_id === null
        const clientName = appointment.client?.full_name || 'Cliente'
        const serviceName = appointment.service?.name || (isBlocked ? 'Bloqueio' : 'Servico')
        const phone = appointment.client?.phone || appointment.client?.cellphone || 'Telefone nao informado'

        return {
          id: appointment.id,
          professionalId: appointment.professional_id,
          startMinutes: toMinutesFromStart(startTime),
          durationMinutes,
          clientName: isBlocked ? 'Bloqueio' : clientName,
          serviceName,
          status: appointment.status,
          type: isBlocked ? 'blocked' : 'appointment',
          color: isBlocked ? '#CBD5E1' : '#6B8794',
          phone,
        } satisfies AgendaEvent
      })
    },
  })

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      <SidebarAgenda companyName={companyName} />

      <div className="ml-[260px] flex min-h-screen flex-col gap-6 px-8 py-8">
        <TopbarAgenda onOpenSettings={() => setSettingsOpen(true)} onNew={() => null} />

        <CalendarGrid professionals={professionals} events={events} />

        <button className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-lg">
          Calendario
        </button>
      </div>

      <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
