'use client'

import { useState } from 'react'
import { productService } from '@/services/api'
import { X, Sparkles, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface BrandFormProps {
  brand?: any
  onClose: () => void
  onSuccess: () => void
}

export default function BrandForm({ brand, onClose, onSuccess }: BrandFormProps) {
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: brand?.name || '',
    notes: brand?.notes || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    setLoading(true)
    try {
      if (brand) {
        await productService.updateBrand(brand.id, formData)
        toast.success('Marca atualizada!')
      } else {
        await productService.createBrand(formData)
        toast.success('Marca criada!')
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || error.response?.data?.detail || 'Erro ao salvar marca')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            {brand ? 'Editar Marca' : 'Nova Marca'}
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
          <div>
            <label className="block text-sm font-medium mb-2">
              Nome da Marca <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
              placeholder="Ex: L'Oréal, Wella, etc."
            />
            <p className="text-xs text-gray-500 mt-1">
              Nome da marca de produtos
            </p>
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
              rows={4}
              placeholder="Informações adicionais sobre a marca..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Informações adicionais, notas ou observações sobre a marca
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
              {loading ? 'Salvando...' : brand ? 'Atualizar Marca' : 'Criar Marca'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

