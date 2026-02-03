'use client'

import { useState } from 'react'
import { productService } from '@/services/api'
import { X, Folder, FileText, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'

interface ProductCategoryFormProps {
  category?: any
  onClose: () => void
  onSuccess: () => void
}

export default function ProductCategoryForm({ category, onClose, onSuccess }: ProductCategoryFormProps) {
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    is_active: category?.is_active !== undefined ? category.is_active : true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    setLoading(true)
    try {
      if (category) {
        await productService.updateCategory(category.id, formData)
        toast.success('Categoria atualizada!')
      } else {
        await productService.createCategory(formData)
        toast.success('Categoria criada!')
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || error.response?.data?.detail || 'Erro ao salvar categoria')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Folder className="w-6 h-6" />
            {category ? 'Editar Categoria' : 'Nova Categoria'}
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
              Nome da Categoria <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
              placeholder="Ex: Shampoos, Condicionadores, Tratamentos, etc."
            />
            <p className="text-xs text-gray-500 mt-1">
              Nome da categoria de produtos
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={4}
              placeholder="Descrição da categoria..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Descrição detalhada da categoria
            </p>
          </div>

          {/* Status */}
          <div className="border-t pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              {formData.is_active ? (
                <ToggleRight className="w-6 h-6 text-green-600" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="hidden"
              />
              <div>
                <span className="text-sm font-medium">Categoria ativa</span>
                <p className="text-xs text-gray-500">
                  Categorias inativas não aparecerão na seleção de produtos
                </p>
              </div>
            </label>
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
              {loading ? 'Salvando...' : category ? 'Atualizar Categoria' : 'Criar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

