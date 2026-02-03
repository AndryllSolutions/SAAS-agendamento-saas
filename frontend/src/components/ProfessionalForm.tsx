'use client'

import { useState, useEffect } from 'react'
import { X, User, Clock, DollarSign, Mail, Phone, MapPin, Calendar, Award } from 'lucide-react'
import { toast } from 'sonner'
import ImageUpload from '@/components/ui/ImageUpload'

interface ProfessionalFormProps {
  professional?: any
  onClose: () => void
  onSuccess: () => void
}

interface WorkingHours {
  [key: string]: {
    enabled: boolean
    start: string
    end: string
  }
}

export default function ProfessionalForm({ professional, onClose, onSuccess }: ProfessionalFormProps) {
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>(professional?.avatar_url || '')
  
  // Update avatarUrl when professional changes
  useEffect(() => {
    if (professional?.avatar_url) {
      setAvatarUrl(professional.avatar_url)
    }
  }, [professional?.avatar_url])
  
  const [formData, setFormData] = useState({
    email: professional?.email || '',
    password: '',
    full_name: professional?.full_name || '',
    phone: professional?.phone || '',
    cpf_cnpj: professional?.cpf_cnpj || '',
    bio: professional?.bio || '',
    date_of_birth: professional?.date_of_birth || '',
    gender: professional?.gender || '',
    address: professional?.address || '',
    city: professional?.city || '',
    state: professional?.state || '',
    postal_code: professional?.postal_code || '',
    specialties: professional?.specialties?.join(', ') || '',
    commission_rate: professional?.commission_rate?.toString() || '0',
    is_active: professional?.is_active !== undefined ? professional.is_active : true,
  })

  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    professional?.working_hours || {
      monday: { enabled: true, start: '09:00', end: '18:00' },
      tuesday: { enabled: true, start: '09:00', end: '18:00' },
      wednesday: { enabled: true, start: '09:00', end: '18:00' },
      thursday: { enabled: true, start: '09:00', end: '18:00' },
      friday: { enabled: true, start: '09:00', end: '18:00' },
      saturday: { enabled: false, start: '09:00', end: '18:00' },
      sunday: { enabled: false, start: '09:00', end: '18:00' },
    }
  )

  const daysOfWeek = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!professional && !formData.password) {
      toast.error('Senha é obrigatória para novos profissionais')
      return
    }
    
    if (formData.password && formData.password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres')
      return
    }
    
    setLoading(true)
    try {
      // Get company_id from localStorage (auth-storage)
      let companyId = 1 // fallback
      try {
        const authStorage = localStorage.getItem('auth-storage')
        if (authStorage) {
          const authData = JSON.parse(authStorage)
          companyId = authData?.state?.user?.company_id || 1
        }
      } catch (e) {
        console.warn('Could not get company_id from auth storage')
      }

      const submitData: any = {
        ...formData,
        // Remove company_id and role - backend sets these automatically
        specialties: formData.specialties
          ? formData.specialties.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
        commission_rate: parseInt(formData.commission_rate) || 0,
        working_hours: workingHours,
        avatar_url: avatarUrl,
      }

      // Remove password if empty (for updates)
      if (!submitData.password) {
        delete submitData.password
      }

      if (professional) {
        // Update via professionals endpoint
        const { professionalService } = await import('@/services/api')
        await professionalService.update(professional.id, submitData)
        toast.success('Profissional atualizado!')
      } else {
        // Create via professionals endpoint
        const { professionalService } = await import('@/services/api')
        
        const createData = {
          email: submitData.email,
          password: submitData.password,
          full_name: submitData.full_name,
          phone: submitData.phone,
          cpf_cnpj: submitData.cpf_cnpj,
          bio: submitData.bio,
          date_of_birth: submitData.date_of_birth,
          gender: submitData.gender,
          address: submitData.address,
          city: submitData.city,
          state: submitData.state,
          postal_code: submitData.postal_code,
          specialties: submitData.specialties,
          commission_rate: submitData.commission_rate,
          working_hours: submitData.working_hours,
          avatar_url: submitData.avatar_url,
          send_invite_email: true,
        }
        
        await professionalService.create(createData)
        toast.success('Profissional criado!')
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      // Handle specific error codes
      if (error.response?.status === 409) {
        // Conflict - duplicate email
        const message = error.response?.data?.detail || 'Email já cadastrado'
        toast.error(message, { duration: 5000 })
        // Focus on email field to help user fix the issue
        const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement
        if (emailInput) {
          emailInput.focus()
          emailInput.select()
        }
      } else if (error.response?.status === 402) {
        // Payment required - plan limit reached
        toast.error('Limite de profissionais atingido. Faça upgrade do seu plano.', { duration: 6000 })
      } else {
        // Generic error
        toast.error(error.response?.data?.detail || error.message || 'Erro ao salvar profissional')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleWorkingHoursChange = (day: string, field: string, value: any) => {
    setWorkingHours({
      ...workingHours,
      [day]: {
        ...workingHours[day],
        [field]: value,
      },
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {professional ? 'Editar Profissional' : 'Novo Profissional'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium mb-2">Foto do Profissional</label>
            {professional ? (
              <ImageUpload
                value={avatarUrl}
                onChange={(url) => {
                  setAvatarUrl(url)
                  // Update professional avatar via API
                  import('@/services/api').then(({ professionalService }) => {
                    professionalService.update(professional.id, { avatar_url: url }).catch(() => {
                      toast.error('Erro ao atualizar foto')
                    })
                  })
                }}
                folder="professionals"
                prefix={`prof_${professional.id}`}
                label="Foto do Profissional"
              />
            ) : (
              <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                Salve o profissional primeiro para fazer upload de foto
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                  disabled={!!professional}
                />
                {professional && (
                  <p className="text-xs text-gray-500 mt-1">Email não pode ser alterado</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {professional ? 'Nova Senha (deixe em branco para manter)' : 'Senha'} {!professional && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required={!professional}
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telefone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CPF/CNPJ</label>
                <input
                  type="text"
                  value={formData.cpf_cnpj}
                  onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Data de Nascimento</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gênero</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Selecione</option>
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                  <option value="other">Outro</option>
                  <option value="prefer_not_to_say">Prefiro não informar</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Endereço
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Endereço</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cidade</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="SP"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CEP</label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Informações Profissionais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Especialidades</label>
                <input
                  type="text"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Ex: Corte, Barba, Coloração (separadas por vírgula)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separe as especialidades por vírgula
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Comissão (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Breve descrição sobre o profissional..."
                />
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horários de Trabalho
            </h3>
            <div className="space-y-3">
              {daysOfWeek.map((day) => (
                <div key={day.key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer min-w-[150px]">
                    <input
                      type="checkbox"
                      checked={workingHours[day.key].enabled}
                      onChange={(e) => handleWorkingHoursChange(day.key, 'enabled', e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium">{day.label}</span>
                  </label>
                  
                  {workingHours[day.key].enabled && (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={workingHours[day.key].start}
                        onChange={(e) => handleWorkingHoursChange(day.key, 'start', e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                      />
                      <span className="text-gray-500">até</span>
                      <input
                        type="time"
                        value={workingHours[day.key].end}
                        onChange={(e) => handleWorkingHoursChange(day.key, 'end', e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                      />
                    </div>
                  )}
                  
                  {!workingHours[day.key].enabled && (
                    <span className="text-sm text-gray-400">Não trabalha</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="border-t pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium">Profissional ativo</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Profissionais inativos não aparecerão nos agendamentos
            </p>
          </div>

          {/* Actions */}
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
              disabled={loading}
            >
              {loading ? 'Salvando...' : professional ? 'Atualizar Profissional' : 'Criar Profissional'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

