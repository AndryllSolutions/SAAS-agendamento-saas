'use client'

import { useState, useEffect } from 'react'
import { packageService, clientService } from '@/services/api'
import { Plus, Edit, Trash2, Eye, Package as PackageIcon, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import UpsellModal from '@/components/UpsellModal'
import { FeatureWrapper } from '@/components/FeatureWrapper'

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [predefinedPackages, setPredefinedPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [formData, setFormData] = useState({
    client_id: '',
    predefined_package_id: '',
    sale_date: new Date().toISOString().slice(0, 16),
    expiry_date: '',
    paid_value: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [pkgRes, clientsRes, predefinedRes] = await Promise.all([
        packageService.list(),
        clientService.list(),
        packageService.listPredefined(),
      ])
      setPackages(pkgRes.data || [])
      setClients(clientsRes.data || [])
      setPredefinedPackages(predefinedRes.data || [])
    } catch (error: any) {
      if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
        return
      }
      const message = error.response?.data?.detail || 'Erro ao carregar pacotes'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const selectedPredefined = predefinedPackages.find(
        (pkg) => String(pkg.id) === String(formData.predefined_package_id)
      )
      const fallbackExpiry = new Date(
        Date.now() + (selectedPredefined?.validity_days || 90) * 24 * 60 * 60 * 1000
      ).toISOString()

      const submitData = {
        ...formData,
        client_id: parseInt(formData.client_id),
        predefined_package_id: parseInt(formData.predefined_package_id),
        paid_value: parseFloat(formData.paid_value),
        sale_date: formData.sale_date ? new Date(formData.sale_date).toISOString() : new Date().toISOString(),
        expiry_date: formData.expiry_date
          ? new Date(formData.expiry_date).toISOString()
          : fallbackExpiry,
      }

      if (selectedPackage) {
        await packageService.update(selectedPackage.id, submitData)
        toast.success('Pacote atualizado!')
      } else {
        await packageService.create(submitData)
        toast.success('Pacote criado!')
      }
      setShowModal(false)
      setSelectedPackage(null)
      setFormData({
        client_id: '',
        predefined_package_id: '',
        sale_date: new Date().toISOString().slice(0, 16),
        expiry_date: '',
        paid_value: '',
      })
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar pacote')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este pacote?')) return
    try {
      await packageService.update(id, { is_active: false })
      toast.success('Pacote excluído!')
      loadData()
    } catch (error: any) {
      toast.error('Erro ao excluir pacote')
    }
  }

  const handleUseSession = async (id: number) => {
    try {
      await packageService.useSession(id, { appointment_id: null })
      toast.success('Sessão utilizada!')
      loadData()
    } catch (error: any) {
      toast.error('Erro ao utilizar sessão')
    }
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'client_id', 
      label: 'Cliente',
      render: (pkg: any) => {
        const client = clients.find(c => c.id === pkg.client_id)
        return client?.full_name || 'N/A'
      }
    },
    { 
      key: 'sessions_used', 
      label: 'Sessões',
      render: (pkg: any) => `${pkg.sessions_used || 0}/${pkg.sessions_total || 0}`
    },
    { 
      key: 'expires_at', 
      label: 'Expira em',
      render: (pkg: any) => pkg.expires_at ? new Date(pkg.expires_at).toLocaleDateString('pt-BR') : 'N/A'
    },
    {
      key: 'status',
      label: 'Status',
      render: (pkg: any) => {
        const used = pkg.sessions_used || 0
        const total = pkg.sessions_total || 0
        if (used >= total) return <span className="text-red-600">Esgotado</span>
        if (pkg.expires_at && new Date(pkg.expires_at) < new Date()) return <span className="text-orange-600">Expirado</span>
        return <span className="text-green-600">Ativo</span>
      }
    },
  ]

  if (loading && packages.length === 0) {
    return (
      <DashboardLayout>
        <LoadingState message="Carregando pacotes..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <FeatureWrapper feature="packages" asCard={true}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pacotes de Clientes</h1>
              <p className="text-gray-600 mt-1">Gerencie pacotes de serviços vendidos aos clientes</p>
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

          {error && packages.length === 0 && (
            <ErrorState
              title="Erro ao carregar pacotes"
              message={error}
              onRetry={loadData}
            />
          )}

          {!error && (
            <DataTable
              data={packages}
              columns={columns}
              loading={loading}
              actions={(pkg) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUseSession(pkg.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Usar Sessão"
                  >
                    <PackageIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPackage(pkg)
                      setFormData({
                        client_id: String(pkg.client_id || ''),
                        predefined_package_id: String(pkg.predefined_package_id || ''),
                        sale_date: pkg.sale_date ? new Date(pkg.sale_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                        expiry_date: pkg.expiry_date ? new Date(pkg.expiry_date).toISOString().slice(0, 16) : '',
                        paid_value: pkg.paid_value ? String(pkg.paid_value) : '',
                      })
                      setShowModal(true)
                    }}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            />
          )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {selectedPackage ? 'Editar Pacote' : 'Novo Pacote'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cliente</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Selecione...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pacote Predefinido</label>
                  <select
                    value={formData.predefined_package_id}
                    onChange={(e) => setFormData({ ...formData, predefined_package_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Selecione...</option>
                    {predefinedPackages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data da Venda</label>
                  <input
                    type="datetime-local"
                    value={formData.sale_date}
                    onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valor Pago</label>
                  <input
                    type="number"
                    value={formData.paid_value}
                    onChange={(e) => setFormData({ ...formData, paid_value: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data de Expiração</label>
                  <input
                    type="datetime-local"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setSelectedPackage(null)
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
        </FeatureWrapper>
      </div>
    </DashboardLayout>
  )
}

