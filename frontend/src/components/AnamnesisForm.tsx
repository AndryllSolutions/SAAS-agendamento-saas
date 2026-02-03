'use client'

import { useState, useEffect } from 'react'
import { anamnesisService, clientService, userService } from '@/services/api'
import { X, FileText, User, Calendar, CheckCircle, PenTool, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface AnamnesisFormProps {
  anamnesis?: any
  clientId?: number
  onClose: () => void
  onSuccess: () => void
}

interface FieldDefinition {
  id: string
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date' | 'email' | 'tel'
  label: string
  placeholder?: string
  required?: boolean
  options?: string[] // Para select, radio, checkbox
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
  helpText?: string
}

export default function AnamnesisForm({ anamnesis, clientId, onClose, onSuccess }: AnamnesisFormProps) {
  const [loading, setLoading] = useState(false)
  const [models, setModels] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [reloadKey, setReloadKey] = useState(0)
  const [selectedModel, setSelectedModel] = useState<any>(null)
  const [fields, setFields] = useState<FieldDefinition[]>([])
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [showSignature, setShowSignature] = useState(false)
  const [signatureData, setSignatureData] = useState<string>('')
  const [signatureName, setSignatureName] = useState('')

  const [formData, setFormData] = useState({
    client_id: anamnesis?.client_id?.toString() || clientId?.toString() || '',
    professional_id: anamnesis?.professional_id?.toString() || '',
    model_id: anamnesis?.model_id?.toString() || '',
  })

  useEffect(() => {
    loadData()
  }, [reloadKey])

  useEffect(() => {
    if (anamnesis) {
      setFormData({
        client_id: anamnesis.client_id?.toString() || '',
        professional_id: anamnesis.professional_id?.toString() || '',
        model_id: anamnesis.model_id?.toString() || '',
      })
      setResponses(anamnesis.responses || {})
      loadModel(anamnesis.model_id)
    }
  }, [anamnesis])

  useEffect(() => {
    if (formData.model_id) {
      loadModel(parseInt(formData.model_id))
    } else {
      setSelectedModel(null)
      setFields([])
    }
  }, [formData.model_id])

  const loadData = async () => {
    try {
      const [modelsRes, clientsRes, professionalsRes] = await Promise.all([
        anamnesisService.listModels(),
        clientService.list(),
        userService.getProfessionals(),
      ])
      setModels(modelsRes.data || [])
      setClients(clientsRes.data || [])
      setProfessionals(professionalsRes.data || [])
    } catch (error) {
      toast.error('Erro ao carregar dados')
    }
  }

  const loadModel = async (modelId: number) => {
    try {
      const response = await anamnesisService.getModel(modelId)
      const model = response.data
      setSelectedModel(model)
      
      // Parse fields from model.fields
      // Expected structure: { "field_id": { "type": "...", "label": "...", ... } }
      const parsedFields: FieldDefinition[] = []
      if (model.fields && typeof model.fields === 'object') {
        Object.entries(model.fields).forEach(([id, fieldDef]: [string, any]) => {
          parsedFields.push({
            id,
            type: fieldDef.type || 'text',
            label: fieldDef.label || id,
            placeholder: fieldDef.placeholder,
            required: fieldDef.required || false,
            options: fieldDef.options || [],
            validation: fieldDef.validation,
            helpText: fieldDef.helpText,
          })
        })
      }
      setFields(parsedFields)
      
      // Initialize responses for new fields
      if (!anamnesis) {
        const initialResponses: Record<string, any> = {}
        parsedFields.forEach(field => {
          if (field.type === 'checkbox') {
            initialResponses[field.id] = []
          } else {
            initialResponses[field.id] = ''
          }
        })
        setResponses(initialResponses)
      }
    } catch (error) {
      toast.error('Erro ao carregar modelo de anamnese')
    }
  }

  const handleResponseChange = (fieldId: string, value: any) => {
    setResponses({
      ...responses,
      [fieldId]: value,
    })
  }

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    const currentValues = responses[fieldId] || []
    if (checked) {
      handleResponseChange(fieldId, [...currentValues, option])
    } else {
      handleResponseChange(fieldId, currentValues.filter((v: string) => v !== option))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.client_id) {
      toast.error('Selecione um cliente')
      return
    }

    if (!formData.model_id) {
      toast.error('Selecione um modelo de anamnese')
      return
    }

    // Validate required fields
    for (const field of fields) {
      if (field.required) {
        const value = responses[field.id]
        if (!value || (Array.isArray(value) && value.length === 0)) {
          toast.error(`Campo "${field.label}" é obrigatório`)
          return
        }
      }
    }

    setLoading(true)
    try {
      const submitData: any = {
        client_id: parseInt(formData.client_id),
        model_id: parseInt(formData.model_id),
        professional_id: formData.professional_id ? parseInt(formData.professional_id) : null,
        responses: responses,
      }

      if (anamnesis) {
        await anamnesisService.update(anamnesis.id, submitData)
        toast.success('Anamnese atualizada!')
      } else {
        const { apiPost } = await import('@/utils/apiClient')
        
        const response = await apiPost('anamneses', submitData)

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.detail || 'Erro ao criar anamnese')
        }

        toast.success('Anamnese criada!')
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || error.response?.data?.detail || 'Erro ao salvar anamnese')
    } finally {
      setLoading(false)
    }
  }

  const handleSign = async () => {
    if (!signatureName.trim()) {
      toast.error('Informe o nome para assinatura')
      return
    }

    if (!anamnesis) {
      toast.error('Salve a anamnese antes de assinar')
      return
    }

    setLoading(true)
    try {
      await anamnesisService.sign(anamnesis.id, {
        signature_image_url: signatureData || null,
        signature_name: signatureName,
      })
      toast.success('Anamnese assinada!')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao assinar anamnese')
    } finally {
      setLoading(false)
    }
  }

  const renderField = (field: FieldDefinition) => {
    const value = responses[field.id] || (field.type === 'checkbox' ? [] : '')

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleResponseChange(field.id, e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            rows={4}
            placeholder={field.placeholder}
            required={field.required}
            disabled={anamnesis?.is_signed}
          />
        )

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleResponseChange(field.id, e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required={field.required}
            disabled={anamnesis?.is_signed}
          >
            <option value="">Selecione...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleResponseChange(field.id, e.target.value)}
                  required={field.required}
                  disabled={anamnesis?.is_signed}
                  className="w-4 h-4"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => handleCheckboxChange(field.id, option, e.target.checked)}
                  disabled={anamnesis?.is_signed}
                  className="w-4 h-4 rounded"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleResponseChange(field.id, e.target.value ? parseFloat(e.target.value) : '')}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder={field.placeholder}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            disabled={anamnesis?.is_signed}
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleResponseChange(field.id, e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required={field.required}
            disabled={anamnesis?.is_signed}
          />
        )

      default:
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleResponseChange(field.id, e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder={field.placeholder}
            required={field.required}
            pattern={field.validation?.pattern}
            disabled={anamnesis?.is_signed}
          />
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            {anamnesis ? 'Editar Anamnese' : 'Nova Anamnese'}
            {anamnesis?.is_signed && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Assinada
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">
                  Cliente <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setReloadKey(prev => prev + 1)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  title="Recarregar clientes"
                >
                  <RefreshCw className="w-4 h-4" />
                  Atualizar
                </button>
              </div>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
                disabled={!!anamnesis || !!clientId}
              >
                <option value="">Selecione um cliente</option>
                {clients.map((client: any) => (
                  <option key={client.id} value={client.id}>
                    {client.full_name} - {client.email || client.cellphone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Modelo de Anamnese <span className="text-red-500">*</span></label>
              <select
                value={formData.model_id}
                onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
                disabled={!!anamnesis}
              >
                <option value="">Selecione um modelo</option>
                {models.map((model: any) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Profissional</label>
              <select
                value={formData.professional_id}
                onChange={(e) => setFormData({ ...formData, professional_id: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                disabled={anamnesis?.is_signed}
              >
                <option value="">Selecione um profissional</option>
                {professionals.map((prof: any) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Fields */}
          {fields.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Formulário</h3>
              <div className="space-y-6">
                {fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderField(field)}
                    {field.helpText && (
                      <p className="text-xs text-gray-500">{field.helpText}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {fields.length === 0 && formData.model_id && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Carregando campos do formulário...</p>
            </div>
          )}

          {!formData.model_id && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Selecione um modelo de anamnese para começar</p>
            </div>
          )}

          {/* Signature */}
          {anamnesis && !anamnesis.is_signed && (
            <div className="border-t pt-6">
              <button
                type="button"
                onClick={() => setShowSignature(true)}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <PenTool className="w-5 h-5" />
                Assinar Anamnese
              </button>
            </div>
          )}

          {anamnesis?.is_signed && (
            <div className="border-t pt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Anamnese Assinada</span>
                </div>
                <p className="text-sm text-green-600">
                  Assinada por: {anamnesis.signature_name}
                </p>
                {anamnesis.signature_date && (
                  <p className="text-sm text-green-600">
                    Data: {new Date(anamnesis.signature_date).toLocaleString('pt-BR')}
                  </p>
                )}
                {anamnesis.signature_image_url && (
                  <div className="mt-3">
                    <img
                      src={anamnesis.signature_image_url}
                      alt="Assinatura"
                      className="max-w-xs border rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {!anamnesis?.is_signed && (
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                disabled={loading || fields.length === 0}
              >
                {loading ? 'Salvando...' : anamnesis ? 'Atualizar Anamnese' : 'Criar Anamnese'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Signature Modal */}
      {showSignature && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Assinar Anamnese</h2>
              <button
                onClick={() => setShowSignature(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome do Assinante <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Assinatura (URL da imagem - opcional)
                </label>
                <input
                  type="text"
                  value={signatureData}
                  onChange={(e) => setSignatureData(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="URL da imagem da assinatura"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Você pode fazer upload da assinatura em outro lugar e colar a URL aqui
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowSignature(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSign}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  disabled={loading || !signatureName.trim()}
                >
                  {loading ? 'Assinando...' : 'Assinar Anamnese'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

