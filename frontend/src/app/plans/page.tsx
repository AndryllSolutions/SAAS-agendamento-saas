'use client'

import { useState, useEffect } from 'react'
import { Check, ArrowRight, Loader2 } from 'lucide-react'
import { subscriptionService } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import { UpgradeSuccessModal } from '@/components/UpgradeSuccessModal'

interface Plan {
  id: number
  name: string
  slug: string
  price: number
  features: string[]
  recommended?: boolean
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [upgrading, setUpgrading] = useState<number | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [upgradedPlan, setUpgradedPlan] = useState<Plan | null>(null)

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const response = await subscriptionService.listPlans()
      setPlans(response.data || [])
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
      toast.error('Erro ao carregar planos')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = async (planId: number) => {
    try {
      setUpgrading(planId)
      setSelectedPlan(planId)
      
      const plan = plans.find(p => p.id === planId)
      if (!plan) {
        throw new Error('Plano não encontrado')
      }

      // ✅ CHAMAR UPGRADE REAL
      await subscriptionService.upgradePlan({
        new_plan_slug: plan.slug,
        immediate: true
      })
      
      toast.success(`Upgrade para plano ${plan.name} realizado com sucesso!`)
      
      // ✅ Mostrar modal de sucesso
      setUpgradedPlan(plan)
      setShowSuccessModal(true)
      
      // ✅ Recarregar página após fechar modal
      setTimeout(() => {
        window.location.reload()
      }, 6000) // Dar tempo de ver o modal
      
    } catch (error: any) {
      console.error('Erro ao fazer upgrade:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Erro ao selecionar plano'
      toast.error(errorMessage)
    } finally {
      setUpgrading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Escolha o plano ideal para seu negócio
            </h1>
            <p className="text-xl text-gray-600">
              ATENDO não é só um sistema de gestão. É um método para lucrar melhor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                  plan.recommended ? 'ring-2 ring-primary' : ''
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                      Mais Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-primary">
                    R${plan.price}
                    <span className="text-lg text-gray-600">/mês</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={upgrading === plan.id}
                  className={`w-full ${
                    plan.recommended
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {upgrading === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      {plan.recommended ? 'Começar Agora' : 'Selecionar Plano'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Sucesso */}
      {upgradedPlan && (
        <UpgradeSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          planName={upgradedPlan.name}
          features={upgradedPlan.features}
        />
      )}
    </DashboardLayout>
  )
}
