'use client'

import { useState, useEffect } from 'react'
import { 
  Loader2, 
  Plus, 
  Edit2, 
  Trash2,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  Users,
  TrendingUp,
  Package
} from 'lucide-react'
import api from '@/services/api'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

interface AddOn {
  id: number
  name: string
  slug: string
  description: string
  price_monthly: number
  category: string
  is_active: boolean
  is_visible: boolean
  included_in_plans: string[]
  created_at: string
}

interface AddOnStats {
  total_addons: number
  active_subscriptions: number
  monthly_revenue: number
  top_addon: string
}

export default function SaasAdminAddonsPage() {
  const [addons, setAddons] = useState<AddOn[]>([])
  const [stats, setStats] = useState<AddOnStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load add-ons list
      const addonsResponse = await api.get('/addons/')
      setAddons(addonsResponse.data)
      
      // Load stats from backend
      const statsResponse = await api.get('/saas-admin/addons/stats')
      setStats(statsResponse.data)
      
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar add-ons')
    } finally {
      setLoading(false)
    }
  }

  const toggleAddonStatus = async (addon: AddOn) => {
    try {
      if (addon.is_active) {
        // Deactivate addon
        await api.post(`/addons/deactivate/${addon.slug}`)
        toast.success(`Add-on ${addon.name} desativado`)
      } else {
        // Activate addon - you need to implement this endpoint or adjust logic
        toast.info('Funcionalidade de ativação em desenvolvimento')
        return
      }
      
      loadData()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao alterar status do add-on')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestão de Add-ons
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie os add-ons disponíveis para os clientes
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Add-on
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Add-ons</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total_addons}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Assinaturas Ativas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.active_subscriptions}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Receita Mensal (Add-ons)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {stats.monthly_revenue.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Mais Vendido</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {stats.top_addon}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add-ons Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Add-on
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Incluso em
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {addons.map((addon) => (
                <tr key={addon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {addon.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {addon.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {addon.category || 'Geral'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      R$ {addon.price_monthly}/mês
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {addon.included_in_plans?.length > 0 ? (
                        addon.included_in_plans.map((plan) => (
                          <span 
                            key={plan}
                            className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 capitalize"
                          >
                            {plan}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">Nenhum</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleAddonStatus(addon)}
                      className="flex items-center gap-2"
                    >
                      {addon.is_active ? (
                        <>
                          <ToggleRight className="w-6 h-6 text-green-500" />
                          <span className="text-sm text-green-600">Ativo</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                          <span className="text-sm text-gray-500">Inativo</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
