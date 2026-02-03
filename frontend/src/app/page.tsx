'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Pequeno delay para evitar hidratação conflicts
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push('/login')
      } else {
        // Redirect based on saas_role first, then company role
        const saasRole = user?.saas_role?.toUpperCase() || ''
        const role = user?.role?.toUpperCase() || ''
        
        // SaaS Admins go to SaaS Admin panel
        if (saasRole === 'SAAS_OWNER' || saasRole === 'SAAS_STAFF') {
          router.push('/saas-admin')
        }
        // Company admins go to dashboard
        else if (role === 'OWNER' || role === 'MANAGER' || role === 'SAAS_ADMIN' || role === 'ADMIN') {
          router.push('/dashboard')
        }
        // Professionals/Receptionists go to appointments
        else if (role === 'PROFESSIONAL' || role === 'RECEPTIONIST') {
          router.push('/appointments')
        }
        // Default to dashboard
        else {
          router.push('/dashboard')
        }
      }
      setIsChecking(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [isAuthenticated, user, router])

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return null // Componente vai redirecionar
}
