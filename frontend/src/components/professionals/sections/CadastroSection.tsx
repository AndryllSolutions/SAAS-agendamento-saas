'use client'

import { useState } from 'react'
import { Camera, Upload, Trash2 } from 'lucide-react'
import ImageUpload from '@/components/ui/ImageUpload'
import { toAbsoluteImageUrl } from '@/utils/apiUrl'

interface Employee {
  id: number
  full_name: string
  avatar_url?: string
  email: string
  phone?: string
  is_active: boolean
  commission_rate?: number
  specialties?: string[]
  role: string
  cpf_cnpj?: string
  date_of_birth?: string
  bio?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
}

interface CadastroSectionProps {
  employee: Employee
  onUpdate: (hasChanges: boolean) => void
}

export default function CadastroSection({ employee, onUpdate }: CadastroSectionProps) {
  const [formData, setFormData] = useState({
    full_name: employee.full_name || '',
    nickname: '',
    phone: employee.phone || '',
    profession: '',
    date_of_birth: employee.date_of_birth || '',
    cpf_cnpj: employee.cpf_cnpj || '',
    rg: '',
    bio: employee.bio || '',
    is_active: employee.is_active,
    online_booking: true,
    generate_schedule: true,
    receives_commission: employee.commission_rate ? employee.commission_rate > 0 : false,
    commission_rate: employee.commission_rate || 0
  })

  const [avatarUrl, setAvatarUrl] = useState(employee.avatar_url || '')

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    onUpdate(true)
  }

  const getFullImageUrl = (url: string | undefined | null): string | null => toAbsoluteImageUrl(url)

  return (
    <div className="p-6">
      <div className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário - 2 colunas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apelido
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Como prefere ser chamado"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Celular
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profissão
                </label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => handleInputChange('profession', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Cabeleireira, Manicure"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aniversário
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF/CNPJ
                </label>
                <input
                  type="text"
                  value={formData.cpf_cnpj}
                  onChange={(e) => handleInputChange('cpf_cnpj', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RG
                </label>
                <input
                  type="text"
                  value={formData.rg}
                  onChange={(e) => handleInputChange('rg', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="00.000.000-0"
                />
              </div>
            </div>

            {/* Anotações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anotações
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Observações importantes sobre o profissional..."
              />
            </div>

            {/* Configurações */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Configurações</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Ativo</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.online_booking}
                    onChange={(e) => handleInputChange('online_booking', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Disponível para agendamento online</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.generate_schedule}
                    onChange={(e) => handleInputChange('generate_schedule', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Gerar agenda</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.receives_commission}
                    onChange={(e) => handleInputChange('receives_commission', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Recebe comissão</span>
                </label>
              </div>

              {formData.receives_commission && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa de comissão (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.commission_rate}
                    onChange={(e) => handleInputChange('commission_rate', parseInt(e.target.value) || 0)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Avatar - 1 coluna */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Foto do Profissional</h3>
                
                <div className="space-y-4">
                  {/* Avatar Display */}
                  <div className="flex justify-center">
                    {getFullImageUrl(avatarUrl) ? (
                      <img
                        src={getFullImageUrl(avatarUrl) as string}
                        alt={employee.full_name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-semibold">
                        {employee.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Upload Component */}
                  <ImageUpload
                    value={avatarUrl}
                    onChange={(url) => {
                      setAvatarUrl(url)
                      onUpdate(true)
                    }}
                    folder="professionals"
                    prefix={`prof_${employee.id}`}
                    label=""
                  />

                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-3">
                    <button
                      type="button"
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Alterar</span>
                    </button>
                    
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarUrl('')
                          onUpdate(true)
                        }}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remover</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
