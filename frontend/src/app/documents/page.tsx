'use client'

import { useState, useEffect } from 'react'
import { documentService, clientService } from '@/services/api'
import { Plus, Edit, Trash2, FileText, Download, Eye, RefreshCw, Printer } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [formData, setFormData] = useState({
    template_id: '',
    client_id: '',
    title: '',
    content: '',
    variables: {} as Record<string, any>
  })

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [documentsRes, templatesRes, clientsRes] = await Promise.all([
        documentService.list(),
        documentService.listTemplates(),
        clientService.list(),
      ])
      
      setDocuments(documentsRes.data || [])
      setTemplates(templatesRes.data || [])
      setClients(clientsRes.data || [])
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao carregar documentos'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await documentService.generate({
        template_id: parseInt(formData.template_id),
        client_id: formData.client_id ? parseInt(formData.client_id) : undefined,
        variables: formData.variables
      })
      toast.success('Documento gerado com sucesso!')
      setShowModal(false)
      setFormData({
        template_id: '',
        client_id: '',
        title: '',
        content: '',
        variables: {}
      })
      await loadData()
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao gerar documento'
      toast.error(errorMessage)
    }
  }

  const handleDownload = async (documentId: number) => {
    try {
      const response = await documentService.download(documentId)
      
      // Handle PDF blob download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      
      // Create temporary link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = `documento_${documentId}.pdf`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Download realizado com sucesso!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao baixar documento'
      toast.error(errorMessage)
    }
  }

  const getStatusBadge = (isFinalized: boolean) => {
    return isFinalized ? (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        Finalizado
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
        Rascunho
      </span>
    )
  }

  if (loading && documents.length === 0) {
    return (
      <DashboardLayout>
        <LoadingState message="Carregando documentos..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerador de Documentos</h1>
            <p className="text-gray-600 mt-1">Crie documentos personalizados para seus clientes</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={loadData}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar
            </button>
            <button
              onClick={() => {
                setSelectedDocument(null)
                setFormData({
                  template_id: '',
                  client_id: '',
                  title: '',
                  content: '',
                  variables: {}
                })
                setShowModal(true)
              }}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              <Plus className="w-5 h-5" />
              Criar Documento
            </button>
          </div>
        </div>

        {error && documents.length === 0 && (
          <ErrorState
            title="Erro ao carregar documentos"
            message={error}
            onRetry={loadData}
          />
        )}

        {!loading && !error && documents.length === 0 && (
          <EmptyState
            title="Nenhum documento criado"
            message="Comece criando seu primeiro documento personalizado."
            actionLabel="Criar Documento"
            onAction={() => {
              setSelectedDocument(null)
              setFormData({
                template_id: '',
                client_id: '',
                title: '',
                content: '',
                variables: {}
              })
              setShowModal(true)
            }}
          />
        )}

        {!error && documents.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criação</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((doc) => {
                    const client = clients.find(c => c.id === doc.client_id)
                    const template = templates.find(t => t.id === doc.template_id)
                    
                    return (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {doc.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {client?.full_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {template?.document_type || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(!!doc.finalized_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedDocument(doc)
                                setFormData({
                                  template_id: doc.template_id?.toString() || '',
                                  client_id: doc.client_id?.toString() || '',
                                  title: doc.title || '',
                                  content: doc.content || '',
                                  variables: doc.variables_used || {}
                                })
                                setShowModal(true)
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="Visualizar/Editar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(doc.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded"
                              title="Baixar PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => window.print()}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                              title="Imprimir"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {selectedDocument ? 'Editar Documento' : 'Criar Novo Documento'}
              </h2>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Template *</label>
                  <select
                    value={formData.template_id}
                    onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Selecione um template...</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id.toString()}>
                        {template.name} ({template.document_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Cliente</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Selecione um cliente (opcional)</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id.toString()}>
                        {client.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Título do documento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Conteúdo</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 h-40"
                    placeholder="Conteúdo do documento. Use {variável} para placeholders."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use placeholders como {'{nome}'}, {'{data}'}, {'{valor}'} que serão substituídos pelos dados do cliente.
                  </p>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setSelectedDocument(null)
                    }}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 border rounded-lg"
                    onClick={(e) => {
                      e.preventDefault()
                      toast.info('Salvar como rascunho em desenvolvimento')
                    }}
                  >
                    Salvar Rascunho
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Finalizar e Gerar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
