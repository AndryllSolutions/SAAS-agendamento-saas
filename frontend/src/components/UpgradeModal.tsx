'use client'

import { useState, useEffect } from 'react'
import { X, Check, TrendingUp, Sparkles, Zap, Crown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { subscriptionService } from '@/services/api'
import { toast } from 'sonner'

interface Plan {
  id: number
  name: string
  slug: string
  description: string
  price_monthly: number
  max_professionals: number
  max_units: number
  features: string[]
  highlight_label: string | null
}

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  requiredPlan?: string
  feature?: string
}

const featureNames: Record<string, string> = {
  pricing_intelligence: 'Precificação Inteligente',
  advanced_reports: 'Relatórios Avançados',
  cashback: 'Cashback & Fidelização',
  promotions: 'Promoções',
  invoices: 'Emissão de NF',
  whatsapp_marketing: 'Marketing WhatsApp',
  commissions: 'Comissões',
  goals: 'Metas',
  packages: 'Pacotes',
  client_funnel: 'Funil de Clientes',
  crm_advanced: 'CRM Avançado',
  automatic_campaigns: 'Campanhas Automáticas'
}

const planIcons: Record<string, any> = {
  essencial: Zap,
  pro: TrendingUp,
  premium: Sparkles,
  scale: Crown
}

const planColors: Record<string, string> = {
  essencial: 'from-blue-500 to-blue-600',
  pro: 'from-purple-500 to-purple-600',
  premium: 'from-amber-500 to-orange-500',
  scale: 'from-emerald-500 to-teal-600'
}

export function UpgradeModal({ isOpen, onClose, requiredPlan, feature }: UpgradeModalProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      loadPlans()
      loadCurrentPlan()
    }
  }, [isOpen])

  const loadPlans = async () => {
    try {
      const response = await subscriptionService.listPlans()
      setPlans(response.data || [])
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCurrentPlan = async () => {
    try {
      const response = await subscriptionService.getCurrentSubscription()
      setCurrentPlan(response.data.plan?.slug || null)
    } catch (error) {
      console.error('Erro ao carregar plano atual:', error)
    }
  }

  const handleUpgrade = async () => {
    if (!recommendedPlan) return
    
    try {
      setUpgrading(true)
      
      // ✅ CHAMAR UPGRADE REAL
      await subscriptionService.upgradePlan({
        new_plan_slug: recommendedPlan.slug,
        immediate: true
      })
      
      toast.success(`Upgrade para plano ${recommendedPlan.name} realizado com sucesso!`)
      
      // ✅ Fechar modal e recarregar página
      onClose()
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error: any) {
      console.error('Erro ao fazer upgrade:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Erro ao fazer upgrade'
      toast.error(errorMessage)
    } finally {
      setUpgrading(false)
    }
  }

  if (!isOpen) return null

  // Filtrar planos que desbloqueiam a feature requerida
  const eligiblePlans = requiredPlan 
    ? plans.filter(p => {
        const planOrder = ['essencial', 'pro', 'premium', 'scale']
        const requiredIndex = planOrder.indexOf(requiredPlan)
        const planIndex = planOrder.indexOf(p.slug)
        return planIndex >= requiredIndex
      })
    : plans

  // Pegar o plano recomendado (mínimo necessário)
  const recommendedPlan = eligiblePlans[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header com gradiente */}
        <div className={`bg-gradient-to-r ${planColors[requiredPlan || 'premium']} p-6 text-white`}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Desbloqueie este recurso</h2>
              <p className="text-white/80 text-sm">Faça upgrade do seu plano</p>
            </div>
          </div>

          {feature && (
            <div className="bg-white/10 rounded-lg px-4 py-2 mt-4">
              <p className="text-sm">
                <span className="font-semibold">{featureNames[feature] || feature}</span> está disponível 
                a partir do plano <span className="font-bold uppercase">{requiredPlan}</span>
              </p>
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recommendedPlan ? (
            <>
              {/* Plano recomendado */}
              <div className="border-2 border-primary rounded-xl p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                      RECOMENDADO
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-2">
                      Plano {recommendedPlan.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-gray-900">
                      R$ {recommendedPlan.price_monthly}
                    </span>
                    <span className="text-gray-500">/mês</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {recommendedPlan.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>
                      {recommendedPlan.max_professionals === -1 
                        ? 'Profissionais ilimitados' 
                        : `Até ${recommendedPlan.max_professionals} profissionais`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>
                      {recommendedPlan.max_units === -1 
                        ? 'Unidades ilimitadas' 
                        : `${recommendedPlan.max_units} unidade(s)`}
                    </span>
                  </div>
                  {feature && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="font-medium">{featureNames[feature] || feature}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Outros planos */}
              {eligiblePlans.length > 1 && (
                <div className="text-center text-sm text-gray-500 mb-4">
                  <button 
                    onClick={handleUpgrade}
                    className="text-primary hover:underline"
                  >
                    Ver todos os planos →
                  </button>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {upgrading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    Fazer Upgrade Agora
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-500 mt-3">
                14 dias de teste grátis • Sem compromisso
              </p>
            </>
          ) : (
            <p className="text-center text-gray-600 py-8">
              Nenhum plano disponível no momento.
            </p>
          )}
        </div>

        {/* Footer com benefícios */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-500" />
              Cancele quando quiser
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-500" />
              Suporte incluído
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-500" />
              Migração fácil
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
