'use client'

import { X, Sparkles, Check } from 'lucide-react'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import Link from 'next/link'

interface UpsellModalProps {
  feature: string
  featureName: string
  description: string
  onClose: () => void
}

export default function UpsellModal({ feature, featureName, description, onClose }: UpsellModalProps) {
  const { plan, requiredPlan } = useFeatureFlag(feature)

  const plans = [
    {
      name: 'BASIC',
      price: 'R$ 99',
      features: ['Clientes', 'Serviços', 'Produtos', 'Agendamentos', 'Comandas', 'Financeiro básico'],
    },
    {
      name: 'PRO',
      price: 'R$ 199',
      features: ['Tudo do BASIC', 'Pacotes', 'Comissões', 'Metas', 'Anamneses', 'Compras', 'WhatsApp Marketing'],
    },
    {
      name: 'PREMIUM',
      price: 'R$ 299',
      features: ['Tudo do PRO', 'Cashback', 'Promoções', 'Vendas por Assinatura', 'Gerador de Documentos', 'Notas Fiscais', 'Agendamento Online'],
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Funcionalidade Premium</h2>
              <p className="text-sm text-gray-600">Upgrade necessário</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{featureName}</h3>
            <p className="text-gray-600">{description}</p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Plano atual:</strong> {plan} → <strong>Plano necessário:</strong> {requiredPlan}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {plans.map((planOption) => (
              <div
                key={planOption.name}
                className={`border-2 rounded-lg p-4 ${
                  planOption.name === requiredPlan
                    ? 'border-primary bg-primary/5'
                    : planOption.name === plan
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{planOption.name}</h4>
                  <span className="text-lg font-bold text-primary">{planOption.price}</span>
                </div>
                <ul className="space-y-2 mt-4">
                  {planOption.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {planOption.name === requiredPlan && (
                  <div className="mt-4">
                    <Link
                      href="/company-settings?tab=billing"
                      className="block w-full text-center py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      Fazer Upgrade
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Fechar
            </button>
            <Link
              href="/company-settings?tab=billing"
              className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-center font-medium"
            >
              Ver Planos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

