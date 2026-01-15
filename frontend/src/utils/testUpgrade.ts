/**
 * Utilitário para testar upgrade de plano
 */
import { subscriptionService } from '@/services/api'
import { toast } from 'sonner'

export async function testUpgradePlan() {
  try {
    console.log('🧪 Testando upgrade de plano...')
    
    // 1. Verificar plano atual
    const current = await subscriptionService.getCurrentSubscription()
    console.log('📋 Plano atual:', current.data.plan)
    
    // 2. Listar planos disponíveis
    const plans = await subscriptionService.listPlans()
    console.log('📦 Planos disponíveis:', plans.data)
    
    // 3. Tentar upgrade para PRO
    const result = await subscriptionService.upgradePlan({
      new_plan_slug: 'pro',
      immediate: true
    })
    
    console.log('✅ Upgrade realizado:', result.data)
    toast.success('Teste de upgrade realizado com sucesso!')
    
    return result.data
  } catch (error: any) {
    console.error('❌ Erro no teste:', error)
    const errorMessage = error.response?.data?.detail || error.message
    toast.error(`Erro no teste: ${errorMessage}`)
    throw error
  }
}

/**
 * Verificar se features estão disponíveis após upgrade
 */
export async function testFeatureAccess() {
  try {
    console.log('🔍 Testando acesso a features...')
    
    // Features que devem estar disponíveis no plano PRO
    const proFeatures = [
      'financial_complete',
      'reports_complete', 
      'packages',
      'commissions',
      'goals',
      'anamneses',
      'purchases',
      'evaluations',
      'whatsapp_marketing'
    ]
    
    const results = []
    
    for (const feature of proFeatures) {
      const check = await subscriptionService.checkFeatureAccess(feature)
      results.push({
        feature,
        has_access: check.data.has_access,
        required_plan: check.data.required_plan
      })
    }
    
    console.log('🔍 Resultados das features:', results)
    
    const accessible = results.filter(r => r.has_access)
    const blocked = results.filter(r => !r.has_access)
    
    console.log(`✅ Features acessíveis: ${accessible.length}/${results.length}`)
    console.log(`❌ Features bloqueadas: ${blocked.length}/${results.length}`)
    
    if (blocked.length > 0) {
      console.log('🚫 Features bloqueadas:', blocked)
      toast.warning(`${blocked.length} features ainda não disponíveis`)
    } else {
      toast.success('Todas as features PRO estão disponíveis!')
    }
    
    return results
  } catch (error: any) {
    console.error('❌ Erro ao verificar features:', error)
    toast.error('Erro ao verificar acesso às features')
    throw error
  }
}

/**
 * Função completa para teste de upgrade
 */
export async function runUpgradeTest() {
  try {
    // Testar upgrade
    await testUpgradePlan()
    
    // Aguardar um pouco para o backend processar
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Testar acesso às features
    await testFeatureAccess()
    
    toast.success('Teste completo finalizado!')
  } catch (error) {
    console.error('❌ Erro no teste completo:', error)
    toast.error('Teste falhou')
  }
}
