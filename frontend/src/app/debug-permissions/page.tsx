'use client'

import { useAuthStore } from '@/store/authStore'
import { usePermissions } from '@/hooks/usePermissions'
import DashboardLayout from '@/components/DashboardLayout'

export default function DebugPermissionsPage() {
  const { user } = useAuthStore()
  const permissions = usePermissions()

  console.log('=== DEBUG PERMISSIONS ===')
  console.log('User:', user)
  console.log('User role:', user?.role)
  console.log('User company_role:', user?.company_role)
  console.log('User saas_role:', user?.saas_role)
  
  console.log('=== PERMISSION CHECKS ===')
  console.log('canViewDashboard():', permissions.canViewDashboard())
  console.log('canManageUsers():', permissions.canManageUsers())
  console.log('canManageServices():', permissions.canManageServices())
  console.log('canManagePayments():', permissions.canManagePayments())
  console.log('canManageClients():', permissions.canManageClients())
  console.log('canViewReports():', permissions.canViewReports())
  console.log('canManageCompanySettings():', permissions.canManageCompanySettings())
  
  console.log('=== ROLE CHECKS ===')
  console.log('isCompanyOwner():', permissions.isCompanyOwner())
  console.log('isCompanyManager():', permissions.isCompanyManager())
  console.log('isSaaSAdmin():', permissions.isSaaSAdmin())
  console.log('isSaaSOwner():', permissions.isSaaSOwner())
  
  console.log('=== UTILITY FUNCTIONS ===')
  console.log('getCompanyRole():', permissions.getCompanyRole())
  console.log('getSaaSRole():', permissions.getSaaSRole())

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Debug de Permissões</h1>
          <p className="text-gray-600">Verificação de permissões do usuário atual</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados do Usuário</h2>
          <div className="space-y-2 font-mono text-sm">
            <p><strong>ID:</strong> {user?.id}</p>
            <p><strong>Nome:</strong> {user?.full_name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role (legado):</strong> {user?.role}</p>
            <p><strong>Company Role:</strong> {user?.company_role}</p>
            <p><strong>SaaS Role:</strong> {user?.saas_role}</p>
            <p><strong>Company ID:</strong> {user?.company_id}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Verificação de Permissões</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>canViewDashboard():</span>
              <span className={`font-bold ${permissions.canViewDashboard() ? 'text-green-600' : 'text-red-600'}`}>
                {permissions.canViewDashboard() ? '✓ PERMITIDO' : '✗ BLOQUEADO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>canManageUsers():</span>
              <span className={`font-bold ${permissions.canManageUsers() ? 'text-green-600' : 'text-red-600'}`}>
                {permissions.canManageUsers() ? '✓ PERMITIDO' : '✗ BLOQUEADO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>canManageServices():</span>
              <span className={`font-bold ${permissions.canManageServices() ? 'text-green-600' : 'text-red-600'}`}>
                {permissions.canManageServices() ? '✓ PERMITIDO' : '✗ BLOQUEADO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>canManagePayments():</span>
              <span className={`font-bold ${permissions.canManagePayments() ? 'text-green-600' : 'text-red-600'}`}>
                {permissions.canManagePayments() ? '✓ PERMITIDO' : '✗ BLOQUEADO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>canManageClients():</span>
              <span className={`font-bold ${permissions.canManageClients() ? 'text-green-600' : 'text-red-600'}`}>
                {permissions.canManageClients() ? '✓ PERMITIDO' : '✗ BLOQUEADO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>canViewReports():</span>
              <span className={`font-bold ${permissions.canViewReports() ? 'text-green-600' : 'text-red-600'}`}>
                {permissions.canViewReports() ? '✓ PERMITIDO' : '✗ BLOQUEADO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>canManageCompanySettings():</span>
              <span className={`font-bold ${permissions.canManageCompanySettings() ? 'text-green-600' : 'text-red-600'}`}>
                {permissions.canManageCompanySettings() ? '✓ PERMITIDO' : '✗ BLOQUEADO'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Verificação de Roles</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>isCompanyOwner():</span>
              <span className={`font-bold ${permissions.isCompanyOwner() ? 'text-green-600' : 'text-red-600'}`}>
                {permissions.isCompanyOwner() ? '✓ SIM' : '✗ NÃO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>isCompanyManager():</span>
              <span className={`font-bold ${permissions.isCompanyManager() ? 'text-green-600' : 'text-red-600'}`}>
                {permissions.isCompanyManager() ? '✓ SIM' : '✗ NÃO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>isSaaSAdmin():</span>
              <span className={`font-bold ${permissions.isSaaSAdmin() ? 'text-green-600' : 'text-red-600'}`}>
                {permissions.isSaaSAdmin() ? '✓ SIM' : '✗ NÃO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>isSaaSOwner():</span>
              <span className={`font-bold ${permissions.isSaaSOwner() ? 'text-green-600' : 'text-red-600'}`}>
                {permissions.isSaaSOwner() ? '✓ SIM' : '✗ NÃO'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Funções Utilitárias</h2>
          <div className="space-y-2 font-mono text-sm">
            <p><strong>getCompanyRole():</strong> {permissions.getCompanyRole()}</p>
            <p><strong>getSaaSRole():</strong> {permissions.getSaaSRole()}</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> Abra o console do navegador (F12) para ver informações detalhadas de debug.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
