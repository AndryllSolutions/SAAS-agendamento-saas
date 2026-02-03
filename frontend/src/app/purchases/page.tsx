'use client'

import { useState, useEffect } from 'react'
import { purchaseService } from '@/services/api'
import { Plus, Edit, Trash2, ShoppingCart, CheckCircle, Eye, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'
import PurchaseForm from '@/components/PurchaseForm'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null)

  useEffect(() => {
    loadPurchases()
  }, [])

  const loadPurchases = async () => {
    try {
      const response = await purchaseService.list()
      setPurchases(response.data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar compras')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (purchase: any) => {
    setSelectedPurchase(purchase)
    setShowModal(true)
  }

  const handleFinish = async (id: number) => {
    if (!confirm('Finalizar esta compra? Isso atualizará o estoque dos produtos.')) return
    try {
      await purchaseService.finish(id)
      toast.success('Compra finalizada!')
      loadPurchases()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao finalizar compra')
    }
  }

  const handleSuccess = () => {
    loadPurchases()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta compra?')) return
    try {
      await purchaseService.delete(id)
      toast.success('Compra excluída!')
      loadPurchases()
    } catch (error: any) {
      toast.error('Erro ao excluir compra')
    }
  }

  const columns = [
    {
      key: 'number',
      label: 'Número',
      sortable: true,
      render: (purchase: any) => (
        <div>
          <div className="font-medium">{purchase.number || `#${purchase.id}`}</div>
          {purchase.items && (
            <div className="text-xs text-gray-500">
              {purchase.items.length} item(s)
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'supplier',
      label: 'Fornecedor',
      render: (purchase: any) => purchase.supplier?.name || '-',
    },
    {
      key: 'purchase_date',
      label: 'Data',
      render: (purchase: any) =>
        purchase.purchase_date
          ? format(new Date(purchase.purchase_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })
          : '-',
    },
    {
      key: 'total_amount',
      label: 'Valor Total',
      render: (purchase: any) => (
        <div className="flex items-center gap-1 font-semibold text-primary">
          <DollarSign className="w-4 h-4" />
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            purchase.total_amount || 0
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (purchase: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            purchase.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : purchase.status === 'cancelled'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {purchase.status === 'completed'
            ? 'Finalizada'
            : purchase.status === 'cancelled'
            ? 'Cancelada'
            : 'Pendente'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (purchase: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(purchase)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title={purchase.status === 'completed' ? 'Visualizar' : 'Editar'}
          >
            {purchase.status === 'completed' ? (
              <Eye className="w-4 h-4" />
            ) : (
              <Edit className="w-4 h-4" />
            )}
          </button>
          {purchase.status !== 'completed' && (
            <>
              <button
                onClick={() => handleFinish(purchase.id)}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Finalizar"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(purchase.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Compras</h1>
            <p className="text-gray-600 mt-1">Gerencie compras de produtos e serviços</p>
          </div>
          <button
            onClick={() => {
              setSelectedPurchase(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" />
            Nova Compra
          </button>
        </div>

        <DataTable data={purchases} columns={columns} loading={loading} />

        {showModal && (
          <PurchaseForm
            purchase={selectedPurchase}
            onClose={() => {
              setShowModal(false)
              setSelectedPurchase(null)
            }}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

