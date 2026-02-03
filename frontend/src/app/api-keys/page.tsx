'use client'

import { useState, useEffect } from 'react'
import { apiKeyService } from '@/services/api'
import { Plus, Copy, Eye, EyeOff, RefreshCw, Trash2, AlertTriangle, Key, Check } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import { formatApiError } from '@/utils/errorHandler'

interface APIKey {
  id: number
  name: string
  key_prefix: string
  description?: string
  scopes: string[]
  is_active: boolean
  expires_at?: string
  last_used_at?: string
  usage_count: number
  created_at: string
}

interface Scope {
  value: string
  label: string
  description: string
}

export default function APIKeysPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newKeyModal, setNewKeyModal] = useState(false)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null)
  const [availableScopes, setAvailableScopes] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scopes: ['appointments:read'] as string[],
    expires_at: null as string | null,
  })

  useEffect(() => {
    loadApiKeys()
    loadScopes()
  }, [])

  const loadApiKeys = async () => {
    setLoading(true)
    try {
      const response = await apiKeyService.list()
      setApiKeys(response.data || [])
    } catch (error: any) {
      toast.error(formatApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const loadScopes = async () => {
    try {
      const response = await apiKeyService.getScopes()
      setAvailableScopes(response.data.descriptions || {})
    } catch (error: any) {
      console.error('Failed to load scopes:', error)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await apiKeyService.create(formData)
      setCreatedKey(response.data.api_key)
      setNewKeyModal(true)
      setShowModal(false)
      setFormData({
        name: '',
        description: '',
        scopes: ['appointments:read'],
        expires_at: null,
      })
      await loadApiKeys()
      toast.success('API Key criada com sucesso!')
    } catch (error: any) {
      toast.error(formatApiError(error))
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja revogar esta API Key? Esta ação não pode ser desfeita.')) {
      return
    }
    
    try {
      await apiKeyService.delete(id)
      toast.success('API Key revogada!')
      await loadApiKeys()
    } catch (error: any) {
      toast.error(formatApiError(error))
    }
  }

  const handleRotate = async (id: number) => {
    if (!confirm('Tem certeza que deseja rotacionar esta API Key? A chave antiga será invalidada.')) {
      return
    }
    
    try {
      const response = await apiKeyService.rotate(id)
      setCreatedKey(response.data.api_key)
      setNewKeyModal(true)
      await loadApiKeys()
      toast.success('API Key rotacionada!')
    } catch (error: any) {
      toast.error(formatApiError(error))
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copiado para área de transferência!')
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleScope = (scope: string) => {
    setFormData(prev => {
      const newScopes = prev.scopes.includes(scope)
        ? prev.scopes.filter(s => s !== scope)
        : [...prev.scopes, scope]
      return { ...prev, scopes: newScopes }
    })
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Nunca'
    return new Date(dateStr).toLocaleString('pt-BR')
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Key className="w-7 h-7 text-purple-600" />
            API Keys
          </h1>
          <p className="text-gray-600 mt-1">
            Crie e gerencie chaves de API para integrações externas
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm text-yellow-700">
                <strong>Importante:</strong> As chaves de API são mostradas apenas uma vez após a criação.
                Armazene-as com segurança. Nunca compartilhe suas chaves publicamente.
              </p>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={() => setShowModal(true)}
          className="mb-6 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova API Key
        </button>

        {/* API Keys List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma API Key</h3>
            <p className="text-gray-500 mb-6">Crie sua primeira API Key para começar a integrar</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Criar API Key
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{key.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          key.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {key.is_active ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    
                    {key.description && (
                      <p className="text-gray-600 text-sm mb-3">{key.description}</p>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                        {key.key_prefix}{'*'.repeat(48)}
                      </code>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {key.scopes.map((scope) => (
                        <span
                          key={scope}
                          className="bg-purple-100 text-purple-700 px-2 py-1 text-xs rounded-full"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Uso:</span>
                        <span className="ml-2 font-medium">{key.usage_count}x</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Último uso:</span>
                        <span className="ml-2 font-medium">{formatDate(key.last_used_at)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Criada:</span>
                        <span className="ml-2 font-medium">{formatDate(key.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleRotate(key.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Rotacionar key"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(key.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Revogar key"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Criar Nova API Key</h2>
              
              <form onSubmit={handleCreate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="Ex: Integração WhatsApp"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="Descrição do uso desta API Key..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Permissões (Scopes)
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      {Object.entries(availableScopes).map(([scope, description]) => (
                        <label
                          key={scope}
                          className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.scopes.includes(scope)}
                            onChange={() => toggleScope(scope)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-mono text-sm text-purple-600">{scope}</div>
                            <div className="text-xs text-gray-500">{description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
                  >
                    Criar API Key
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* New Key Modal */}
        {newKeyModal && createdKey && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">API Key Criada!</h2>
                <p className="text-gray-600">
                  Copie e salve esta chave agora. Ela <strong>não será mostrada novamente</strong>.
                </p>
              </div>
              
              <div className="bg-gray-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Sua API Key:</label>
                  <button
                    onClick={() => copyToClipboard(createdKey)}
                    className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <code className="block bg-white border border-gray-200 p-3 rounded text-sm font-mono break-all">
                  {createdKey}
                </code>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-sm text-yellow-700">
                  <strong>Atenção:</strong> Armazene esta chave em um local seguro (variáveis de ambiente, gerenciador de senhas, etc.).
                  Nunca compartilhe ou commite no código.
                </p>
              </div>
              
              <button
                onClick={() => {
                  setNewKeyModal(false)
                  setCreatedKey(null)
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium"
              >
                Entendi, salvei a chave
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

