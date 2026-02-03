'use client'

import { useState, useEffect } from 'react'
import { 
  Loader2, 
  GraduationCap,
  TrendingUp,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Star,
  Clock,
  Users,
  Target,
  DollarSign,
  Crown
} from 'lucide-react'
import api from '@/services/api'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

interface StandaloneService {
  id: number
  name: string
  slug: string
  description: string
  price: number
  price_min: number | null
  price_max: number | null
  service_type: string
  duration_days: number | null
  includes: string[]
  included_in_plans: string[]
  is_active: boolean
}

interface StandaloneServiceListResponse {
  services: StandaloneService[]
  total: number
}

const includesLabels: Record<string, string> = {
  'financial_diagnosis': 'Diagnóstico financeiro completo',
  'price_adjustment': 'Ajuste de preços dos serviços',
  'custom_pricing_table': 'Tabela de preços personalizada',
  'weekly_meetings': 'Encontros semanais online',
  'profit_focus': 'Foco em aumento de lucro',
  'goals_setting': 'Definição de metas',
  'growth_strategy': 'Estratégia de crescimento',
  'strategic_support': 'Suporte estratégico',
  'extended_support': 'Suporte estendido',
}

export default function ConsultingPage() {
  const [services, setServices] = useState<StandaloneService[]>([])
  const [currentPlan, setCurrentPlan] = useState<string>('essencial')
  const [loading, setLoading] = useState(true)

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
      
      // Load services
      const response = await api.get('/standalone-services/')
      setServices(response.data.services)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }

  const isIncludedInPlan = (service: StandaloneService) => {
    return service.included_in_plans?.includes(currentPlan)
  }

  const handleContactSales = (service: StandaloneService) => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no serviço "${service.name}". Gostaria de mais informações.`
    )
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const pricingConsulting = services.find(s => s.slug === 'pricing_consulting')
  const programaCrescer = services.filter(s => s.slug.startsWith('programa_crescer'))

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Consultoria & Programa Crescer
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
          Transforme seu negócio com acompanhamento especializado. 
          Aumente seu lucro com precificação correta e estratégias comprovadas.
        </p>
      </div>

      {/* Current Plan Notice for Scale */}
      {currentPlan === 'scale' && (
        <div className="mb-8 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-green-500" />
            <div>
              <span className="font-semibold text-green-700 dark:text-green-400">
                Parabéns! Você é Scale!
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                O Programa Crescer está incluso gratuitamente no seu plano.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Consultoria de Precificação */}
      {pricingConsulting && (
        <div className="mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {pricingConsulting.name}
                  </h2>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {pricingConsulting.description}
                </p>

                <div className="space-y-3 mb-6">
                  {pricingConsulting.includes?.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {includesLabels[item] || item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:w-80">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="text-center mb-6">
                    <span className="text-sm text-gray-500">Investimento único</span>
                    <div className="text-4xl font-bold text-blue-600 mt-1">
                      R$ {pricingConsulting.price}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => handleContactSales(pricingConsulting)}
                  >
                    Quero contratar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Entraremos em contato em até 24h
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Programa Crescer */}
      <div className="mb-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4" />
            Mais vendido
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Programa Crescer
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Acompanhamento completo para transformar seu negócio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {programaCrescer.map((service) => {
            const included = isIncludedInPlan(service)
            const is60Days = service.slug === 'programa_crescer_60'
            
            return (
              <div 
                key={service.id}
                className={`relative rounded-2xl p-6 border-2 transition-all ${
                  is60Days 
                    ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-300 dark:border-purple-700' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                {is60Days && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Recomendado
                  </div>
                )}
                
                {included && (
                  <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Incluso
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl ${is60Days ? 'bg-purple-500' : 'bg-gray-500'}`}>
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {service.duration_days} dias
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {service.duration_days === 30 ? '4 semanas' : '8 semanas'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {service.includes?.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {includesLabels[item] || item}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      {included ? (
                        <div className="text-2xl font-bold text-green-600">
                          Grátis
                        </div>
                      ) : (
                        <>
                          <span className="text-sm text-gray-500">A partir de</span>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            R$ {service.price}
                          </div>
                        </>
                      )}
                    </div>
                    {!included && (
                      <div className="text-right text-sm text-gray-500">
                        ou 12x de R$ {(service.price / 12).toFixed(2)}
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full" 
                    variant={is60Days ? 'default' : 'secondary'}
                    onClick={() => included ? toast.success('Incluso no seu plano! Entre em contato para agendar.') : handleContactSales(service)}
                  >
                    {included ? 'Agendar início' : 'Quero participar'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mt-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Por que escolher nossa consultoria?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-4">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Aumento de Lucro
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Média de 30% de aumento no lucro após implementação das estratégias
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex p-4 bg-green-100 dark:bg-green-900/30 rounded-xl mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Suporte Dedicado
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Acompanhamento personalizado com consultores especializados
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex p-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl mb-4">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Metodologia Comprovada
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mais de 500 negócios transformados com nossa metodologia
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
