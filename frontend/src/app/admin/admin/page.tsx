'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function AdminRedirectPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Verificar se o usuário tem permissão de admin/saas_admin (normalizar para lowercase)
    const userRole = (user?.role || '').toLowerCase()
    if (userRole === 'saas_admin' || userRole === 'admin') {
      // Redirecionar para o dashboard principal do SaaS Admin
      router.push('/saas-admin')
    } else {
      router.push('/unauthorized')
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  )
}

