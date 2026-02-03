'use client'

import { Crown, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface FeatureBlockedCardProps {
  feature: string
  requiredPlan: string | null
  title?: string
  description?: string
}

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
  promotions: 'Promoções',
  automatic_campaigns: 'Campanhas Automáticas',
  crm_advanced: 'CRM Avançado',
  whatsapp_marketing: 'WhatsApp Marketing',
}

/**
 * Card inline mostrando que feature está bloqueada
 */
export function FeatureBlockedCard({
  feature,
  requiredPlan,
  title,
  description,
}: FeatureBlockedCardProps) {
  const featureName = FEATURE_NAMES[feature] || feature
  const planName = requiredPlan?.toUpperCase() || 'PRO'
  
  return (
    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center space-y-4">
      <div className="flex justify-center">
        <div className="rounded-full bg-yellow-500/10 p-3">
          <Crown className="h-8 w-8 text-yellow-500" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">
          {title || 'Recurso Premium'}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {description || (
            <>
              <strong>{featureName}</strong> está disponível a partir do plano{' '}
              <span className="font-bold text-foreground">{planName}</span>
            </>
          )}
        </p>
      </div>
      
      <Link 
        href="/plans"
        className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 text-sm font-medium transition-colors"
      >
        Ver Planos
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </div>
  )
}
