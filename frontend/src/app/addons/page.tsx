'use client'

import { useState, useEffect } from 'react'
import { 
  Check, 
  Plus, 
  Minus, 
  Loader2, 
  Sparkles,
  BarChart3,
  Target,
  MessageSquare,
  Building2,
  FileSignature,
  ClipboardList,
  Gift,
  Receipt,
  Crown
} from 'lucide-react'
import api from '@/services/api'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

interface AddOn {
  id: number
  name: string
  slug: string
  description: string
  price_monthly: number
  category: string
  icon: string
  color: string
  unlocks_features: string[]
  included_in_plans: string[]
  is_active: boolean
}

interface CompanyAddOn {
  id: number
  addon_id: number
  is_active: boolean
  is_trial: boolean
  trial_end_date: string | null
  addon: AddOn
}

interface CompanyAddOnsResponse {
  active_addons: CompanyAddOn[]
  available_addons: AddOn[]
  total_monthly_cost: number
}

const iconMap: Record<string, any> = {
  'pricing_intelligence': Sparkles,
  'advanced_reports': BarChart3,
  'goals_bonification': Target,
  'marketing_whatsapp': MessageSquare,
  'extra_unit': Building2,
  'digital_signature': FileSignature,
  'anamnesis_intelligent': ClipboardList,
  'cashback_loyalty': Gift,
  'fiscal_pro': Receipt,
}

const categoryLabels: Record<string, string> = {
  'analytics': 'Análise & Relatórios',
  'management': 'Gestão',
  'marketing': 'Marketing',
  'operations': 'Operações',
  'healthcare': 'Saúde & Estética',
  'fiscal': 'Fiscal',
}

export default function AddOnsPage() {
  const [data, setData] = useState<CompanyAddOnsResponse | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string>('essencial')
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState<string | null>(null)
  const [deactivating, setDeactivating] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load current plan
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.company_id) {
        const companyResponse = await api.get(`/companies/${user.company_id}`)
        setCurrentPlan(companyResponse.data.subscription_plan?.toLowerCase() || 'essencial')
      }
      
      // Load addons
      const response = await api.get('/addons/company')
      setData(response.data)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar add-ons')
    } finally {
      setLoading(false)
    }
  }

  const activateAddOn = async (slug: string) => {
    try {
      setActivating(slug)
      await api.post('/addons/activate', { addon_slug: slug })
      toast.success('Add-on ativado com sucesso!')
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao ativar add-on')
    } finally {
      setActivating(null)
    }
  }

  const deactivateAddOn = async (slug: string) => {
    try {
      setDeactivating(slug)
      await api.post(`/addons/deactivate/${slug}`)
      toast.success('Add-on desativado')
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao desativar add-on')
    } finally {
      setDeactivating(null)
    }
  }

  const isIncludedInPlan = (addon: AddOn) => {
    return addon.included_in_plans?.includes(currentPlan)
  }

  const getIcon = (slug: string) => {
    const Icon = iconMap[slug] || Sparkles
    return Icon
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const groupedAvailable = data?.available_addons.reduce((acc, addon) => {
    const category = addon.category || 'outros'
    if (!acc[category]) acc[category] = []
    acc[category].push(addon)
    return acc
  }, {} as Record<string, AddOn[]>) || {}

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Add-ons
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Expanda as funcionalidades do seu plano com recursos adicionais
        </p>
      </div>

      {/* Current Plan Badge */}
      <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5 text-primary" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Seu plano atual:</span>
          <span className="font-semibold text-primary capitalize">{currentPlan}</span>
          {data?.total_monthly_cost && data.total_monthly_cost > 0 && (
            <span className="ml-auto text-sm text-gray-500">
              Add-ons ativos: <strong className="text-primary">R$ {data.total_monthly_cost.toFixed(2)}/mês</strong>
            </span>
          )}
        </div>
      </div>

      {/* Active Add-ons */}
      {data?.active_addons && data.active_addons.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            Add-ons Ativos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.active_addons.map((companyAddon) => {
              const addon = companyAddon.addon
              const Icon = getIcon(addon.slug)
              const included = isIncludedInPlan(addon)
              
              return (
                <div 
                  key={companyAddon.id}
                  className="relative p-5 bg-white dark:bg-gray-800 rounded-xl border-2 border-green-500/50 shadow-sm"
                >
                  {included && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Incluso no plano
                    </div>
                  )}
                  {companyAddon.is_trial && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      Trial
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {addon.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {addon.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">
                          {included ? 'Incluso' : `R$ ${addon.price_monthly}/mês`}
                        </span>
                        {!included && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => deactivateAddOn(addon.slug)}
                            disabled={deactivating === addon.slug}
                          >
                            {deactivating === addon.slug ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Minus className="w-4 h-4 mr-1" />
                                Cancelar
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Available Add-ons by Category */}
      {Object.entries(groupedAvailable).map(([category, addons]) => (
        <div key={category} className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
            {categoryLabels[category] || category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addons.map((addon) => {
              const Icon = getIcon(addon.slug)
              const included = isIncludedInPlan(addon)
              
              return (
                <div 
                  key={addon.id}
                  className="relative p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  {included && (
                    <div className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                      Incluso no seu plano
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                      <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {addon.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {addon.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          {included ? 'Grátis' : `R$ ${addon.price_monthly}/mês`}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => activateAddOn(addon.slug)}
                          disabled={activating === addon.slug}
                        >
                          {activating === addon.slug ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-1" />
                              {included ? 'Ativar' : 'Contratar'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {!data?.available_addons?.length && !data?.active_addons?.length && (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Nenhum add-on disponível
          </h3>
          <p className="text-gray-500 mt-2">
            Todos os recursos já estão inclusos no seu plano!
          </p>
        </div>
      )}
    </div>
  )
}
