/**
 * AuthGuard V2 - Arquitetura Inteligente para Evitar Rate Limit Loops
 */
'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

type AuthState = 'checking' | 'authenticated' | 'unauthenticated' | 'public_route'

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user, checkAuth } = useAuthStore()
  const [authState, setAuthState] = useState<AuthState>('checking')
  const [currentPath, setCurrentPath] = useState('')
  const hasInitialized = useRef(false)

  // Public routes that don't require authentication
  const publicRoutes = ['/book', '/login', '/register', '/scheduling', '/access-denied', '/']

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname)
    }
  }, [])

  useEffect(() => {
    const initializeAuth = async () => {
      // Prevent multiple initializations
      if (hasInitialized.current) return
      hasInitialized.current = true

      console.log('🔐 AuthGuard V2: Initializing...', {
        currentPath,
        isAuthenticated,
        isLoading
      })

      // Check if current route is public
      const isPublicRoute = publicRoutes.some(route => 
        currentPath === route || currentPath.startsWith(route + '/')
      )

      if (isPublicRoute) {
        console.log('🌐 AuthGuard V2: Public route detected:', currentPath)
        setAuthState('public_route')
        return
      }

      // If we have existing auth state, verify it
      if (isAuthenticated) {
        try {
          const isValid = await checkAuth()
          if (isValid) {
            console.log('✅ AuthGuard V2: Auth validated')
            setAuthState('authenticated')
            
            // Redirect authenticated users from login/register
            if (currentPath === '/login' || currentPath === '/register') {
              const targetRoute = user?.role === 'SAAS_ADMIN' || user?.role === 'ADMIN' 
                ? '/saas-admin' 
                : '/dashboard'
              console.log('🔄 AuthGuard V2: Redirecting authenticated user to:', targetRoute)
              router.push(targetRoute)
            }
          } else {
            console.log('❌ AuthGuard V2: Auth invalid, redirecting to login')
            setAuthState('unauthenticated')
            router.push('/login')
          }
        } catch (error) {
          console.error('❌ AuthGuard V2: Auth check failed:', error)
          setAuthState('unauthenticated')
          router.push('/login')
        }
      } else {
        console.log('🔐 AuthGuard V2: Not authenticated, redirecting to login')
        setAuthState('unauthenticated')
        router.push('/login')
      }
    }

    // Only initialize if we have the current path and are not loading
    if (currentPath && !isLoading) {
      initializeAuth()
    }
  }, [currentPath, isAuthenticated, isLoading, checkAuth, router, user?.role])

  // Show loading during auth check
  if (authState === 'checking' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Allow public routes
  if (authState === 'public_route') {
    return <>{children}</>
  }

  // Block unauthenticated access to protected routes
  if (authState === 'unauthenticated' && requireAuth) {
    return null // Will redirect to login
  }

  // Allow authenticated access
  if (authState === 'authenticated') {
    return <>{children}</>
  }

  return null
}
