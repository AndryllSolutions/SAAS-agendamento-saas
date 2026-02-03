'use client'

import { useState, useEffect } from 'react'
import { clientService } from '@/services/api'
import { Plus, Pause, Play, X, Eye, RefreshCw, Calendar, DollarSign, Users } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import { FeatureWrapper } from '@/components/FeatureWrapper'
import { PaywallModal } from '@/components/PaywallModal'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

export default function SubscriptionSalesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'models'>('subscriptions')
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [modelFilter, setModelFilter] = useState<string>('')
  const [showPaywall, setShowPaywall] = useState(false)
  const [hasFeature] = useState(false)

  const loadData = async () => {
    // CRITICAL: Endpoint /subscription-sales não existe - desabilitado para evitar loop
    console.warn('⚠️ Subscription sales desabilitado - endpoint não existe no backend')
    setLoading(false)
    setError('Funcionalidade de assinaturas ainda não implementada no backend')
    return
  }

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const handlePause = async (id: number) => {
    toast.error('Funcionalidade não disponível - endpoint não implementado')
    return
  }

  const handleResume = async (id: number) => {
    toast.error('Funcionalidade não disponível - endpoint não implementado')
    return
  }

  const handleCancel = async (id: number) => {
    toast.error('Funcionalidade não disponível - endpoint não implementado')
    return
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      active: { label: 'Ativa', className: 'bg-green-100 text-green-800' },
      paused: { label: 'Pausada', className: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
      pending: { label: 'Pendente', className: 'bg-blue-100 text-blue-800' }
    }
    const badge = badges[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
        {badge.label}
      </span>
    )
  }

  const filteredSubscriptions = subscriptions.filter((s) => {
    if (modelFilter) {
      return s.model_id?.toString() === modelFilter
    }
    return true
  })

  const activeCount = subscriptions.filter(s => s.status === 'active').length
  const pausedCount = subscriptions.filter(s => s.status === 'paused').length
  const cancelledCount = subscriptions.filter(s => s.status === 'cancelled').length
  
  const mrr = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => {
      const model = models.find(m => m.id === s.model_id)
      return sum + (model?.monthly_value || 0)
    }, 0)

  if (loading && subscriptions.length === 0) {
    return (
      <DashboardLayout>
        <LoadingState message="Carregando assinaturas..." />
      </DashboardLayout>
    )
  }

  const handleAction = () => {
    if (!hasFeature) {
      setShowPaywall(true)
    }
  }

  const handleContract = () => {
    router.push('/plans')
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <FeatureWrapper feature="subscription_sales" asCard={true}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendas por Assinatura</h1>
            <p className="text-gray-600 mt-1">Gerencie vendas recorrentes por assinatura</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleAction}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              + Novo
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'subscriptions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assinaturas
            </button>
            <button
              onClick={() => setActiveTab('models')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'models'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Modelos de assinatura
            </button>
          </nav>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Assinaturas Ativas</span>
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{activeCount}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Pausadas</span>
              <Pause className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{pausedCount}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Canceladas</span>
              <X className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{cancelledCount}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">MRR Aproximado</span>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(mrr)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todos os status</option>
                <option value="active">Ativa</option>
                <option value="paused">Pausada</option>
                <option value="cancelled">Cancelada</option>
                <option value="pending">Pendente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plano/Pacote</label>
              <select
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todos os planos</option>
                {models.map(model => (
                  <option key={model.id} value={model.id.toString()}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && subscriptions.length === 0 && (
          <ErrorState
            title="Erro ao carregar assinaturas"
            message={error}
            onRetry={loadData}
          />
        )}

        {!loading && !error && filteredSubscriptions.length === 0 && (
          <EmptyState
            title="Nenhuma assinatura encontrada"
            message={statusFilter || modelFilter
              ? "Não há assinaturas para os filtros selecionados."
              : "Ainda não há assinaturas cadastradas."}
          />
        )}

        {!error && filteredSubscriptions.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periodicidade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Próxima Cobrança</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubscriptions.map((subscription) => {
                    const client = clients.find(c => c.id === subscription.client_id)
                    const model = models.find(m => m.id === subscription.model_id)
                    
                    return (
                      <tr key={subscription.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {client?.full_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {model?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(model?.monthly_value || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Mensal
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(subscription.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscription.next_payment_date 
                            ? format(new Date(subscription.next_payment_date), 'dd/MM/yyyy', { locale: ptBR })
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                toast.info('Histórico de cobranças em desenvolvimento')
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="Ver histórico"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {subscription.status === 'active' && (
                              <button
                                onClick={() => handlePause(subscription.id)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                                title="Pausar"
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                            )}
                            {subscription.status === 'paused' && (
                              <button
                                onClick={() => handleResume(subscription.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded"
                                title="Reativar"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            {subscription.status !== 'cancelled' && (
                              <button
                                onClick={() => handleCancel(subscription.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="Cancelar"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'models' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Modelos de Assinatura</h3>
            <p className="text-gray-600 mb-6">
              Crie modelos de assinatura para facilitar a venda recorrente
            </p>
            <button
              onClick={handleAction}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              + Novo Modelo
            </button>
          </div>
        )}
        </FeatureWrapper>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onContract={handleContract}
      />
    </DashboardLayout>
  )
}
