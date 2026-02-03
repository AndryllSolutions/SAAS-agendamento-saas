'use client'

import { useState, useEffect } from 'react'
import { productService } from '@/services/api'
import { X, Package, DollarSign, BarChart3, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import ImageUpload from '@/components/ui/ImageUpload'

interface ProductFormProps {
  product?: any
  onClose: () => void
  onSuccess: () => void
}

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [brands, setBrands] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [imageUrl, setImageUrl] = useState<string>(
    product?.image_url || (product?.images && product.images.length > 0 ? product.images[0] : '') || ''
  )
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    stock_current: product?.stock_current?.toString() || '0',
    stock_minimum: product?.stock_minimum?.toString() || '0',
    unit: product?.unit || 'UN',
    cost_price: product?.cost_price?.toString() || '',
    sale_price: product?.sale_price?.toString() || '',
    commission_percentage: product?.commission_percentage?.toString() || '0',
    barcode: product?.barcode || '',
    brand_id: product?.brand_id?.toString() || '',
    category_id: product?.category_id?.toString() || '',
    is_active: product?.is_active !== undefined ? product.is_active : true,
  })

  useEffect(() => {
    loadBrandsAndCategories()
  }, [])

  const loadBrandsAndCategories = async () => {
    try {
      const [brandsRes, categoriesRes] = await Promise.all([
        productService.listBrands(),
        productService.listCategories()
      ])
      setBrands(brandsRes.data || [])
      setCategories(categoriesRes.data || [])
    } catch (error) {
      toast.error('Erro ao carregar marcas e categorias')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (parseFloat(formData.cost_price) <= 0) {
      toast.error('Preço de custo deve ser maior que zero')
      return
    }
    
    if (parseFloat(formData.sale_price) <= 0) {
      toast.error('Preço de venda deve ser maior que zero')
      return
    }
    
    if (parseFloat(formData.sale_price) < parseFloat(formData.cost_price)) {
      toast.error('Preço de venda não pode ser menor que o preço de custo')
      return
    }
    
    setLoading(true)
    try {
      // Get company_id from localStorage (auth-storage)
      let companyId = 1 // fallback
      try {
        const authStorage = localStorage.getItem('auth-storage')
        if (authStorage) {
          const authData = JSON.parse(authStorage)
          companyId = authData?.state?.user?.company_id || 1
        }
      } catch (e) {
        console.warn('Could not get company_id from auth storage')
      }

      const submitData = {
        ...formData,
        company_id: companyId,
        stock_current: parseInt(formData.stock_current) || 0,
        stock_minimum: parseInt(formData.stock_minimum) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        sale_price: parseFloat(formData.sale_price) || 0,
        commission_percentage: parseInt(formData.commission_percentage) || 0,
        brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        is_active: Boolean(formData.is_active),
      }
      
      if (product) {
        await productService.update(product.id, submitData)
        toast.success('Produto atualizado!')
      } else {
        await productService.create(submitData)
        toast.success('Produto criado!')
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar produto')
    } finally {
      setLoading(false)
    }
  }


  const profitMargin = formData.cost_price && formData.sale_price
    ? ((parseFloat(formData.sale_price) - parseFloat(formData.cost_price)) / parseFloat(formData.sale_price) * 100).toFixed(2)
    : '0'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {product ? 'Editar Produto' : 'Novo Produto'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Nome do Produto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
                placeholder="Ex: Shampoo Hidratante 500ml"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
                placeholder="Descrição detalhada do produto..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Marca
              </label>
              <select
                value={formData.brand_id}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Selecione uma marca</option>
                {brands.map((brand: any) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Categoria
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Código de Barras
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="7891234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Unidade
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="UN">Unidade (UN)</option>
                <option value="KG">Quilograma (KG)</option>
                <option value="G">Grama (G)</option>
                <option value="L">Litro (L)</option>
                <option value="ML">Mililitro (ML)</option>
                <option value="M">Metro (M)</option>
                <option value="CM">Centímetro (CM)</option>
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Preços e Comissão
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Preço de Custo (R$) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Preço de Venda (R$) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                  placeholder="0.00"
                />
                {formData.cost_price && formData.sale_price && (
                  <p className="text-xs text-gray-500 mt-1">
                    Margem: {profitMargin}%
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Comissão (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.commission_percentage}
                  onChange={(e) => setFormData({ ...formData, commission_percentage: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Estoque
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Estoque Atual
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_current}
                  onChange={(e) => setFormData({ ...formData, stock_current: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Estoque Mínimo
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_minimum}
                  onChange={(e) => setFormData({ ...formData, stock_minimum: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="0"
                />
                {parseInt(formData.stock_current) <= parseInt(formData.stock_minimum) && parseInt(formData.stock_current) > 0 && (
                  <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Estoque próximo do mínimo
                  </p>
                )}
                {parseInt(formData.stock_current) < parseInt(formData.stock_minimum) && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Estoque abaixo do mínimo
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Imagem do Produto</h3>
            {product ? (
              <ImageUpload
                value={imageUrl}
                onChange={async (url) => {
                  setImageUrl(url)
                  // Update product image via API
                  try {
                    const currentImages = product?.images || []
                    const updatedImages = currentImages.length > 0 
                      ? [url, ...currentImages.filter((img: string) => img !== url)]
                      : [url]
                    
                    await productService.update(product.id, { 
                      image_url: url,
                      images: updatedImages
                    })
                    toast.success('Imagem atualizada!')
                  } catch (error) {
                    toast.error('Erro ao atualizar imagem')
                  }
                }}
                folder="products"
                prefix={`product_${product.id}`}
                label="Imagem do Produto"
              />
            ) : (
              <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                Salve o produto primeiro para fazer upload de imagem
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
              <span className="text-sm font-medium">Produto ativo</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Produtos inativos não aparecerão nas vendas
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
              {loading ? 'Salvando...' : product ? 'Atualizar Produto' : 'Criar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

