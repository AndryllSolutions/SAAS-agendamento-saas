'use client'

import { useState, useEffect } from 'react'
import { clientService } from '@/services/api'
import { Plus, Edit, Trash2, Eye, Download, Upload, Search, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import ClientModal from '@/components/ClientModal'
import { useRouter } from 'next/navigation'
import { formatApiError } from '@/utils/errorHandler'

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadClients()
  }, [])

  const [error, setError] = useState<string | null>(null)

  const loadClients = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('📥 Carregando clientes...');
      const response = await clientService.list()
      console.log('✅ Clientes carregados:', response.data?.length || 0);
      setClients(response.data || [])
    } catch (error: any) {
      console.error('❌ Erro ao carregar clientes:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      const errorMessage = error.response?.data?.detail || error.message || 'Erro ao carregar clientes'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    setSaving(true)
    try {
      if (selectedClient) {
        await clientService.update(selectedClient.id, data)
        toast.success('Cliente atualizado!')
      } else {
        // Backend preenche company_id automaticamente via context
        await clientService.create(data)
        toast.success('Cliente criado!')
      }
      setShowModal(false)
      setSelectedClient(null)
      await loadClients()
    } catch (error: any) {
      console.error('❌ Erro ao salvar cliente:', error.response?.data)
      toast.error(formatApiError(error))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return
    
    try {
      await clientService.delete(id)
      toast.success('Cliente excluído com sucesso!')
      await loadClients()
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao excluir cliente'
      toast.error(errorMessage)
    }
  }

  const handleEdit = (client: any) => {
    setSelectedClient(client)
    setModalMode('edit')
    setShowModal(true)
  }


  const columns = [
    { key: 'full_name', label: 'Nome', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'cellphone', label: 'Telefone', sortable: false },
    { key: 'city', label: 'Cidade', sortable: true },
    {
      key: 'actions',
      label: 'Ações',
      render: (client: any) => (
        <div className="flex items-center gap-2">
          <button
            disabled
            title="Visualização pelo modal desabilitada"
            className="p-1 text-gray-400 rounded cursor-not-allowed"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(client)
            }}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(client.id)
            }}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  if (loading && clients.length === 0) {
    return (
      <DashboardLayout>
        <LoadingState message="Carregando clientes..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600">Gerencie seus clientes</p>
          </div>
          <button
            onClick={loadClients}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar
          </button>
        </div>

        {error && clients.length === 0 && (
          <ErrorState
            title="Erro ao carregar clientes"
            message={error}
            onRetry={loadClients}
          />
        )}

        {!loading && !error && clients.length === 0 && (
          <EmptyState
            title="Nenhum cliente cadastrado"
            message="Comece adicionando seu primeiro cliente."
            actionLabel="Novo Cliente"
            onAction={() => {
              setSelectedClient(null)
              setShowModal(true)
            }}
          />
        )}

        {!error && clients.length > 0 && (
          <>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.csv,.xlsx'
                  input.onchange = async (e: any) => {
                    const file = e.target.files[0]
                    if (file) {
                      try {
                        await clientService.import(file)
                        toast.success('Clientes importados!')
                        loadClients()
                      } catch (error) {
                        toast.error('Erro ao importar clientes')
                      }
                    }
                  }
                  input.click()
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Importar
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await clientService.export()
                    const url = window.URL.createObjectURL(new Blob([response.data]))
                    const link = document.createElement('a')
                    link.href = url
                    link.setAttribute('download', 'clientes.csv')
                    document.body.appendChild(link)
                    link.click()
                    link.remove()
                    toast.success('Clientes exportados!')
                  } catch (error) {
                    toast.error('Erro ao exportar clientes')
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={() => {
                  setSelectedClient(null)
                  setModalMode('create')
                  setShowModal(true)
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Cliente
              </button>
            </div>

            <DataTable
              data={clients}
              columns={columns}
              loading={loading}
              onRowClick={(client) => router.push(`/clients/${client.id}`)}
            />
          </>
        )}

        <ClientModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedClient(null)
            setModalMode('create')
          }}
          onSubmit={handleSubmit}
          initialData={selectedClient}
          loading={saving}
          mode={modalMode}
        />
      </div>
    </DashboardLayout>
  )
}

