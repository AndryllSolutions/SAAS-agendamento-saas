'use client'

import { useState, useEffect } from 'react'
import { packageService } from '@/services/api'
import { Plus, Edit, Trash2, Package as PackageIcon, DollarSign, Calendar, Scissors, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'
import PredefinedPackageForm from '@/components/PredefinedPackageForm'

export default function PredefinedPackagesPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await packageService.listPredefined()
      setPackages(response.data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar pacotes predefinidos')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (packageData: any) => {
    setSelectedPackage(packageData)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este pacote?')) return
    try {
      await packageService.deletePredefined(id)
      toast.success('Pacote excluído!')
      loadData()
    } catch (error: any) {
      toast.error('Erro ao excluir pacote')
    }
  }

  const handleSuccess = () => {
    loadData()
  }

  const columns = [
    {
      key: 'name',
      label: 'Pacote',
      sortable: true,
      render: (pkg: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
            <PackageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-medium">{pkg.name}</div>
            {pkg.services_included && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Scissors className="w-3 h-3" />
                {pkg.services_included.length} serviço(s)
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Descrição',
      render: (pkg: any) => (
        <div className="text-sm text-gray-600 max-w-md truncate">
          {pkg.description || '-'}
        </div>
      ),
    },
    {
      key: 'total_value',
      label: 'Valor',
      render: (pkg: any) => (
        <div className="flex items-center gap-1 font-semibold text-primary">
          <DollarSign className="w-4 h-4" />
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            pkg.total_value || 0
          )}
        </div>
      ),
    },
    {
      key: 'validity_days',
      label: 'Validade',
      render: (pkg: any) => (
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          {pkg.validity_days} dia(s)
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (pkg: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
            pkg.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {pkg.is_active ? (
            <>
              <CheckCircle className="w-3 h-3" />
              Ativo
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3" />
              Inativo
            </>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (pkg: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(pkg)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(pkg.id)}
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
            <h1 className="text-3xl font-bold text-gray-900">Pacotes Predefinidos</h1>
            <p className="text-gray-600 mt-1">Crie pacotes de serviços para vender aos clientes</p>
          </div>
          <button
            onClick={() => {
              setSelectedPackage(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" />
            Novo Pacote
          </button>
        </div>

        <DataTable data={packages} columns={columns} loading={loading} />

        {showModal && (
          <PredefinedPackageForm
            packageData={selectedPackage}
            onClose={() => {
              setShowModal(false)
              setSelectedPackage(null)
            }}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

