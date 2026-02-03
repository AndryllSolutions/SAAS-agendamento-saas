'use client'

import { useState, useEffect } from 'react'
import { commandService, clientService, serviceService, productService, packageService, userService } from '@/services/api'
import { X, Plus, Trash2, ShoppingCart, DollarSign, User, Calendar, Percent, CreditCard, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

// ====== TIPOS BASEADOS NO BACKEND ======

// Enums do backend
type CommandStatus = 'open' | 'in_progress' | 'finished' | 'cancelled'
type CommandItemType = 'service' | 'product' | 'package'

// Interfaces baseadas nos schemas do backend
interface CommandItemBase {
  item_type: CommandItemType
  service_id?: number | null
  product_id?: number | null
  package_id?: number | null
  professional_id?: number | null
  quantity: number
  unit_value: string  // Backend usa Decimal, precisa ser string
  commission_percentage: number
}

interface CommandItemCreate extends CommandItemBase {
  // Schema para criação de item (sem ID)
}

interface CommandItemResponse extends CommandItemBase {
  id: number
  command_id: number
  total_value: string  // Decimal como string
  created_at: string
  updated_at: string
}

interface CommandBase {
  client_crm_id: number
  professional_id?: number | null
  appointment_id?: number | null
  date: string  // ISO datetime string
  notes?: string | null
}

interface CommandCreatePublic extends CommandBase {
  items: CommandItemCreate[]  // Backend exige lista, pode ser vazia
}

interface CommandResponse extends CommandBase {
  id: number
  company_id: number
  number: string
  status: CommandStatus
  total_value: string
  discount_value: string
  net_value: string
  payment_summary?: string | null
  payment_blocked: boolean
  payment_received: boolean
  has_nfse: boolean
  has_nfe: boolean
  has_nfce: boolean
  items: CommandItemResponse[]
  created_at: string
  updated_at: string
}

interface CommandUpdate {
  professional_id?: number | null
  status?: CommandStatus
  discount_value?: string | null
  notes?: string | null
  payment_received?: boolean | null
}

// ====== INTERFACES DO FRONTEND ======

interface CommandFormProps {
  command?: CommandResponse
  onClose: () => void
  onSuccess: () => void
}

interface CommandFormItem extends CommandItemCreate {
  id?: number
  name?: string // Para display
}

interface PaymentMethod {
  method: string
  value: number
}

// ====== COMPONENTE PRINCIPAL ======

export default function CommandForm({ command, onClose, onSuccess }: CommandFormProps) {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [reloadKey, setReloadKey] = useState(0)
  
  // Estado baseado no schema do backend
  const [formData, setFormData] = useState<CommandBase>({
    client_crm_id: command?.client_crm_id || 0,
    professional_id: command?.professional_id || null,
    appointment_id: command?.appointment_id || null,
    date: command?.date ? new Date(command.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    notes: command?.notes || '',
  })

  const [items, setItems] = useState<CommandFormItem[]>([])

  // ====== VALIDAÇÃO BASEADA NO BACKEND ======

  const validateCommandData = (data: CommandBase, items: CommandFormItem[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Validação do schema CommandBase
    if (!data.client_crm_id || data.client_crm_id <= 0) {
      errors.push('Cliente é obrigatório')
    }

    if (!data.date) {
      errors.push('Data é obrigatória')
    }

    // Validação dos itens (CommandItemCreate)
    items.forEach((item, index) => {
      const itemPrefix = `Item ${index + 1}:`

      // item_type é obrigatório e deve ser um enum válido
      if (!item.item_type) {
        errors.push(`${itemPrefix} Tipo é obrigatório`)
      } else if (!['service', 'product', 'package'].includes(item.item_type)) {
        errors.push(`${itemPrefix} Tipo inválido`)
      }

      // Validação específica por tipo
      if (item.item_type === 'service' && !item.service_id) {
        errors.push(`${itemPrefix} Serviço é obrigatório`)
      }
      if (item.item_type === 'product' && !item.product_id) {
        errors.push(`${itemPrefix} Produto é obrigatório`)
      }
      if (item.item_type === 'package' && !item.package_id) {
        errors.push(`${itemPrefix} Pacote é obrigatório`)
      }

      // quantity deve ser > 0
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`${itemPrefix} Quantidade deve ser maior que zero`)
      }

      // unit_value deve ser um número válido > 0 (string para Decimal)
      if (!item.unit_value || parseFloat(item.unit_value) <= 0) {
        errors.push(`${itemPrefix} Valor unitário deve ser maior que zero`)
      }

      // commission_percentage deve estar entre 0 e 100
      if (item.commission_percentage < 0 || item.commission_percentage > 100) {
        errors.push(`${itemPrefix} Comissão deve estar entre 0% e 100%`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // ====== CONVERSÃO DE DADOS ======

  const convertToBackendFormat = (): CommandCreatePublic => {
    const validatedData = validateCommandData(formData, items)
    
    if (!validatedData.isValid) {
      throw new Error(validatedData.errors.join('\n'))
    }

    return {
      client_crm_id: formData.client_crm_id,
      professional_id: formData.professional_id || null,
      appointment_id: formData.appointment_id || null,
      date: new Date(formData.date).toISOString(),
      notes: formData.notes || null,
      items: items.map(item => ({
        item_type: item.item_type,
        service_id: item.service_id || null,
        product_id: item.product_id || null,
        package_id: item.package_id || null,
        professional_id: item.professional_id || null,
        quantity: item.quantity,
        unit_value: item.unit_value,  // Backend usa Decimal, string é correto
        commission_percentage: item.commission_percentage,
      }))
    }
  }

  // ====== CARREGAMENTO DE DADOS ======

  useEffect(() => {
    loadData()
  }, [reloadKey])

  const loadData = async () => {
    try {
      const [clientsRes, professionalsRes, servicesRes, productsRes, packagesRes] = await Promise.all([
        clientService.list(),
        userService.listProfessionals(),
        serviceService.list(),
        productService.list(),
        packageService.listPredefined()
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

  // ====== MANIPULAÇÃO DE ITENS ======

  const addItem = () => {
    const newItem: CommandFormItem = {
      item_type: 'service',
      service_id: null,
      product_id: null,
      package_id: null,
      professional_id: null,
      quantity: 1,
      unit_value: '0.00',
      commission_percentage: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof CommandFormItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    // Auto-cálculo do total quando mudar quantidade ou valor
    if (field === 'quantity' || field === 'unit_value') {
      const item = updatedItems[index]
      // O backend calcula total_value, mas podemos mostrar preview
    }
    
    setItems(updatedItems)
  }

  // ====== SUBMIT ======

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      const submitData = convertToBackendFormat()
      
      if (command) {
        // Atualização - usa CommandUpdate
        const updateData: CommandUpdate = {
          professional_id: formData.professional_id || null,
          notes: formData.notes || null,
        }
        await commandService.update(command.id, updateData)
        toast.success('Comanda atualizada!')
      } else {
        // Criação - usa CommandCreatePublic
        await commandService.create(submitData)
        toast.success('Comanda criada!')
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Erro ao salvar comanda:', error)
      
      // Tratamento específico de erros do backend
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail)
      } else if (error.message) {
        toast.error(error.message)
      } else {
        toast.error('Erro ao salvar comanda')
      }
    } finally {
      setLoading(false)
    }
  }

  // ====== FUNÇÕES UTILITÁRIAS ======

  const calculateItemTotal = (item: CommandFormItem): string => {
    const quantity = item.quantity || 0
    const unitValue = parseFloat(item.unit_value || '0')
    return (quantity * unitValue).toFixed(2)
  }

  const calculateTotal = (): string => {
    return items.reduce((total, item) => {
      return total + parseFloat(calculateItemTotal(item))
    }, 0).toFixed(2)
  }

  const getItemName = (item: CommandFormItem): string => {
    if (item.item_type === 'service' && item.service_id) {
      const service = services.find(s => s.id === item.service_id)
      return service?.name || 'Serviço não encontrado'
    }
    if (item.item_type === 'product' && item.product_id) {
      const product = products.find(p => p.id === item.product_id)
      return product?.name || 'Produto não encontrado'
    }
    if (item.item_type === 'package' && item.package_id) {
      const pkg = packages.find(p => p.id === item.package_id)
      return pkg?.name || 'Pacote não encontrado'
    }
    return 'Item não selecionado'
  }

  // ====== UI COMPONENTS ======

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {command ? 'Editar Comanda' : 'Nova Comanda'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                value={formData.client_crm_id}
                onChange={(e) => setFormData({ ...formData, client_crm_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Selecione um cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profissional
              </label>
              <select
                value={formData.professional_id || ''}
                onChange={(e) => setFormData({ ...formData, professional_id: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Selecione um profissional</option>
                {professionals.map((professional) => (
                  <option key={professional.id} value={professional.id}>
                    {professional.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data *
              </label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Observações sobre a comanda..."
            />
          </div>

          {/* Itens da Comanda */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Itens da Comanda</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Item
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum item adicionado</p>
                <p className="text-sm text-gray-400 mt-2">
                  Adicione serviços, produtos ou pacotes à comanda
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={item.item_type}
                          onChange={(e) => updateItem(index, 'item_type', e.target.value as CommandItemType)}
                          className="px-3 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="service">Serviço</option>
                          <option value="product">Produto</option>
                          <option value="package">Pacote</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {getItemName(item)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {item.item_type === 'service' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Serviço
                          </label>
                          <select
                            value={item.service_id || ''}
                            onChange={(e) => updateItem(index, 'service_id', e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Selecione</option>
                            {services.map((service) => (
                              <option key={service.id} value={service.id}>
                                {service.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {item.item_type === 'product' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Produto
                          </label>
                          <select
                            value={item.product_id || ''}
                            onChange={(e) => updateItem(index, 'product_id', e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Selecione</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {item.item_type === 'package' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Pacote
                          </label>
                          <select
                            value={item.package_id || ''}
                            onChange={(e) => updateItem(index, 'package_id', e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Selecione</option>
                            {packages.map((pkg) => (
                              <option key={pkg.id} value={pkg.id}>
                                {pkg.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Quantidade
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Valor Unitário (R$)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_value}
                          onChange={(e) => updateItem(index, 'unit_value', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Comissão (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.commission_percentage}
                          onChange={(e) => updateItem(index, 'commission_percentage', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      <div className="flex items-end">
                        <div className="text-sm font-medium text-gray-900">
                          Total: R$ {calculateItemTotal(item)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total da Comanda */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-gray-900">
                      Total da Comanda:
                    </div>
                    <div className="text-lg font-semibold text-indigo-600">
                      R$ {calculateTotal()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Salvando...
                </span>
              ) : (
                command ? 'Atualizar' : 'Criar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
