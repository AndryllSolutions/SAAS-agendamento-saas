import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFeature } from './useFeatureAccess'

/**
 * Hook avançado para proteção de rotas/páginas inteiras baseado em features
 * 
 * @param feature - Feature necessária para acessar a rota
 * @param redirectTo - URL para redirecionar se não tiver acesso (padrão: /plans)
 * @param onBlocked - Callback executado quando acesso é bloqueado
 * 
 * @example
 * function FinancialReportsPage() {
 *   const { hasAccess, loading } = useFeatureGuard('financial_complete')
 *   
 *   if (loading) return <Loading />
 *   if (!hasAccess) return null // Já foi redirecionado
 *   
 *   return <FinancialReportsContent />
 * }
 */
export function useFeatureGuard(
  feature: string,
  redirectTo: string = '/plans',
  onBlocked?: (requiredPlan: string | null) => void
) {
  const { hasAccess, requiredPlan, loading } = useFeature(feature)
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && !hasAccess) {
      // Executar callback se fornecido
      if (onBlocked) {
        onBlocked(requiredPlan)
      }
      
      // Redirecionar
      router.push(redirectTo)
    }
  }, [hasAccess, loading, redirectTo, router, onBlocked, requiredPlan])
  
  return {
    hasAccess,
    requiredPlan,
    loading,
  }
}

/**
 * HOC (Higher Order Component) para proteger páginas inteiras
 * 
 * @example
 * const ProtectedFinancialPage = withFeatureGuard(
 *   FinancialReportsPage,
 *   'financial_complete'
 * )
 */
// HOC não pode ser implementado em .ts puro - mover para .tsx se necessário
// Ver exemplo em: src/examples/FeatureWrapperExamples.tsx
