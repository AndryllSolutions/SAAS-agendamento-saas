'use client'

import { Shield, Check, X } from 'lucide-react'

interface Employee {
  id: number
  full_name: string
}

interface PermissoesSectionProps {
  employee: Employee
  onUpdate: (hasChanges: boolean) => void
}

const permissions = [
  { id: 'view_clients', label: 'Visualizar clientes', description: 'Pode ver a lista de clientes' },
  { id: 'edit_clients', label: 'Editar clientes', description: 'Pode criar e editar informações de clientes' },
  { id: 'view_appointments', label: 'Visualizar agendamentos', description: 'Pode ver todos os agendamentos' },
  { id: 'manage_appointments', label: 'Gerenciar agendamentos', description: 'Pode criar, editar e cancelar agendamentos' },
  { id: 'view_reports', label: 'Relatórios', description: 'Acesso a relatórios e estatísticas' },
  { id: 'manage_services', label: 'Gerenciar serviços', description: 'Pode criar e editar serviços' },
  { id: 'view_financial', label: 'Financeiro', description: 'Acesso a informações financeiras' },
  { id: 'manage_financial', label: 'Gerenciar financeiro', description: 'Pode editar informações financeiras' }
]

export default function PermissoesSection({ employee, onUpdate }: PermissoesSectionProps) {
  const handlePermissionChange = (permissionId: string, granted: boolean) => {
    // Implementar lógica de atualização de permissões
    onUpdate(true)
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Permissões
          </h3>
          <p className="text-sm text-gray-500">
            Configure as permissões de acesso do profissional no sistema.
          </p>
        </div>

        {/* Aviso */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900">Atenção</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Seja cuidadoso ao conceder permissões. Algumas permissões podem dar acesso a informações sensíveis.
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Permissões */}
        <div className="space-y-4">
          {permissions.map((permission) => (
            <div key={permission.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{permission.label}</h4>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePermissionChange(permission.id, true)}
                        className="p-2 rounded-lg border-2 border-green-200 hover:bg-green-50 transition-colors"
                        title="Conceder permissão"
                      >
                        <Check className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => handlePermissionChange(permission.id, false)}
                        className="p-2 rounded-lg border-2 border-red-200 hover:bg-red-50 transition-colors"
                        title="Negar permissão"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{permission.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Permissões Especiais */}
        <div className="mt-8">
          <h4 className="font-medium text-gray-900 mb-4">Permissões Especiais</h4>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                onChange={() => onUpdate(true)}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Administrador</span>
                <p className="text-xs text-gray-500">Acesso total ao sistema (use com cuidado)</p>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                onChange={() => onUpdate(true)}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Gerente</span>
                <p className="text-xs text-gray-500">Pode gerenciar outros profissionais</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
