'use client'

import { User, MapPin, UserCog, FileSignature, Clock, Wrench, Percent, Users, DollarSign, Receipt, Shield, Badge } from 'lucide-react'

export type EmployeeSection = 
  | 'cadastro' 
  | 'endereco' 
  | 'usuario' 
  | 'assinatura' 
  | 'expediente' 
  | 'servicos' 
  | 'comissoes-config' 
  | 'comissoes-auxiliares' 
  | 'pagar-salario' 
  | 'vales' 
  | 'permissoes'

interface EmployeeSubnavProps {
  activeSection: EmployeeSection
  onSectionChange: (section: EmployeeSection) => void
}

const navItems = [
  { id: 'cadastro' as const, label: 'Cadastro', icon: User },
  { id: 'endereco' as const, label: 'Endereço', icon: MapPin },
  { id: 'usuario' as const, label: 'Usuário', icon: UserCog },
  { id: 'assinatura' as const, label: 'Assinatura digital', icon: FileSignature },
  { id: 'expediente' as const, label: 'Expediente', icon: Clock, badge: 'Novo' },
  { id: 'servicos' as const, label: 'Personalizar serviços', icon: Wrench },
  { id: 'comissoes-config' as const, label: 'Configurar comissões', icon: Percent },
  { id: 'comissoes-auxiliares' as const, label: 'Comissões e Auxiliares', icon: Users },
  { id: 'pagar-salario' as const, label: 'Pagar salário/comissão', icon: DollarSign },
  { id: 'vales' as const, label: 'Vales', icon: Receipt },
  { id: 'permissoes' as const, label: 'Permissões', icon: Shield },
]

export default function EmployeeSubnav({ activeSection, onSectionChange }: EmployeeSubnavProps) {
  return (
    <nav className="w-64 border-r border-gray-200 bg-gray-50 p-4 space-y-1 shrink-0">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activeSection === item.id
        
        return (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-left relative ${
              isActive
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {/* Active indicator */}
            {isActive && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
            )}
            
            <div className="flex items-center space-x-3">
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </div>
            
            {item.badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {item.badge}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
