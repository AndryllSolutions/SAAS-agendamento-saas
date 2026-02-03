'use client'

import { useState, useEffect } from 'react'
import { purchaseService, productService } from '@/services/api'
import { X, Plus, Trash2, ShoppingCart, DollarSign, Calendar, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface PurchaseFormProps {
  purchase?: any
  onClose: () => void
  onSuccess: () => void
}

interface PurchaseItem {
  id?: number
  product_id: number | null
  quantity: number
  unit_cost: number
  total_cost: number
  name?: string // For display
}

export default function PurchaseForm({ purchase, onClose, onSuccess }: PurchaseFormProps) {
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    supplier_id: purchase?.supplier_id?.toString() || '',
    purchase_date: purchase?.purchase_date 
      ? new Date(purchase.purchase_date).toISOString().slice(0, 16) 
      : new Date().toISOString().slice(0, 16),
    payment_method: purchase?.payment_method || 'cash',
    notes: purchase?.notes || '',
  })

  const [items, setItems] = useState<PurchaseItem[]>(
    purchase?.items?.map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_cost: parseFloat(item.unit_cost),
      total_cost: parseFloat(item.total_cost),
      name: item.product?.name,
    })) || []
  )

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [suppliersRes, productsRes] = await Promise.all([
        purchaseService.listSuppliers(),
        productService.list(),
      ])
      setSuppliers(suppliersRes.data || [])
      setProducts(productsRes.data || [])
    } catch (error) {
      toast.error('Erro ao carregar dados')
    }
  }

  const addItem = () => {
    const newItem: PurchaseItem = {
      product_id: null,
      quantity: 1,
      unit_cost: 0,
      total_cost: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    }

    // Auto-fill name when product is selected
    if (field === 'product_id' && value) {
      const product = products.find((p: any) => p.id === parseInt(value))
      if (product) {
        updatedItems[index].name = product.name
        // Optionally set unit_cost from product cost_price
        if (product.cost_price && !updatedItems[index].unit_cost) {
          updatedItems[index].unit_cost = parseFloat(product.cost_price)
        }
      }
    }

    // Calculate total_cost when quantity or unit_cost changes
    if (field === 'quantity' || field === 'unit_cost') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity
      const unitCost = field === 'unit_cost' ? parseFloat(value) || 0 : updatedItems[index].unit_cost
      updatedItems[index].total_cost = quantity * unitCost
    }

    setItems(updatedItems)
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.total_cost || 0)
    }, 0)
    
    return {
      subtotal,
      total: subtotal,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.supplier_id) {
      toast.error('Selecione um fornecedor')
      return
    }

    if (items.length === 0) {
      toast.error('Adicione pelo menos um item à compra')
      return
    }

    // Validate items
    for (const item of items) {
      if (!item.product_id) {
        toast.error('Selecione o produto para todos os itens')
        return
      }
      if (item.quantity <= 0) {
        toast.error('Quantidade deve ser maior que zero')
        return
      }
      if (item.unit_cost <= 0) {
        toast.error('Custo unitário deve ser maior que zero')
        return
      }
    }

    setLoading(true)
    try {
      const submitData = {
        supplier_id: parseInt(formData.supplier_id),
        purchase_date: new Date(formData.purchase_date).toISOString(),
        payment_method: formData.payment_method,
        notes: formData.notes,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          total_cost: item.total_cost,
        })),
      }

      if (purchase) {
        await purchaseService.update(purchase.id, submitData)
        toast.success('Compra atualizada!')
      } else {
        const { apiPost } = await import('@/utils/apiClient')
        
        const response = await apiPost('purchases', submitData)

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.detail || 'Erro ao criar compra')
        }

        toast.success('Compra criada!')
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || error.response?.data?.detail || 'Erro ao salvar compra')
    } finally {
      setLoading(false)
    }
  }

  const totals = calculateTotals()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            {purchase ? 'Editar Compra' : 'Nova Compra'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Fornecedor <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
                disabled={purchase?.status === 'completed'}
              >
                <option value="">Selecione um fornecedor</option>
                {suppliers.map((supplier: any) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Data da Compra <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
                disabled={purchase?.status === 'completed'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Forma de Pagamento</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                disabled={purchase?.status === 'completed'}
              >
                <option value="cash">Dinheiro</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="pix">Pix</option>
                <option value="bank_transfer">Transferência</option>
                <option value="check">Cheque</option>
              </select>
            </div>
          </div>

          {/* Items */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Itens da Compra
              </h3>
              {purchase?.status !== 'completed' && (
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Item
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhum item adicionado. Clique no botão acima para adicionar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-12 gap-3 items-start">
                      {/* Product Selection */}
                      <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-medium mb-1">Produto <span className="text-red-500">*</span></label>
                        <select
                          value={item.product_id || ''}
                          onChange={(e) => updateItem(index, 'product_id', e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full px-2 py-1.5 text-sm border rounded"
                          required
                          disabled={purchase?.status === 'completed'}
                        >
                          <option value="">Selecione</option>
                          {products.map((p: any) => (
                            <option key={p.id} value={p.id}>
                              {p.name} - Estoque: {p.stock_current || 0}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-6 md:col-span-2">
                        <label className="block text-xs font-medium mb-1">Quantidade <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1.5 text-sm border rounded"
                          disabled={purchase?.status === 'completed'}
                        />
                      </div>

                      {/* Unit Cost */}
                      <div className="col-span-6 md:col-span-2">
                        <label className="block text-xs font-medium mb-1">Custo Unit. <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={item.unit_cost}
                          onChange={(e) => updateItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-sm border rounded"
                          disabled={purchase?.status === 'completed'}
                        />
                      </div>

                      {/* Total */}
                      <div className="col-span-6 md:col-span-2">
                        <label className="block text-xs font-medium mb-1">Total</label>
                        <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">
                          R$ {item.total_cost.toFixed(2)}
                        </div>
                      </div>

                      {/* Remove */}
                      {purchase?.status !== 'completed' && (
                        <div className="col-span-6 md:col-span-2 flex items-end">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="w-full px-2 py-1.5 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="border-t pt-6">
            <div className="flex justify-end">
              <div className="w-full md:w-80 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-semibold">R$ {totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">R$ {totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={3}
              placeholder="Observações sobre a compra..."
              disabled={purchase?.status === 'completed'}
            />
          </div>

          {/* Actions */}
          {purchase?.status !== 'completed' && (
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Salvando...' : purchase ? 'Atualizar Compra' : 'Criar Compra'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

