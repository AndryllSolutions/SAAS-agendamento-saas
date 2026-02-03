import api from './api'

export interface Professional {
  id: number
  full_name: string
  email: string
  phone?: string
  cellphone?: string
  avatar_url?: string
  is_active: boolean
  commission_rate?: number
  specialties?: string[]
  role: string
  sort_order?: number
  cpf_cnpj?: string
  date_of_birth?: string
  bio?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  working_hours?: any
}

export interface ReorderRequest {
  items: Array<{
    id: number
    sort_order: number
  }>
}

export const professionalService = {
  // Existing methods
  list: async (params?: any) => {
    return api.get('/professionals', { params })
  },

  get: async (id: number) => {
    return api.get(`/professionals/${id}`)
  },

  create: async (data: any) => {
    return api.post('/professionals', data)
  },

  update: async (id: number, data: any) => {
    return api.put(`/professionals/${id}`, data)
  },

  delete: async (id: number) => {
    return api.delete(`/professionals/${id}`)
  },

  getStatistics: async (id: number, startDate?: string, endDate?: string) => {
    const params: any = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    return api.get(`/professionals/${id}/statistics`, { params })
  },

  // New reorder method
  reorder: async (data: ReorderRequest) => {
    return api.post('/professionals/reorder', data)
  },

  // Schedule overrides
  getScheduleOverrides: async (professionalId: number, params?: any) => {
    return api.get(`/professionals/${professionalId}/schedule-overrides`, { params })
  },

  createScheduleOverride: async (professionalId: number, data: any) => {
    return api.post(`/professionals/${professionalId}/schedule-overrides`, data)
  },

  updateScheduleOverride: async (professionalId: number, overrideId: number, data: any) => {
    return api.put(`/professionals/${professionalId}/schedule-overrides/${overrideId}`, data)
  },

  deleteScheduleOverride: async (professionalId: number, overrideId: number) => {
    return api.delete(`/professionals/${professionalId}/schedule-overrides/${overrideId}`)
  },

  // Vouchers
  getVouchers: async (professionalId: number, params?: any) => {
    return api.get(`/professionals/${professionalId}/vouchers`, { params })
  },

  createVoucher: async (professionalId: number, data: any) => {
    return api.post(`/professionals/${professionalId}/vouchers`, data)
  },

  updateVoucher: async (professionalId: number, voucherId: number, data: any) => {
    return api.put(`/professionals/${professionalId}/vouchers/${voucherId}`, data)
  },

  deleteVoucher: async (professionalId: number, voucherId: number) => {
    return api.delete(`/professionals/${professionalId}/vouchers/${voucherId}`)
  },

  payVoucher: async (professionalId: number, voucherId: number, data: any) => {
    return api.post(`/professionals/${professionalId}/vouchers/${voucherId}/pay`, data)
  },

  getVouchersSummary: async (professionalId: number) => {
    return api.get(`/professionals/${professionalId}/vouchers/summary`)
  }
}
