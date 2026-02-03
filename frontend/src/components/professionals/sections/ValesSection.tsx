'use client'

import { useState } from 'react'
import { Receipt, Plus } from 'lucide-react'
import { useDrawerStack } from '../DrawerStackManager'
import { NovoValeDrawer } from '../NovoValeDrawer'

interface Employee {
  id: number
  full_name: string
}

interface ValesSectionProps {
  employee: Employee
  onUpdate: (hasChanges: boolean) => void
}

export default function ValesSection({ employee, onUpdate }: ValesSectionProps) {
  const [showNovoVale, setShowNovoVale] = useState(false)
  const { openDrawer, updateURL } = useDrawerStack()

  const mockVales = [
    { id: 1, amount: 150, date: '2024-01-20', description: 'Vale alimentação', status: 'Pago' },
    { id: 2, amount: 80, date: '2024-01-15', description: 'Vale transporte', status: 'Pendente' }
  ]

  const handleNewVale = () => {
    setShowNovoVale(true)
    updateURL(employee.id, 'vales', 'novoVale')
  }

  const handleValeSuccess = () => {
    setShowNovoVale(false)
    updateURL(employee.id, 'vales')
    // TODO: Recarregar lista de vales
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
              <Receipt className="w-5 h-5 mr-2" />
              Vales
            </h3>
            <p className="text-sm text-gray-500">
              Gerencie vales e adiantamentos do profissional.
            </p>
          </div>
          <button
            onClick={handleNewVale}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Novo</span>
          </button>
        </div>

        {/* Lista de Vales */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">Histórico de Vales</h4>
          </div>
          <div className="divide-y divide-gray-200">
            {mockVales.map((vale) => (
              <div key={vale.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-900">{vale.description}</h5>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        vale.status === 'Pago'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {vale.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        {new Date(vale.date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        R$ {vale.amount.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {mockVales.length === 0 && (
              <div className="p-8 text-center">
                <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum vale registrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Sub-drawer Novo Vale */}
        {showNovoVale && (
          <NovoValeDrawer
            employee={employee}
            level={2}
            onClose={() => {
              setShowNovoVale(false)
              updateURL(employee.id, 'vales')
            }}
            onSuccess={handleValeSuccess}
          />
        )}
      </div>
    </div>
  )
}
