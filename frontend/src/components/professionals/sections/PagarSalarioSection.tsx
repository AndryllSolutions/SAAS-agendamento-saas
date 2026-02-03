'use client'

import { DollarSign, Plus, MoreHorizontal } from 'lucide-react'
import { useDrawerStack } from '../DrawerStackManager'
import PaymentsDrawer from '../PaymentsDrawer'

interface Employee {
  id: number
  full_name: string
}

interface PagarSalarioSectionProps {
  employee: Employee
  onUpdate: (hasChanges: boolean) => void
}

export default function PagarSalarioSection({ employee, onUpdate }: PagarSalarioSectionProps) {
  const { openDrawer } = useDrawerStack()

  const mockPayments = [
    { id: 1, type: 'Salário', amount: 2500, date: '2024-01-15', status: 'Pago' },
    { id: 2, type: 'Comissão', amount: 450, date: '2024-01-10', status: 'Pago' },
    { id: 3, type: 'Adicional', amount: 200, date: '2024-01-05', status: 'Pendente' }
  ]

  const handleOpenPayments = () => {
    openDrawer(2, <PaymentsDrawer employee={employee} onClose={() => {}} />)
  }

  const handleNewPayment = () => {
    // Abrir drawer de nível 3 para novo pagamento
    console.log('Abrir novo pagamento')
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Pagar Salário/Comissão
            </h3>
            <p className="text-sm text-gray-500">
              Gerencie os pagamentos de salários e comissões do profissional.
            </p>
          </div>
          <button
            onClick={handleNewPayment}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Novo</span>
          </button>
        </div>

        {/* Resumo rápido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Total Pago</div>
            <div className="text-2xl font-bold text-green-900">R$ 2.950</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-600 font-medium">Pendente</div>
            <div className="text-2xl font-bold text-yellow-900">R$ 200</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Este Mês</div>
            <div className="text-2xl font-bold text-blue-900">R$ 3.150</div>
          </div>
        </div>

        {/* Tabela de Pagamentos */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">Histórico de Pagamentos</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      R$ {payment.amount.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'Pago'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={handleOpenPayments}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todos os pagamentos →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
