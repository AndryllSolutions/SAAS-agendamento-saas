/**
 * Auth Guard - Protege rotas que requerem autenticação
 */
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
    console.log('🔐 Guard Debug:', {
      currentPath,
      isAuthenticated,
      isLoading,
      requireAuth
    })
    
    // Se não estiver carregando, verificar autenticação
    if (!isLoading) {
      // Lista de rotas públicas que não requerem autenticação
      const publicRoutes = ['/book', '/login', '/register', '/scheduling', '/access-denied']
      
      // Verificar se está em rota pública
      const isPublicRoute = publicRoutes.some(route => 
        currentPath === route || currentPath.startsWith(route + '/')
      )
      
      console.log('🌐 Guard: Route check:', {
        currentPath,
        isPublicRoute,
        publicRoutes
      })
      
      // Se está em rota pública, não verificar autenticação
      if (isPublicRoute) {
        console.log('🌐 Guard: Rota pública detectada:', currentPath)
        return
      }
      
      // Se a rota requer autenticação e usuário não está autenticado
      if (requireAuth && !isAuthenticated) {
        console.log('🔐 Guard: Usuário não autenticado, redirecionando para access-denied')
        router.push('/access-denied')
        return
      }
      
      // Se usuário está autenticado e está na página de login ou registro
      if (isAuthenticated && (currentPath === '/login' || currentPath === '/register')) {
        // Verificar se é SaaS Admin
        if (user?.role === 'SAAS_ADMIN' || user?.role === 'ADMIN') {
          console.log('👑 SaaS Admin detectado, redirecionando para admin')
          router.push('/saas-admin')
          return
        }
        
        console.log('🏠 Guard: Usuário autenticado na página de login, redirecionando para dashboard')
        router.push('/dashboard')
        return
      }
    }
  }, [isAuthenticated, isLoading, router, requireAuth])

  // Se está carregando, mostrar loading com estilos
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
