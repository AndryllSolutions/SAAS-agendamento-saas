'use client'

import { useEffect, useState } from 'react'
import { UpgradeModal } from './UpgradeModal'

interface FeatureBlockedEvent {
  feature?: string
  requiredPlan?: string
  message: string
  url?: string
}

// Mapeamento de features para nomes amigáveis
const FEATURE_NAMES: Record<string, string> = {
  financial_complete: 'Financeiro Completo',
  reports_complete: 'Relatórios Completos',
  commissions: 'Comissões',
  goals: 'Metas',
  invoices: 'Notas Fiscais',
  online_booking: 'Agendamento Online',
  pricing_intelligence: 'Precificação Inteligente',
  advanced_reports: 'Relatórios Avançados',
  cashback: 'Cashback',
  automatic_campaigns: 'Campanhas Automáticas',
  crm_advanced: 'CRM Avançado',
}

/**
 * Handler global para capturar erros HTTP 402 (Payment Required)
 * 
 * Este componente escuta eventos globais disparados pelo interceptor
 * da API quando uma feature é bloqueada pelo plano.
 * 
 * Deve ser adicionado no layout raiz da aplicação.
 */
export function GlobalFeatureBlockedHandler() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [blockedFeature, setBlockedFeature] = useState<string>('')
  const [requiredPlan, setRequiredPlan] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    // Listener para eventos de limite de plano (HTTP 402)
    const handlePlanLimit = (event: Event) => {
      const customEvent = event as CustomEvent<FeatureBlockedEvent>
      const { message, url } = customEvent.detail
      
      console.log('🚫 Feature bloqueada detectada:', { message, url })
      
      // Extrair feature e plano da mensagem do backend
      // Formato esperado: "Esta funcionalidade requer o plano PRO ou superior"
      // ou: "Recurso 'financial_complete' não disponível no seu plano"
      const featureMatch = message.match(/Recurso '(.+?)' não disponível/)
      const planMatch = message.match(/plano (\w+)/i)
      
      // Usar feature do evento ou extrair da mensagem
      const finalFeature = customEvent.detail.feature || 
                           (featureMatch ? featureMatch[1] : 'recurso premium')
      
      // Usar plano do evento ou extrair da mensagem  
      const finalPlan = customEvent.detail.requiredPlan || 
                        (planMatch ? planMatch[1] : null)
      
      setBlockedFeature(finalFeature)
      setRequiredPlan(finalPlan)
      setErrorMessage(message)
      setIsModalOpen(true)
      
      // Analytics (opcional)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'feature_blocked', {
          feature: finalFeature,
          required_plan: finalPlan,
          url: url
        })
      }
    }

    // Registrar listener
    window.addEventListener('plan-limit-reached', handlePlanLimit)
    
    // Cleanup
    return () => {
      window.removeEventListener('plan-limit-reached', handlePlanLimit)
    }
  }, [])

  const handleClose = () => {
    setIsModalOpen(false)
    
    // Limpar após fechar
    setTimeout(() => {
      setBlockedFeature('')
      setRequiredPlan(null)
      setErrorMessage('')
    }, 300)
  }
  
  // Obter nome amigável da feature
  const featureName = FEATURE_NAMES[blockedFeature] || blockedFeature
  
  return (
    <UpgradeModal
      feature={featureName}
      requiredPlan={requiredPlan}
      isOpen={isModalOpen}
      onClose={handleClose}
      description={errorMessage}
    />
  )
}
