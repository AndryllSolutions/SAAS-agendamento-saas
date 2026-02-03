'use client'

import { useState, useEffect } from 'react'
import { promotionService } from '@/services/api'
import { Plus, Edit, Trash2, Gift, Search } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { PaywallModal } from '@/components/PaywallModal'
import { useRouter } from 'next/navigation'

export default function PromotionsPage() {
  const router = useRouter()
  const hasAccess = useFeatureFlag('promotions')
  const [promotions, setPromotions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => {
    if (hasAccess) {
      loadPromotions()
    }
  }, [hasAccess])

  const loadPromotions = async () => {
    try {
      const response = await promotionService.list()
      setPromotions(response.data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar promoções')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = () => {
    if (!hasAccess) {
      setShowPaywall(true)
    } else {
      toast.info('Funcionalidade em desenvolvimento')
    }
  }

  const handleContract = () => {
    router.push('/plans')
  }

  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch = searchTerm === '' || 
      promo.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === '' || 
      (statusFilter === 'active' && promo.is_active) ||
      (statusFilter === 'inactive' && !promo.is_active)
    return matchesSearch && matchesStatus
  })

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nome' },
    { key: 'discount_percentage', label: 'Desconto', render: (p: any) => `${p.discount_percentage}%` },
    { key: 'start_date', label: 'Início', render: (p: any) => new Date(p.start_date).toLocaleDateString('pt-BR') },
    { key: 'end_date', label: 'Fim', render: (p: any) => new Date(p.end_date).toLocaleDateString('pt-BR') },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Promoções</h1>
            <p className="text-gray-600 mt-1">Gerencie promoções e descontos</p>
          </div>
          <button
            onClick={handleAction}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            + Novo
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="active">Ativa</option>
              <option value="inactive">Inativa</option>
            </select>
          </div>
        </div>

        <DataTable
          data={filteredPromotions}
          columns={columns}
          loading={loading}
        />
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onContract={handleContract}
      />
    </DashboardLayout>
  )
}

