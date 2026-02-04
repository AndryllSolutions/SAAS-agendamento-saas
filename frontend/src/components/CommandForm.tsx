'use client'

import { useState, useEffect } from 'react'
import { commandService, clientService, serviceService, productService, packageService, userService } from '@/services/api'
import { X, Plus, Trash2, ShoppingCart, DollarSign, User, Calendar, Percent, CreditCard, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface CommandFormProps {
  command?: any
  onClose: () => void
  onSuccess: () => void
}

interface CommandItem {
  id?: number
  item_type: 'service' | 'product' | 'package'
  service_id?: number | null
  product_id?: number | null
  package_id?: number | null
  professional_id?: number | null
  quantity: number
  unit_value: number
  commission_percentage: number
  name?: string // For display
}

interface PaymentMethod {
  method: string
  value: number
}

export default function CommandForm({ command, onClose, onSuccess }: CommandFormProps) {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [reloadKey, setReloadKey] = useState(0)
  
  const [formData, setFormData] = useState({
    client_id: command?.client_crm_id?.toString() || '',
    professional_id: command?.professional_id?.toString() || '',
    appointment_id: command?.appointment_id?.toString() || '',
    date: command?.date ? new Date(command.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    notes: command?.notes || '',
    discount_value: command?.discount_value?.toString() || '0',
  })

  const [items, setItems] = useState<CommandItem[]>(
    command?.items?.map((item: any) => ({
      id: item.id,
      item_type: item.item_type,
      service_id: item.service_id,
      product_id: item.product_id,
      package_id: item.package_id,
      professional_id: item.professional_id,
      quantity: item.quantity,
      unit_value: parseFloat(item.unit_value),
      commission_percentage: item.commission_percentage || 0,
      name: item.service?.name || item.product?.name || item.package?.name,
    })) || []
  )

  const [showFinishModal, setShowFinishModal] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { method: 'cash', value: 0 }
  ])
  const [generateInvoice, setGenerateInvoice] = useState(false)

  useEffect(() => {
    loadData()
  }, [reloadKey])

  const loadData = async () => {
    try {
      const [clientsRes, professionalsRes, servicesRes, productsRes, packagesRes] = await Promise.all([
        clientService.list(),
        userService.getProfessionals(),
        serviceService.list(),
        productService.list(),
        packageService.listPredefined(), // Use predefined packages
      ])
      setClients(clientsRes.data || [])
      setProfessionals(professionalsRes.data || [])
      setServices(servicesRes.data || [])
      setProducts(productsRes.data || [])
      setPackages(packagesRes.data || [])
    } catch (error) {
      toast.error('Erro ao carregar dados')
    }
  }

  const addItem = (type: 'service' | 'product' | 'package') => {
    const newItem: CommandItem = {
      item_type: type,
      service_id: type === 'service' ? null : undefined,
      product_id: type === 'product' ? null : undefined,
      package_id: type === 'package' ? null : undefined,
      professional_id: null,
      quantity: 1,
      unit_value: 0,
      commission_percentage: 0,
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

    // Auto-fill unit_value and name when item is selected
    if (field === 'service_id' && value) {
      const service = services.find((s: any) => s.id === parseInt(value))
      if (service) {
        updatedItems[index].unit_value = parseFloat(service.price)
        updatedItems[index].name = service.name
        updatedItems[index].commission_percentage = service.commission_percentage || 0
      }
    } else if (field === 'product_id' && value) {
      const product = products.find((p: any) => p.id === parseInt(value))
      if (product) {
        updatedItems[index].unit_value = parseFloat(product.sale_price)
        updatedItems[index].name = product.name
      }
    } else if (field === 'package_id' && value) {
      const pkg = packages.find((p: any) => p.id === parseInt(value))
      if (pkg) {
        updatedItems[index].unit_value = parseFloat(pkg.total_value || 0)
        updatedItems[index].name = pkg.name || 'Pacote'
      }
    }

    setItems(updatedItems)
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.unit_value * item.quantity)
    }, 0)
    
    const discount = parseFloat(formData.discount_value) || 0
    const total = subtotal - discount

    return {
      subtotal,
      discount,
      total: Math.max(0, total),
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.client_id) {
      toast.error('Selecione um cliente')
      return
    }

    if (items.length === 0) {
      toast.error('Adicione pelo menos um item à comanda')
      return
    }

    // Validate items
    for (const item of items) {
      if (item.item_type === 'service' && !item.service_id) {
        toast.error('Selecione o serviço para todos os itens do tipo serviço')
        return
      }
      if (item.item_type === 'product' && !item.product_id) {
        toast.error('Selecione o produto para todos os itens do tipo produto')
        return
      }
      if (item.item_type === 'package' && !item.package_id) {
        toast.error('Selecione o pacote para todos os itens do tipo pacote')
        return
      }
      if (item.quantity <= 0) {
        toast.error('Quantidade deve ser maior que zero')
        return
      }
      if (item.unit_value <= 0) {
        toast.error('Valor unitário deve ser maior que zero')
        return
      }
    }

    setLoading(true)
    try {
      const submitData = {
        client_crm_id: parseInt(formData.client_id),
        professional_id: formData.professional_id ? parseInt(formData.professional_id) : null,
        appointment_id: formData.appointment_id ? parseInt(formData.appointment_id) : null,
        date: new Date(formData.date).toISOString(),
        notes: formData.notes,
        items: items.map(item => ({
          item_type: item.item_type,
          service_id: item.service_id || null,
          product_id: item.product_id || null,
          package_id: item.package_id || null,
          professional_id: item.professional_id || null,
          quantity: item.quantity,
          unit_value: item.unit_value,
          commission_percentage: item.commission_percentage || 0,
        })),
      }

      if (command) {
        await commandService.update(command.id, {
          professional_id: submitData.professional_id,
          notes: submitData.notes,
          discount_value: parseFloat(formData.discount_value) || 0,
        })
        toast.success('Comanda atualizada!')
      } else {
        await commandService.create(submitData)
        toast.success('Comanda criada!')
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar comanda')
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = async () => {
    if (!command) {
      toast.error('Comanda não encontrada')
      return
    }

    const totalPayment = paymentMethods.reduce((sum, pm) => sum + pm.value, 0)
    const totals = calculateTotals()

    if (totalPayment < totals.total) {
      toast.error(`Valor pago (${totalPayment.toFixed(2)}) é menor que o total (${totals.total.toFixed(2)})`)
      return
    }

    setLoading(true)
    try {
      await commandService.finish(command.id)
      toast.success('Comanda finalizada!')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao finalizar comanda')
    } finally {
      setLoading(false)
    }
  }

  const addPaymentMethod = () => {
    setPaymentMethods([...paymentMethods, { method: 'cash', value: 0 }])
  }

  const removePaymentMethod = (index: number) => {
    setPaymentMethods(paymentMethods.filter((_, i) => i !== index))
  }

  const updatePaymentMethod = (index: number, field: string, value: any) => {
    const updated = [...paymentMethods]
    updated[index] = { ...updated[index], [field]: value }
    setPaymentMethods(updated)
  }

  const totals = calculateTotals()
  const totalPayment = paymentMethods.reduce((sum, pm) => sum + pm.value, 0)
  const change = totalPayment - totals.total

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {command ? 'Editar Comanda' : 'Nova Comanda'}
            </h2>
            <div className="flex items-center gap-2">
              {command && command.status !== 'FINISHED' && (
                <button
                  onClick={() => setShowFinishModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Finalizar
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">
                    Cliente <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setReloadKey(prev => prev + 1)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    title="Recarregar dados"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Atualizar
                  </button>
                </div>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                  disabled={!!command}
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((client: any) => (
                    <option key={client.id} value={client.id}>
                      {client.full_name} - {client.email || client.cellphone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Profissional</label>
                <select
                  value={formData.professional_id}
                  onChange={(e) => setFormData({ ...formData, professional_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Selecione um profissional</option>
                  {professionals.map((prof: any) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Data e Hora</label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            {/* Items */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Itens da Comanda
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addItem('service')}
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                  >
                    + Serviço
                  </button>
                  <button
                    type="button"
                    onClick={() => addItem('product')}
                    className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                  >
                    + Produto
                  </button>
                  <button
                    type="button"
                    onClick={() => addItem('package')}
                    className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
                  >
                    + Pacote
                  </button>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhum item adicionado. Clique nos botões acima para adicionar.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-12 gap-3 items-start">
                        {/* Item Type */}
                        <div className="col-span-12 md:col-span-2">
                          <label className="block text-xs font-medium mb-1">Tipo</label>
                          <select
                            value={item.item_type}
                            onChange={(e) => {
                              const newItem = { ...item, item_type: e.target.value as any }
                              newItem.service_id = undefined
                              newItem.product_id = undefined
                              newItem.package_id = undefined
                              updateItem(index, 'item_type', e.target.value)
                            }}
                            className="w-full px-2 py-1.5 text-sm border rounded"
                            disabled={!!command}
                          >
                            <option value="service">Serviço</option>
                            <option value="product">Produto</option>
                            <option value="package">Pacote</option>
                          </select>
                        </div>

                        {/* Item Selection */}
                        <div className="col-span-12 md:col-span-3">
                          <label className="block text-xs font-medium mb-1">Item</label>
                          {item.item_type === 'service' && (
                            <select
                              value={item.service_id || ''}
                              onChange={(e) => updateItem(index, 'service_id', e.target.value ? parseInt(e.target.value) : null)}
                              className="w-full px-2 py-1.5 text-sm border rounded"
                              disabled={!!command}
                            >
                              <option value="">Selecione</option>
                              {services.map((s: any) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} - R$ {s.price}
                                </option>
                              ))}
                            </select>
                          )}
                          {item.item_type === 'product' && (
                            <select
                              value={item.product_id || ''}
                              onChange={(e) => updateItem(index, 'product_id', e.target.value ? parseInt(e.target.value) : null)}
                              className="w-full px-2 py-1.5 text-sm border rounded"
                              disabled={!!command}
                            >
                              <option value="">Selecione</option>
                              {products.map((p: any) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} - R$ {p.sale_price}
                                </option>
                              ))}
                            </select>
                          )}
                          {item.item_type === 'package' && (
                            <select
                              value={item.package_id || ''}
                              onChange={(e) => updateItem(index, 'package_id', e.target.value ? parseInt(e.target.value) : null)}
                              className="w-full px-2 py-1.5 text-sm border rounded"
                              disabled={!!command}
                            >
                              <option value="">Selecione</option>
                              {packages.map((p: any) => (
                                <option key={p.id} value={p.id}>
                                  {p.name || 'Pacote'} - R$ {p.total_value || 0}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* Professional (for services) */}
                        {item.item_type === 'service' && (
                          <div className="col-span-12 md:col-span-2">
                            <label className="block text-xs font-medium mb-1">Profissional</label>
                            <select
                              value={item.professional_id || ''}
                              onChange={(e) => updateItem(index, 'professional_id', e.target.value ? parseInt(e.target.value) : null)}
                              className="w-full px-2 py-1.5 text-sm border rounded"
                              disabled={!!command}
                            >
                              <option value="">Selecione</option>
                              {professionals.map((p: any) => (
                                <option key={p.id} value={p.id}>
                                  {p.full_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Quantity */}
                        <div className="col-span-6 md:col-span-1">
                          <label className="block text-xs font-medium mb-1">Qtd</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1.5 text-sm border rounded"
                            disabled={!!command}
                          />
                        </div>

                        {/* Unit Value */}
                        <div className="col-span-6 md:col-span-2">
                          <label className="block text-xs font-medium mb-1">Valor Unit.</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={item.unit_value}
                            onChange={(e) => updateItem(index, 'unit_value', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 text-sm border rounded"
                            disabled={!!command}
                          />
                        </div>

                        {/* Commission */}
                        {item.item_type === 'service' && (
                          <div className="col-span-6 md:col-span-1">
                            <label className="block text-xs font-medium mb-1">Comissão %</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.commission_percentage}
                              onChange={(e) => updateItem(index, 'commission_percentage', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 text-sm border rounded"
                              disabled={!!command}
                            />
                          </div>
                        )}

                        {/* Total */}
                        <div className="col-span-6 md:col-span-2">
                          <label className="block text-xs font-medium mb-1">Total</label>
                          <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">
                            R$ {(item.unit_value * item.quantity).toFixed(2)}
                          </div>
                        </div>

                        {/* Remove */}
                        {!command && (
                          <div className="col-span-12 md:col-span-1 flex items-end">
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
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      <span>Desconto:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.discount_value}
                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                        className="w-24 px-2 py-1 text-sm border rounded"
                        disabled={!!command}
                      />
                    </div>
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
              <label className="block text-sm font-medium mb-2">Observações</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
                placeholder="Observações sobre a comanda..."
              />
            </div>

            {/* Actions */}
            {!command && (
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
                  {loading ? 'Salvando...' : 'Criar Comanda'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Finish Modal */}
      {showFinishModal && command && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Finalizar Comanda</h2>
              <button
                onClick={() => setShowFinishModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Totals */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Desconto:</span>
                    <span>R$ {totals.discount.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-primary">R$ {totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Formas de Pagamento</h3>
                  <button
                    type="button"
                    onClick={addPaymentMethod}
                    className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Adicionar
                  </button>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((pm, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <select
                        value={pm.method}
                        onChange={(e) => updatePaymentMethod(index, 'method', e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                      >
                        <option value="cash">Dinheiro</option>
                        <option value="credit_card">Cartão de Crédito</option>
                        <option value="debit_card">Cartão de Débito</option>
                        <option value="pix">Pix</option>
                        <option value="bank_transfer">Transferência</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={pm.value}
                        onChange={(e) => updatePaymentMethod(index, 'value', parseFloat(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 border rounded-lg"
                        placeholder="Valor"
                      />
                      {paymentMethods.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePaymentMethod(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Pago:</span>
                    <span className="font-semibold">R$ {totalPayment.toFixed(2)}</span>
                  </div>
                  {change > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Troco:</span>
                      <span className="font-semibold">R$ {change.toFixed(2)}</span>
                    </div>
                  )}
                  {change < 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Falta:</span>
                      <span className="font-semibold">R$ {Math.abs(change).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateInvoice}
                    onChange={(e) => setGenerateInvoice(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Gerar nota fiscal</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowFinishModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  disabled={loading || change < 0}
                >
                  {loading ? 'Finalizando...' : 'Finalizar Comanda'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

