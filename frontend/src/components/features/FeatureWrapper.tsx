'use client'

import { ReactNode } from 'react'
import { useFeature } from '@/hooks/useFeatureAccess'
import { UpgradeModal } from './UpgradeModal'
import { LoadingFeature } from './LoadingFeature'
import { FeatureBlockedCard } from './FeatureBlockedCard'

interface FeatureWrapperProps {
  /**
   * Feature a ser validada (ex: 'financial_complete', 'invoices')
   */
  feature: string
  
  /**
   * Conteúdo a ser renderizado se o usuário tiver acesso
   */
  children: ReactNode
  
  /**
   * Componente customizado para exibir quando feature está bloqueada
   * Se não informado, usa UpgradeModal
   */
  fallback?: ReactNode
  
  /**
   * Componente customizado para exibir durante carregamento
   * Se não informado, usa LoadingFeature
   */
  loadingComponent?: ReactNode
  
  /**
   * Modo de bloqueio:
   * - 'modal': Exibe modal de upgrade (padrão)
   * - 'card': Exibe card inline com mensagem de upgrade
   * - 'hide': Não renderiza nada (esconde completamente)
   * - 'custom': Usa o componente fallback fornecido
   */
  blockMode?: 'modal' | 'card' | 'hide' | 'custom'
  
  /**
   * Título customizado para o modal/card de upgrade
   */
  title?: string
  
  /**
   * Descrição customizada para o modal/card de upgrade
   */
  description?: string
  
  /**
   * Se true, mostra apenas um indicador de loading menor
   */
  compactLoading?: boolean
}

/**
 * Componente wrapper para validar acesso a features baseado no plano
 * 
 * @example
 * // Uso básico - renderiza children ou modal de upgrade
 * <FeatureWrapper feature="financial_complete">
 *   <FinancialReportsPage />
 * </FeatureWrapper>
 * 
 * @example
 * // Com card inline ao invés de modal
 * <FeatureWrapper feature="invoices" blockMode="card">
 *   <InvoicesSection />
 * </FeatureWrapper>
 * 
 * @example
 * // Esconder completamente se não tiver acesso
 * <FeatureWrapper feature="advanced_reports" blockMode="hide">
 *   <AdvancedReportsButton />
 * </FeatureWrapper>
 * 
 * @example
 * // Com fallback customizado
 * <FeatureWrapper 
 *   feature="crm_advanced" 
 *   blockMode="custom"
 *   fallback={<CustomUpgradeMessage />}
 * >
 *   <CRMAdvancedFeatures />
 * </FeatureWrapper>
 */
export function FeatureWrapper({
  feature,
  children,
  fallback,
  loadingComponent,
  blockMode = 'modal',
  title,
  description,
  compactLoading = false,
}: FeatureWrapperProps) {
  const { hasAccess, requiredPlan, loading } = useFeature(feature)
  
  // Estado de loading
  if (loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }
    return <LoadingFeature compact={compactLoading} />
  }
  
  // Tem acesso - renderiza children normalmente
  if (hasAccess) {
    return <>{children}</>
  }
  
  // Não tem acesso - renderiza de acordo com blockMode
  switch (blockMode) {
    case 'hide':
      return null
    
    case 'card':
      return (
        <FeatureBlockedCard
          feature={feature}
          requiredPlan={requiredPlan}
          title={title}
          description={description}
        />
      )
    
    case 'custom':
      return <>{fallback}</>
    
    case 'modal':
    default:
      return (
        <UpgradeModal
          feature={feature}
          requiredPlan={requiredPlan}
          isOpen={true}
          onClose={() => {}}
          title={title}
          description={description}
        />
      )
  }
}
