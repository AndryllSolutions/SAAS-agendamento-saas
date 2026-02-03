'use client'

import { useEffect, useState } from 'react'
import api from '@/services/api'
import { AlertCircle, TrendingUp, X } from 'lucide-react'
import { Button } from './ui/Button'
import { useRouter } from 'next/navigation'

interface UsageData {
  professionals: {
    current: number
    limit: number | string
    percentage: number
    can_add: boolean
  }
  units: {
    current: number
    limit: number | string
    percentage: number
    can_add: boolean
  }
}

export function UsageLimits() {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadUsage()
  }, [])

  const loadUsage = async () => {
    try {
      const response = await api.get('/plans/subscription/usage')
      setUsage(response.data)
    } catch (error) {
      console.error('Erro ao carregar limites:', error)
    }
  }

  if (!usage || dismissed) return null

  const showWarning = 
    (typeof usage.professionals.limit === 'number' && usage.professionals.percentage >= 80) ||
    (typeof usage.units.limit === 'number' && usage.units.percentage >= 80)

  if (!showWarning) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 relative">
      {/* Close Button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-yellow-600 hover:text-yellow-800"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-yellow-800 mb-2">
            Você está próximo do limite do seu plano
          </h4>
          
          {typeof usage.professionals.limit === 'number' && usage.professionals.percentage >= 80 && (
            <p className="text-sm text-yellow-700 mb-1">
              <strong>Profissionais:</strong> {usage.professionals.current} de {usage.professionals.limit} 
              ({Math.round(usage.professionals.percentage)}%)
            </p>
          )}
          
          {typeof usage.units.limit === 'number' && usage.units.percentage >= 80 && (
            <p className="text-sm text-yellow-700 mb-1">
              <strong>Unidades:</strong> {usage.units.current} de {usage.units.limit}
              ({Math.round(usage.units.percentage)}%)
            </p>
          )}
          
          <Button
            size="sm"
            className="mt-3"
            onClick={() => router.push('/plans')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Fazer Upgrade
          </Button>
        </div>
      </div>
    </div>
  )
}

