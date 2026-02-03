'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, Edit, Trash2, MessageSquare, Eye, EyeOff, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { whatsappService, WhatsAppTemplate } from '@/services/whatsappService'

export default function WhatsAppTemplatesPage() {
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null)
  const [showVariables, setShowVariables] = useState<number | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const data = await whatsappService.listTemplates()
      setTemplates(data)
    } catch (error: any) {
      console.error('Erro ao carregar templates:', error)
      toast.error('Erro ao carregar templates')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setShowCreateModal(true)
  }

  const handleEdit = (template: WhatsAppTemplate) => {
    setEditingTemplate(template)
    setShowCreateModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este template?')) return

    try {
      await whatsappService.deleteTemplate(id)
      toast.success('Template excluído com sucesso!')
      loadTemplates()
    } catch (error: any) {
      console.error('Erro ao excluir template:', error)
      toast.error('Erro ao excluir template')
    }
  }

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await whatsappService.updateTemplate(id, { is_active: !isActive })
      toast.success(`Template ${!isActive ? 'ativado' : 'desativado'}!`)
      loadTemplates()
    } catch (error: any) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status do template')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado para área de transferência!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Templates de Mensagem
          </h1>
          <p className="text-gray-600">
            Crie e gerencie templates reutilizáveis para suas campanhas
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 shadow-md"
        >
          <Plus className="w-5 h-5" />
          Novo Template
        </button>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`bg-white border rounded-lg p-6 transition-all ${
              template.is_active
                ? 'border-green-300 shadow-sm'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {template.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {template.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-2">Preview:</div>
                  <div className="bg-white p-3 rounded text-sm whitespace-pre-wrap">
                    {template.content.length > 200 
                      ? template.content.substring(0, 200) + '...'
                      : template.content
                    }
                  </div>
                </div>

                {/* Variables */}
                {template.available_variables && template.available_variables.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowVariables(showVariables === template.id ? null : template.id)}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      {showVariables === template.id ? 'Ocultar' : 'Ver'} Variáveis
                    </button>
                    {showVariables === template.id && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {template.available_variables.map((variable) => (
                          <span
                            key={variable}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {`{variable}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Criado em {new Date(template.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => copyToClipboard(template.content)}
                  className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                  title="Copiar template"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleActive(template.id, template.is_active)}
                  className={`p-2 rounded-lg ${
                    template.is_active
                      ? 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                      : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                  }`}
                  title={template.is_active ? 'Desativar' : 'Ativar'}
                >
                  {template.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEdit(template)}
                  className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {templates.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum template encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            Crie seu primeiro template para usar em campanhas de WhatsApp
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" />
            Criar Primeiro Template
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <TemplateModal
          template={editingTemplate}
          onClose={() => {
            setShowCreateModal(false)
            setEditingTemplate(null)
            loadTemplates()
          }}
        />
      )}
    </div>
  )
}

// Modal de Template
function TemplateModal({ 
  template, 
  onClose 
}: { 
  template: WhatsAppTemplate | null
  onClose: () => void 
}) {
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(template?.name || '')
  const [content, setContent] = useState(template?.content || '')
  const [isActive, setIsActive] = useState(template?.is_active ?? true)
  const [variables, setVariables] = useState(template?.available_variables || [])

  const availableVariables = [
    'nome_cliente',
    'nome_empresa', 
    'data_agendamento',
    'hora_agendamento',
    'servico',
    'profissional',
    'valor',
    'endereco',
    'telefone',
    'link_agendamento'
  ]

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('O nome é obrigatório')
      return
    }

    if (!content.trim()) {
      toast.error('O conteúdo é obrigatório')
      return
    }

    try {
      setSaving(true)
      
      const data = {
        name: name.trim(),
        content: content.trim(),
        available_variables: variables,
        is_active: isActive
      }

      if (template) {
        await whatsappService.updateTemplate(template.id, data)
        toast.success('Template atualizado com sucesso!')
      } else {
        await whatsappService.createTemplate(data)
        toast.success('Template criado com sucesso!')
      }

      onClose()
    } catch (error: any) {
      console.error('Erro ao salvar template:', error)
      toast.error('Erro ao salvar template')
    } finally {
      setSaving(false)
    }
  }

  const insertVariable = (variable: string) => {
    setContent(prev => prev + `{${variable}}`)
  }

  const toggleVariable = (variable: string) => {
    setVariables(prev => 
      prev.includes(variable) 
        ? prev.filter(v => v !== variable)
        : [...prev, variable]
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {template ? 'Editar Template' : 'Novo Template'}
            </h2>
            <p className="text-sm text-gray-600">
              {template ? 'Altere as informações do template' : 'Crie um novo template reutilizável'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Template
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ex: Mensagem de Aniversário"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo da Mensagem
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
              placeholder="Digite sua mensagem... Use {variável} para personalização"
            />
            <p className="text-xs text-gray-500 mt-1">
              {content.length} caracteres
            </p>
          </div>

          {/* Variables */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variáveis Disponíveis
            </label>
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {availableVariables.map((variable) => (
                  <button
                    key={variable}
                    onClick={() => insertVariable(variable)}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-100"
                  >
                    {`{variable}`}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="text-sm text-gray-600 mb-2">Variáveis selecionadas:</div>
              <div className="flex flex-wrap gap-2">
                {variables.map((variable) => (
                  <button
                    key={variable}
                    onClick={() => toggleVariable(variable)}
                    className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium hover:bg-green-100 flex items-center gap-1"
                  >
                    {`{variable}`}
                    <span className="text-green-500">×</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">
                Template ativo
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
