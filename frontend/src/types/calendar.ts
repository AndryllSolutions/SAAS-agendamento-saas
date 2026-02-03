/**
 * Calendar Types - Time Grid per Professional
 * Tipos para a agenda time-grid com suporte a multi-serviços
 */

export interface CalendarProfessional {
  id: number
  full_name: string
  avatar_url?: string | null
  email?: string | null
  phone?: string | null
  working_hours?: Record<string, any> | null
}

export interface AppointmentItem {
  service_id: number
  service_name: string
  professional_id: number
  start_time: string
  end_time: string
  duration_minutes: number
  price?: number | null
}

export interface CalendarClient {
  id: number
  full_name: string
  phone?: string | null
  cellphone?: string | null
}

export interface CalendarAppointment {
  id: number
  start_time: string
  end_time: string
  status: string
  color?: string | null
  client?: CalendarClient | null
  items: AppointmentItem[]
  notes?: string | null
  professional_id?: number | null
}

export interface BusyBlock {
  id?: number | null
  professional_id: number
  start_time: string
  end_time: string
  reason: string
}

export interface CalendarDayResponse {
  date: string
  professionals: CalendarProfessional[]
  appointments: CalendarAppointment[]
  busy_blocks: BusyBlock[]
}

export interface AppointmentMoveRequest {
  start_time: string
  professional_id?: number | null
}

export interface ClientNote {
  id: number
  content: string
  is_private: boolean
  created_by_id: number
  created_by_name: string
  created_at: string
  updated_at: string
}

export interface ClientNoteCreate {
  content: string
  is_private?: boolean
}

export interface ClientNoteUpdate {
  content?: string
  is_private?: boolean
}
