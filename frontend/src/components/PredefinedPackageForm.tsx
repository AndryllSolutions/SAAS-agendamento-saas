'use client'

import { useState, useEffect } from 'react'
import { packageService, serviceService } from '@/services/api'
import { X, Plus, Trash2, Package, DollarSign, Calendar, Scissors, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface PredefinedPackageFormProps {
  packageData?: any
  onClose: () => void
  onSuccess: () => void
}

interface ServiceIncluded {
  service_id: number
  sessions: number
  name?: string // For display
  price?: number // For display
}

export default function PredefinedPackageForm({ packageData, onClose, onSuccess }: PredefinedPackageFormProps) {
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<any[]>([])
  const [reloadKey, setReloadKey] = useState(0)
  
  const [formData, setFormData] = useState({
    name: packageData?.name || '',
    description: packageData?.description || '',
    validity_days: packageData?.validity_days?.toString() || '30',
    total_value: packageData?.total_value?.toString() || '0',
    is_active: packageData?.is_active !== undefined ? packageData.is_active : true,
  })

  const [servicesIncluded, setServicesIncluded] = useState<ServiceIncluded[]>(
    packageData?.services_included?.map((item: any) => ({
      service_id: item.service_id || item.id,
      sessions: item.sessions || 1,
      name: item.service?.name || item.name,
      price: item.service?.price || item.price,
    })) || []
  )

  useEffect(() => {
    loadServices()
  }, [reloadKey])

  const loadServices = async () => {
    try {
      const response = await serviceService.list()
      setServices(response.data || [])
    } catch (error) {
      toast.error('Erro ao carregar serviços')
    }
  }

  const addService = () => {
    const newService: ServiceIncluded = {
      service_id: 0,
      sessions: 1,
    }
    setServicesIncluded([...servicesIncluded, newService])
  }

  const removeService = (index: number) => {
    setServicesIncluded(servicesIncluded.filter((_, i) => i !== index))
    calculateTotal()
  }

  const updateService = (index: number, field: string, value: any) => {
    const updated = [...servicesIncluded]
    updated[index] = {
      ...updated[index],
      [field]: value,
    }

    // Auto-fill name and price when service is selected
    if (field === 'service_id' && value) {
      const service = services.find((s: any) => s.id === parseInt(value))
      if (service) {
        updated[index].name = service.name
        updated[index].price = parseFloat(service.price)
      }
    }

    setServicesIncluded(updated)
    calculateTotal()
  }

  const calculateTotal = () => {
    // Calculate total based on services and their prices
    // For now, we'll use the manual total_value field
    // In a real scenario, you might want to auto-calculate based on service prices
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    if (servicesIncluded.length === 0) {
      toast.error('Adicione pelo menos um serviço ao pacote')
      return
    }

    // Validate services
    for (const service of servicesIncluded) {
      if (!service.service_id || service.service_id === 0) {
        toast.error('Selecione o serviço para todos os itens')
        return
      }
      if (service.sessions <= 0) {
        toast.error('Número de sessões deve ser maior que zero')
        return
      }
    }

    if (parseFloat(formData.total_value) <= 0) {
      toast.error('Valor total deve ser maior que zero')
      return
    }

    if (parseInt(formData.validity_days) <= 0) {
      toast.error('Validade deve ser maior que zero')
      return
    }

    setLoading(true)
    try {
      const submitData = {
        name: formData.name,
        description: formData.description,
        validity_days: parseInt(formData.validity_days),
        total_value: parseFloat(formData.total_value),
        services_included: servicesIncluded.map(s => ({
          service_id: s.service_id,
          sessions: s.sessions,
        })),
        is_active: formData.is_active,
      }

      if (packageData) {
        await packageService.updatePredefined(packageData.id, submitData)
        toast.success('Pacote atualizado!')
      } else {
        const { apiPost } = await import('@/utils/apiClient')
        
        const response = await apiPost('packages/predefined', submitData)

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.detail || 'Erro ao criar pacote')
        }

        toast.success('Pacote criado!')
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || error.response?.data?.detail || 'Erro ao salvar pacote')
    } finally {
      setLoading(false)
    }
  }

  // Calculate suggested total based on services
  const suggestedTotal = servicesIncluded.reduce((sum, service) => {
    if (service.price && service.sessions) {
      return sum + (service.price * service.sessions)
    }
    return sum
  }, 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6" />
            {packageData ? 'Editar Pacote Predefinido' : 'Novo Pacote Predefinido'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Nome do Pacote <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
                placeholder="Ex: Pacote Completo de Tratamento"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
                placeholder="Descrição do pacote..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Validade (dias) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.validity_days}
                onChange={(e) => setFormData({ ...formData, validity_days: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
                placeholder="30"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número de dias de validade do pacote
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Valor Total (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.total_value}
                onChange={(e) => setFormData({ ...formData, total_value: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
                placeholder="0.00"
              />
              {suggestedTotal > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Sugerido: R$ {suggestedTotal.toFixed(2)} (baseado nos serviços)
                </p>
              )}
            </div>
          </div>

          {/* Services Included */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Scissors className="w-5 h-5" />
                Serviços Incluídos
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReloadKey(prev => prev + 1)}
                  className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  title="Recarregar serviços"
                >
                  <RefreshCw className="w-4 h-4" />
                  Atualizar
                </button>
                <button
                  type="button"
                  onClick={addService}
                  className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Serviço
                </button>
              </div>
            </div>

            {servicesIncluded.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Scissors className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhum serviço adicionado. Clique no botão acima para adicionar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {servicesIncluded.map((service, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-12 gap-3 items-start">
                      {/* Service Selection */}
                      <div className="col-span-12 md:col-span-6">
                        <label className="block text-xs font-medium mb-1">Serviço <span className="text-red-500">*</span></label>
                        <select
                          value={service.service_id || ''}
                          onChange={(e) => updateService(index, 'service_id', e.target.value ? parseInt(e.target.value) : 0)}
                          className="w-full px-2 py-1.5 text-sm border rounded"
                          required
                        >
                          <option value="0">Selecione um serviço</option>
                          {services.map((s: any) => (
                            <option key={s.id} value={s.id}>
                              {s.name} - R$ {s.price}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Sessions */}
                      <div className="col-span-6 md:col-span-3">
                        <label className="block text-xs font-medium mb-1">Sessões <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          min="1"
                          value={service.sessions}
                          onChange={(e) => updateService(index, 'sessions', parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1.5 text-sm border rounded"
                          required
                        />
                      </div>

                      {/* Subtotal */}
                      <div className="col-span-6 md:col-span-2">
                        <label className="block text-xs font-medium mb-1">Subtotal</label>
                        <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">
                          {service.price && service.sessions
                            ? `R$ ${(service.price * service.sessions).toFixed(2)}`
                            : '-'}
                        </div>
                      </div>

                      {/* Remove */}
                      <div className="col-span-12 md:col-span-1 flex items-end">
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="w-full px-2 py-1.5 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="border-t pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium">Pacote ativo</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Pacotes inativos não aparecerão nas vendas
            </p>
          </div>

          {/* Actions */}
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
              {loading ? 'Salvando...' : packageData ? 'Atualizar Pacote' : 'Criar Pacote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

