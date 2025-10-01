import { useAuthStore } from '@/store/authStore'

export type UserRole = 'admin' | 'manager' | 'professional' | 'client'

export const usePermissions = () => {
  const { user } = useAuthStore()

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false
    return roles.includes(user.role as UserRole)
  }

  const isAdmin = () => user?.role === 'admin'
  const isManager = () => user?.role === 'manager'
  const isProfessional = () => user?.role === 'professional'
  const isClient = () => user?.role === 'client'

  const canViewDashboard = () => hasRole(['admin', 'manager', 'professional'])
  const canManageServices = () => hasRole(['admin', 'manager'])
  const canManageUsers = () => hasRole(['admin', 'manager'])
  const canManagePayments = () => hasRole(['admin', 'manager'])
  const canViewReviews = () => hasRole(['admin', 'manager', 'professional'])
  const canViewCalendar = () => hasRole(['admin', 'manager', 'professional'])
  const canManageAppointments = () => hasRole(['admin', 'manager', 'professional'])

  return {
    user,
    hasRole,
    isAdmin,
    isManager,
    isProfessional,
    isClient,
    canViewDashboard,
    canManageServices,
    canManageUsers,
    canManagePayments,
    canViewReviews,
    canViewCalendar,
    canManageAppointments,
  }
}
