'use client'

import { useState } from 'react'
import { supplierService } from '@/services/api'
import { X, Truck, Mail, Phone, MapPin, Building2 } from 'lucide-react'
import { toast } from 'sonner'

interface SupplierFormProps {
  supplier?: any
  onClose: () => void
  onSuccess: () => void
}

export default function SupplierForm({ supplier, onClose, onSuccess }: SupplierFormProps) {
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    cellphone: supplier?.cellphone || '',
    address: supplier?.address || '',
    city: supplier?.city || '',
    state: supplier?.state || '',
    zip_code: supplier?.zip_code || '',
    cnpj: supplier?.cnpj || '',
    notes: supplier?.notes || '',
    is_active: supplier?.is_active !== undefined ? supplier.is_active : true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    setLoading(true)
    try {
      if (supplier) {
        await supplierService.update(supplier.id, formData)
        toast.success('Fornecedor atualizado!')
      } else {
        await supplierService.create(formData)
        toast.success('Fornecedor criado!')
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar fornecedor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="w-6 h-6" />
            {supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
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
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Nome/Razão Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                  placeholder="Nome do fornecedor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CNPJ</label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Informações de Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="fornecedor@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telefone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="(11) 3333-3333"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Celular</label>
                <input
                  type="tel"
                  value={formData.cellphone}
                  onChange={(e) => setFormData({ ...formData, cellphone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Endereço
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Endereço</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cidade</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="São Paulo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="SP"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CEP</label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium mb-2">Observações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={3}
              placeholder="Observações sobre o fornecedor..."
            />
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
              <span className="text-sm font-medium">Fornecedor ativo</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Fornecedores inativos não aparecerão nas compras
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
              {loading ? 'Salvando...' : supplier ? 'Atualizar Fornecedor' : 'Criar Fornecedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

