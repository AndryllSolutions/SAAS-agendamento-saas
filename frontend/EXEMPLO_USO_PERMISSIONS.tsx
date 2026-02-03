/**
 * EXEMPLO DE USO DO NOVO usePermissions HOOK
 * 
 * Este arquivo mostra como usar o hook atualizado com a arquitetura de 2 camadas.
 * Copie estes exemplos para seus componentes!
 */

'use client'

import { usePermissions } from '@/hooks/usePermissions'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { 
  Shield, DollarSign, Users, BarChart3, Calendar, 
  Settings, Briefcase, MessageCircle 
} from 'lucide-react'

// ========== EXEMPLO 1: Proteção de Página ==========

export function ProtectedFinancialPage() {
  const router = useRouter()
  const { canViewFinancial } = usePermissions()

  useEffect(() => {
    if (!canViewFinancial()) {
      router.push('/unauthorized')
    }
  }, [canViewFinancial, router])

  return (
    <div>
      <h1>Módulo Financeiro</h1>
      <p>Apenas usuários com permissão podem ver esta página.</p>
    </div>
  )
}

// ========== EXEMPLO 2: Menu Dinâmico ==========

export function DynamicMenu() {
  const {
    canViewDashboard,
    canManageServices,
    canViewFinancial,
    canManageUsers,
    canAccessSaaSAdmin,
    canViewCommissions,
    canManageWhatsApp,
  } = usePermissions()

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      visible: canViewDashboard(),
    },
    {
      label: 'Serviços',
      href: '/services',
      icon: Briefcase,
      visible: canManageServices(),
    },
    {
      label: 'Usuários',
      href: '/users',
      icon: Users,
      visible: canManageUsers(),
    },
    {
      label: 'Financeiro',
      href: '/financial',
      icon: DollarSign,
      visible: canViewFinancial(),
    },
    {
      label: 'Comissões',
      href: '/commissions',
      icon: DollarSign,
      visible: canViewCommissions(),
    },
    {
      label: 'WhatsApp',
      href: '/whatsapp',
      icon: MessageCircle,
      visible: canManageWhatsApp(),
    },
    {
      label: 'SaaS Admin',
      href: '/saas-admin',
      icon: Shield,
      visible: canAccessSaaSAdmin(),
      highlight: true, // Destaque especial
    },
  ].filter(item => item.visible)

  return (
    <nav className="space-y-2">
      {menuItems.map(item => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 ${
              item.highlight ? 'bg-red-50 border border-red-200' : ''
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

// ========== EXEMPLO 3: Verificação de Role Específica ==========

export function RoleBasedComponent() {
  const {
    isSaaSOwner,
    isSaaSAdmin,
    isCompanyOwner,
    isCompanyManager,
    isProfessional,
    isClient,
  } = usePermissions()

  if (isSaaSOwner()) {
    return (
      <div className="bg-red-100 p-4 rounded">
        <h2>🔥 Dono do SaaS</h2>
        <p>Você tem acesso total a tudo!</p>
      </div>
    )
  }

  if (isSaaSAdmin()) {
    return (
      <div className="bg-orange-100 p-4 rounded">
        <h2>⚡ Admin do SaaS</h2>
        <p>Você tem acesso administrativo global.</p>
      </div>
    )
  }

  if (isCompanyOwner()) {
    return (
      <div className="bg-blue-100 p-4 rounded">
        <h2>👑 Dono da Empresa</h2>
        <p>Você tem acesso total à sua empresa.</p>
      </div>
    )
  }

  if (isCompanyManager()) {
    return (
      <div className="bg-green-100 p-4 rounded">
        <h2>🎯 Gerente</h2>
        <p>Você tem acesso gerencial à empresa.</p>
      </div>
    )
  }

  if (isProfessional()) {
    return (
      <div className="bg-purple-100 p-4 rounded">
        <h2>💼 Profissional</h2>
        <p>Você tem acesso aos seus agendamentos e comissões.</p>
      </div>
    )
  }

  if (isClient()) {
    return (
      <div className="bg-gray-100 p-4 rounded">
        <h2>👤 Cliente</h2>
        <p>Você pode ver seus agendamentos.</p>
      </div>
    )
  }

  return <p>Role não reconhecida.</p>
}

// ========== EXEMPLO 4: Botões Condicionais ==========

export function ConditionalButtons() {
  const {
    canManageServices,
    canManageUsers,
    canManagePayments,
    canPayCommissions,
  } = usePermissions()

  return (
    <div className="flex gap-2">
      {canManageServices() && (
        <button className="px-4 py-2 bg-blue-500 text-white rounded">
          Criar Serviço
        </button>
      )}

      {canManageUsers() && (
        <button className="px-4 py-2 bg-green-500 text-white rounded">
          Adicionar Usuário
        </button>
      )}

      {canManagePayments() && (
        <button className="px-4 py-2 bg-purple-500 text-white rounded">
          Registrar Pagamento
        </button>
      )}

      {canPayCommissions() && (
        <button className="px-4 py-2 bg-yellow-500 text-white rounded">
          Pagar Comissão
        </button>
      )}
    </div>
  )
}

// ========== EXEMPLO 5: Dashboard com Seções Condicionais ==========

export function ConditionalDashboard() {
  const {
    canViewDashboard,
    canViewFinancial,
    canViewCommissions,
    canManageServices,
    isSaaSAdmin,
  } = usePermissions()

  if (!canViewDashboard()) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Você não tem permissão para acessar o dashboard.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Métricas Básicas - Todos que acessam dashboard */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard title="Agendamentos" value="125" />
        <MetricCard title="Clientes" value="89" />
        <MetricCard title="Serviços" value="15" />
      </div>

      {/* Financeiro - Apenas quem tem permissão */}
      {canViewFinancial() && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Financeiro</h2>
          <div className="grid grid-cols-2 gap-4">
            <MetricCard title="Receita" value="R$ 12.500" />
            <MetricCard title="Despesas" value="R$ 3.200" />
          </div>
        </div>
      )}

      {/* Comissões - Profissionais veem suas, managers veem todas */}
      {canViewCommissions() && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Comissões</h2>
          <CommissionsList />
        </div>
      )}

      {/* Gerenciar Serviços - Apenas managers */}
      {canManageServices() && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Serviços</h2>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            Criar Novo Serviço
          </button>
        </div>
      )}

      {/* Analytics Global - Apenas SaaS Admins */}
      {isSaaSAdmin() && (
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h2 className="text-xl font-bold mb-4 text-red-700">
            🔥 Analytics Global (SaaS Admin)
          </h2>
          <GlobalAnalytics />
        </div>
      )}
    </div>
  )
}

// ========== EXEMPLO 6: SaaS Admin Link na Navegação ==========

export function NavigationWithSaaSAdmin() {
  const { canAccessSaaSAdmin, isSaaSOwner } = usePermissions()

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/services">Serviços</Link>
          <Link href="/appointments">Agendamentos</Link>
          <Link href="/clients">Clientes</Link>
        </div>

        {/* Link de SaaS Admin - Apenas para admins do SaaS */}
        {canAccessSaaSAdmin() && (
          <Link 
            href="/saas-admin"
            className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            <Shield className="w-4 h-4" />
            <span>SaaS Admin</span>
            {isSaaSOwner() && <span className="text-xs">(Owner)</span>}
          </Link>
        )}
      </div>
    </nav>
  )
}

// ========== EXEMPLO 7: Debug Info (Útil para desenvolvimento) ==========

export function DebugPermissionsInfo() {
  const {
    user,
    getSaaSRole,
    getCompanyRole,
    isSaaSAdmin,
    isCompanyManager,
    canViewFinancial,
    canManageServices,
  } = usePermissions()

  // Mostrar apenas em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg text-xs max-w-xs">
      <h3 className="font-bold mb-2">🔐 Debug: Permissões</h3>
      <div className="space-y-1">
        <p><strong>User ID:</strong> {user?.id}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>SaaS Role:</strong> {getSaaSRole()}</p>
        <p><strong>Company Role:</strong> {getCompanyRole()}</p>
        <p><strong>Company ID:</strong> {user?.company_id}</p>
        <hr className="my-2 border-gray-600" />
        <p>isSaaSAdmin: {isSaaSAdmin() ? '✅' : '❌'}</p>
        <p>isCompanyManager: {isCompanyManager() ? '✅' : '❌'}</p>
        <p>canViewFinancial: {canViewFinancial() ? '✅' : '❌'}</p>
        <p>canManageServices: {canManageServices() ? '✅' : '❌'}</p>
      </div>
    </div>
  )
}

// ========== EXEMPLO 8: Página de SaaS Admin Protegida ==========

export function SaaSAdminPage() {
  const router = useRouter()
  const { canAccessSaaSAdmin, isSaaSOwner, getSaaSRole } = usePermissions()

  useEffect(() => {
    if (!canAccessSaaSAdmin()) {
      router.push('/unauthorized')
    }
  }, [canAccessSaaSAdmin, router])

  if (!canAccessSaaSAdmin()) {
    return null // Ou loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold">Painel SaaS Admin</h1>
              <p className="text-gray-600">
                Role: {getSaaSRole()}
                {isSaaSOwner() && ' (Dono do SaaS)'}
              </p>
            </div>
          </div>
        </div>

        {/* Apenas SAAS_OWNER pode promover usuários */}
        {isSaaSOwner() && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6">
            <h3 className="font-bold">⚠️ Acesso de Owner</h3>
            <p className="text-sm">
              Você pode promover usuários para SaaS Admin.
            </p>
          </div>
        )}

        {/* Conteúdo do SaaS Admin */}
        <div className="grid grid-cols-3 gap-6">
          <SaaSAdminCard title="Empresas" count={25} href="/saas-admin/companies" />
          <SaaSAdminCard title="Usuários" count={150} href="/saas-admin/users" />
          <SaaSAdminCard title="MRR" count="R$ 50.000" href="/saas-admin/metrics" />
        </div>
      </div>
    </div>
  )
}

// ========== COMPONENTES AUXILIARES ==========

function MetricCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function CommissionsList() {
  return <div>Lista de comissões...</div>
}

function GlobalAnalytics() {
  return <div>Analytics globais do SaaS...</div>
}

function SaaSAdminCard({ 
  title, 
  count, 
  href 
}: { 
  title: string; 
  count: string | number; 
  href: string 
}) {
  return (
    <Link href={href} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold text-primary">{count}</p>
    </Link>
  )
}

// ========== EXEMPLO 9: Tabela com Ações Condicionais ==========

export function UsersTable() {
  const { canManageUsers, isSaaSAdmin } = usePermissions()

  const users = [
    { id: 1, name: 'João Silva', role: 'COMPANY_MANAGER' },
    { id: 2, name: 'Maria Santos', role: 'COMPANY_PROFESSIONAL' },
  ]

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Role</th>
          {canManageUsers() && <th>Ações</th>}
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.role}</td>
            {canManageUsers() && (
              <td>
                <button className="text-blue-600 mr-2">Editar</button>
                {isSaaSAdmin() && (
                  <button className="text-red-600">Promover a SaaS</button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ========== EXEMPLO 10: Formulário com Campos Condicionais ==========

export function CompanySettingsForm() {
  const { isCompanyOwner, isSaaSAdmin } = usePermissions()

  return (
    <form className="space-y-4">
      <div>
        <label>Nome da Empresa</label>
        <input 
          type="text" 
          className="w-full border p-2 rounded"
          disabled={!isCompanyOwner() && !isSaaSAdmin()}
        />
      </div>

      {/* Apenas owners podem alterar configurações sensíveis */}
      {isCompanyOwner() && (
        <div>
          <label>Configurações Avançadas</label>
          <textarea 
            className="w-full border p-2 rounded"
            placeholder="JSON de configurações..."
          />
        </div>
      )}

      {/* Apenas SaaS admins podem alterar plano */}
      {isSaaSAdmin() && (
        <div>
          <label>Plano da Empresa</label>
          <select className="w-full border p-2 rounded">
            <option>FREE</option>
            <option>BASIC</option>
            <option>PRO</option>
            <option>PREMIUM</option>
          </select>
        </div>
      )}

      <button 
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded"
        disabled={!isCompanyOwner() && !isSaaSAdmin()}
      >
        Salvar
      </button>
    </form>
  )
}

/**
 * RESUMO:
 * 
 * Este arquivo mostra 10 exemplos práticos de como usar o novo hook usePermissions:
 * 
 * 1. Proteção de Página
 * 2. Menu Dinâmico
 * 3. Verificação de Role Específica
 * 4. Botões Condicionais
 * 5. Dashboard com Seções Condicionais
 * 6. SaaS Admin Link na Navegação
 * 7. Debug Info
 * 8. Página de SaaS Admin Protegida
 * 9. Tabela com Ações Condicionais
 * 10. Formulário com Campos Condicionais
 * 
 * Copie e adapte estes exemplos para seus componentes!
 */

