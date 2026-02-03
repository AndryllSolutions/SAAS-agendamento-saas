'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Home } from 'lucide-react'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const companySlug = searchParams.get('company') || ''

  const handleGoHome = () => {
    if (companySlug) {
      window.location.href = `https://${companySlug}.atendo.app`
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-4">Agendamento Confirmado! 🎉</h1>

          {/* Message */}
          <p className="text-gray-300 mb-6">
            Seu agendamento foi realizado com sucesso. Você receberá uma confirmação por email e WhatsApp com todos os detalhes.
          </p>

          {/* Info Box */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-300">
              <strong>Importante:</strong> Chegue com 10 minutos de antecedência. Em caso de cancelamento, avise com pelo menos 24h de antecedência.
            </p>
          </div>

          {/* Button */}
          <button
            onClick={handleGoHome}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SuccessContent />
    </Suspense>
  )
}

