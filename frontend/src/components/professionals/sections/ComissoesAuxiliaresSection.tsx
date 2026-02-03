'use client'

import { Users, Trash2, Download } from 'lucide-react'

interface Employee {
  id: number
}

interface ComissoesAuxiliaresSectionProps {
  employee: Employee
  onUpdate: (hasChanges: boolean) => void
}

export default function ComissoesAuxiliaresSection({ employee, onUpdate }: ComissoesAuxiliaresSectionProps) {
  const mockServices = [
    { id: 1, name: 'Corte de Cabelo', commission: 15, auxiliar_commission: 5 },
    { id: 2, name: 'Escova', commission: 10, auxiliar_commission: 3 },
    { id: 3, name: 'Pintura', commission: 20, auxiliar_commission: 8 }
  ]

  return (
    <div className="p-6">
      <div className="max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Comissões e Auxiliares
            </h3>
            <p className="text-sm text-gray-500">
              Configure as comissões por serviço e valores para auxiliares.
            </p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            <span>Importar serviços</span>
          </button>
        </div>

        {/* Tabela de Serviços */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comissão (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-600">Comissão como auxiliar</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {service.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={service.commission}
                        onChange={() => onUpdate(true)}
                        className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={10}>10%</option>
                        <option value={15}>15%</option>
                        <option value={20}>20%</option>
                        <option value={25}>25%</option>
                        <option value={30}>30%</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap bg-blue-50/30">
                      <select
                        value={service.auxiliar_commission}
                        onChange={() => onUpdate(true)}
                        className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={0}>0%</option>
                        <option value={3}>3%</option>
                        <option value={5}>5%</option>
                        <option value={8}>8%</option>
                        <option value={10}>10%</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
