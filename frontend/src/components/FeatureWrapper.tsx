/**
 * FeatureWrapper Component
 * 
 * Wrapper component that validates feature access before rendering children.
 * Shows upgrade prompt if feature is not available.
 */

import React from 'react'
import { useFeature } from '@/hooks/useFeatureAccess'
import { Button } from '@/components/ui/Button'
import { Lock, ArrowUp } from 'lucide-react'

interface FeatureWrapperProps {
  /** Feature key to check access for */
  feature: string
  /** Children to render if feature is accessible */
  children: React.ReactNode
  /** Fallback content to show when feature is not accessible */
  fallback?: React.ReactNode
  /** Whether to show as a card/container style */
  asCard?: boolean
}

const FEATURE_NAMES: Record<string, string> = {
  // Essencial
  'clients': 'Gestão de Clientes',
  'services': 'Cadastro de Serviços',
  'appointments': 'Agendamentos',
  'financial_basic': 'Financeiro Básico',
  'reports_basic': 'Relatórios Básicos',
  
  // Pro
  'financial_complete': 'Financeiro Completo',
  'packages': 'Pacotes de Serviços',
  'commissions': 'Comissões',
  'goals': 'Metas',
  'whatsapp_marketing': 'Marketing WhatsApp',
  
  // Premium
  'pricing_intelligence': 'Precificação Inteligente',
  'advanced_reports': 'Relatórios Avançados',
  'online_booking': 'Agendamento Online',
  'cashback': 'Cashback & Fidelização',
  'invoices': 'Notas Fiscais',
  
  // Scale
  'automatic_campaigns': 'Campanhas Automáticas',
  'crm_advanced': 'CRM Avançado',
  'multi_unit_reports': 'Relatórios Multi-unidade',
  'programa_crescer': 'Programa Crescer'
}

const PLAN_NAMES: Record<string, { name: string }> = {
  'essencial': { name: 'Essencial' },
  'pro': { name: 'Pro' },
  'premium': { name: 'Premium' },
  'scale': { name: 'Scale' }
}

export function FeatureWrapper({
  feature,
  children,
  fallback,
  asCard = false
}: FeatureWrapperProps) {
  const { hasAccess, requiredPlan, loading } = useFeature(feature)

  // Show loading skeleton while checking access
  if (loading) {
    return (
      <div className={`animate-pulse ${asCard ? 'bg-gray-100 rounded-lg p-4' : ''}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  // If user has access, render children normally
  if (hasAccess) {
    return <>{children}</>
  }

  // Feature not accessible - show upgrade content
  const featureName = FEATURE_NAMES[feature] || feature
  const planInfo = PLAN_NAMES[requiredPlan || 'pro'] || { name: requiredPlan || 'Pro' }

  const handleUpgrade = () => {
    window.location.href = '/company-settings?tab=billing'
  }

  // Custom fallback content
  if (fallback) {
    return <>{fallback}</>
  }

  // Default blocked content
  return (
    <div className={`relative ${asCard ? 'border-2 border-dashed border-gray-300 rounded-lg p-6' : 'p-4'} text-center`}>
      {asCard && (
        <div className="absolute inset-0 bg-gray-50/50 rounded-lg backdrop-blur-sm"></div>
      )}
      
      <div className="relative z-10">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-gray-100 rounded-full">
            <Lock className="w-6 h-6 text-gray-500" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">
              Recurso Bloqueado
            </h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">{featureName}</span> disponível no plano{' '}
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                {planInfo.name}
              </span>
            </p>
          </div>
          
          <Button 
            onClick={handleUpgrade}
            className="gap-2"
          >
            <ArrowUp className="w-4 h-4" />
            Fazer Upgrade
          </Button>
        </div>
      </div>
    </div>
  )
}
