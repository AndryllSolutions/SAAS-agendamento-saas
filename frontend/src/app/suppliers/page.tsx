'use client'

import { useState, useEffect } from 'react'
import { supplierService } from '@/services/api'
import { Plus, Edit, Trash2, Truck, Mail, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'
import SupplierForm from '@/components/SupplierForm'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    try {
      const response = await supplierService.list()
      setSuppliers(response.data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar fornecedores')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (supplier: any) => {
    setSelectedSupplier(supplier)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return
    try {
      await supplierService.delete(id)
      toast.success('Fornecedor excluído!')
      loadSuppliers()
    } catch (error: any) {
      toast.error('Erro ao excluir fornecedor')
    }
  }

  const handleSuccess = () => {
    loadSuppliers()
  }

  const columns = [
    {
      key: 'name',
      label: 'Fornecedor',
      sortable: true,
      render: (supplier: any) => (
        <div>
          <div className="font-medium">{supplier.name}</div>
          {supplier.cnpj && (
            <div className="text-xs text-gray-500">CNPJ: {supplier.cnpj}</div>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contato',
      render: (supplier: any) => (
        <div className="space-y-1">
          {supplier.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="w-3 h-3 text-gray-400" />
              <span>{supplier.email}</span>
            </div>
          )}
          {supplier.phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="w-3 h-3 text-gray-400" />
              <span>{supplier.phone}</span>
            </div>
          )}
          {supplier.cellphone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="w-3 h-3 text-gray-400" />
              <span>{supplier.cellphone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'address',
      label: 'Endereço',
      render: (supplier: any) => (
        <div className="text-sm">
          {supplier.address && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span>{supplier.address}</span>
            </div>
          )}
          {(supplier.city || supplier.state) && (
            <div className="text-gray-500 mt-1">
              {supplier.city}
              {supplier.city && supplier.state && ', '}
              {supplier.state}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (supplier: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            supplier.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {supplier.is_active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (supplier: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(supplier)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(supplier.id)}
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
            <h1 className="text-3xl font-bold text-gray-900">Fornecedores</h1>
            <p className="text-gray-600 mt-1">Gerencie fornecedores de produtos e serviços</p>
          </div>
          <button
            onClick={() => {
              setSelectedSupplier(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" />
            Novo Fornecedor
          </button>
        </div>

        <DataTable data={suppliers} columns={columns} loading={loading} />

        {showModal && (
          <SupplierForm
            supplier={selectedSupplier}
            onClose={() => {
              setShowModal(false)
              setSelectedSupplier(null)
            }}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

