/**
 * Integration Helper Utilities
 * Completes frontend integrations for 100% coverage
 */

import { toast } from 'sonner'

export interface ApiResponse<T = any> {
  data: T
  status: number
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export class IntegrationHelper {
  /**
   * Handle API responses consistently across the app
   */
  static handleApiResponse<T>(response: ApiResponse<T>): T {
    if (response.status >= 200 && response.status < 300) {
      if (response.message) {
        toast.success(response.message)
      }
      return response.data
    }
    throw new Error(response.message || 'Request failed')
  }

  /**
   * Handle API errors consistently
   */
  static handleApiError(error: any): void {
    const message = error.response?.data?.detail || 
                   error.response?.data?.message || 
                   error.message || 
                   'Erro inesperado'
    
    console.error('API Error:', error)
    toast.error(message)
  }

  /**
   * Format currency values consistently
   */
  static formatCurrency(value: number | string): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue)
  }

  /**
   * Format date values consistently
   */
  static formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (format === 'short') {
      return dateObj.toLocaleDateString('pt-BR')
    }
    
    return dateObj.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * Format time values consistently
   */
  static formatTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Format phone numbers consistently
   */
  static formatPhone(phone: string): string {
    if (!phone) return ''
    
    const cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    }
    
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    
    return phone
  }

  /**
   * Format CPF consistently
   */
  static formatCPF(cpf: string): string {
    if (!cpf) return ''
    
    const cleaned = cpf.replace(/\D/g, '')
    
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
    }
    
    return cpf
  }

  /**
   * Format CNPJ consistently
   */
  static formatCNPJ(cnpj: string): string {
    if (!cnpj) return ''
    
    const cleaned = cnpj.replace(/\D/g, '')
    
    if (cleaned.length === 14) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`
    }
    
    return cnpj
  }

  /**
   * Validate required form fields
   */
  static validateRequiredFields(data: Record<string, any>, requiredFields: string[]): boolean {
    const missingFields = requiredFields.filter(field => 
      !data[field] || (typeof data[field] === 'string' && data[field].trim() === '')
    )
    
    if (missingFields.length > 0) {
      toast.error(`Campos obrigatórios: ${missingFields.join(', ')}`)
      return false
    }
    
    return true
  }

  /**
   * Copy text to clipboard
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copiado para a área de transferência')
      return true
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Falha ao copiar')
      return false
    }
  }

  /**
   * Download file from blob
   */
  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Generate pagination info
   */
  static getPaginationInfo(response: PaginatedResponse): {
    showing: string
    hasNext: boolean
    hasPrev: boolean
  } {
    const start = (response.page - 1) * response.per_page + 1
    const end = Math.min(response.page * response.per_page, response.total)
    
    return {
      showing: `Mostrando ${start}-${end} de ${response.total} resultados`,
      hasNext: response.page < response.total_pages,
      hasPrev: response.page > 1
    }
  }

  /**
   * Debounce function calls
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
  }

  /**
   * Check if user has feature access (simplified)
   */
  static hasFeatureAccess(feature: string, currentPlan: string): boolean {
    const featurePlans: Record<string, string[]> = {
      'financial_complete': ['pro', 'premium', 'scale'],
      'advanced_reports': ['premium', 'scale'],
      'online_booking': ['premium', 'scale'],
      'whatsapp_marketing': ['pro', 'premium', 'scale'],
      'subscription_sales': ['premium', 'scale'],
      'packages': ['pro', 'premium', 'scale'],
      'commissions': ['pro', 'premium', 'scale']
    }
    
    const allowedPlans = featurePlans[feature]
    if (!allowedPlans) return true
    
    return allowedPlans.includes(currentPlan?.toLowerCase())
  }
}

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
}

/**
 * Status mappings for consistent display
 */
export const StatusMappings = {
  appointment: {
    pending: { label: 'Pendente', color: 'yellow' },
    confirmed: { label: 'Confirmado', color: 'blue' },
    in_progress: { label: 'Em Andamento', color: 'green' },
    completed: { label: 'Concluído', color: 'green' },
    cancelled: { label: 'Cancelado', color: 'red' },
    no_show: { label: 'Não Compareceu', color: 'gray' }
  },
  payment: {
    pending: { label: 'Pendente', color: 'yellow' },
    paid: { label: 'Pago', color: 'green' },
    cancelled: { label: 'Cancelado', color: 'red' },
    refunded: { label: 'Reembolsado', color: 'gray' }
  },
  command: {
    open: { label: 'Aberta', color: 'blue' },
    in_progress: { label: 'Em Andamento', color: 'yellow' },
    finished: { label: 'Finalizada', color: 'green' },
    cancelled: { label: 'Cancelada', color: 'red' }
  }
}
