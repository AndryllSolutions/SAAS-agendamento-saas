'use client'

import { useState, useEffect } from 'react'
import { financialService } from '@/services/api'
import { Plus, Edit, Trash2, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'
import { useAuthStore } from '@/store/authStore'

export default function PaymentFormsPage() {
  const [paymentForms, setPaymentForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedForm, setSelectedForm] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash', // cash, card, pix, boleto etc.
    integrates_with_gateway: false,
    gateway_name: '',
  })
  const { user } = useAuthStore()

  useEffect(() => {
    loadPaymentForms()
  }, [])

  const loadPaymentForms = async () => {
    try {
      const response = await financialService.listPaymentForms()
      setPaymentForms(response.data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar formas de pagamento')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.company_id) {
      toast.error('Empresa não identificada para salvar forma de pagamento')
      return
    }

    const payload = {
      ...formData,
      gateway_name: formData.integrates_with_gateway ? formData.gateway_name || null : null,
      company_id: user.company_id,
    }

    try {
      if (selectedForm) {
        await financialService.updatePaymentForm(selectedForm.id, payload)
        toast.success('Forma de pagamento atualizada!')
      } else {
        await financialService.createPaymentForm(payload)
        toast.success('Forma de pagamento criada!')
      }
      setShowModal(false)
      setSelectedForm(null)
      loadPaymentForms()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar forma de pagamento')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta forma de pagamento?')) return
    try {
      await financialService.deletePaymentForm(id)
      toast.success('Forma de pagamento excluída!')
      loadPaymentForms()
    } catch (error: any) {
      toast.error('Erro ao excluir forma de pagamento')
    }
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nome' },
    { key: 'type', label: 'Tipo' },
    {
      key: 'integrates_with_gateway',
      label: 'Integração',
      render: (f: any) =>
        f.integrates_with_gateway ? (
          <span className="text-green-600">Integrado ({f.gateway_name || 'gateway'})</span>
        ) : (
          <span className="text-gray-500">Padrão</span>
        ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Formas de Pagamento</h1>
            <p className="text-gray-600 mt-1">Gerencie formas de pagamento aceitas</p>
          </div>
          <button
            onClick={() => {
              setSelectedForm(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" />
            Nova Forma
          </button>
        </div>

        <DataTable
          data={paymentForms}
          columns={columns}
          loading={loading}
          actions={(f) => (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedForm(f)
                  setFormData({
                    name: f.name,
                    type: f.type,
                    integrates_with_gateway: f.integrates_with_gateway ?? false,
                    gateway_name: f.gateway_name || '',
                  })
                  setShowModal(true)
                }}
                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(f.id)}
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
                {selectedForm ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
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
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="cash">Dinheiro</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="debit_card">Cartão de Débito</option>
                    <option value="pix">PIX</option>
                    <option value="bank_transfer">Transferência</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.integrates_with_gateway}
                      onChange={(e) =>
                        setFormData({ ...formData, integrates_with_gateway: e.target.checked })
                      }
                    />
                    <span>Integra com gateway (ex: MercadoPago, Stripe)</span>
                  </label>
                  {formData.integrates_with_gateway && (
                    <input
                      type="text"
                      placeholder="Nome do gateway (opcional)"
                      value={formData.gateway_name}
                      onChange={(e) =>
                        setFormData({ ...formData, gateway_name: e.target.value })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setSelectedForm(null)
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

