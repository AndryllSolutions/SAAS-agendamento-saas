'use client'

import { Button } from '@/components/ui/Button'
import { Crown, ArrowRight, Check, X } from 'lucide-react'
import Link from 'next/link'

interface UpgradeModalProps {
  feature: string
  requiredPlan: string | null
  isOpen: boolean
  onClose: () => void
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

const PLAN_BENEFITS: Record<string, string[]> = {
  PRO: [
    'Financeiro completo com DRE',
    'Comissões e metas',
    'WhatsApp Marketing',
    'Até 5 profissionais',
  ],
  PREMIUM: [
    'Todos os recursos PRO',
    'Notas Fiscais',
    'Agendamento Online',
    'Precificação Inteligente',
    'Cashback e Promoções',
    'Até 10 profissionais',
  ],
  SCALE: [
    'Todos os recursos PREMIUM',
    'Campanhas Automáticas WhatsApp',
    'CRM Avançado',
    'Profissionais ilimitados',
    'Suporte prioritário',
  ],
}

export function UpgradeModal({
  feature,
  requiredPlan,
  isOpen,
  onClose,
  title,
  description,
}: UpgradeModalProps) {
  const featureName = FEATURE_NAMES[feature] || feature
  const planName = requiredPlan?.toUpperCase() || 'PRO'
  const benefits = PLAN_BENEFITS[planName] || []
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-background rounded-lg shadow-xl p-6 max-w-md w-full mx-4 border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-4">
          <Crown className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">
            {title || 'Recurso Premium'}
          </h2>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          {description || (
            <>
              <strong>{featureName}</strong> está disponível a partir do plano{' '}
              <span className="inline-block px-2 py-1 text-xs font-bold border rounded">
                {planName}
              </span>
            </>
          )}
        </p>
        
        <div className="mt-4 space-y-4">
          {/* Benefits */}
          {benefits.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                O que você terá no plano {planName}:
              </h4>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* CTA Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Link href="/plans" className="w-full">
              <Button className="w-full" size="lg">
                Ver Planos e Preços
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            
            <Button variant="secondary" onClick={onClose} className="w-full">
              <X className="mr-2 h-4 w-4" />
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
