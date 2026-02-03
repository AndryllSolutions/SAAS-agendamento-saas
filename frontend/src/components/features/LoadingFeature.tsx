'use client'

import { Loader2 } from 'lucide-react'

interface LoadingFeatureProps {
  /**
   * Se true, exibe loading mais compacto
   */
  compact?: boolean
  
  /**
   * Mensagem customizada de loading
   */
  message?: string
}

/**
 * Componente de loading para features
 */
export function LoadingFeature({ compact = false, message }: LoadingFeatureProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-center p-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">
        {message || 'Verificando permissões...'}
      </p>
    </div>
  )
}
