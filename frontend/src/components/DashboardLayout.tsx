'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Sidebar from './Sidebar'
import NotificationDropdown from './NotificationDropdown'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6">
        <div className="mb-4 flex justify-end">
          <NotificationDropdown />
        </div>
        <div>
          {children}
        </div>
      </main>
    </div>
  )
}
