'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, GripVertical, Edit, Trash2, Star, DollarSign, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import { usePermissions } from '@/hooks/usePermissions'
import ProfessionalForm from '@/components/ProfessionalForm'
import { ProfessionalsTable } from '@/components/professionals/ProfessionalsTable'

interface Professional {
  id: number
  full_name: string
  email: string
  phone?: string
  cellphone?: string
  avatar_url?: string
  is_active: boolean
  commission_rate?: number
  specialties?: string[]
  role: string
  sort_order?: number
}

export default function ProfessionalsPage() {
  const permissions = usePermissions()
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null)
  const [draggedItem, setDraggedItem] = useState<Professional | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  useEffect(() => {
    loadProfessionals()
  }, [searchTerm, isActiveFilter])

  const loadProfessionals = async () => {
    try {
      setLoading(true)
      const { professionalService } = await import('@/services/professionalService')
      
      // Build params object
      const params: any = {}
      
      // Add search term if exists
      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      }
      
      // Add active filter if set
      if (isActiveFilter !== null) {
        params.is_active = isActiveFilter
      }
      
      const response = await professionalService.list(params)
      setProfessionals(response.data)
    } catch (error) {
      toast.error('Erro ao carregar profissionais')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (prof: Professional) => {
    setSelectedProfessional(prof)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Deseja realmente excluir este profissional?')) {
      try {
        const { professionalService } = await import('@/services/professionalService')
        await professionalService.delete(id)
        toast.success('Profissional excluído!')
        loadProfessionals()
      } catch (error) {
        toast.error('Erro ao excluir profissional')
      }
    }
  }

  const handleSuccess = () => {
    loadProfessionals()
  }

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    setIsReordering(true)
    
    try {
      const { professionalService } = await import('@/services/professionalService')
      
      // Create reordered array
      const reorderedProfessionals = [...professionals]
      const [movedItem] = reorderedProfessionals.splice(fromIndex, 1)
      reorderedProfessionals.splice(toIndex, 0, movedItem)
      
      // Update sort_order for all affected items
      const reorderItems = reorderedProfessionals.map((prof, index) => ({
        id: prof.id,
        sort_order: index + 1
      }))
      
      // Call API
      await professionalService.reorder({ items: reorderItems })
      
      // Update local state
      setProfessionals(reorderedProfessionals)
      
      toast.success('Profissionais reordenados com sucesso!')
    } catch (error) {
      toast.error('Erro ao reordenar profissionais')
      // Revert to original order
      loadProfessionals()
    } finally {
      setIsReordering(false)
      setDraggedItem(null)
      setDragOverIndex(null)
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: Professional, index: number) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'))
    
    if (draggedIndex !== dropIndex) {
      handleReorder(draggedIndex, dropIndex)
    }
    
    setDragOverIndex(null)
  }

  if (!permissions.canManageUsers()) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
            <p className="text-gray-600">Gerencie os profissionais da sua empresa</p>
          </div>
          <button
            onClick={() => {
              setSelectedProfessional(null)
              setShowModal(true)
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Profissional</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar profissionais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsActiveFilter(null)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActiveFilter === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setIsActiveFilter(true)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActiveFilter === true
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setIsActiveFilter(false)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActiveFilter === false
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inativos
            </button>
          </div>
        </div>

        {/* Drag & Drop Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <GripVertical className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-800">
              Arraste e solte os profissionais para reordená-los. A ordem será salva automaticamente.
            </p>
          </div>
        </div>

        {/* Professionals Table */}
        <ProfessionalsTable
          professionals={professionals}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          dragOverIndex={dragOverIndex}
          isReordering={isReordering}
        />

        {/* Professional Form Modal */}
        {showModal && (
          <ProfessionalForm
            professional={selectedProfessional}
            onClose={() => {
              setShowModal(false)
              setSelectedProfessional(null)
            }}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
