import type { ServiceItem, ProfessionalItem } from '@/components/online-booking/types'

const normalizeBaseUrl = (baseUrl: string) => {
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL não configurada. Defina a variável de ambiente para habilitar o agendamento público.')
  }
  return baseUrl.replace(/\/$/, '')
}

const handleResponse = async <T>(response: Response, fallbackMessage: string): Promise<T> => {
  if (response.ok) {
    return response.json()
  }

  try {
    const data = await response.json()
    const detail = data?.detail || data?.message
    throw new Error(detail || fallbackMessage)
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error(fallbackMessage)
  }
}

export const getPublicServices = async (baseUrl: string, companyId: number) => {
  const url = new URL('/api/public/services', normalizeBaseUrl(baseUrl))
  if (companyId) {
    url.searchParams.set('companyId', String(companyId))
  }
  const response = await fetch(url.toString(), { cache: 'no-store' })
  return handleResponse<ServiceItem[]>(response, 'Não foi possível carregar os serviços públicos.')
}

export const getPublicProfessionals = async (baseUrl: string, companyId: number) => {
  const url = new URL('/api/public/professionals', normalizeBaseUrl(baseUrl))
  if (companyId) {
    url.searchParams.set('companyId', String(companyId))
  }
  const response = await fetch(url.toString(), { cache: 'no-store' })
  return handleResponse<ProfessionalItem[]>(response, 'Não foi possível carregar os profissionais públicos.')
}

export const getPublicAvailability = async (
  baseUrl: string,
  params: { companyId: number; serviceId: number; professionalId: number; date: string }
) => {
  const url = new URL('/api/public/availability', normalizeBaseUrl(baseUrl))
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, String(value))
    }
  })
  const response = await fetch(url.toString(), { cache: 'no-store' })
  return handleResponse<{ date: string; slots: string[] }>(response, 'Não encontramos horários disponíveis para a data selecionada.')
}

export interface CreatePublicAppointmentPayload {
  companyId: number
  serviceId: number
  professionalId: number
  date: string
  time: string
  customer: {
    name: string
    phone: string
    email?: string
    notes?: string
  }
}

export interface CreatePublicAppointmentResponse {
  ok: boolean
  appointmentId?: number | string
}

export const createPublicAppointment = async (
  baseUrl: string,
  payload: CreatePublicAppointmentPayload
) => {
  const url = new URL('/api/public/appointments', normalizeBaseUrl(baseUrl))
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return handleResponse<CreatePublicAppointmentResponse>(response, 'Não conseguimos finalizar seu agendamento. Tente novamente.')
}
