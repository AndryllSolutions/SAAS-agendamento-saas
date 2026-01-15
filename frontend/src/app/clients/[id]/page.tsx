'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { clientService } from '@/services/api'
import { ArrowLeft, Edit, Trash2, User, Calendar, MapPin, Phone, Mail, CreditCard, Package, MessageSquare, FileText, DollarSign, TrendingUp, Settings, Hash, Users, Instagram, Facebook } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'

interface Client {
  id: number
  full_name: string
  nickname?: string
  email?: string
  phone?: string
  cellphone?: string
  date_of_birth?: string
  cpf?: string
  cnpj?: string
  address?: string
  address_number?: string
  address_complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zip_code?: string
  credits: number
  marketing_whatsapp: boolean
  marketing_email: boolean
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = parseInt(params.id as string)
  
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('cadastro')

  useEffect(() => {
    loadClient()
  }, [clientId])

  const loadClient = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await clientService.get(clientId)
      setClient(response.data)
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao carregar cliente'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return
    
    try {
      await clientService.delete(clientId)
      toast.success('Cliente excluído com sucesso!')
      router.push('/clients')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao excluir cliente'
      toast.error(errorMessage)
    }
  }

  const tabs = [
    { id: 'cadastro', label: 'Cadastro', icon: User },
    { id: 'painel', label: 'Painel', icon: TrendingUp },
    { id: 'debitos', label: 'Débitos', icon: DollarSign },
    { id: 'creditos', label: 'Créditos', icon: CreditCard },
    { id: 'cashback', label: 'Cashback', icon: CreditCard },
    { id: 'agendamentos', label: 'Agendamentos', icon: Calendar },
    { id: 'vendas', label: 'Vendas', icon: Package },
    { id: 'pacotes', label: 'Pacotes', icon: Package },
    { id: 'mensagens', label: 'Mensagens', icon: MessageSquare },
    { id: 'anotacoes', label: 'Anotações', icon: FileText },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState message="Carregando cliente..." />
      </DashboardLayout>
    )
  }

  if (error || !client) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Erro ao carregar cliente"
          message={error || 'Cliente não encontrado'}
          onRetry={loadClient}
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/clients')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{client.full_name}</h1>
                <p className="text-gray-600">{client.nickname && `Apelido: ${client.nickname}`}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/clients/${client.id}/edit`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Menu Lateral */}
          <div className="w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1">
            {/* Aba Cadastro */}
            {activeTab === 'cadastro' && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Dados do Cliente</h2>
                
                <div className="grid grid-cols-3 gap-6">
                  {/* Foto/Avatar */}
                  <div className="col-span-1">
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                    <button className="mt-2 text-sm text-blue-600 hover:underline">
                      Alterar foto
                    </button>
                  </div>

                  {/* Informações Básicas */}
                  <div className="col-span-2 space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Identificação</h3>
                      <div className="space-y-2">
                        <p><strong>Nome:</strong> {client.full_name}</p>
                        {client.nickname && <p><strong>Apelido:</strong> {client.nickname}</p>}
                        {client.email && (
                          <p className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <strong>Email:</strong> {client.email}
                          </p>
                        )}
                        {client.cellphone && (
                          <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <strong>Celular:</strong> {client.cellphone}
                          </p>
                        )}
                        {client.phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <strong>Telefone:</strong> {client.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Dados Pessoais</h3>
                      <div className="space-y-2">
                        {client.date_of_birth && (
                          <p className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <strong>Aniversário:</strong> {new Date(client.date_of_birth).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                        {client.cpf && <p><strong>CPF:</strong> {client.cpf}</p>}
                        {client.cnpj && <p><strong>CNPJ:</strong> {client.cnpj}</p>}
                      </div>
                    </div>

                    {(client.address || client.city || client.state) && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Endereço</h3>
                        <p className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-1" />
                          <span>
                            {client.address && `${client.address}`}
                            {client.address_number && `, ${client.address_number}`}
                            {client.address_complement && ` - ${client.address_complement}`}
                            {client.neighborhood && `, ${client.neighborhood}`}
                            {client.city && ` - ${client.city}`}
                            {client.state && `/${client.state}`}
                            {client.zip_code && ` - CEP: ${client.zip_code}`}
                          </span>
                        </p>
                      </div>
                    )}

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Configurações</h3>
                      <div className="space-y-2">
                        <p>
                          <strong>Status:</strong>{' '}
                          <span className={`px-2 py-1 rounded text-xs ${
                            client.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {client.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </p>
                        <p>
                          <strong>Marketing WhatsApp:</strong>{' '}
                          <span className={`px-2 py-1 rounded text-xs ${
                            client.marketing_whatsapp ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {client.marketing_whatsapp ? 'Sim' : 'Não'}
                          </span>
                        </p>
                        <p>
                          <strong>Marketing Email:</strong>{' '}
                          <span className={`px-2 py-1 rounded text-xs ${
                            client.marketing_email ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {client.marketing_email ? 'Sim' : 'Não'}
                          </span>
                        </p>
                        <p><strong>Créditos:</strong> R$ {client.credits.toFixed(2)}</p>
                      </div>
                    </div>

                    {client.notes && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Observações</h3>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded">{client.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Painéis Laterais */}
                <div className="mt-8 grid grid-cols-3 gap-6">
                  {/* Endereço Detalhado */}
                  {(client.address || client.city) && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Endereço
                      </h3>
                      <div className="text-sm space-y-1">
                        {client.address && <p>{client.address}</p>}
                        {client.address_number && <p>Número: {client.address_number}</p>}
                        {client.address_complement && <p>Complemento: {client.address_complement}</p>}
                        {client.neighborhood && <p>Bairro: {client.neighborhood}</p>}
                        {client.city && <p>{client.city} - {client.state}</p>}
                        {client.zip_code && <p>CEP: {client.zip_code}</p>}
                      </div>
                    </div>
                  )}

                  {/* Redes Sociais */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Redes Sociais</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Instagram className="w-4 h-4" />
                        <span className="text-sm">Não informado</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Facebook className="w-4 h-4" />
                        <span className="text-sm">Não informado</span>
                      </div>
                    </div>
                  </div>

                  {/* Configurações Adicionais */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Configurações
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Desconto padrão:</strong> Não definido</p>
                      <p><strong>Bloquear acesso:</strong> Não</p>
                      <p><strong>Notificações:</strong> Ativas</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Aba Painel */}
            {activeTab === 'painel' && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Painel do Cliente</h2>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">Total em Serviços</p>
                    <p className="text-2xl font-bold text-blue-900">R$ 0,00</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Créditos</p>
                    <p className="text-2xl font-bold text-green-900">R$ {client.credits.toFixed(2)}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600">Agendamentos</p>
                    <p className="text-2xl font-bold text-purple-900">0</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-orange-600">Última Visita</p>
                    <p className="text-2xl font-bold text-orange-900">-</p>
                  </div>
                </div>
                <p className="text-gray-500">Dados do painel serão implementados com base nos agendamentos e histórico do cliente.</p>
              </div>
            )}

            {/* Demais Abas (Placeholder) */}
            {activeTab !== 'cadastro' && activeTab !== 'painel' && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6 capitalize">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                <p className="text-gray-500">
                  Funcionalidade em desenvolvimento. Esta aba exibirá informações de {activeTab} do cliente.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
