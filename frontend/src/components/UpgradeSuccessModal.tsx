'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UpgradeSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  planName: string
  features: string[]
}

export function UpgradeSuccessModal({ isOpen, onClose, planName, features }: UpgradeSuccessModalProps) {
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header com gradiente verde */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            ×
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Upgrade Realizado!</h2>
              <p className="text-white/80 text-sm">Seu plano foi atualizado</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg px-4 py-2 mt-4">
            <p className="text-sm font-semibold">
              Agora você está no plano <span className="text-yellow-300">{planName}</span>
            </p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Parabéns! 🎉
            </h3>
            <p className="text-gray-600 text-sm">
              Você agora tem acesso a novas funcionalidades
            </p>
          </div>

          {/* Novas features */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Novas funcionalidades desbloqueadas:</h4>
            <div className="space-y-2">
              {features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
              {features.length > 3 && (
                <div className="text-sm text-gray-500 italic">
                  +{features.length - 3} outras funcionalidades...
                </div>
              )}
            </div>
          </div>

          {/* Countdown */}
          <div className="text-center text-sm text-gray-500 mb-4">
            Esta janela fechará automaticamente em {countdown} segundos
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              onClose()
              // Redirecionar para dashboard ou página relevante
              router.push('/dashboard')
            }}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Começar a Usar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
