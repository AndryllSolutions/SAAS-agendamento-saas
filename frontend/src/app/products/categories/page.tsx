'use client'

import { useState, useEffect } from 'react'
import { productService } from '@/services/api'
import { Plus, Edit, Trash2, Folder, Package, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'
import ProductCategoryForm from '@/components/ProductCategoryForm'

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await productService.listCategories()
      setCategories(response.data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: any) => {
    setSelectedCategory(category)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return
    try {
      await productService.deleteCategory(id)
      toast.success('Categoria excluída!')
      loadCategories()
    } catch (error: any) {
      toast.error('Erro ao excluir categoria')
    }
  }

  const handleSuccess = () => {
    loadCategories()
  }

  const columns = [
    {
      key: 'name',
      label: 'Categoria',
      sortable: true,
      render: (category: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <div className="font-medium">{category.name}</div>
            {category.products && category.products.length > 0 && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Package className="w-3 h-3" />
                {category.products.length} produto(s)
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Descrição',
      render: (category: any) => (
        <div className="text-sm text-gray-600 max-w-md">
          {category.description || '-'}
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (category: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
            category.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {category.is_active ? (
            <>
              <CheckCircle className="w-3 h-3" />
              Ativa
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3" />
              Inativa
            </>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (category: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(category)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(category.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categorias de Produtos</h1>
            <p className="text-gray-600 mt-1">Gerencie categorias de produtos</p>
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

        <DataTable data={categories} columns={columns} loading={loading} />

        {showModal && (
          <ProductCategoryForm
            category={selectedCategory}
            onClose={() => {
              setShowModal(false)
              setSelectedCategory(null)
            }}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

