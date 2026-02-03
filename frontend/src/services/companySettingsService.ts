/**
 * Company Settings Service
 * Serviço para gerenciar todas as configurações da empresa
 */
import api from './api'

// ========== TYPES ==========

export enum CompanyType {
  PESSOA_FISICA = 'pessoa_fisica',
  PESSOA_JURIDICA = 'pessoa_juridica'
}

export enum Language {
  PT_BR = 'pt_BR',
  ES = 'es',
  EN = 'en'
}

export enum Currency {
  BRL = 'BRL',
  USD = 'USD',
  EUR = 'EUR',
  ARS = 'ARS',
  CLP = 'CLP'
}

export enum Country {
  BR = 'BR',
  AR = 'AR',
  CL = 'CL',
  US = 'US'
}

export interface CompanyDetails {
  id?: number
  company_id?: number
  company_type: CompanyType
  document_number?: string
  company_name?: string
  municipal_registration?: string
  state_registration?: string
  email?: string
  phone?: string
  whatsapp?: string
  postal_code?: string
  address?: string
  address_number?: string
  address_complement?: string
  neighborhood?: string
  city?: string
  state?: string
  country?: string
  created_at?: string
  updated_at?: string
}

export interface FinancialSettings {
  id?: number
  company_id?: number
  allow_retroactive_entries: boolean
  allow_invoice_edit_after_conference: boolean
  edit_only_value_after_conference: boolean
  allow_operations_with_closed_cash: boolean
  require_category_on_transaction: boolean
  require_payment_form_on_transaction: boolean
  created_at?: string
  updated_at?: string
}

export interface NotificationSettings {
  id?: number
  company_id?: number
  notify_new_appointment: boolean
  notify_appointment_cancellation: boolean
  notify_appointment_deletion: boolean
  notify_new_review: boolean
  notify_sms_response: boolean
  notify_client_return: boolean
  notify_goal_achievement: boolean
  notify_client_waiting: boolean
  notification_sound_enabled: boolean
  notification_duration_seconds: number
  created_at?: string
  updated_at?: string
}

export interface ThemeSettings {
  id?: number
  company_id?: number
  interface_language: Language
  sidebar_color: string
  theme_mode: string
  custom_logo_url?: string
  created_at?: string
  updated_at?: string
}

export interface AdminSettings {
  id?: number
  company_id?: number
  default_message_language: Language
  currency: Currency
  country: Country
  timezone: string
  date_format: string
  time_format: string
  additional_settings?: any
  created_at?: string
  updated_at?: string
}

export interface AllSettings {
  details?: CompanyDetails
  financial?: FinancialSettings
  notifications?: NotificationSettings
  theme?: ThemeSettings
  admin?: AdminSettings
}

// ========== SERVICE ==========

class CompanySettingsService {
  // ========== COMPANY DETAILS ==========
  
  async getDetails(): Promise<CompanyDetails> {
    const response = await api.get<CompanyDetails>('/settings/details')
    return response.data
  }
  
  async updateDetails(data: Partial<CompanyDetails>): Promise<CompanyDetails> {
    const response = await api.put<CompanyDetails>('/settings/details', data)
    return response.data
  }
  
  // ========== FINANCIAL SETTINGS ==========
  
  async getFinancialSettings(): Promise<FinancialSettings> {
    const response = await api.get<FinancialSettings>('/settings/financial')
    return response.data
  }
  
  async updateFinancialSettings(data: Partial<FinancialSettings>): Promise<FinancialSettings> {
    const response = await api.put<FinancialSettings>('/settings/financial', data)
    return response.data
  }
  
  // ========== NOTIFICATION SETTINGS ==========
  
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await api.get<NotificationSettings>('/settings/notifications')
    return response.data
  }
  
  async updateNotificationSettings(data: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response = await api.put<NotificationSettings>('/settings/notifications', data)
    return response.data
  }
  
  // ========== THEME SETTINGS ==========
  
  async getThemeSettings(): Promise<ThemeSettings> {
    const response = await api.get<ThemeSettings>('/settings/theme')
    return response.data
  }
  
  async updateThemeSettings(data: Partial<ThemeSettings>): Promise<ThemeSettings> {
    const response = await api.put<ThemeSettings>('/settings/theme', data)
    return response.data
  }
  
  // ========== ADMIN SETTINGS ==========
  
  async getAdminSettings(): Promise<AdminSettings> {
    const response = await api.get<AdminSettings>('/settings/admin')
    return response.data
  }
  
  async updateAdminSettings(data: Partial<AdminSettings>): Promise<AdminSettings> {
    const response = await api.put<AdminSettings>('/settings/admin', data)
    return response.data
  }
  
  // ========== ALL SETTINGS ==========
  
  async getAllSettings(): Promise<AllSettings> {
    const response = await api.get<AllSettings>('/settings/all')
    return response.data
  }
  
  // ========== HELPER METHODS ==========
  
  /**
   * Valida CPF
   */
  validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/\D/g, '')
    
    if (cpf.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cpf)) return false
    
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let digit = 11 - (sum % 11)
    if (digit >= 10) digit = 0
    if (digit !== parseInt(cpf.charAt(9))) return false
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i)
    }
    digit = 11 - (sum % 11)
    if (digit >= 10) digit = 0
    if (digit !== parseInt(cpf.charAt(10))) return false
    
    return true
  }
  
  /**
   * Valida CNPJ
   */
  validateCNPJ(cnpj: string): boolean {
    cnpj = cnpj.replace(/\D/g, '')
    
    if (cnpj.length !== 14) return false
    if (/^(\d)\1{13}$/.test(cnpj)) return false
    
    let size = cnpj.length - 2
    let numbers = cnpj.substring(0, size)
    const digits = cnpj.substring(size)
    let sum = 0
    let pos = size - 7
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--
      if (pos < 2) pos = 9
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    if (result !== parseInt(digits.charAt(0))) return false
    
    size = size + 1
    numbers = cnpj.substring(0, size)
    sum = 0
    pos = size - 7
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--
      if (pos < 2) pos = 9
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    if (result !== parseInt(digits.charAt(1))) return false
    
    return true
  }
  
  /**
   * Formata CPF
   */
  formatCPF(cpf: string): string {
    cpf = cpf.replace(/\D/g, '')
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  
  /**
   * Formata CNPJ
   */
  formatCNPJ(cnpj: string): string {
    cnpj = cnpj.replace(/\D/g, '')
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  
  /**
   * Formata CEP
   */
  formatCEP(cep: string): string {
    cep = cep.replace(/\D/g, '')
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2')
  }
  
  /**
   * Busca endereço por CEP (ViaCEP)
   */
  async searchAddressByCEP(cep: string): Promise<any> {
    try {
      const cleanCEP = cep.replace(/\D/g, '')
      if (cleanCEP.length !== 8) {
        throw new Error('CEP inválido')
      }
      
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      const data = await response.json()
      
      if (data.erro) {
        throw new Error('CEP não encontrado')
      }
      
      return {
        address: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      throw error
    }
  }
}

export const companySettingsService = new CompanySettingsService()
export default companySettingsService
