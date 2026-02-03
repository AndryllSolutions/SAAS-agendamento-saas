'use client'

import { useState, useEffect } from 'react'
import { productService } from '@/services/api'
import { Plus, Edit, Trash2, Package, AlertCircle, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'
import ProductForm from '@/components/ProductForm'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await productService.list()
      setProducts(response.data || [])
    } catch (error) {
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: any) => {
    setSelectedProduct(product)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Deseja realmente excluir este produto?')) {
      try {
        await productService.delete(id)
        toast.success('Produto excluído!')
        loadProducts()
      } catch (error) {
        toast.error('Erro ao excluir produto')
      }
    }
  }

  const handleAdjustStock = async (product: any) => {
    const quantity = prompt(`Ajustar estoque de "${product.name}"\nEstoque atual: ${product.stock_current}\n\nDigite a quantidade (positivo para adicionar, negativo para remover):`)
    
    if (quantity === null) return
    
    const qty = parseInt(quantity)
    if (isNaN(qty)) {
      toast.error('Quantidade inválida')
      return
    }

    try {
      await productService.adjustStock(product.id, {
        quantity: qty,
        reason: 'Ajuste manual'
      })
      toast.success('Estoque ajustado!')
      loadProducts()
    } catch (error) {
      toast.error('Erro ao ajustar estoque')
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Produto',
      sortable: true,
      render: (p: any) => {
        const productImage = p.image_url || (p.images && Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null)
        return (
          <div className="flex items-center gap-3">
            {productImage && (
              <img
                src={productImage}
                alt={p.name}
                className="w-10 h-10 object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            )}
            <div>
              <div className="font-medium">{p.name}</div>
              {p.barcode && (
                <div className="text-xs text-gray-500">Cód: {p.barcode}</div>
              )}
            </div>
          </div>
        )
      },
    },
    { key: 'category', label: 'Categoria', render: (p: any) => p.category?.name || '-' },
    { key: 'brand', label: 'Marca', render: (p: any) => p.brand?.name || '-' },
    {
      key: 'stock_current',
      label: 'Estoque',
      render: (p: any) => (
        <div className="flex items-center gap-2">
          <span className={p.stock_current <= (p.stock_minimum || 0) ? 'text-red-600 font-semibold' : ''}>
            {p.stock_current || 0} {p.unit || 'UN'}
          </span>
          {p.stock_current <= (p.stock_minimum || 0) && (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
        </div>
      ),
    },
    {
      key: 'sale_price',
      label: 'Preço',
      render: (p: any) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
          p.sale_price || 0
        ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (p: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(p)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAdjustStock(p)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Ajustar Estoque"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(p.id)}
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-600">Gerencie seus produtos e estoque</p>
          </div>
          <button
            onClick={() => {
              setSelectedProduct(null)
              setShowModal(true)
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        </div>

        {/* Low Stock Alert */}
        {products.filter((p: any) => p.stock_current <= (p.stock_minimum || 0)).length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-800">
                {products.filter((p: any) => p.stock_current <= (p.stock_minimum || 0)).length} produto(s) com estoque baixo
              </p>
              <p className="text-sm text-yellow-700">
                Considere fazer uma nova compra para repor o estoque
              </p>
            </div>
          </div>
        )}

        <DataTable data={products} columns={columns} loading={loading} />

        {showModal && (
          <ProductForm
            product={selectedProduct}
            onClose={() => {
              setShowModal(false)
              setSelectedProduct(null)
            }}
            onSuccess={() => {
              loadProducts()
            }}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

