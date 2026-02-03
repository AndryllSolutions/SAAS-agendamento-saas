/**
 * WhatsApp Marketing Service
 * Serviço para gerenciar campanhas automáticas e personalizadas de WhatsApp
 */
import api from './api'

// ========== TYPES ==========

export enum AutomatedCampaignType {
  BIRTHDAY = 'birthday',
  RECONQUER = 'reconquer',
  REMINDER = 'reminder',
  PRE_CARE = 'pre_care',
  POST_CARE = 'post_care',
  RETURN_GUARANTEE = 'return_guarantee',
  STATUS_UPDATE = 'status_update',
  WELCOME = 'welcome',
  INVITE_ONLINE = 'invite_online',
  CASHBACK = 'cashback',
  PACKAGE_EXPIRING = 'package_expiring',
  BILLING = 'billing'
}

export interface AutomatedCampaignConfig {
  [key: string]: any
}

export interface AutomatedCampaignFilters {
  service_ids?: number[]
  client_tags?: string[]
  min_purchase_value?: number
  [key: string]: any
}

export interface AutomatedCampaign {
  id?: number
  campaign_type: AutomatedCampaignType
  name: string
  description: string
  is_enabled: boolean
  is_configured: boolean
  config?: AutomatedCampaignConfig
  message_template?: string
  default_message_template: string
  available_variables: string[]
  filters?: AutomatedCampaignFilters
  send_time_start: string
  send_time_end: string
  send_weekdays_only: boolean
  total_triggered: number
  total_sent: number
  total_failed: number
}

export interface CampaignStats {
  total_triggered: number
  total_sent: number
  total_failed: number
  success_rate: number
}

export interface UpdateCampaignData {
  is_enabled?: boolean
  config?: AutomatedCampaignConfig
  message_template?: string
  filters?: AutomatedCampaignFilters
  send_time_start?: string
  send_time_end?: string
  send_weekdays_only?: boolean
}

// ========== SERVICE ==========

class WhatsAppMarketingService {
  // ========== AUTOMATED CAMPAIGNS ==========
  
  /**
   * Lista todas as campanhas automáticas disponíveis
   */
  async listAutomatedCampaigns(): Promise<AutomatedCampaign[]> {
    const response = await api.get<AutomatedCampaign[]>('/whatsapp-marketing/automated-campaigns')
    return response.data
  }
  
  /**
   * Obtém detalhes de uma campanha automática específica
   */
  async getAutomatedCampaign(campaignType: AutomatedCampaignType): Promise<AutomatedCampaign> {
    const response = await api.get<AutomatedCampaign>(`/whatsapp-marketing/automated-campaigns/${campaignType}`)
    return response.data
  }
  
  /**
   * Ativa ou desativa uma campanha automática
   */
  async toggleAutomatedCampaign(campaignType: AutomatedCampaignType, enabled: boolean): Promise<AutomatedCampaign> {
    const response = await api.post<AutomatedCampaign>(
      `/whatsapp-marketing/automated-campaigns/${campaignType}/toggle`,
      null,
      { params: { enabled } }
    )
    return response.data
  }
  
  /**
   * Atualiza a configuração de uma campanha automática
   */
  async updateAutomatedCampaign(
    campaignType: AutomatedCampaignType,
    data: UpdateCampaignData
  ): Promise<AutomatedCampaign> {
    const response = await api.put<AutomatedCampaign>(
      `/whatsapp-marketing/automated-campaigns/${campaignType}`,
      data
    )
    return response.data
  }
  
  /**
   * Reseta uma campanha automática para as configurações padrão
   */
  async resetAutomatedCampaign(campaignType: AutomatedCampaignType): Promise<AutomatedCampaign> {
    const response = await api.post<AutomatedCampaign>(
      `/whatsapp-marketing/automated-campaigns/${campaignType}/reset`
    )
    return response.data
  }
  
  /**
   * Obtém estatísticas de uma campanha automática
   */
  async getCampaignStats(campaignType: AutomatedCampaignType): Promise<CampaignStats> {
    const response = await api.get<CampaignStats>(
      `/whatsapp-marketing/automated-campaigns/${campaignType}/stats`
    )
    return response.data
  }
  
  // ========== HELPER METHODS ==========
  
  /**
   * Formata variáveis do template para exibição
   */
  formatVariable(variable: string): string {
    const variableMap: { [key: string]: string } = {
      nome_cliente: 'Nome do Cliente',
      nome_empresa: 'Nome da Empresa',
      data_agendamento: 'Data do Agendamento',
      hora_agendamento: 'Hora do Agendamento',
      servico: 'Nome do Serviço',
      profissional: 'Nome do Profissional',
      valor: 'Valor do Serviço',
      endereco: 'Endereço da Empresa',
      telefone: 'Telefone da Empresa',
      link_agendamento: 'Link para Agendamento Online',
      saldo_cashback: 'Saldo de Cashback',
      dias_inativo: 'Dias desde Último Atendimento',
      data_vencimento: 'Data de Vencimento',
      valor_fatura: 'Valor da Fatura',
      status: 'Status do Agendamento',
      // Variáveis compatíveis com frontend (placeholders %VAR%)
      NOME: 'Nome do Cliente',
      APELIDO: 'Apelido do Cliente',
      DATA: 'Data do Agendamento',
      HORA: 'Hora do Agendamento',
      SERVICO: 'Nome do Serviço',
      PROFISSIONAL: 'Nome do Profissional',
      LINK: 'Link para Agendamento Online'
    }
    
    return variableMap[variable] || variable
  }
  
  /**
   * Valida template de mensagem
   */
  validateTemplate(template: string, availableVariables: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Verificar se template não está vazio
    if (!template || template.trim().length === 0) {
      errors.push('O template não pode estar vazio')
      return { valid: false, errors }
    }
    
    // Extrair variáveis usadas no template (suporta {VAR} e %VAR%)
    const usedVariables = [
      ...(template.match(/\{([^}]+)\}/g) || []).map(v => v.slice(1, -1)),
      ...(template.match(/%([^%]+)%/g) || []).map(v => v.slice(1, -1))
    ]
    
    // Verificar se todas as variáveis usadas são válidas
    const invalidVariables = usedVariables.filter(v => !availableVariables.includes(v))
    if (invalidVariables.length > 0) {
      errors.push(`Variáveis inválidas: ${invalidVariables.join(', ')}`)
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
  
  /**
   * Pré-visualiza template com dados de exemplo
   */
  previewTemplate(template: string): string {
    const exampleData: { [key: string]: string } = {
      nome_cliente: 'Maria Silva',
      nome_empresa: 'Salão Beleza & Estilo',
      data_agendamento: '15/01/2025',
      hora_agendamento: '14:30',
      servico: 'Corte e Escova',
      profissional: 'Ana Costa',
      valor: 'R$ 150,00',
      endereco: 'Rua das Flores, 123',
      telefone: '(45) 99999-9999',
      link_agendamento: 'https://exemplo.atendo.app',
      saldo_cashback: 'R$ 50,00',
      dias_inativo: '30',
      data_vencimento: '20/01/2025',
      valor_fatura: 'R$ 200,00',
      status: 'confirmado',
      // Variáveis compatíveis com frontend (placeholders %VAR%)
      NOME: 'Maria Silva',
      APELIDO: 'Maria',
      DATA: '15/01/2025',
      HORA: '14:30',
      SERVICO: 'Corte e Escova',
      PROFISSIONAL: 'Ana Costa',
      LINK: 'https://exemplo.atendo.app'
    }
    
    let preview = template
    Object.entries(exampleData).forEach(([key, value]) => {
      // Substitui {VAR} e %VAR%
      preview = preview.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
      preview = preview.replace(new RegExp(`%${key}%`, 'g'), value)
    })
    
    return preview
  }
}

export const whatsappMarketingService = new WhatsAppMarketingService()
export default whatsappMarketingService
