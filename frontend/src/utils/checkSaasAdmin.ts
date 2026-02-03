/**
 * Verifica se o usuário é Super Admin do SaaS
 * Aceita tanto role quanto saas_role para compatibilidade
 */
export function isSaasAdmin(user: any): boolean {
  if (!user) return false
  
  const role = user.role?.toUpperCase()
  const saasRole = user.saas_role?.toUpperCase()
  
  // Verificar role (legacy)
  // IMPORTANTE: role "ADMIN" é admin da EMPRESA (tenant), não admin do SaaS
  if (role === 'SAAS_ADMIN') {
    return true
  }
  
  // Verificar saas_role (novo sistema)
  if (saasRole === 'SAAS_OWNER' || saasRole === 'SAAS_STAFF') {
    return true
  }
  
  return false
}
