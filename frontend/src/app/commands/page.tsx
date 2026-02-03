'use client'

import { useState, useEffect } from 'react'
import { commandService, clientService } from '@/services/api'
import { Plus, Edit, Trash2, CheckCircle, Eye } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'
import CommandForm from '@/components/CommandForm'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function CommandsPage() {
  const [commands, setCommands] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedCommand, setSelectedCommand] = useState<any>(null)

  useEffect(() => {
    loadCommands()
  }, [])

  const loadCommands = async () => {
    try {
      const [commandsRes, clientsRes] = await Promise.all([
        commandService.list(),
        clientService.list(),
      ])
      setCommands(commandsRes.data || [])
      setClients(clientsRes.data || [])
    } catch (error) {
      toast.error('Erro ao carregar comandas')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    loadCommands()
  }

  const columns = [
    {
      key: 'number',
      label: 'Número',
      sortable: true,
    },
    {
      key: 'client',
      label: 'Cliente',
      render: (command: any) => {
        const client = clients.find((item) => item.id === command.client_crm_id)
        return client?.full_name || '-'
      },
    },
    {
      key: 'date',
      label: 'Data',
      render: (command: any) => {
        const dateValue = command.date || command.created_at
        return dateValue ? format(new Date(dateValue), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-'
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (command: any) => {
        const status = String(command.status || '').toLowerCase()
        const statusLabel = status || 'open'
        const statusClass =
          status === 'finished'
            ? 'bg-green-100 text-green-800'
            : status === 'cancelled'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'

        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>{statusLabel}</span>
        )
      },
    },
    {
      key: 'total_value',
      label: 'Total',
      render: (command: any) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
          command.total_value || 0
        ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (command: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedCommand(command)
              setShowModal(true)
            }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title={command.status === 'FINISHED' ? 'Visualizar' : 'Editar'}
          >
            {command.status === 'FINISHED' ? (
              <Eye className="w-4 h-4" />
            ) : (
              <Edit className="w-4 h-4" />
            )}
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
            <h1 className="text-2xl font-bold text-gray-900">Comandas</h1>
            <p className="text-gray-600">Gerencie as comandas</p>
          </div>
          <button
            onClick={() => {
              setSelectedCommand(null)
              setShowModal(true)
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Comanda
          </button>
        </div>

        <DataTable data={commands} columns={columns} loading={loading} />

        {showModal && (
          <CommandForm
            command={selectedCommand}
            onClose={() => {
              setShowModal(false)
              setSelectedCommand(null)
            }}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

