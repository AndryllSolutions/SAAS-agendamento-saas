'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions, UserRole } from '@/hooks/usePermissions'
import { ShieldAlert } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, hasRole } = usePermissions()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!hasRole(allowedRoles)) {
      router.push('/unauthorized')
    }
  }, [user, allowedRoles, hasRole, router])

  if (!user || !hasRole(allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
