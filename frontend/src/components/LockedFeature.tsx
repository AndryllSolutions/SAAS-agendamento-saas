'use client'

import { useState, useEffect, ReactNode } from 'react'
import { Lock, TrendingUp, Sparkles } from 'lucide-react'
import { useFeature } from '@/hooks/useFeatureAccess'
import { UpgradeModal } from './UpgradeModal'

interface LockedFeatureProps {
  feature: string
  children: ReactNode
  fallback?: ReactNode
  showOverlay?: boolean
  blurContent?: boolean
}

const planNames: Record<string, string> = {
  essencial: 'Essencial',
  pro: 'Pro',
  premium: 'Premium',
  scale: 'Scale'
}

const featureNames: Record<string, string> = {
  clients: 'Cadastro de Clientes',
  services: 'Cadastro de Serviços',
  appointments: 'Agendamentos',
  products: 'Produtos',
  commands: 'Comandas',
  financial_basic: 'Financeiro Básico',
  financial_complete: 'Financeiro Completo',
  reports_basic: 'Relatórios Básicos',
  reports_complete: 'Relatórios Completos',
  packages: 'Pacotes',
  commissions: 'Comissões',
  goals: 'Metas',
  anamneses: 'Anamnese',
  purchases: 'Compras',
  evaluations: 'Avaliações',
  whatsapp_marketing: 'Marketing WhatsApp',
  cashback: 'Cashback',
  promotions: 'Promoções',
  subscription_sales: 'Assinaturas',
  document_generator: 'Gerador de Documentos',
  invoices: 'Emissão de NF',
  online_booking: 'Agendamento Online',
  pricing_intelligence: 'Precificação Inteligente',
  advanced_reports: 'Relatórios Avançados',
  professional_ranking: 'Ranking de Profissionais',
  client_funnel: 'Funil de Clientes',
  crm_advanced: 'CRM Avançado',
  multi_unit_reports: 'Relatórios Multi-Unidade',
  automatic_campaigns: 'Campanhas Automáticas',
  priority_support: 'Suporte Prioritário',
  programa_crescer: 'Programa Crescer'
}

export function LockedFeature({ 
  feature, 
  children, 
  fallback,
  showOverlay = true,
  blurContent = true 
}: LockedFeatureProps) {
  const { hasAccess, requiredPlan, loading } = useFeature(feature)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Se está carregando, mostrar children (assumir acesso até confirmar)
  if (loading) {
    return <>{children}</>
  }

  // Se tem acesso, mostrar conteúdo normal
  if (hasAccess) {
    return <>{children}</>
  }

  // Se forneceu fallback customizado, usar ele
  if (fallback) {
    return <>{fallback}</>
  }

  // Bloqueado - mostrar overlay com CTA de upgrade
  return (
    <>
      <div className="relative">
        {/* Conteúdo com blur */}
        {blurContent && (
          <div className="filter blur-sm pointer-events-none select-none opacity-50">
            {children}
          </div>
        )}

        {/* Overlay de bloqueio */}
        {showOverlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 backdrop-blur-[2px] rounded-lg z-10">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Recurso Bloqueado
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-medium">{featureNames[feature] || feature}</span> está disponível 
                no plano <span className="font-semibold text-primary">{planNames[requiredPlan || ''] || requiredPlan}</span> ou superior.
              </p>
              
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-white font-medium py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Fazer Upgrade
              </button>
              
              <p className="text-xs text-gray-500 mt-3">
                Desbloqueie funcionalidades avançadas
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de upgrade */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        requiredPlan={requiredPlan || undefined}
        feature={feature}
      />
    </>
  )
}

// Componente para botão bloqueado
interface LockedButtonProps {
  feature: string
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export function LockedButton({ 
  feature, 
  children, 
  onClick, 
  className = '',
  disabled = false 
}: LockedButtonProps) {
  const { hasAccess, requiredPlan, loading } = useFeature(feature)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  if (loading) {
    return (
      <button className={className} disabled>
        {children}
      </button>
    )
  }

  if (hasAccess) {
    return (
      <button className={className} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    )
  }

  // Botão bloqueado
  return (
    <>
      <button
        className={`${className} relative opacity-70 cursor-not-allowed`}
        onClick={() => setShowUpgradeModal(true)}
        title={`Requer plano ${planNames[requiredPlan || ''] || requiredPlan}`}
      >
        <span className="flex items-center gap-2">
          {children}
          <Lock className="w-3.5 h-3.5" />
        </span>
      </button>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        requiredPlan={requiredPlan || undefined}
        feature={feature}
      />
    </>
  )
}

// Componente para link de menu bloqueado
interface LockedMenuItemProps {
  feature: string
  href: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function LockedMenuItem({ 
  feature, 
  href, 
  icon, 
  children,
  className = '' 
}: LockedMenuItemProps) {
  const { hasAccess, requiredPlan, loading } = useFeature(feature)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  if (loading || hasAccess) {
    return (
      <a href={href} className={className}>
        {icon}
        {children}
      </a>
    )
  }

  // Menu item bloqueado
  return (
    <>
      <button
        className={`${className} opacity-60 cursor-not-allowed flex items-center justify-between w-full`}
        onClick={() => setShowUpgradeModal(true)}
      >
        <span className="flex items-center gap-2">
          {icon}
          {children}
        </span>
        <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
          <Sparkles className="w-3 h-3" />
          {planNames[requiredPlan || ''] || 'PRO'}
        </span>
      </button>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        requiredPlan={requiredPlan || undefined}
        feature={feature}
      />
    </>
  )
}
