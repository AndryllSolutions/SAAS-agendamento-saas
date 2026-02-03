/**
 * Agenda Adapter
 * Camada de adaptação entre UI e Backend
 * Mapeia endpoints existentes e fornece fallbacks para funcionalidades não disponíveis
 */

import { appointmentService, userService, clientService, serviceService, commandService } from './api'

// ========== TIPOS ==========

export interface AgendaColor {
  id: string
  name: string
  hex: string
  statusKey: string | null
}

export interface AgendaSettings {
  slotMinutes: number
  columnWidthMode: string
  defaultStatusKey: string
  showAvatars: boolean
  filterProfessionalsByService: boolean
  blockCancelledAppointments: boolean
}

export interface Professional {
  id: number
  full_name: string
  avatar_url?: string | null
  working_hours?: Record<string, any>
}

export interface Client {
  id: number
  full_name: string
  phone?: string
  email?: string
}

export interface Service {
  id: number
  name: string
  duration_minutes: number
  price: number
}

export interface Block {
  id?: number
  professionalId: number
  start: string
  end: string
  reason: string
}

// ========== CORES PADRÃO (SEED) ==========

const DEFAULT_COLORS: AgendaColor[] = [
  { id: '1', name: 'Confirmado', hex: '#10B981', statusKey: 'confirmed' },
  { id: '2', name: 'Não confirmado', hex: '#3B82F6', statusKey: 'pending' },
  { id: '3', name: 'Aguardando', hex: '#F59E0B', statusKey: 'pending' },
  { id: '4', name: 'Cancelado', hex: '#EF4444', statusKey: 'cancelled' },
  { id: '5', name: 'Faturado', hex: '#6366F1', statusKey: 'completed' },
  { id: '6', name: 'Ocupação', hex: '#6B7280', statusKey: null },
  { id: '7', name: 'Cliente VIP', hex: '#F59E0B', statusKey: null },
  { id: '8', name: 'Check In', hex: '#10B981', statusKey: 'checked_in' },
  { id: '9', name: 'Em atendimento', hex: '#3B82F6', statusKey: 'in_progress' },
  { id: '10', name: 'Retrabalho', hex: '#F97316', statusKey: null },
  { id: '11', name: 'Bloqueio', hex: '#6B7280', statusKey: null },
  { id: '12', name: 'Pago', hex: '#10B981', statusKey: null }
]

// ========== CONFIGURAÇÕES PADRÃO (SEED) ==========

const DEFAULT_SETTINGS: AgendaSettings = {
  slotMinutes: 15,
  columnWidthMode: 'auto',
  defaultStatusKey: 'confirmed',
  showAvatars: true,
  filterProfessionalsByService: false,
  blockCancelledAppointments: true
}

// ========== HELPERS ==========

function getCompanyId(): string {
  // TODO: Pegar do contexto de autenticação
  return localStorage.getItem('company_id') || '1'
}

function getStorageKey(key: string): string {
  return `agenda_${key}_${getCompanyId()}`
}

// ========== ADAPTER ==========

export const agendaAdapter = {
  // ========== APPOINTMENTS (✅ Endpoints existem) ==========
  
  async listAppointments(date: string) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    return appointmentService.list({
      start_date: startOfDay.toISOString(),
      end_date: endOfDay.toISOString()
    })
  },
  
  async createAppointment(data: any) {
    return appointmentService.create(data)
  },
  
  async updateAppointment(id: number, data: any) {
    return appointmentService.update(id, data)
  },
  
  async cancelAppointment(id: number, reason?: string) {
    return appointmentService.cancel(id, reason)
  },
  
  // ========== PROFESSIONALS (✅ Endpoint existe) ==========
  
  async listProfessionals(): Promise<Professional[]> {
    const response = await userService.getProfessionals()
    return response.data || []
  },
  
  // ========== CLIENTS (✅ Endpoint existe) ==========
  
  async searchClients(query: string): Promise<Client[]> {
    const response = await clientService.list({ search: query })
    return response.data || []
  },
  
  // ========== SERVICES (✅ Endpoint existe) ==========
  
  async listServices(): Promise<Service[]> {
    const response = await serviceService.list()
    return response.data || []
  },
  
  // ========== BLOCKS (⚠️ Usar appointments com service_id = NULL) ==========
  
  async listBlocks(date: string): Promise<Block[]> {
    const response = await this.listAppointments(date)
    const appointments = response.data || []
    
    // Filtrar appointments sem service_id (bloqueios)
    return appointments
      .filter((apt: any) => apt.service_id === null)
      .map((apt: any) => ({
        id: apt.id,
        professionalId: apt.professional_id,
        start: apt.start_time,
        end: apt.end_time,
        reason: apt.internal_notes?.replace('BLOQUEIO: ', '') || 'Bloqueio'
      }))
  },
  
  async createBlock(block: Block) {
    // Criar appointment sem service_id
    return appointmentService.create({
      professional_id: block.professionalId,
      service_id: null, // NULL = bloqueio
      start_time: block.start,
      end_time: block.end,
      internal_notes: `BLOQUEIO: ${block.reason}`
    })
  },
  
  async deleteBlock(id: number) {
    return appointmentService.cancel(id, 'Bloqueio removido')
  },
  
  // ========== SETTINGS (⚠️ Fallback localStorage) ==========
  
  async getAgendaSettings(): Promise<AgendaSettings> {
    const stored = localStorage.getItem(getStorageKey('settings'))
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        return {
          ...DEFAULT_SETTINGS,
          ...parsed
        }
      } catch {
        localStorage.setItem(getStorageKey('settings'), JSON.stringify(DEFAULT_SETTINGS))
        return DEFAULT_SETTINGS
      }
    }
    
    // Seed inicial
    localStorage.setItem(getStorageKey('settings'), JSON.stringify(DEFAULT_SETTINGS))
    return DEFAULT_SETTINGS
  },
  
  async saveAgendaSettings(settings: AgendaSettings): Promise<void> {
    localStorage.setItem(getStorageKey('settings'), JSON.stringify(settings))
    // TODO: POST /api/v1/agenda/settings quando disponível
  },
  
  // ========== COLORS (⚠️ Fallback localStorage) ==========
  
  async listColors(): Promise<AgendaColor[]> {
    const stored = localStorage.getItem(getStorageKey('colors'))
    if (stored) {
      return JSON.parse(stored)
    }
    
    // Seed inicial
    localStorage.setItem(getStorageKey('colors'), JSON.stringify(DEFAULT_COLORS))
    return DEFAULT_COLORS
  },
  
  async createColor(color: Omit<AgendaColor, 'id'>): Promise<AgendaColor> {
    const colors = await this.listColors()
    const newColor: AgendaColor = {
      ...color,
      id: Date.now().toString()
    }
    colors.push(newColor)
    localStorage.setItem(getStorageKey('colors'), JSON.stringify(colors))
    // TODO: POST /api/v1/agenda/colors quando disponível
    return newColor
  },
  
  async updateColor(id: string, updates: Partial<AgendaColor>): Promise<AgendaColor> {
    const colors = await this.listColors()
    const index = colors.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Cor não encontrada')
    
    colors[index] = { ...colors[index], ...updates }
    localStorage.setItem(getStorageKey('colors'), JSON.stringify(colors))
    // TODO: PUT /api/v1/agenda/colors/{id} quando disponível
    return colors[index]
  },
  
  async deleteColor(id: string): Promise<void> {
    const colors = await this.listColors()
    const filtered = colors.filter(c => c.id !== id)
    localStorage.setItem(getStorageKey('colors'), JSON.stringify(filtered))
    // TODO: DELETE /api/v1/agenda/colors/{id} quando disponível
  },

  // ========== COMANDA ( Endpoint existe) ==========

  async createComandaFromAppointment(appointmentId: number): Promise<{ comandaId: number }> {
    // 1. Buscar appointment
    const appointmentRes = await appointmentService.get(appointmentId)
    const appointment = appointmentRes.data

    // 2. Buscar service para pegar preço
    const serviceRes = await serviceService.get(appointment.service_id)
    const service = serviceRes.data

    // 3. Criar command
    const response = await commandService.create({
      client_id: appointment.client_crm_id,
      appointment_id: appointmentId,
      professional_id: appointment.professional_id,
      date: appointment.start_time,
      items: [{
        item_type: 'service',
        service_id: appointment.service_id,
        professional_id: appointment.professional_id,
        quantity: 1,
        unit_value: service.price,
        commission_percentage: 0
      }]
    })

    return { comandaId: response.data.id }
  },

  // ========== RECURRENCE ( Criar múltiplos appointments) ==========

  // ========== RECURRENCE (⚠️ Criar múltiplos appointments) ==========
  
  async createRecurringAppointments(data: any, recurrence: string, count: number) {
    const appointments = []
    const startDate = new Date(data.start_time)
    
    // i=1 para não duplicar o primeiro agendamento já criado
    for (let i = 1; i <= count; i++) {
      const appointmentDate = new Date(startDate)
      
      // Calcular próxima data baseado na recorrência
      if (recurrence === 'daily') {
        appointmentDate.setDate(startDate.getDate() + i)
      } else if (recurrence === 'weekly') {
        appointmentDate.setDate(startDate.getDate() + (i * 7))
      } else if (recurrence === 'monthly') {
        appointmentDate.setMonth(startDate.getMonth() + i)
      }
      
      const appointmentData = {
        ...data,
        start_time: appointmentDate.toISOString()
      }
      
      const response = await this.createAppointment(appointmentData)
      appointments.push(response)
    }
    
    return appointments
  },
  
  // ========== HELPER: Mapear status para cor ==========
  
  async getColorForStatus(statusKey: string): Promise<string> {
    const colors = await this.listColors()
    const color = colors.find(c => c.statusKey === statusKey)
    return color?.hex || '#6B7280' // Cinza padrão
  }
}
