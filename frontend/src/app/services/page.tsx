'use client'

import { useMemo, useState, useEffect } from 'react'
import { serviceService } from '@/services/api'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Star,
  Settings,
  X,
  Info,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import ImageUpload from '@/components/ui/ImageUpload'
import LoadingState from '@/components/ui/LoadingState'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import Link from 'next/link'

const COLUMN_STORAGE_KEY = 'services-table-columns'
const DEFAULT_COLUMNS = {
  value: true,
  commission: true,
  duration: true,
  category: true,
  showOnSite: true
}

const DURATIONS = [15, 30, 45, 60, 90, 120]
const LEAD_TIMES = [0, 15, 30, 60, 120]

type ServiceFormState = {
  name: string
  description: string
  price: string
  duration_minutes: string
  currency: string
  image_url: string
  category_id: string
  commission_rate: string
  extra_cost: string
  price_type: 'fixed'
  is_active: boolean
  is_favorite: boolean
  visible_online: boolean
  online_booking_enabled: boolean
  lead_time: string
}

export default function ServicesPage() {
  const cashbackFeature = useFeatureFlag('cashback')
  const formId = 'service-form'
  const [services, setServices] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'cadastro' | 'config' | 'cashback'>('cadastro')
  const [editingService, setEditingService] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showColumnsMenu, setShowColumnsMenu] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [gotoPage, setGotoPage] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS)
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'active' | 'inactive',
    favorites: 'all' as 'all' | 'with' | 'without',
    categoryIds: [] as number[]
  })
  const [formData, setFormData] = useState<ServiceFormState>({
    name: '',
    description: '',
    price: '',
    duration_minutes: '15',
    currency: 'BRL',
    image_url: '',
    category_id: '',
    commission_rate: '0',
    extra_cost: '',
    price_type: 'fixed',
    is_active: true,
    is_favorite: false,
    visible_online: true,
    online_booking_enabled: true,
    lead_time: '0'
  })

  useEffect(() => {
    loadPreferences()
    loadCategories()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [searchTerm, filters])

  useEffect(() => {
    loadServices()
  }, [filters.status, filters.categoryIds])

  useEffect(() => {
    if (page < 1) setPage(1)
  }, [page])

  const loadPreferences = () => {
    try {
      const stored = localStorage.getItem(COLUMN_STORAGE_KEY)
      if (stored) {
        setVisibleColumns({ ...DEFAULT_COLUMNS, ...JSON.parse(stored) })
      }
    } catch (err) {
      console.warn('Could not load column preferences')
    }
  }


  const loadServices = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = { skip: 0, limit: 1000 }
      if (filters.status === 'active') params.is_active = true
      if (filters.status === 'inactive') params.is_active = false
      if (filters.categoryIds.length === 1) params.category_id = filters.categoryIds[0]
      const response = await serviceService.list(params)
      setServices(response.data || [])
    } catch (err: any) {
      if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') {
        return
      }
      const message = err.response?.data?.detail || 'Erro ao carregar serviços'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await serviceService.listCategories()
      setCategories(response.data || [])
    } catch (err) {
      console.warn('Erro ao carregar categorias')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let companyId = 1
      try {
        const authStorage = localStorage.getItem('auth-storage')
        if (authStorage) {
          const authData = JSON.parse(authStorage)
          companyId = authData?.state?.user?.company_id || 1
        }
      } catch (err) {
        console.warn('Could not get company_id from auth storage')
      }

      const payload: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price || '0'),
        duration_minutes: parseInt(formData.duration_minutes || '15', 10),
        currency: formData.currency,
        image_url: formData.image_url || null,
        category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
        commission_rate: parseInt(formData.commission_rate || '0', 10),
        is_active: formData.is_active,
        is_favorite: formData.is_favorite,
        available_online: formData.visible_online,
        online_booking_enabled: formData.online_booking_enabled,
        extra_cost: formData.extra_cost ? parseFloat(formData.extra_cost) : null,
        lead_time_minutes: parseInt(formData.lead_time || '0', 10)
      }

      if (editingService) {
        await serviceService.update(editingService.id, payload)
        toast.success('Serviço atualizado!')
      } else {
        await serviceService.create({ ...payload, company_id: companyId })
        toast.success('Serviço criado!')
      }

      setShowModal(false)
      setEditingService(null)
      resetForm()
      loadServices()
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Erro ao salvar serviço'
      toast.error(errorMessage)
    }
  }

  const handleEdit = (service: any) => {
    setEditingService(service)
    setActiveTab('cadastro')
    setFormData({
      name: service.name || '',
      description: service.description || '',
      price: service.price ? String(service.price) : '',
      duration_minutes: String(service.duration_minutes || 15),
      currency: service.currency || 'BRL',
      image_url: service.image_url || '',
      category_id: service.category_id ? String(service.category_id) : '',
      commission_rate: service.commission_rate ? String(service.commission_rate) : '0',
      extra_cost: '',
      price_type: 'fixed',
      is_active: service.is_active ?? true,
      is_favorite: service.is_favorite ?? false,
      visible_online: service.available_online ?? true,
      online_booking_enabled: service.online_booking_enabled ?? true,
      lead_time: service.lead_time_minutes ? String(service.lead_time_minutes) : '0'
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este serviço?')) return
    try {
      await serviceService.delete(id)
      toast.success('Serviço excluído!')
      loadServices()
    } catch (err) {
      toast.error('Erro ao excluir serviço')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration_minutes: '15',
      currency: 'BRL',
      image_url: '',
      category_id: '',
      commission_rate: '0',
      extra_cost: '',
      price_type: 'fixed',
      is_active: true,
      is_favorite: false,
      visible_online: true,
      online_booking_enabled: true,
      lead_time: '0'
    })
  }

  const toggleFavorite = async (service: any) => {
    try {
      await serviceService.update(service.id, { is_favorite: !service.is_favorite })
      loadServices()
    } catch (err) {
      toast.error('Erro ao atualizar favorito')
    }
  }

  const resetColumns = () => {
    setVisibleColumns(DEFAULT_COLUMNS)
    try {
      localStorage.removeItem(COLUMN_STORAGE_KEY)
    } catch (err) {
      console.warn('Could not reset column preferences')
    }
  }

  const toggleColumn = (key: keyof typeof DEFAULT_COLUMNS) => {
    const updated = { ...visibleColumns, [key]: !visibleColumns[key] }
    setVisibleColumns(updated)
    try {
      localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(updated))
    } catch (err) {
      console.warn('Could not save column preferences')
    }
  }

  const filteredServices = useMemo(() => {
    return services
      .filter((service) => {
        if (filters.categoryIds.length > 1 && !filters.categoryIds.includes(service.category_id)) {
          return false
        }
        if (filters.favorites === 'with') return service.is_favorite
        if (filters.favorites === 'without') return !service.is_favorite
        return true
      })
      .filter((service) => {
        if (!searchTerm) return true
        const categoryName = categories.find((cat) => cat.id === service.category_id)?.name || ''
        const searchBase = [
          service.name,
          service.price,
          service.commission_rate,
          service.duration_minutes,
          categoryName
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return searchBase.includes(searchTerm.toLowerCase())
      })
  }, [services, filters, searchTerm, categories])

  const totalItems = filteredServices.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedServices = filteredServices.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
  const currentIds = paginatedServices.map((service) => service.id)
  const allSelected = currentIds.length > 0 && currentIds.every((id) => selectedIds.includes(id))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(Array.from(new Set([...selectedIds, ...currentIds])))
    } else {
      setSelectedIds(selectedIds.filter((id) => !currentIds.includes(id)))
    }
  }

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((item) => item !== id))
    }
  }

  const handleGotoPage = () => {
    const target = parseInt(gotoPage, 10)
    if (!Number.isNaN(target) && target >= 1 && target <= totalPages) {
      setPage(target)
      setGotoPage('')
    }
  }

  const renderEmptyState = () => (
    <EmptyState
      title="Nenhum serviço encontrado"
      message="Crie um novo serviço para começar a cadastrar sua lista."
      actionLabel="Novo serviço"
      onAction={() => {
        resetForm()
        setEditingService(null)
        setActiveTab('cadastro')
        setShowModal(true)
      }}
    />
  )

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
            <div className="flex-1 min-w-[240px] max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Procure por nome, valor ou comissão..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
                  showFilters ? 'border-primary text-primary bg-primary/10' : 'border-gray-200 text-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtrar
              </button>
              <button
                onClick={() => {
                  resetForm()
                  setEditingService(null)
                  setActiveTab('cadastro')
                  setShowModal(true)
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                + Novo
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {showFilters && (
            <aside className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Ativos', value: 'active' },
                      { label: 'Inativos', value: 'inactive' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name="status-filter"
                          value={option.value}
                          checked={filters.status === option.value}
                          onChange={() => setFilters({ ...filters, status: option.value as 'active' | 'inactive' })}
                          className="text-primary focus:ring-primary"
                        />
                        {option.label}
                      </label>
                    ))}
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="status-filter"
                        value="all"
                        checked={filters.status === 'all'}
                        onChange={() => setFilters({ ...filters, status: 'all' })}
                        className="text-primary focus:ring-primary"
                      />
                      Todos
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Favoritos</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Com estrela', value: 'with' },
                      { label: 'Sem estrela', value: 'without' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name="favorite-filter"
                          value={option.value}
                          checked={filters.favorites === option.value}
                          onChange={() => setFilters({ ...filters, favorites: option.value as 'with' | 'without' })}
                          className="text-primary focus:ring-primary"
                        />
                        {option.label}
                      </label>
                    ))}
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="favorite-filter"
                        value="all"
                        checked={filters.favorites === 'all'}
                        onChange={() => setFilters({ ...filters, favorites: 'all' })}
                        className="text-primary focus:ring-primary"
                      />
                      Todos
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Categorias</h3>
                  <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <input
                      type="checkbox"
                      checked={filters.categoryIds.length === categories.length && categories.length > 0}
                      onChange={(event) =>
                        setFilters({
                          ...filters,
                          categoryIds: event.target.checked ? categories.map((cat) => cat.id) : []
                        })
                      }
                      className="text-primary focus:ring-primary"
                    />
                    Selecionar tudo
                  </label>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={filters.categoryIds.includes(category.id)}
                          onChange={(event) => {
                            const updated = event.target.checked
                              ? [...filters.categoryIds, category.id]
                              : filters.categoryIds.filter((id) => id !== category.id)
                            setFilters({ ...filters, categoryIds: updated })
                          }}
                          className="text-primary focus:ring-primary"
                        />
                        {category.name}
                      </label>
                    ))}
                    {categories.length === 0 && (
                      <p className="text-xs text-gray-500">Nenhuma categoria cadastrada</p>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          )}

          <div className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div className="text-sm text-gray-600">{totalItems} no total</div>
                <div className="relative">
                  <button
                    onClick={() => setShowColumnsMenu((prev) => !prev)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4" />
                    Colunas
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showColumnsMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button
                        onClick={resetColumns}
                        className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-gray-50"
                      >
                        Padrão
                      </button>
                      <div className="border-t border-gray-100">
                        {[
                          { key: 'value', label: 'Valor' },
                          { key: 'commission', label: 'Comissão' },
                          { key: 'duration', label: 'Duração' },
                          { key: 'category', label: 'Categoria' },
                          { key: 'showOnSite', label: 'Mostra no site' }
                        ].map((column) => (
                          <label
                            key={column.key}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={visibleColumns[column.key as keyof typeof DEFAULT_COLUMNS]}
                              onChange={() => toggleColumn(column.key as keyof typeof DEFAULT_COLUMNS)}
                              className="text-primary focus:ring-primary"
                            />
                            {column.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {loading && <LoadingState message="Carregando serviços..." />}
              {!loading && error && <ErrorState message={error} onRetry={loadServices} />}
              {!loading && !error && filteredServices.length === 0 && renderEmptyState()}

              {!loading && !error && filteredServices.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={(event) => handleSelectAll(event.target.checked)}
                            className="text-primary focus:ring-primary"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        {visibleColumns.value && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Valor
                          </th>
                        )}
                        {visibleColumns.commission && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Comissão
                          </th>
                        )}
                        {visibleColumns.duration && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Duração
                          </th>
                        )}
                        {visibleColumns.category && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Categoria
                          </th>
                        )}
                        {visibleColumns.showOnSite && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Mostra no site
                          </th>
                        )}
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedServices.map((service) => {
                        const categoryName = categories.find((cat) => cat.id === service.category_id)?.name || '-'
                        const isFavorite = service.is_favorite
                        const showOnSite = service.available_online ?? service.online_booking_enabled
                        return (
                          <tr key={service.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(service.id)}
                                onChange={(event) => handleSelectOne(service.id, event.target.checked)}
                                className="text-primary focus:ring-primary"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                {service.image_url ? (
                                  <img
                                    src={service.image_url}
                                    alt={service.name}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                                    {(service.name || 'S').slice(0, 1).toUpperCase()}
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleEdit(service)}
                                  className="text-sm font-semibold text-gray-900 hover:text-primary"
                                >
                                  {service.name}
                                </button>
                              </div>
                            </td>
                            {visibleColumns.value && (
                              <td className="px-4 py-4 text-sm text-gray-700">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                  Number(service.price || 0)
                                )}
                              </td>
                            )}
                            {visibleColumns.commission && (
                              <td className="px-4 py-4 text-sm text-gray-700">{service.commission_rate || 0}%</td>
                            )}
                            {visibleColumns.duration && (
                              <td className="px-4 py-4 text-sm text-gray-700">{service.duration_minutes} min</td>
                            )}
                            {visibleColumns.category && (
                              <td className="px-4 py-4 text-sm text-gray-700">{categoryName}</td>
                            )}
                            {visibleColumns.showOnSite && (
                              <td className="px-4 py-4 text-sm text-gray-700">
                                {showOnSite === undefined ? '-' : showOnSite ? 'Sim' : 'Não'}
                              </td>
                            )}
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => toggleFavorite(service)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    isFavorite
                                      ? 'text-yellow-500 bg-yellow-50'
                                      : 'text-gray-500 hover:bg-gray-100'
                                  }`}
                                  title={isFavorite ? 'Remover favorito' : 'Favoritar'}
                                >
                                  <Star className={isFavorite ? 'w-4 h-4 fill-current' : 'w-4 h-4'} />
                                </button>
                                <button
                                  onClick={() => handleEdit(service)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="Editar"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(service.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && !error && filteredServices.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
                  <div>{totalItems} no total</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setPage(1)}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      {pageNumbers.map((pageNumber) => (
                        <button
                          key={pageNumber}
                          onClick={() => setPage(pageNumber)}
                          className={`px-3 py-1 rounded-lg border ${
                            pageNumber === currentPage
                              ? 'bg-primary text-white border-primary'
                              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-500">20 / página</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Vá até</span>
                      <input
                        type="number"
                        value={gotoPage}
                        onChange={(event) => setGotoPage(event.target.value)}
                        className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm"
                      />
                      <button
                        onClick={handleGotoPage}
                        className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-700"
                      >
                        Página
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingService ? 'Editar serviço' : 'Novo serviço'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-1 overflow-hidden">
                <div className="w-56 border-r border-gray-200 p-4 space-y-2">
                  {[
                    { key: 'cadastro', label: 'Cadastro' },
                    { key: 'config', label: 'Configurações' },
                    { key: 'cashback', label: 'Cashback' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key as typeof activeTab)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.key
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <form id={formId} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                  {activeTab === 'cadastro' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-6">
                        <div className="w-32">
                          <ImageUpload
                            value={formData.image_url}
                            onChange={(url) => setFormData({ ...formData, image_url: url })}
                            folder="services"
                            prefix="service"
                            label="Imagem"
                          />
                          <button
                            type="button"
                            className="mt-2 text-sm text-primary hover:underline"
                          >
                            Alterar
                          </button>
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nome*</label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                              placeholder="Informe o nome"
                              className="w-full px-4 py-2 border rounded-lg"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria*</label>
                            <select
                              value={formData.category_id}
                              onChange={(event) => setFormData({ ...formData, category_id: event.target.value })}
                              className="w-full px-4 py-2 border rounded-lg"
                              required
                            >
                              <option value="">Selecione...</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Preço de venda</label>
                          <div className="flex gap-2">
                            <select
                              value={formData.price_type}
                              onChange={(event) => setFormData({ ...formData, price_type: event.target.value as 'fixed' })}
                              className="px-3 py-2 border rounded-lg bg-gray-50"
                            >
                              <option value="fixed">Preço fixo</option>
                            </select>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.price}
                              onChange={(event) => setFormData({ ...formData, price: event.target.value })}
                              placeholder="R$ 0,00"
                              className="w-full px-4 py-2 border rounded-lg"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            Custo adicional
                            <span title="Valor adicional cobrado no serviço">
                              <Info className="w-4 h-4 text-gray-400" />
                            </span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.extra_cost}
                            onChange={(event) => setFormData({ ...formData, extra_cost: event.target.value })}
                            placeholder="R$ 0,00"
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            Comissão (%)
                            <span title="Percentual de comissão para profissionais">
                              <Info className="w-4 h-4 text-gray-400" />
                            </span>
                          </label>
                          <input
                            type="number"
                            step="1"
                            value={formData.commission_rate}
                            onChange={(event) => setFormData({ ...formData, commission_rate: event.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Duração</label>
                          <select
                            value={formData.duration_minutes}
                            onChange={(event) => setFormData({ ...formData, duration_minutes: event.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                          >
                            {DURATIONS.map((duration) => (
                              <option key={duration} value={duration}>
                                {duration} min
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                        <textarea
                          value={formData.description}
                          onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                          rows={4}
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Esta descrição será exibida no agendamento online para ajudar os clientes a escolherem o serviço.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'config' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tempo de antecedência para agendamentos
                        </label>
                        <select
                          value={formData.lead_time}
                          onChange={(event) => setFormData({ ...formData, lead_time: event.target.value })}
                          className="w-full px-4 py-2 border rounded-lg"
                        >
                          {LEAD_TIMES.map((time) => (
                            <option key={time} value={time}>
                              {time} min
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">
                          Defina o tempo mínimo entre o agendamento e o horário do serviço.
                        </p>
                      </div>

                      <div className="space-y-4">
                        {[
                          {
                            label: 'Ativo',
                            description: 'Controla se o serviço fica disponível para uso interno.',
                            key: 'is_active'
                          },
                          {
                            label: 'Favorito',
                            description: 'Exibir o serviço com destaque na lista.',
                            key: 'is_favorite'
                          },
                          {
                            label: 'Visível',
                            description: 'Mostrar o serviço na vitrine pública.',
                            key: 'visible_online'
                          },
                          {
                            label: 'Permite agendamento online',
                            description: 'Habilita o serviço para marcação online.',
                            key: 'online_booking_enabled'
                          }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
                            <div>
                              <p className="font-medium text-gray-900">{item.label}</p>
                              <p className="text-xs text-gray-500">{item.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData[item.key as keyof ServiceFormState] as boolean}
                                onChange={(event) =>
                                  setFormData({
                                    ...formData,
                                    [item.key]: event.target.checked
                                  })
                                }
                                className="sr-only peer"
                              />
                              <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary transition-colors"></div>
                              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'cashback' && (
                    <div className="space-y-6">
                      {!cashbackFeature.hasAccess ? (
                        <div className="border border-orange-200 bg-orange-50 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-orange-900 mb-2">Cashback Desativado</h3>
                          <p className="text-sm text-orange-800 mb-4">
                            O módulo de cashback não está ativo no seu plano.{' '}
                            <Link href="/company-settings?tab=billing" className="underline text-orange-900">
                              Clique aqui
                            </Link>{' '}
                            para acessar as configurações.
                          </p>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => setActiveTab('cadastro')}
                              className="px-4 py-2 border border-orange-200 rounded-lg text-orange-900"
                            >
                              Fechar
                            </button>
                            <Link
                              href="/company-settings?tab=billing"
                              className="px-4 py-2 bg-primary text-white rounded-lg"
                            >
                              Acessar configurações
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
                          Cashback ativo. Configure regras em Configurações &gt; Cashback.
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>

              <div className="border-t px-6 py-4 flex items-center justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form={formId}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}