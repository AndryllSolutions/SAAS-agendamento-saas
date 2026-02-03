'use client'

import { useState, useEffect } from 'react'
import { 
  Loader2, 
  Plus, 
  Edit2, 
  Trash2,
  GraduationCap,
  DollarSign,
  Calendar,
  Users,
  TrendingUp
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
  service_type: string
  duration_days: number | null
  included_in_plans: string[]
  is_active: boolean
  created_at: string
}

interface ServiceStats {
  total_services: number
  active_programs: number
  total_revenue: number
  avg_completion_rate: number
}

export default function SaasAdminServicesPage() {
  const [services, setServices] = useState<StandaloneService[]>([])
  const [stats, setStats] = useState<ServiceStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/standalone-services/')
      setServices(response.data.services)
      
      // Calculate real stats from response data
      setStats({
        total_services: response.data.total,
        active_programs: response.data.services.filter((s: any) => s.is_active).length,
        total_revenue: response.data.total_revenue || 0,
        avg_completion_rate: response.data.avg_completion_rate || 0
      })
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar serviços')
    } finally {
      setLoading(false)
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
            Serviços Avulsos & Consultorias
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie consultorias e programas de acompanhamento
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Serviços</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total_services}
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
                <p className="text-sm text-gray-500">Programas Ativos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.active_programs}
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
                <p className="text-sm text-gray-500">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {stats.total_revenue.toLocaleString('pt-BR')}
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
                <p className="text-sm text-gray-500">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.avg_completion_rate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div 
            key={service.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    service.service_type === 'consulting' 
                      ? 'bg-blue-100 dark:bg-blue-900/30' 
                      : 'bg-purple-100 dark:bg-purple-900/30'
                  }`}>
                    <GraduationCap className={`w-5 h-5 ${
                      service.service_type === 'consulting' 
                        ? 'text-blue-600' 
                        : 'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      service.service_type === 'consulting'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {service.service_type === 'consulting' ? 'Consultoria' : 'Programa'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {service.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                {service.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ {service.price.toLocaleString('pt-BR')}
                  </span>
                  {service.duration_days && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4" />
                      {service.duration_days} dias
                    </div>
                  )}
                </div>
                {service.included_in_plans?.length > 0 && (
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Incluso em:</span>
                    <div className="flex gap-1 mt-1">
                      {service.included_in_plans.map((plan) => (
                        <span 
                          key={plan}
                          className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 capitalize"
                        >
                          {plan}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Bar */}
            <div className={`px-6 py-3 ${
              service.is_active 
                ? 'bg-green-50 dark:bg-green-900/10' 
                : 'bg-gray-50 dark:bg-gray-700/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  service.is_active 
                    ? 'text-green-700 dark:text-green-400' 
                    : 'text-gray-500'
                }`}>
                  {service.is_active ? '● Ativo' : '○ Inativo'}
                </span>
                <span className="text-xs text-gray-500">
                  ID: {service.id}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {services.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Nenhum serviço cadastrado
          </h3>
          <p className="text-gray-500 mt-2">
            Crie seu primeiro serviço de consultoria
          </p>
          <Button className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Criar Serviço
          </Button>
        </div>
      )}
    </div>
  )
}
