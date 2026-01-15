'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/services/api'

interface FeatureAccessResult {
  feature: string
  has_access: boolean
  required_plan: string | null
  message: string | null
}

interface SubscriptionUsage {
  plan_name: string
  plan_slug: string
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

// Cache de features para evitar múltiplas requisições
const featureCache: Map<string, { data: FeatureAccessResult; timestamp: number }> = new Map()
const CACHE_TTL = 60000 // 1 minuto

export function useFeatureAccess() {
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null)
  const [loading, setLoading] = useState(true)

  // Carregar dados do plano atual
  useEffect(() => {
    loadSubscriptionData()
  }, [])

  const loadSubscriptionData = async () => {
    try {
      const response = await api.get('/plans/subscription/usage')
      setCurrentPlan(response.data.plan_slug)
      setUsage(response.data)
    } catch (error) {
      console.error('Erro ao carregar dados de assinatura:', error)
    } finally {
      setLoading(false)
    }
  }

  // Verificar acesso a uma feature específica
  const checkFeatureAccess = useCallback(async (feature: string): Promise<FeatureAccessResult> => {
    // Verificar cache
    const cached = featureCache.get(feature)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }

    try {
      const response = await api.get(`/plans/subscription/check-feature/${feature}`)
      const result: FeatureAccessResult = response.data
      
      // Salvar no cache
      featureCache.set(feature, { data: result, timestamp: Date.now() })
      
      return result
    } catch (error) {
      console.error(`Erro ao verificar feature ${feature}:`, error)
      return {
        feature,
        has_access: false,
        required_plan: null,
        message: 'Erro ao verificar acesso'
      }
    }
  }, [])

  // Verificar se pode adicionar profissional
  const canAddProfessional = useCallback(async (): Promise<boolean> => {
    try {
      const response = await api.get('/plans/subscription/can-add-professional')
      return response.data.can_add
    } catch (error) {
      console.error('Erro ao verificar limite de profissionais:', error)
      return false
    }
  }, [])

  // Mapeamento de features para planos (para verificação local rápida)
  // IMPORTANTE: Manter sincronizado com backend/app/services/plan_service.py
  const featurePlanMap: Record<string, string[]> = {
    // ESSENCIAL - Funcionalidades básicas
    clients: ['essencial', 'pro', 'premium', 'scale'],
    services: ['essencial', 'pro', 'premium', 'scale'],
    appointments: ['essencial', 'pro', 'premium', 'scale'],
    products: ['essencial', 'pro', 'premium', 'scale'],
    commands: ['essencial', 'pro', 'premium', 'scale'],
    financial_basic: ['essencial', 'pro', 'premium', 'scale'],
    reports_basic: ['essencial', 'pro', 'premium', 'scale'],
    
    // PRO - Gestão completa
    financial_complete: ['pro', 'premium', 'scale'],
    reports_complete: ['pro', 'premium', 'scale'],
    packages: ['pro', 'premium', 'scale'],
    commissions: ['pro', 'premium', 'scale'],
    goals: ['pro', 'premium', 'scale'],
    anamneses: ['pro', 'premium', 'scale'],
    purchases: ['pro', 'premium', 'scale'],
    evaluations: ['pro', 'premium', 'scale'],
    whatsapp_marketing: ['pro', 'premium', 'scale'],  // Confirmações e lembretes
    
    // PREMIUM - Crescimento
    cashback: ['premium', 'scale'],
    promotions: ['premium', 'scale'],
    subscription_sales: ['premium', 'scale'],
    document_generator: ['premium', 'scale'],
    invoices: ['premium', 'scale'],
    online_booking: ['premium', 'scale'],
    pricing_intelligence: ['premium', 'scale'],
    advanced_reports: ['premium', 'scale'],
    professional_ranking: ['premium', 'scale'],
    client_funnel: ['premium', 'scale'],
    
    // SCALE - Enterprise
    crm_advanced: ['scale'],
    automatic_campaigns: ['scale'],  // Campanhas automáticas WhatsApp
    multi_unit_reports: ['scale'],
    priority_support: ['scale'],
    programa_crescer: ['scale'],
  }

  // Verificação local rápida (sem API)
  const hasFeatureLocal = useCallback((feature: string): boolean => {
    if (!currentPlan) return false
    const allowedPlans = featurePlanMap[feature]
    if (!allowedPlans) return true // Feature desconhecida = liberada
    return allowedPlans.includes(currentPlan)
  }, [currentPlan])

  // Obter plano mínimo necessário para uma feature
  const getRequiredPlan = useCallback((feature: string): string => {
    const planOrder = ['essencial', 'pro', 'premium', 'scale']
    const allowedPlans = featurePlanMap[feature]
    if (!allowedPlans) return 'essencial'
    return allowedPlans[0] // Primeiro plano da lista é o mínimo
  }, [])

  // Limpar cache
  const clearCache = useCallback(() => {
    featureCache.clear()
  }, [])

  // Forçar atualização completa após upgrade
  const forceRefresh = useCallback(() => {
    clearCache()
    loadSubscriptionData()
  }, [clearCache, loadSubscriptionData])

  return {
    currentPlan,
    usage,
    loading,
    checkFeatureAccess,
    canAddProfessional,
    hasFeatureLocal,
    getRequiredPlan,
    clearCache,
    forceRefresh,
    refreshData: loadSubscriptionData
  }
}

// Hook simplificado para verificar uma única feature
export function useFeature(feature: string) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [requiredPlan, setRequiredPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await api.get(`/plans/subscription/check-feature/${feature}`)
        setHasAccess(response.data.has_access)
        setRequiredPlan(response.data.required_plan)
      } catch (error) {
        console.error(`Erro ao verificar feature ${feature}:`, error)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [feature])

  return { hasAccess, requiredPlan, loading }
}
