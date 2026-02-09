/**
 * Online Booking Service
 * Serviço para gerenciar configurações de agendamento online
 */
import api from './api'

export interface OnlineBookingConfig {
  id?: number
  company_id?: number
  
  // Detalhes da empresa
  public_name?: string
  public_description?: string
  logo_url?: string
  public_slug?: string
  
  // Endereço
  use_company_address?: boolean
  public_address?: string
  public_address_number?: string
  public_address_complement?: string
  public_neighborhood?: string
  public_city?: string
  public_state?: string
  public_postal_code?: string
  
  // Contatos
  public_whatsapp?: string
  public_phone?: string
  public_instagram?: string
  public_facebook?: string
  public_website?: string
  
  // Aparência
  primary_color?: string
  theme?: 'light' | 'dark' | 'optional'
  
  // Fluxo
  booking_flow?: 'service_first' | 'professional_first'
  
  // Login
  require_login?: boolean
  
  // Antecedência
  min_advance_time_minutes?: number
  
  // Cancelamento
  allow_cancellation?: boolean
  cancellation_min_hours?: number
  
  // Pagamento
  enable_payment_local?: boolean
  enable_payment_card?: boolean
  enable_payment_pix?: boolean
  enable_deposit_payment?: boolean
  deposit_percentage?: number
  
  // Status
  is_active?: boolean
  
  created_at?: string
  updated_at?: string
}

export interface GalleryImage {
  id?: number
  company_id?: number
  config_id?: number
  image_url: string
  display_order?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface BusinessHours {
  id?: number
  company_id?: number
  config_id?: number
  day_of_week: number
  is_active?: boolean
  start_time?: string
  break_start_time?: string
  break_end_time?: string
  end_time?: string
  created_at?: string
  updated_at?: string
}

export interface BookingLinks {
  base_url: string
  general_link: string
  instagram_link: string
  whatsapp_link: string
  google_link: string
  facebook_link: string
  slug: string
}

class OnlineBookingService {
  // ========== CONFIG ==========
  
  async getConfig() {
    const response = await api.get<OnlineBookingConfig>('/online-booking/config')
    return response.data
  }
  
  async createConfig(data: OnlineBookingConfig) {
    const response = await api.post<OnlineBookingConfig>('/online-booking/config', data)
    return response.data
  }
  
  async updateConfig(data: Partial<OnlineBookingConfig>) {
    const response = await api.put<OnlineBookingConfig>('/online-booking/config', data)
    return response.data
  }
  
  // ========== GALLERY ==========
  
  async listGalleryImages() {
    const response = await api.get<GalleryImage[]>('/online-booking/gallery')
    return response.data
  }
  
  async addGalleryImage(data: { image_url: string; display_order?: number }) {
    const response = await api.post<GalleryImage>('/online-booking/gallery', data)
    return response.data
  }
  
  async updateGalleryImage(imageId: number, data: Partial<GalleryImage>) {
    const response = await api.put<GalleryImage>(`/online-booking/gallery/${imageId}`, data)
    return response.data
  }
  
  async deleteGalleryImage(imageId: number) {
    await api.delete(`/online-booking/gallery/${imageId}`)
  }
  
  // ========== BUSINESS HOURS ==========
  
  async listBusinessHours() {
    const response = await api.get<BusinessHours[]>('/online-booking/business-hours')
    return response.data
  }
  
  async createBusinessHours(data: BusinessHours) {
    const response = await api.post<BusinessHours>('/online-booking/business-hours', data)
    return response.data
  }
  
  async updateBusinessHours(dayOfWeek: number, data: Partial<BusinessHours>) {
    const response = await api.put<BusinessHours>(`/online-booking/business-hours/${dayOfWeek}`, data)
    return response.data
  }
  
  async bulkUpdateBusinessHours(hours: BusinessHours[]) {
    const response = await api.post<BusinessHours[]>('/online-booking/business-hours/bulk', { hours })
    return response.data
  }
  
  // ========== LINKS ==========
  
  async getLinks() {
    const response = await api.get<BookingLinks>('/online-booking/links')
    return response.data
  }
  
  // ========== SERVICES ==========
  
  async listAvailableServices() {
    const response = await api.get('/online-booking/services/available')
    return response.data
  }
  
  async listUnavailableServices() {
    const response = await api.get('/online-booking/services/unavailable')
    return response.data
  }
  
  async toggleServiceAvailability(serviceId: number, available: boolean) {
    const response = await api.put(`/online-booking/services/${serviceId}/availability`, null, {
      params: { available }
    })
    return response.data
  }
}

export const onlineBookingService = new OnlineBookingService()
