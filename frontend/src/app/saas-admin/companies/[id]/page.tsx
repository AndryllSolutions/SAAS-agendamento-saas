'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { saasAdminService } from '@/services/api'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Building2,
  ArrowLeft,
  Edit,
  Save,
  X,
  Users,
  Calendar,
  DollarSign,
  Power,
  PowerOff,
  LogIn,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  CreditCard,
  AlertTriangle,
  Sparkles,
  Crown,
  Award,
  Tag,
  FileText,
  Settings,
  TrendingUp,
  CalendarDays,
  Store,
  Shield,
  ExternalLink,
  Copy
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

// Tipos de plano com cores e ícones
const PLAN_CONFIG: Record<string, { color: string, bg: string, icon: any, price: string, features: string[] }> = {
  FREE: { 
    color: 'text-gray-700', 
    bg: 'bg-gray-100', 
    icon: Tag,
    price: 'R$ 0,00',
    features: ['1 profissional', 'Recursos básicos', 'Sem suporte']
  },
  BASIC: { 
    color: 'text-blue-700', 
    bg: 'bg-blue-100', 
    icon: Award,
    price: 'R$ 49,90/mês',
    features: ['Até 3 profissionais', 'Agendamento online', 'Suporte email']
  },
  PRO: { 
    color: 'text-purple-700', 
    bg: 'bg-purple-100', 
    icon: Sparkles,
    price: 'R$ 99,90/mês',
    features: ['Até 10 profissionais', 'Todos os recursos', 'Suporte prioritário']
  },
  PREMIUM: { 
    color: 'text-amber-700', 
    bg: 'bg-amber-100', 
    icon: Crown,
    price: 'R$ 199,90/mês',
    features: ['Profissionais ilimitados', 'API access', 'Suporte dedicado']
  }
}

export default function CompanyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params?.id as string
  const { user, isAuthenticated, setAuth } = useAuthStore()
  
  const [company, setCompany] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editedCompany, setEditedCompany] = useState<any>({})
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Subscription editing
  const [editingSubscription, setEditingSubscription] = useState(false)
  const [editedSubscription, setEditedSubscription] = useState<any>({})

  // Aguardar hidratação do Zustand
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    // Não fazer nada enquanto não hidratar
    if (!isHydrated) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const saasRole = user?.saas_role?.toUpperCase()
    if (saasRole !== 'SAAS_OWNER' && saasRole !== 'SAAS_STAFF') {
      router.push('/unauthorized')
      return
    }

    loadCompanyDetails()
  }, [isHydrated, isAuthenticated, user, router, companyId])

  const loadCompanyDetails = async () => {
    setLoading(true)
    try {
      const [companyRes, subscriptionRes] = await Promise.all([
        saasAdminService.getCompanyDetails(parseInt(companyId)),
        saasAdminService.getCompanySubscription(parseInt(companyId))
      ])
      setCompany(companyRes.data)
      setSubscription(subscriptionRes.data)
      setEditedCompany(companyRes.data)
      setEditedSubscription(subscriptionRes.data)
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error)
      toast.error('Erro ao carregar detalhes da empresa')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCompany = async () => {
    try {
      await saasAdminService.updateCompany(parseInt(companyId), editedCompany)
      toast.success('Empresa atualizada com sucesso')
      setEditing(false)
      loadCompanyDetails()
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error)
      toast.error('Erro ao atualizar empresa')
    }
  }

  const handleToggleStatus = async () => {
    try {
      await saasAdminService.toggleCompanyStatus(parseInt(companyId), !company.is_active)
      toast.success(`Empresa ${!company.is_active ? 'ativada' : 'desativada'} com sucesso`)
      loadCompanyDetails()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status da empresa')
    }
  }

  const handleSaveSubscription = async () => {
    try {
      const params: any = {
        plan_type: editedSubscription.plan_type,
        is_active: editedSubscription.is_active
      }
      
      if (editedSubscription.trial_days) {
        params.trial_days = parseInt(editedSubscription.trial_days)
      }

      await saasAdminService.updateCompanySubscription(parseInt(companyId), params)
      toast.success('Assinatura atualizada com sucesso')
      setEditingSubscription(false)
      loadCompanyDetails()
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error)
      toast.error('Erro ao atualizar assinatura')
    }
  }

  const handleImpersonate = async () => {
    try {
      const response = await saasAdminService.impersonateCompany(parseInt(companyId))
      const { access_token } = response.data
      
      if (user) {
        setAuth(user, access_token, "")
      }
      toast.success(`Entrando como ${company.name}...`)
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } catch (error) {
      console.error('Erro ao impersonar empresa:', error)
      toast.error('Erro ao entrar na empresa')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado!')
  }

  // Calcular status da assinatura
  const getSubscriptionStatus = () => {
    if (!company) return { status: 'unknown', label: 'Desconhecido', color: 'gray' }
    
    const now = new Date()
    const expiresAt = company.subscription_expires_at ? new Date(company.subscription_expires_at) : null
    const trialEnd = subscription?.trial_end_date ? new Date(subscription.trial_end_date) : null
    
    if (!company.is_active) {
      return { status: 'suspended', label: 'Suspensa', color: 'red' }
    }
    
    if (trialEnd && trialEnd > now) {
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return { status: 'trial', label: `Trial (${daysLeft} dias)`, color: 'blue' }
    }
    
    if (expiresAt && expiresAt < now) {
      return { status: 'expired', label: 'Expirada', color: 'red' }
    }
    
    if (expiresAt) {
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (daysLeft <= 7) {
        return { status: 'expiring', label: `Expira em ${daysLeft}d`, color: 'amber' }
      }
    }
    
    return { status: 'active', label: 'Ativa', color: 'green' }
  }

  const saasRole = user?.saas_role?.toUpperCase()
  const isAuthorized = saasRole === 'SAAS_OWNER' || saasRole === 'SAAS_STAFF'

  // Aguardar hidratação antes de renderizar
  if (!isHydrated) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!isAuthenticated || !isAuthorized) {
    return null
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!company) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
          <div className="text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Empresa não encontrada</p>
            <Link href="/saas-admin/companies">
              <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Voltar para lista
              </button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const subscriptionStatus = getSubscriptionStatus()
  const currentPlan = company.subscription_plan || subscription?.plan_type || 'FREE'
  const planConfig = PLAN_CONFIG[currentPlan] || PLAN_CONFIG.FREE
  const PlanIcon = planConfig.icon

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/saas-admin/companies">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${planConfig.bg} ${planConfig.color}`}>
                    <PlanIcon className="w-4 h-4 inline mr-1" />
                    {currentPlan}
                  </span>
                </div>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{company.slug}</span>
                  <button onClick={() => copyToClipboard(company.slug)} className="text-gray-400 hover:text-gray-600">
                    <Copy className="w-4 h-4" />
                  </button>
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleImpersonate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Entrar na Empresa
              </button>
              <button
                onClick={handleToggleStatus}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  company.is_active
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {company.is_active ? <PowerOff className="w-5 h-5" /> : <Power className="w-5 h-5" />}
                {company.is_active ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </div>

          {/* Status Cards - Resumo Principal */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Status Geral */}
            <div className={`rounded-xl p-4 border-2 ${
              subscriptionStatus.color === 'green' ? 'bg-green-50 border-green-200' :
              subscriptionStatus.color === 'red' ? 'bg-red-50 border-red-200' :
              subscriptionStatus.color === 'amber' ? 'bg-amber-50 border-amber-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  subscriptionStatus.color === 'green' ? 'bg-green-100' :
                  subscriptionStatus.color === 'red' ? 'bg-red-100' :
                  subscriptionStatus.color === 'amber' ? 'bg-amber-100' :
                  'bg-blue-100'
                }`}>
                  {subscriptionStatus.status === 'active' ? <CheckCircle className="w-6 h-6 text-green-600" /> :
                   subscriptionStatus.status === 'expired' || subscriptionStatus.status === 'suspended' ? <XCircle className="w-6 h-6 text-red-600" /> :
                   subscriptionStatus.status === 'expiring' ? <AlertTriangle className="w-6 h-6 text-amber-600" /> :
                   <Clock className="w-6 h-6 text-blue-600" />}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-bold">{subscriptionStatus.label}</p>
                </div>
              </div>
            </div>

            {/* Plano Atual */}
            <div className={`rounded-xl p-4 border-2 ${planConfig.bg} border-opacity-50`} style={{ borderColor: 'currentColor' }}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${planConfig.bg}`}>
                  <PlanIcon className={`w-6 h-6 ${planConfig.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plano</p>
                  <p className={`text-lg font-bold ${planConfig.color}`}>{currentPlan}</p>
                  <p className="text-xs text-gray-500">{planConfig.price}</p>
                </div>
              </div>
            </div>

            {/* Vencimento */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <CalendarDays className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vencimento</p>
                  <p className="text-lg font-bold">
                    {company.subscription_expires_at 
                      ? new Date(company.subscription_expires_at).toLocaleDateString('pt-BR')
                      : 'Sem data'}
                  </p>
                </div>
              </div>
            </div>

            {/* Usuários */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Usuários</p>
                  <p className="text-lg font-bold">
                    {company.stats?.active_users || 0}/{company.stats?.total_users || 0}
                  </p>
                  <p className="text-xs text-gray-500">ativos/total</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda - Informações */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informações Básicas */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    Informações da Empresa
                  </h2>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveCompany}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false)
                          setEditedCompany(company)
                        }}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dados Básicos */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 border-b pb-2">Dados Básicos</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Nome</label>
                      {editing ? (
                        <input
                          type="text"
                          value={editedCompany.name || ''}
                          onChange={(e) => setEditedCompany({ ...editedCompany, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{company.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Tipo de Negócio</label>
                      {editing ? (
                        <select
                          value={editedCompany.business_type || ''}
                          onChange={(e) => setEditedCompany({ ...editedCompany, business_type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Selecione...</option>
                          <option value="barbearia">Barbearia</option>
                          <option value="salao_de_beleza">Salão de Beleza</option>
                          <option value="clinica_estetica">Clínica Estética</option>
                          <option value="spa">SPA</option>
                          <option value="outro">Outro</option>
                        </select>
                      ) : (
                        <p className="text-gray-900">{company.business_type || '-'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Tamanho da Equipe</label>
                      <p className="text-gray-900">{company.team_size || '-'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Fuso Horário</label>
                      <p className="text-gray-900">{company.timezone || 'America/Sao_Paulo'}</p>
                    </div>
                  </div>

                  {/* Contato */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 border-b pb-2">Contato</h3>
                    
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                        {editing ? (
                          <input
                            type="email"
                            value={editedCompany.email || ''}
                            onChange={(e) => setEditedCompany({ ...editedCompany, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <p className="text-gray-900">{company.email || '-'}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Telefone</label>
                        {editing ? (
                          <input
                            type="text"
                            value={editedCompany.phone || ''}
                            onChange={(e) => setEditedCompany({ ...editedCompany, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <p className="text-gray-900">{company.phone || '-'}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      </svg>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-500 mb-1">WhatsApp</label>
                        {editing ? (
                          <input
                            type="text"
                            value={editedCompany.whatsapp || ''}
                            onChange={(e) => setEditedCompany({ ...editedCompany, whatsapp: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <p className="text-gray-900">{company.whatsapp || '-'}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Website</label>
                        {editing ? (
                          <input
                            type="url"
                            value={editedCompany.website || ''}
                            onChange={(e) => setEditedCompany({ ...editedCompany, website: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          company.website ? (
                            <a href={company.website} target="_blank" rel="noopener noreferrer" 
                               className="text-blue-600 hover:underline flex items-center gap-1">
                              {company.website} <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : <p className="text-gray-400">-</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dados Fiscais */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    Dados Fiscais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Tipo</label>
                      <p className="text-gray-900">{company.company_type === 'PJ' ? 'Pessoa Jurídica' : company.company_type === 'PF' ? 'Pessoa Física' : '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">CPF/CNPJ</label>
                      <p className="text-gray-900 font-mono">{company.cnpj || company.cpf || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Nome Fantasia</label>
                      <p className="text-gray-900">{company.trade_name || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Inscrição Municipal</label>
                      <p className="text-gray-900">{company.municipal_registration || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Inscrição Estadual</label>
                      <p className="text-gray-900">{company.state_registration || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    Endereço
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Logradouro</label>
                      {editing ? (
                        <input
                          type="text"
                          value={editedCompany.address || ''}
                          onChange={(e) => setEditedCompany({ ...editedCompany, address: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="text-gray-900">{company.address || '-'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Número</label>
                      {editing ? (
                        <input
                          type="text"
                          value={editedCompany.address_number || ''}
                          onChange={(e) => setEditedCompany({ ...editedCompany, address_number: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="text-gray-900">{company.address_number || '-'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Complemento</label>
                      {editing ? (
                        <input
                          type="text"
                          value={editedCompany.address_complement || ''}
                          onChange={(e) => setEditedCompany({ ...editedCompany, address_complement: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="text-gray-900">{company.address_complement || '-'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Bairro</label>
                      {editing ? (
                        <input
                          type="text"
                          value={editedCompany.neighborhood || ''}
                          onChange={(e) => setEditedCompany({ ...editedCompany, neighborhood: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="text-gray-900">{company.neighborhood || '-'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Cidade</label>
                      {editing ? (
                        <input
                          type="text"
                          value={editedCompany.city || ''}
                          onChange={(e) => setEditedCompany({ ...editedCompany, city: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="text-gray-900">{company.city || '-'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Estado</label>
                      {editing ? (
                        <input
                          type="text"
                          value={editedCompany.state || ''}
                          onChange={(e) => setEditedCompany({ ...editedCompany, state: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                          maxLength={2}
                        />
                      ) : (
                        <p className="text-gray-900">{company.state || '-'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">CEP</label>
                      {editing ? (
                        <input
                          type="text"
                          value={editedCompany.postal_code || ''}
                          onChange={(e) => setEditedCompany({ ...editedCompany, postal_code: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="text-gray-900">{company.postal_code || '-'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assinatura Detalhada */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    Assinatura e Plano
                  </h2>
                  {!editingSubscription ? (
                    <button
                      onClick={() => setEditingSubscription(true)}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveSubscription}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingSubscription(false)
                          setEditedSubscription(subscription)
                        }}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Plano Card */}
                <div className={`p-6 rounded-xl mb-6 ${planConfig.bg} border-2`} style={{ borderColor: 'transparent' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-xl bg-white/50`}>
                        <PlanIcon className={`w-10 h-10 ${planConfig.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Plano Atual</p>
                        <p className={`text-3xl font-bold ${planConfig.color}`}>{currentPlan}</p>
                        <p className="text-gray-600 mt-1">{planConfig.price}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Recursos incluídos:</p>
                      <ul className="text-sm text-gray-700 mt-1">
                        {planConfig.features.map((f, i) => (
                          <li key={i} className="flex items-center justify-end gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Alterar Plano */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plano</label>
                    {editingSubscription ? (
                      <select
                        value={editedSubscription.plan_type || currentPlan}
                        onChange={(e) => setEditedSubscription({ ...editedSubscription, plan_type: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="FREE">FREE - R$ 0,00</option>
                        <option value="BASIC">BASIC - R$ 49,90/mês</option>
                        <option value="PRO">PRO - R$ 99,90/mês</option>
                        <option value="PREMIUM">PREMIUM - R$ 199,90/mês</option>
                      </select>
                    ) : (
                      <p className={`inline-block px-4 py-2 rounded-full font-semibold ${planConfig.bg} ${planConfig.color}`}>
                        {currentPlan}
                      </p>
                    )}
                  </div>

                  {/* Status Assinatura */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status da Assinatura</label>
                    {editingSubscription ? (
                      <select
                        value={editedSubscription.is_active ? 'true' : 'false'}
                        onChange={(e) => setEditedSubscription({ ...editedSubscription, is_active: e.target.value === 'true' })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="true">Ativa</option>
                        <option value="false">Inativa</option>
                      </select>
                    ) : (
                      <span className={`inline-block px-4 py-2 rounded-full ${
                        subscription?.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {subscription?.is_active ? 'Ativa' : 'Inativa'}
                      </span>
                    )}
                  </div>

                  {/* Trial */}
                  {editingSubscription && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adicionar Trial (dias)
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 30"
                        value={editedSubscription.trial_days || ''}
                        onChange={(e) => setEditedSubscription({ ...editedSubscription, trial_days: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}

                  {/* Data de Expiração */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data de Expiração</label>
                    <p className="text-gray-900 text-lg">
                      {company.subscription_expires_at 
                        ? new Date(company.subscription_expires_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })
                        : 'Sem data definida'}
                    </p>
                  </div>

                  {/* Trial End */}
                  {subscription?.trial_end_date && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trial até</label>
                      <p className="text-blue-600 text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        {new Date(subscription.trial_end_date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {/* Cupom */}
                  {subscription?.coupon_code && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cupom Utilizado</label>
                      <p className="text-gray-900 font-mono bg-gray-100 px-3 py-2 rounded inline-block">
                        {subscription.coupon_code}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Coluna Direita - Ações e Configs */}
            <div className="space-y-6">
              {/* Datas Importantes */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  Timeline
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Store className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Criada em</p>
                      <p className="font-medium">
                        {company.created_at 
                          ? new Date(company.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })
                          : '-'}
                      </p>
                    </div>
                  </div>

                  {company.updated_at && (
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Edit className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Última atualização</p>
                        <p className="font-medium">
                          {new Date(company.updated_at).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {company.subscription_expires_at && (
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        subscriptionStatus.status === 'expired' ? 'bg-red-100' :
                        subscriptionStatus.status === 'expiring' ? 'bg-amber-100' :
                        'bg-orange-100'
                      }`}>
                        <CalendarDays className={`w-5 h-5 ${
                          subscriptionStatus.status === 'expired' ? 'text-red-600' :
                          subscriptionStatus.status === 'expiring' ? 'text-amber-600' :
                          'text-orange-600'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Vencimento do Plano</p>
                        <p className={`font-medium ${
                          subscriptionStatus.status === 'expired' ? 'text-red-600' :
                          subscriptionStatus.status === 'expiring' ? 'text-amber-600' :
                          ''
                        }`}>
                          {new Date(company.subscription_expires_at).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'long', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Configurações */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-400" />
                  Configurações
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">Agendamento Online</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      company.online_booking_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {company.online_booking_enabled ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">Moeda</span>
                    <span className="font-mono">{company.currency || 'BRL'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Cores</span>
                    <div className="flex gap-1">
                      <div className="w-6 h-6 rounded border" style={{ backgroundColor: company.primary_color || '#3B82F6' }}></div>
                      <div className="w-6 h-6 rounded border" style={{ backgroundColor: company.secondary_color || '#10B981' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Ações</h2>
                <div className="space-y-2">
                  <button
                    onClick={handleImpersonate}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    Entrar na Empresa
                  </button>
                  <button
                    onClick={handleToggleStatus}
                    className={`w-full px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      company.is_active
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {company.is_active ? <PowerOff className="w-5 h-5" /> : <Power className="w-5 h-5" />}
                    {company.is_active ? 'Desativar Empresa' : 'Ativar Empresa'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
