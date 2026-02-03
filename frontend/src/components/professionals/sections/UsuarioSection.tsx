'use client'

import { useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

interface Employee {
  id: number
  email: string
}

interface UsuarioSectionProps {
  employee: Employee
  onUpdate: (hasChanges: boolean) => void
}

export default function UsuarioSection({ employee, onUpdate }: UsuarioSectionProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: employee.email || '',
    password: '',
    confirmPassword: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    onUpdate(true)
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        {/* Banner informativo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Informações de acesso</h4>
              <p className="text-sm text-blue-700 mt-1">
                Configure as credenciais de acesso do profissional ao sistema. O e-mail será usado como login.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dados de acesso</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="exemplo@email.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este e-mail será usado para login no sistema
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite uma nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Deixe em branco para manter a senha atual
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar nova senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirme a nova senha"
                  />
                </div>
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    As senhas não coincidem
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Informações de segurança */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Requisitos da senha</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Mínimo de 8 caracteres</li>
              <li>• Pelo menos uma letra maiúscula</li>
              <li>• Pelo menos uma letra minúscula</li>
              <li>• Pelo menos um número</li>
              <li>• Recomendado: pelo menos um caractere especial</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
