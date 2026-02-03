'use client'

import { useState, useEffect } from 'react'
import { productService } from '@/services/api'
import { Plus, Edit, Trash2, Sparkles, Package } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'
import BrandForm from '@/components/BrandForm'

export default function ProductBrandsPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<any>(null)

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    try {
      const response = await productService.listBrands()
      setBrands(response.data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar marcas')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (brand: any) => {
    setSelectedBrand(brand)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta marca?')) return
    try {
      await productService.deleteBrand(id)
      toast.success('Marca excluída!')
      loadBrands()
    } catch (error: any) {
      toast.error('Erro ao excluir marca')
    }
  }

  const handleSuccess = () => {
    loadBrands()
  }

  const columns = [
    {
      key: 'name',
      label: 'Marca',
      sortable: true,
      render: (brand: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
            {brand.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{brand.name}</div>
            {brand.products && brand.products.length > 0 && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Package className="w-3 h-3" />
                {brand.products.length} produto(s)
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'notes',
      label: 'Observações',
      render: (brand: any) => (
        <div className="text-sm text-gray-600 max-w-md truncate">
          {brand.notes || '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (brand: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(brand)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(brand.id)}
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
            <h1 className="text-3xl font-bold text-gray-900">Marcas de Produtos</h1>
            <p className="text-gray-600 mt-1">Gerencie marcas de produtos</p>
          </div>
          <button
            onClick={() => {
              setSelectedBrand(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" />
            Nova Marca
          </button>
        </div>

        <DataTable data={brands} columns={columns} loading={loading} />

        {showModal && (
          <BrandForm
            brand={selectedBrand}
            onClose={() => {
              setShowModal(false)
              setSelectedBrand(null)
            }}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

