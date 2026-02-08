'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { usePermissions } from '@/hooks/usePermissions'
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  Users,
  DollarSign,
  Star,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  CalendarCheck,
  ShoppingBag,
  TrendingUp,
  Package,
  ShoppingCart,
  FileText,
  Target,
  Gift,
  Receipt,
  MessageSquare,
  CreditCard,
  FileEdit,
  HelpCircle,
  Sparkles,
  ClipboardList,
  BarChart3,
  Wallet,
  Truck,
  UserCheck,
  Award,
  Zap,
  Link2,
  Shield,
  Key,
  Puzzle,
  GraduationCap,
  Crown,
  Building,
  ChevronDown,
  Plus as PlusIcon
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { useCompanyTheme } from '@/hooks/useCompanyTheme'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ImageUpload from '@/components/ui/ImageUpload'
import { userService } from '@/services/api'
import { toast } from 'sonner'

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout, setUser } = useAuthStore()
  const permissions = usePermissions()
  useCompanyTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar_url || '')

  useEffect(() => {
    setAvatarUrl(user?.avatar_url || '')
  }, [user?.avatar_url])

  // Normalizar role para comparação
  const normalizedUserRole = (user?.role || '').toLowerCase()

  const getRoleBadge = (role: string, saasRole?: string) => {
    // Priorizar saas_role se existir
    const roleToUse = saasRole || role
    const normalizedRole = roleToUse?.toLowerCase() || 'client'
    const badges: any = {
      // SaaS Roles (prioridade)
      saas_owner: { label: 'Dono do SaaS', color: 'bg-gradient-to-r from-red-600 to-red-700' },
      saas_staff: { label: 'Equipe SaaS', color: 'bg-gradient-to-r from-blue-600 to-blue-700' },
      // Company Roles
      owner: { label: 'Proprietário', color: 'bg-purple-500' },
      company_owner: { label: 'Proprietário', color: 'bg-purple-500' },
      manager: { label: 'Gerente', color: 'bg-blue-500' },
      company_manager: { label: 'Gerente', color: 'bg-blue-500' },
      receptionist: { label: 'Recepcionista', color: 'bg-green-500' },
      company_receptionist: { label: 'Recepcionista', color: 'bg-green-500' },
      professional: { label: 'Profissional', color: 'bg-yellow-500' },
      company_professional: { label: 'Profissional', color: 'bg-yellow-500' },
      finance: { label: 'Financeiro', color: 'bg-orange-500' },
      company_finance: { label: 'Financeiro', color: 'bg-orange-500' },
      saas_admin: { label: 'Admin', color: 'bg-red-500' },
      admin: { label: 'Admin', color: 'bg-red-500' },
      client: { label: 'Cliente', color: 'bg-gray-500' },
      company_client: { label: 'Cliente', color: 'bg-gray-500' },
    }
    return badges[normalizedRole] || badges.client
  }

  interface MenuItem {
    icon: React.ComponentType<{ className?: string }>
    label: string
    href: string
    show: boolean
    premium?: boolean
    feature?: string // Feature key para verificar acesso por plano
    requiredPlan?: string // Plano mínimo necessário
  }

  const { hasFeatureLocal, currentPlan } = useFeatureAccess()

  // Mapeamento de features para planos mínimos
  const featurePlanMap: Record<string, string> = {
    financial_complete: 'pro',
    commissions: 'pro',
    goals: 'pro',
    packages: 'pro',
    anamneses: 'pro',
    purchases: 'pro',
    whatsapp_marketing: 'pro',
    cashback: 'premium',
    promotions: 'premium',
    subscription_sales: 'premium',
    document_generator: 'premium',
    invoices: 'premium',
    pricing_intelligence: 'premium',
    advanced_reports: 'premium',
    client_funnel: 'premium',
    crm_advanced: 'scale',
    automatic_campaigns: 'scale',
  }

  const menuItems: Array<{
    section: string
    items: MenuItem[]
  }> = [
    // PRINCIPAL
    { 
      section: 'PRINCIPAL',
      items: [
        { icon: LayoutDashboard, label: 'Painel', href: '/dashboard', show: permissions.canViewDashboard() },
        { icon: Calendar, label: 'Agenda', href: '/calendar', show: permissions.canViewCalendar() },
        { icon: CalendarCheck, label: 'Agendamentos', href: '/appointments', show: true },
        { icon: Receipt, label: 'Comandas', href: '/commands', show: permissions.canManagePayments() },
        { icon: Package, label: 'Pacotes', href: '/packages', show: permissions.canManagePayments() },
        { icon: Package, label: 'Pacotes Predefinidos', href: '/packages/predefined', show: permissions.canManagePayments() },
      ]
    },
    // CADASTROS
    { 
      section: 'CADASTROS',
      items: [
        { icon: Users, label: 'Clientes', href: '/clients', show: permissions.canManageClients() },
        { icon: Briefcase, label: 'Serviços', href: '/services', show: permissions.canManageServices() },
        { icon: ShoppingBag, label: 'Produtos', href: '/products', show: permissions.canManageServices() },
        { icon: UserCheck, label: 'Profissionais', href: '/professionals', show: permissions.canManageUsers() },
        { icon: Truck, label: 'Fornecedores', href: '/suppliers', show: permissions.canManageServices() },
        { icon: ClipboardList, label: 'Categorias', href: '/products/categories', show: permissions.canManageServices() },
        { icon: Sparkles, label: 'Marcas', href: '/products/brands', show: permissions.canManageServices() },
        { icon: FileEdit, label: 'Gerador de Documento', href: '/documents', show: permissions.canManageServices(), feature: 'document_generator', requiredPlan: 'premium' },
      ]
    },
    // FINANCEIRO
    { 
      section: 'FINANCEIRO',
      items: [
        { icon: TrendingUp, label: 'Painel Financeiro', href: '/financial/dashboard', show: permissions.canManagePayments() },
        { icon: DollarSign, label: 'Transações', href: '/financial/transactions', show: permissions.canManagePayments() },
        { icon: Wallet, label: 'Contas Financeiras', href: '/financial/accounts', show: permissions.canManagePayments() },
        { icon: CreditCard, label: 'Formas de Pagamento', href: '/financial/payment-forms', show: permissions.canManagePayments() },
        { icon: BarChart3, label: 'Categorias Financeiras', href: '/financial/categories', show: permissions.canManagePayments() },
        { icon: Award, label: 'Comissões', href: '/commissions', show: permissions.canManagePayments() },
        { icon: Settings, label: 'Configurar Comissões', href: '/commissions/config', show: permissions.canManagePayments() },
        { icon: ShoppingBag, label: 'Caixa', href: '/financial/cash-registers', show: permissions.canManagePayments() },
        { icon: Zap, label: 'Pagamentos Integrados', href: '/payments', show: permissions.canManagePayments() },
        { icon: FileText, label: 'Notas Fiscais', href: '/invoices', show: permissions.canManagePayments(), feature: 'invoices', requiredPlan: 'premium' },
      ]
    },
    // CONTROLE
    { 
      section: 'CONTROLE',
      items: [
        { icon: Target, label: 'Metas', href: '/goals', show: permissions.canManagePayments() },
        { icon: BarChart3, label: 'Relatórios', href: '/reports', show: permissions.canViewReports() },
        { icon: FileText, label: 'Anamneses', href: '/anamneses', show: permissions.canManagePayments() },
        { icon: Truck, label: 'Compras', href: '/purchases', show: permissions.canManagePayments() },
        { icon: Gift, label: 'Cashback', href: '/cashback', show: permissions.canManagePayments(), feature: 'cashback', requiredPlan: 'premium' },
      ]
    },
    // MARKETING
    { 
      section: 'MARKETING',
      items: [
        { icon: Link2, label: 'Link de Agendamento', href: '/marketing/scheduling-link', show: permissions.canManageServices() },
        { icon: Calendar, label: 'Agendamento Online', href: '/marketing/online-booking', show: permissions.canManageServices() },
        { icon: MessageSquare, label: 'WhatsApp Marketing', href: '/whatsapp', show: permissions.canManageServices() },
        { icon: Gift, label: 'Promoções', href: '/promotions', show: permissions.canManageServices(), feature: 'promotions', requiredPlan: 'premium' },
        { icon: CreditCard, label: 'Vendas por Assinatura', href: '/subscription-sales', show: permissions.canManageServices(), feature: 'subscription_sales', requiredPlan: 'premium' },
        { icon: Star, label: 'Avaliações', href: '/evaluations', show: permissions.canViewReviews() },
        { icon: MessageSquare, label: 'CRM no WhatsApp', href: '/whatsapp/crm', show: permissions.canManageServices() },
      ]
    },
    // ADMIN
    { 
      section: 'ADMIN',
      items: [
        { icon: Shield, label: 'Painel SaaS Admin', href: '/saas-admin', show: (typeof (permissions as any).canAccessSaaSAdmin === 'function' ? (permissions as any).canAccessSaaSAdmin() : (typeof (permissions as any).canAccessSaasAdmin === 'function' ? (permissions as any).canAccessSaasAdmin() : false)) },
        { icon: Key, label: 'Configurações de Notificação', href: '/admin/notifications-config', show: permissions.canManageCompanySettings() },
        { icon: Key, label: 'API Keys', href: '/api-keys', show: permissions.canManageCompanySettings() },
        { icon: Settings, label: 'Configurações de Sistema', href: '/admin/system', show: permissions.isSaaSOwner() },
      ]
    },
    // PLANO & ADD-ONS
{
  section: 'PLANO',
  items: [
    { icon: Crown, label: 'Meu Plano', href: '/plans', show: true },
    { icon: Puzzle, label: 'Add-ons', href: '/addons', show: permissions.canManageCompanySettings() },
    { icon: GraduationCap, label: 'Consultoria', href: '/consulting', show: permissions.canManageCompanySettings() },
  ]
},
// CONTA
{ 
  section: 'CONTA',
  items: [
    { icon: Bell, label: 'Notificações', href: '/notifications', show: true },
    { icon: Settings, label: 'Gerenciar Notificações', href: '/notifications/templates', show: permissions.canManageCompanySettings() },
    { icon: Building, label: 'Configurações da Empresa', href: '/company-settings', show: permissions.canManageCompanySettings() },
    { icon: Settings, label: 'Configurações', href: '/configuracoes', show: true },
  ]
},
    // EXTRA
    { 
      section: 'EXTRA',
      items: [
        { icon: HelpCircle, label: 'Ajuda', href: '/help', show: true },
        { icon: Bell, label: 'Conferir novidades', href: '/news', show: true },
      ]
    },
  ]

  const filteredMenu = menuItems.map(section => ({
    ...section,
    items: section.items.filter(item => item.show && item.href) // Garantir que tenha href válido
  })).filter(section => section.items.length > 0)
  
  // Priorizar saas_role se existir, senão usar role normal
  const roleBadge = getRoleBadge(user?.role || 'client', user?.saas_role || undefined)
  
  // Ajustar nome para SaaS Owner
  const displayName = user?.saas_role === 'SAAS_OWNER' ? 'Dono do SaaS' : user?.full_name

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const firstName = (displayName || '').split(' ')[0] || 'Olá'

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full shadow-lg z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64 overflow-y-auto`}
        style={{
          background: `linear-gradient(to bottom, var(--sidebar-color, #6d28d9), #0b1220)`
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-bold text-white">Atendo</h1>
            <p className="text-sm text-white/80">SaaS Platform</p>

            {/* Quick icons */}
            <div className="mt-4 flex items-center gap-2">
              <Link
                href="/notifications"
                className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title="Notificações"
              >
                <Bell className="h-4 w-4 text-white" />
              </Link>
              <Link
                href="/whatsapp"
                className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title="WhatsApp"
              >
                <MessageSquare className="h-4 w-4 text-white" />
              </Link>
              <Link
                href="/calendar"
                className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title="Atalhos"
              >
                <Zap className="h-4 w-4 text-white" />
              </Link>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAvatarUpload(!showAvatarUpload)}
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-white/15 hover:bg-white/25 transition-colors overflow-hidden group relative"
                title="Clique para alterar foto"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={user?.full_name || 'Avatar'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">Alterar</span>
                </div>
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate text-white">Olá, {firstName}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white ${roleBadge.color}`}>
                    {roleBadge.label}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs text-white/90 hover:text-white transition-colors"
                      >
                        Meu perfil
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem asChild>
                        <Link href="/configuracoes">Configurações</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {showAvatarUpload && (
              <div className="mt-3 p-3 bg-white/10 rounded-lg">
                <ImageUpload
                  value={avatarUrl}
                  onChange={async (url) => {
                    try {
                      setAvatarUrl(url)
                      const response = await userService.updateMe({ avatar_url: url })
                      setUser(response.data)
                      toast.success('Foto atualizada!')
                      setShowAvatarUpload(false)
                    } catch (error: any) {
                      toast.error(error?.response?.data?.detail || 'Erro ao atualizar foto')
                    }
                  }}
                  folder="professionals"
                  prefix={user?.id ? `me_${user.id}` : 'me'}
                  label=""
                />
              </div>
            )}

            <div className="mt-4 space-y-2">
              <Link
                href="/calendar?new=1"
                onClick={() => setIsOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900/90 hover:bg-slate-900 text-white font-semibold py-3 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                + Novo
              </Link>
              <Link
                href="/professionals"
                onClick={() => setIsOpen(false)}
                className="block text-sm text-white/90 hover:text-white underline underline-offset-4"
              >
                Convidar profissionais
              </Link>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            {filteredMenu.map((section) => (
              <div key={section.section} className="mb-6">
                <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 px-2">
                  {section.section}
                </h3>
                <ul className="space-y-1">
                  {section.items
                    .filter((item): item is MenuItem => Boolean(item.href && typeof item.href === 'string'))
                    .map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                    return (
                      <li key={`${section.section}-${item.href}`}>
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 transition-colors text-sm ${
                            isActive
                              ? 'text-white bg-white/20 rounded-full shadow-sm'
                              : 'text-white/90 hover:text-white hover:bg-white/10 rounded-lg'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium flex-1">{item.label}</span>
                          {item.feature && !hasFeatureLocal(item.feature) && (
                            <span className="text-xs bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-1.5 py-0.5 rounded font-medium uppercase">
                              {item.requiredPlan || 'PRO'}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
