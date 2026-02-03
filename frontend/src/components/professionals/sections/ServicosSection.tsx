'use client'

import { Wrench } from 'lucide-react'

interface Employee {
  id: number
}

interface ServicosSectionProps {
  employee: Employee
  onUpdate: (hasChanges: boolean) => void
}

export default function ServicosSection({ employee, onUpdate }: ServicosSectionProps) {
  return (
    <div className="p-6">
      <div className="max-w-2xl">
        <div className="text-center py-12">
          <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Personalizar Serviços</h3>
          <p className="text-gray-500">
            Configure quais serviços este profissional pode realizar e suas especificações.
          </p>
        </div>
      </div>
    </div>
  )
}
