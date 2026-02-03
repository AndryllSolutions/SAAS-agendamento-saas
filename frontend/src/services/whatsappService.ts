/**
 * WhatsApp Service - Integração completa com backend
 * Reflete todas as capacidades do backend
 */
import api from './api'

// ========== TYPES ==========
export interface WhatsAppProvider {
  id: number
  company_id: number
  provider_name: string
  api_url: string
  api_key?: string
  api_secret?: string
  instance_id?: string
  is_active: boolean
  is_connected: boolean
  settings?: any
  created_at: string
  updated_at: string
}

export interface WhatsAppTemplate {
  id: number
  company_id: number
  name: string
  content: string
  available_variables?: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WhatsAppCampaign {
  id: number
  company_id: number
  template_id?: number
  name: string
  description?: string
  campaign_type: string
  content?: string
  auto_send_enabled: boolean
  schedule_config?: any
  client_filters?: any
  status: 'active' | 'paused' | 'finished' | 'cancelled'
  total_sent: number
  total_delivered: number
  total_read: number
  total_failed: number
  created_at: string
  updated_at: string
}

export interface WhatsAppCampaignLog {
  id: number
  company_id: number
  campaign_id: number
  client_crm_id: number
  phone_number: string
  message_content: string
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'error'
  sent_at?: string
  delivered_at?: string
  read_at?: string
  error_message?: string
  provider_response?: any
  created_at: string
  updated_at: string
}

export interface CampaignStats {
  total_sent: number
  total_delivered: number
  total_read: number
  total_failed: number
  delivery_rate: number
  read_rate: number
  failed_rate: number
}

// ========== SERVICE ==========
class WhatsAppService {
  
  // ========== PROVIDERS ==========
  
  async getProvider(): Promise<WhatsAppProvider> {
    const response = await api.get<WhatsAppProvider>('/whatsapp/providers')
    return response.data
  }
  
  async createProvider(data: Partial<WhatsAppProvider>): Promise<WhatsAppProvider> {
    const response = await api.post<WhatsAppProvider>('/whatsapp/providers', data)
    return response.data
  }
  
  async updateProvider(id: number, data: Partial<WhatsAppProvider>): Promise<WhatsAppProvider> {
    const response = await api.put<WhatsAppProvider>(`/whatsapp/providers/${id}`, data)
    return response.data
  }
  
  async deleteProvider(id: number): Promise<void> {
    await api.delete(`/whatsapp/providers/${id}`)
  }
  
  async checkConnection(): Promise<{ connected: boolean; status: string }> {
    const response = await api.get('/whatsapp/providers/connection-status')
    return response.data
  }
  
  // ========== TEMPLATES ==========
  
  async listTemplates(isActive?: boolean): Promise<WhatsAppTemplate[]> {
    const params = isActive !== undefined ? { is_active: isActive } : {}
    const response = await api.get<WhatsAppTemplate[]>('/whatsapp/templates', { params })
    return response.data
  }
  
  async getTemplate(id: number): Promise<WhatsAppTemplate> {
    const response = await api.get<WhatsAppTemplate>(`/whatsapp/templates/${id}`)
    return response.data
  }
  
  async createTemplate(data: Partial<WhatsAppTemplate>): Promise<WhatsAppTemplate> {
    const response = await api.post<WhatsAppTemplate>('/whatsapp/templates', data)
    return response.data
  }
  
  async updateTemplate(id: number, data: Partial<WhatsAppTemplate>): Promise<WhatsAppTemplate> {
    const response = await api.put<WhatsAppTemplate>(`/whatsapp/templates/${id}`, data)
    return response.data
  }
  
  async deleteTemplate(id: number): Promise<void> {
    await api.delete(`/whatsapp/templates/${id}`)
  }
  
  // ========== CAMPAIGNS MANUAIS ==========
  
  async listCampaigns(status?: string, skip = 0, limit = 100): Promise<WhatsAppCampaign[]> {
    const params: any = { skip, limit }
    if (status) params.status = status
    
    const response = await api.get<WhatsAppCampaign[]>('/whatsapp/campaigns', { params })
    return response.data
  }
  
  async getCampaign(id: number): Promise<WhatsAppCampaign> {
    const response = await api.get<WhatsAppCampaign>(`/whatsapp/campaigns/${id}`)
    return response.data
  }
  
  async createCampaign(data: Partial<WhatsAppCampaign>): Promise<WhatsAppCampaign> {
    const response = await api.post<WhatsAppCampaign>('/whatsapp/campaigns', data)
    return response.data
  }
  
  async updateCampaign(id: number, data: Partial<WhatsAppCampaign>): Promise<WhatsAppCampaign> {
    const response = await api.put<WhatsAppCampaign>(`/whatsapp/campaigns/${id}`, data)
    return response.data
  }
  
  async deleteCampaign(id: number): Promise<void> {
    await api.delete(`/whatsapp/campaigns/${id}`)
  }
  
  async sendCampaign(id: number): Promise<{
    message: string
    campaign_id: number
    sent: number
    failed: number
    total: number
  }> {
    const response = await api.post(`/whatsapp/campaigns/${id}/send`)
    return response.data
  }
  
  async toggleAutoSend(id: number): Promise<WhatsAppCampaign> {
    const response = await api.post<WhatsAppCampaign>(`/whatsapp/campaigns/${id}/toggle-auto`)
    return response.data
  }
  
  // ========== LOGS E ESTATÍSTICAS ==========
  
  async getCampaignLogs(id: number, status?: string, skip = 0, limit = 100): Promise<WhatsAppCampaignLog[]> {
    const params: any = { skip, limit }
    if (status) params.status = status
    
    const response = await api.get<WhatsAppCampaignLog[]>(`/whatsapp/campaigns/${id}/logs`, { params })
    return response.data
  }
  
  async getCampaignStats(id: number): Promise<CampaignStats> {
    // Calcular estatísticas baseado nos logs
    const logs = await this.getCampaignLogs(id, undefined, 0, 10000)
    
    const stats: CampaignStats = {
      total_sent: logs.filter(l => l.status === 'sent').length,
      total_delivered: logs.filter(l => l.status === 'delivered').length,
      total_read: logs.filter(l => l.status === 'read').length,
      total_failed: logs.filter(l => l.status === 'failed' || l.status === 'error').length,
      delivery_rate: 0,
      read_rate: 0,
      failed_rate: 0
    }
    
    const total = stats.total_sent
    if (total > 0) {
      stats.delivery_rate = (stats.total_delivered / total) * 100
      stats.read_rate = (stats.total_read / total) * 100
      stats.failed_rate = (stats.total_failed / total) * 100
    }
    
    return stats
  }
  
  // ========== HELPER METHODS ==========
  
  async testConnection(): Promise<boolean> {
    try {
      const status = await this.checkConnection()
      return status.connected
    } catch (error) {
      console.error('Erro ao testar conexão:', error)
      return false
    }
  }
  
  formatPhoneNumber(phone: string): string {
    // Remove espaços e caracteres especiais
    let formatted = phone.replace(/\D/g, '')
    
    // Adiciona código do Brasil se não tiver
    if (!formatted.startsWith('55')) {
      formatted = '55' + formatted
    }
    
    // Adiciona +
    if (!formatted.startsWith('+')) {
      formatted = '+' + formatted
    }
    
    return formatted
  }
}

export const whatsappService = new WhatsAppService()
export default whatsappService
