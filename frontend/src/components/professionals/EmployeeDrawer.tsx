'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Drawer, useDrawerStack } from './DrawerStackManager'
import EmployeeSubnav, { EmployeeSection } from './EmployeeSubnav'
import CadastroSection from './sections/CadastroSection'
import EnderecoSection from './sections/EnderecoSection'
import UsuarioSection from './sections/UsuarioSection'
import AssinaturaSection from './sections/AssinaturaSection'
import ExpedienteSection from './sections/ExpedienteSection'
import ServicosSection from './sections/ServicosSection'
import ComissoesConfigSection from './sections/ComissoesConfigSection'
import ComissoesAuxiliaresSection from './sections/ComissoesAuxiliaresSection'
import PagarSalarioSection from './sections/PagarSalarioSection'
import ValesSection from './sections/ValesSection'
import PermissoesSection from './sections/PermissoesSection'
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
  // Adicionar outros campos conforme necessário
  cpf_cnpj?: string
  date_of_birth?: string
  bio?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  working_hours?: any
}

interface EmployeeDrawerProps {
  employee: Employee
  onClose: () => void
  onSave?: (data: Partial<Employee>) => void
}

export default function EmployeeDrawer({ employee, onClose, onSave }: EmployeeDrawerProps) {
  const [activeSection, setActiveSection] = useState<EmployeeSection>('cadastro')
  const [hasChanges, setHasChanges] = useState(false)
  const { closeDrawer } = useDrawerStack()

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('Você tem alterações não salvas. Deseja sair mesmo assim?')) {
        onClose()
        closeDrawer(1)
      }
    } else {
      onClose()
      closeDrawer(1)
    }
  }

  const handleSave = () => {
    // Implementar lógica de salvamento
    if (onSave) {
      onSave(employee)
    }
    setHasChanges(false)
  }

  const getFullImageUrl = (url: string | undefined | null): string | null => toAbsoluteImageUrl(url)

  const renderSection = () => {
    switch (activeSection) {
      case 'cadastro':
        return <CadastroSection employee={employee} onUpdate={setHasChanges} />
      case 'endereco':
        return <EnderecoSection employee={employee} onUpdate={setHasChanges} />
      case 'usuario':
        return <UsuarioSection employee={employee} onUpdate={setHasChanges} />
      case 'assinatura':
        return <AssinaturaSection employee={employee} onUpdate={setHasChanges} />
      case 'expediente':
        return <ExpedienteSection employee={employee} onUpdate={setHasChanges} />
      case 'servicos':
        return <ServicosSection employee={employee} onUpdate={setHasChanges} />
      case 'comissoes-config':
        return <ComissoesConfigSection employee={employee} onUpdate={setHasChanges} />
      case 'comissoes-auxiliares':
        return <ComissoesAuxiliaresSection employee={employee} onUpdate={setHasChanges} />
      case 'pagar-salario':
        return <PagarSalarioSection employee={employee} onUpdate={setHasChanges} />
      case 'vales':
        return <ValesSection employee={employee} onUpdate={setHasChanges} />
      case 'permissoes':
        return <PermissoesSection employee={employee} onUpdate={setHasChanges} />
      default:
        return <CadastroSection employee={employee} onUpdate={setHasChanges} />
    }
  }

  return (
    <Drawer
      title=""
      onClose={handleClose}
      width="wide"
      className="overflow-hidden"
    >
      {/* Custom Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
        <div className="flex items-center space-x-3">
          {getFullImageUrl(employee.avatar_url) ? (
            <img
              src={getFullImageUrl(employee.avatar_url) as string}
              alt={employee.full_name}
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {employee.full_name.charAt(0).toUpperCase()}
            </div>
          )}
          <h2 className="text-lg font-semibold text-gray-900">{employee.full_name}</h2>
        </div>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body with Subnav and Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Subnav */}
        <EmployeeSubnav
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {renderSection()}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 shrink-0">
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Salvar
          </button>
        </div>
      </div>
    </Drawer>
  )
}
