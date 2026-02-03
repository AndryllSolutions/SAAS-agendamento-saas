'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, Crown, Star, Zap, Users, Calendar, HeadphonesIcon, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

export default function PricingPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const plans = [
    {
      name: 'Básico',
      description: 'Perfeito para pequenas empresas',
      price: billingCycle === 'monthly' ? 97 : 87,
      yearlyPrice: 1044,
      features: [
        'Até 10 profissionais',
        'Até 500 agendamentos/mês',
        'Agenda online',
        'Notificações automáticas',
        'Relatórios básicos',
        'Suporte por email',
      ],
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      popular: false,
    },
    {
      name: 'Profissional',
      description: 'Ideal para empresas em crescimento',
      price: billingCycle === 'monthly' ? 197 : 177,
      yearlyPrice: 2124,
      features: [
        'Até 50 profissionais',
        'Agendamentos ilimitados',
        'Agenda online + WhatsApp',
        'Notificações avançadas',
        'Relatórios completos',
        'API de integração',
        'Suporte prioritário',
        'Multiplas unidades',
      ],
      icon: Star,
      color: 'from-purple-500 to-purple-600',
      popular: true,
    },
    {
      name: 'Enterprise',
      description: 'Para grandes operações',
      price: billingCycle === 'monthly' ? 397 : 357,
      yearlyPrice: 4284,
      features: [
        'Profissionais ilimitados',
        'Recursos ilimitados',
        'Solução personalizada',
        'Dedicado VIP',
        'API completa',
        'Integrações customizadas',
        'Treinamento incluído',
        'SLA garantido',
        'Multi-tenant completo',
      ],
      icon: Crown,
      color: 'from-yellow-500 to-yellow-600',
      popular: false,
    },
  ]

  const handleSubscribe = (planName: string) => {
    if (!isAuthenticated) {
      router.push('/register')
      return
    }
    
    // Redirecionar para página de pagamento
    router.push(`/payments?plan=${planName}&billing=${billingCycle}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Agendamento SaaS
            </Link>
            <div className="flex space-x-4">
              {isAuthenticated ? (
                <Button onClick={() => router.push('/dashboard')}>
                  Ir para Dashboard
                </Button>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="secondary">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Cadastrar</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Planos que Crescem com Seu Negócio
          </h1>
          <p className="text-xl mb-8 text-indigo-100">
            Escolha o plano perfeito para sua necessidade. Upgrade ou downgrade a qualquer momento.
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-indigo-600'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-white text-indigo-600'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Anual
              <span className="bg-green-400 text-green-900 text-xs px-2 py-1 rounded-full font-semibold">
                Economia 10%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const Icon = plan.icon
              return (
                <div
                  key={plan.name}
                  className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                    plan.popular
                      ? 'ring-2 ring-purple-500 ring-offset-4'
                      : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">
                      Mais Popular
                    </div>
                  )}
                  
                  <div className={`p-8 bg-gradient-to-br ${plan.color} text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <Icon className="w-8 h-8" />
                      <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">
                        {plan.description}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">
                        R$ {plan.price}
                      </span>
                      <span className="text-lg">/mês</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-sm text-white/80">
                        R$ {plan.yearlyPrice} pagos anualmente
                      </p>
                    )}
                  </div>
                  
                  <div className="p-8">
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      onClick={() => handleSubscribe(plan.name)}
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                          : ''
                      }`}
                    >
                      {isAuthenticated ? 'Assinar Agora' : 'Começar Gratuitamente'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Recursos Incluídos em Todos os Planos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Segurança Garantida</h3>
              <p className="text-gray-600">
                Dados criptografados e backup automático
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Performance Rápida</h3>
              <p className="text-gray-600">
                Sistema otimizado para agilidade
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeadphonesIcon className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Suporte Especializado</h3>
              <p className="text-gray-600">
                Equipe pronta para ajudar quando precisar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para Transformar Seu Negócio?
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Junte-se a milhares de empresas que já usam nossa plataforma
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => router.push('/register')}
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              Começar Gratuitamente
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-gray-900"
              onClick={() => router.push('/login')}
            >
              Fazer Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
