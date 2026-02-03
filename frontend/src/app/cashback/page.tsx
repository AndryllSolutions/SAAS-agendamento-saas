'use client'

import { useState, useEffect } from 'react'
import { cashbackService } from '@/services/api'
import { Plus, Edit, Trash2, Gift } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import UpsellModal from '@/components/UpsellModal'

export default function CashbackPage() {
  const hasAccess = useFeatureFlag('cashback')
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedRule, setSelectedRule] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    percentage: 0,
    min_purchase: 0,
    max_cashback: 0,
    is_active: true,
  })

  useEffect(() => {
    if (hasAccess) {
      loadRules()
    }
  }, [hasAccess])

  const loadRules = async () => {
    try {
      const response = await cashbackService.listRules()
      setRules(response.data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar regras de cashback')
    } finally {
      setLoading(false)
    }
  }

  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <UpsellModal
            feature="cashback"
            featureName="Cashback"
            description="Sistema de cashback para recompensar clientes fiéis"
            onClose={() => window.history.back()}
          />
        </div>
      </DashboardLayout>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedRule) {
        await cashbackService.updateRule(selectedRule.id, formData)
        toast.success('Regra atualizada!')
      } else {
        await cashbackService.createRule(formData)
        toast.success('Regra criada!')
      }
      setShowModal(false)
      setSelectedRule(null)
      loadRules()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar regra')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return
    try {
      await cashbackService.deleteRule(id)
      toast.success('Regra excluída!')
      loadRules()
    } catch (error: any) {
      toast.error('Erro ao excluir regra')
    }
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nome' },
    { key: 'percentage', label: 'Percentual', render: (r: any) => `${r.percentage}%` },
    { key: 'min_purchase', label: 'Compra Mínima', render: (r: any) => `R$ ${r.min_purchase?.toFixed(2)}` },
    { key: 'max_cashback', label: 'Cashback Máximo', render: (r: any) => `R$ ${r.max_cashback?.toFixed(2)}` },
    { 
      key: 'is_active', 
      label: 'Status',
      render: (r: any) => (
        <span className={r.is_active ? 'text-green-600' : 'text-gray-600'}>
          {r.is_active ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cashback</h1>
            <p className="text-gray-600 mt-1">Gerencie regras de cashback para clientes</p>
          </div>
          <button
            onClick={() => {
              setSelectedRule(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" />
            Nova Regra
          </button>
        </div>

        <DataTable
          data={rules}
          columns={columns}
          loading={loading}
          actions={(r) => (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedRule(r)
                  setFormData({
                    name: r.name,
                    percentage: r.percentage,
                    min_purchase: r.min_purchase,
                    max_cashback: r.max_cashback,
                    is_active: r.is_active,
                  })
                  setShowModal(true)
                }}
                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {selectedRule ? 'Editar Regra' : 'Nova Regra de Cashback'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Percentual (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Compra Mínima</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.min_purchase}
                    onChange={(e) => setFormData({ ...formData, min_purchase: parseFloat(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cashback Máximo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.max_cashback}
                    onChange={(e) => setFormData({ ...formData, max_cashback: parseFloat(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <span>Ativo</span>
                  </label>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setSelectedRule(null)
                    }}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

