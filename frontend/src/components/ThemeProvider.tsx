'use client'

import { useEffect, useRef } from 'react'
import { useCompanyTheme } from '@/hooks/useCompanyTheme'
import { useAuth } from '@/hooks/useAuth'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const { reloadTheme, loading } = useCompanyTheme()
  const hasLoadedTheme = useRef(false)

  useEffect(() => {
    // Carregar tema apenas uma vez quando usuário estiver autenticado
    if (isAuthenticated && !loading && !hasLoadedTheme.current) {
      reloadTheme()
      hasLoadedTheme.current = true
    }
  }, [isAuthenticated, loading, reloadTheme])

  return <>{children}</>
}
