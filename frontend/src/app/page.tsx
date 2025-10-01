'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else {
      // Redirect based on role
      if (user?.role === 'admin' || user?.role === 'manager') {
        router.push('/dashboard')
      } else if (user?.role === 'professional') {
        router.push('/appointments')
      } else {
        router.push('/client/appointments')
      }
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  )
}
