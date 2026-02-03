'use client'

import { FileSignature, Upload } from 'lucide-react'

interface Employee {
  id: number
  full_name: string
}

interface AssinaturaSectionProps {
  employee: Employee
  onUpdate: (hasChanges: boolean) => void
}

export default function AssinaturaSection({ employee, onUpdate }: AssinaturaSectionProps) {
  return (
    <div className="p-6">
      <div className="max-w-2xl">
        <div className="text-center py-12">
          <FileSignature className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Assinatura Digital</h3>
          <p className="text-gray-500 mb-6">
            Funcionalidade em desenvolvimento. Em breve você poderá configurar a assinatura digital do profissional.
          </p>
          <button
            disabled
            className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload de Assinatura
          </button>
        </div>
      </div>
    </div>
  )
}
