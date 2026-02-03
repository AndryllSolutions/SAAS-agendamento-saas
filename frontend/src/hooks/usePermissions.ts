import { useAuthStore } from '@/store/authStore'

// SaaS Roles (Global)
export type SaaSRole = 'SAAS_OWNER' | 'SAAS_STAFF' | 'SAAS_USER'

// Company Roles (Tenant)
export type CompanyRole = 
  | 'COMPANY_OWNER' 
  | 'COMPANY_MANAGER' 
  | 'COMPANY_FINANCE' 
  | 'COMPANY_RECEPTIONIST' 
  | 'COMPANY_PROFESSIONAL' 
  | 'COMPANY_OPERATOR' 
  | 'COMPANY_CLIENT' 
  | 'COMPANY_READ_ONLY'

// Legacy roles (for backward compatibility)
export type LegacyRole = 'OWNER' | 'MANAGER' | 'RECEPTIONIST' | 'PROFESSIONAL' | 'FINANCE' | 'SAAS_ADMIN' | 'CLIENT' | 'admin' | 'manager' | 'professional' | 'client'

export const usePermissions = () => {
  const { user } = useAuthStore()

  /**
   * Normalize SaaS role to uppercase
   */
  const normalizeSaaSRole = (role: string | undefined | null): string => {
    if (!role) return ''
    return role.toUpperCase()
  }

  /**
   * Normalize Company role to uppercase and map legacy roles
   */
  const normalizeCompanyRole = (role: string | undefined | null): string => {
    if (!role) return ''
    const upperRole = role.toUpperCase()
    
    // Map legacy roles to new company roles
    const legacyMap: { [key: string]: string } = {
      'ADMIN': 'COMPANY_OWNER',
      'OWNER': 'COMPANY_OWNER',
      'MANAGER': 'COMPANY_MANAGER',
      'FINANCE': 'COMPANY_FINANCE',
      'RECEPTIONIST': 'COMPANY_RECEPTIONIST',
      'PROFESSIONAL': 'COMPANY_PROFESSIONAL',
      'CLIENT': 'COMPANY_CLIENT',
      'SAAS_ADMIN': 'COMPANY_OWNER', // Fallback for legacy SAAS_ADMIN in company context
    }
    
    // If role doesn't start with COMPANY_, try to map it
    if (!upperRole.startsWith('COMPANY_')) {
      return legacyMap[upperRole] || upperRole
    }
    
    return upperRole
  }

  /**
   * Get the effective company role (from company_role or fallback to role)
   */
  const getCompanyRole = (): string => {
    if (!user) return ''
    
    // Prefer company_role if available
    if (user.company_role) {
      return normalizeCompanyRole(user.company_role)
    }
    
    // Fallback to legacy role field
    if (user.role) {
      return normalizeCompanyRole(user.role)
    }
    
    return ''
  }

  /**
   * Get the effective SaaS role
   */
  const getSaaSRole = (): string => {
    if (!user) return ''
    
    // Check saas_role first
    if (user.saas_role) {
      return normalizeSaaSRole(user.saas_role)
    }
    
    // Fallback: check if legacy role contains SAAS_ADMIN
    if (user.role && user.role.toUpperCase().includes('SAAS')) {
      return 'SAAS_OWNER' // Map legacy SAAS_ADMIN to SAAS_OWNER
    }
    
    return 'SAAS_USER' // Default SaaS role
  }

  // ========== SAAS ROLE CHECKS ==========

  /**
   * Check if user is SaaS Owner (root admin)
   */
  const isSaaSOwner = (): boolean => {
    return getSaaSRole() === 'SAAS_OWNER'
  }

  /**
   * Check if user is SaaS Staff (global admin)
   */
  const isSaaSStaff = (): boolean => {
    return getSaaSRole() === 'SAAS_STAFF'
  }

  /**
   * Check if user has any SaaS admin privileges
   */
  const isSaaSAdmin = (): boolean => {
    const saasRole = getSaaSRole()
    return saasRole === 'SAAS_OWNER' || saasRole === 'SAAS_STAFF'
  }

  // ========== COMPANY ROLE CHECKS ==========

  /**
   * Check if user is Company Owner
   */
  const isCompanyOwner = (): boolean => {
    return getCompanyRole() === 'COMPANY_OWNER'
  }

  /**
   * Check if user is Company Manager or Owner
   */
  const isCompanyManager = (): boolean => {
    const companyRole = getCompanyRole()
    return companyRole === 'COMPANY_OWNER' || companyRole === 'COMPANY_MANAGER'
  }

  /**
   * Check if user is Professional
   */
  const isProfessional = (): boolean => {
    return getCompanyRole() === 'COMPANY_PROFESSIONAL'
  }

  /**
   * Check if user is Client
   */
  const isClient = (): boolean => {
    return getCompanyRole() === 'COMPANY_CLIENT'
  }

  /**
   * Check if user is Finance
   */
  const isFinance = (): boolean => {
    return getCompanyRole() === 'COMPANY_FINANCE'
  }

  /**
   * Check if user is Receptionist
   */
  const isReceptionist = (): boolean => {
    return getCompanyRole() === 'COMPANY_RECEPTIONIST'
  }

  // ========== LEGACY COMPATIBILITY ==========

  /**
   * @deprecated Use isCompanyOwner() instead
   */
  const isAdmin = (): boolean => {
    return isCompanyOwner() || isSaaSAdmin()
  }

  /**
   * @deprecated Use isCompanyManager() instead
   */
  const isManager = (): boolean => {
    return isCompanyManager() || isSaaSAdmin()
  }

  /**
   * @deprecated Use specific role checks instead
   */
  const hasRole = (roles: LegacyRole[]): boolean => {
    if (!user) return false
    
    // Map legacy roles to new roles and check
    const mappedRoles = roles.map(r => normalizeCompanyRole(r))
    const userRole = getCompanyRole()
    
    return mappedRoles.includes(userRole) || isSaaSAdmin()
  }

  // ========== PERMISSION CHECKS ==========

  /**
   * Can access dashboard
   */
  const canViewDashboard = (): boolean => {
    if (isSaaSAdmin()) return true
    
    const companyRole = getCompanyRole()
    return [
      'COMPANY_OWNER',
      'COMPANY_MANAGER',
      'COMPANY_FINANCE',
      'COMPANY_RECEPTIONIST',
      'COMPANY_PROFESSIONAL',
      'COMPANY_OPERATOR'
    ].includes(companyRole)
  }

  /**
   * Can manage services (create, edit, delete)
   */
  const canManageServices = (): boolean => {
    if (isSaaSAdmin()) return true
    return isCompanyManager()
  }

  /**
   * Can manage users (create, edit, delete, change roles)
   */
  const canManageUsers = (): boolean => {
    if (isSaaSAdmin()) return true
    return isCompanyManager()
  }

  /**
   * Can manage payments and financial transactions
   */
  const canManagePayments = (): boolean => {
    if (isSaaSAdmin()) return true
    
    const companyRole = getCompanyRole()
    return [
      'COMPANY_OWNER',
      'COMPANY_MANAGER',
      'COMPANY_FINANCE'
    ].includes(companyRole)
  }

  /**
   * Can view financial reports
   */
  const canViewFinancial = (): boolean => {
    if (isSaaSAdmin()) return true
    
    const companyRole = getCompanyRole()
    return [
      'COMPANY_OWNER',
      'COMPANY_MANAGER',
      'COMPANY_FINANCE'
    ].includes(companyRole)
  }

  /**
   * Can view reviews
   */
  const canViewReviews = (): boolean => {
    if (isSaaSAdmin()) return true
    
    const companyRole = getCompanyRole()
    return [
      'COMPANY_OWNER',
      'COMPANY_MANAGER',
      'COMPANY_RECEPTIONIST',
      'COMPANY_PROFESSIONAL'
    ].includes(companyRole)
  }

  /**
   * Can view calendar
   */
  const canViewCalendar = (): boolean => {
    if (isSaaSAdmin()) return true
    
    const companyRole = getCompanyRole()
    return [
      'COMPANY_OWNER',
      'COMPANY_MANAGER',
      'COMPANY_RECEPTIONIST',
      'COMPANY_PROFESSIONAL'
    ].includes(companyRole)
  }

  /**
   * Can manage appointments (create, edit, cancel)
   */
  const canManageAppointments = (): boolean => {
    if (isSaaSAdmin()) return true
    
    const companyRole = getCompanyRole()
    return [
      'COMPANY_OWNER',
      'COMPANY_MANAGER',
      'COMPANY_RECEPTIONIST',
      'COMPANY_PROFESSIONAL'
    ].includes(companyRole)
  }

  /**
   * Can access SaaS Admin panel
   */
  const canAccessSaaSAdmin = (): boolean => {
    return isSaaSAdmin()
  }

  const canAccessSaasAdmin = (): boolean => {
    return isSaaSAdmin()
  }

  /**
   * Can impersonate companies (SaaS admins only)
   */
  const canImpersonate = (): boolean => {
    return isSaaSAdmin()
  }

  /**
   * Can manage company settings
   */
  const canManageCompanySettings = (): boolean => {
    if (isSaaSAdmin()) return true
    return isCompanyOwner()
  }

  /**
   * Can manage products
   */
  const canManageProducts = (): boolean => {
    if (isSaaSAdmin()) return true
    return isCompanyManager()
  }

  /**
   * Can manage clients
   */
  const canManageClients = (): boolean => {
    if (isSaaSAdmin()) return true
    
    const companyRole = getCompanyRole()
    return [
      'COMPANY_OWNER',
      'COMPANY_MANAGER',
      'COMPANY_RECEPTIONIST'
    ].includes(companyRole)
  }

  /**
   * Can view commissions (own or all)
   */
  const canViewCommissions = (): boolean => {
    if (isSaaSAdmin()) return true
    
    const companyRole = getCompanyRole()
    return [
      'COMPANY_OWNER',
      'COMPANY_MANAGER',
      'COMPANY_PROFESSIONAL' // Can view own commissions
    ].includes(companyRole)
  }

  /**
   * Can pay commissions
   */
  const canPayCommissions = (): boolean => {
    if (isSaaSAdmin()) return true
    return isCompanyManager()
  }

  /**
   * Can view reports
   */
  const canViewReports = (): boolean => {
    return canViewFinancial()
  }

  /**
   * Can manage whatsapp campaigns
   */
  const canManageWhatsApp = (): boolean => {
    if (isSaaSAdmin()) return true
    return isCompanyManager()
  }

  return {
    // User info
    user,
    
    // SaaS role checks
    isSaaSOwner,
    isSaaSStaff,
    isSaaSAdmin,
    
    // Company role checks
    isCompanyOwner,
    isCompanyManager,
    isProfessional,
    isClient,
    isFinance,
    isReceptionist,
    
    // Legacy compatibility (deprecated)
    isAdmin,
    isManager,
    hasRole,
    
    // Permission checks
    canViewDashboard,
    canManageServices,
    canManageUsers,
    canManagePayments,
    canViewFinancial,
    canViewReviews,
    canViewCalendar,
    canManageAppointments,
    canAccessSaaSAdmin,
    canAccessSaasAdmin,
    canImpersonate,
    canManageCompanySettings,
    canManageProducts,
    canManageClients,
    canViewCommissions,
    canPayCommissions,
    canViewReports,
    canManageWhatsApp,
    
    // Utility functions
    getCompanyRole,
    getSaaSRole,
  }
}
