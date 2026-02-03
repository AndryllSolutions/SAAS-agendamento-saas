'use client'

import { useState, useEffect } from 'react'
import { financialService } from '@/services/api'
import { Plus, Edit, Trash2, Folder } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'

export default function FinancialCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'income',
    description: '',
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await financialService.listCategories()
      setCategories(response.data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedCategory) {
        await financialService.updateCategory(selectedCategory.id, formData)
        toast.success('Categoria atualizada!')
      } else {
        await financialService.createCategory(formData)
        toast.success('Categoria criada!')
      }
      setShowModal(false)
      setSelectedCategory(null)
      loadCategories()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar categoria')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return
    try {
      await financialService.deleteCategory(id)
      toast.success('Categoria excluída!')
      loadCategories()
    } catch (error: any) {
      toast.error('Erro ao excluir categoria')
    }
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nome' },
    { 
      key: 'type', 
      label: 'Tipo',
      render: (c: any) => c.type === 'income' ? 'Receita' : 'Despesa'
    },
    { key: 'description', label: 'Descrição' },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categorias Financeiras</h1>
            <p className="text-gray-600 mt-1">Gerencie categorias de receitas e despesas</p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" />
            Nova Categoria
          </button>
        </div>

        <DataTable
          data={categories}
          columns={columns}
          loading={loading}
          actions={(c) => (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedCategory(c)
                  setFormData({
                    name: c.name,
                    type: c.type,
                    description: c.description || '',
                  })
                  setShowModal(true)
                }}
                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(c.id)}
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
                {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
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
                    <option value="income">Receita</option>
                    <option value="expense">Despesa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setSelectedCategory(null)
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

