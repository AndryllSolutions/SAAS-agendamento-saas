'use client'

import { useState } from 'react'
import { DollarSign, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { Drawer, useDrawerStack } from './DrawerStackManager'
import NewItemDrawer from './NewItemDrawer'

interface Employee {
  id: number
  full_name: string
}

interface PaymentsDrawerProps {
  employee: Employee
  onClose: () => void
}

interface Payment {
  id: number
  type: string
  amount: number
  date: string
  status: 'Pago' | 'Pendente' | 'Cancelado'
  description?: string
  category?: string
}

export default function PaymentsDrawer({ employee, onClose }: PaymentsDrawerProps) {
  const { openDrawer, closeDrawer } = useDrawerStack()
  const [currentPage, setCurrentPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all')
  
  // Mock data - substituir por dados reais da API
  const mockPayments: Payment[] = [
    { id: 1, type: 'Salário', amount: 2500, date: '2024-01-15', status: 'Pago', description: 'Salário mensal Janeiro', category: 'Salário' },
    { id: 2, type: 'Comissão', amount: 450, date: '2024-01-10', status: 'Pago', description: 'Comissões Janeiro', category: 'Comissão' },
    { id: 3, type: 'Adicional', amount: 200, date: '2024-01-05', status: 'Pendente', description: 'Hora extra', category: 'Adicional' },
    { id: 4, type: 'Vale', amount: 150, date: '2024-01-03', status: 'Pago', description: 'Vale alimentação', category: 'Vale' },
    { id: 5, type: 'Comissão', amount: 320, date: '2023-12-28', status: 'Pago', description: 'Comissões Dezembro', category: 'Comissão' }
  ]

  const filteredPayments = mockPayments.filter(payment => {
    if (filterStatus === 'paid') return payment.status === 'Pago'
    if (filterStatus === 'pending') return payment.status === 'Pendente'
    return true
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage)

  const handleNewPayment = () => {
    openDrawer(3, 
      <NewItemDrawer 
        title="Novo Pagamento"
        onClose={() => closeDrawer(3)}
        onSave={(data: any) => {
          console.log('Saving payment:', data)
          closeDrawer(3)
        }}
      />
    )
  }

  const handleClose = () => {
    onClose()
    closeDrawer(2)
  }

  const getTotalPaid = () => {
    return mockPayments
      .filter(p => p.status === 'Pago')
      .reduce((sum, p) => sum + p.amount, 0)
  }

  const getTotalPending = () => {
    return mockPayments
      .filter(p => p.status === 'Pendente')
      .reduce((sum, p) => sum + p.amount, 0)
  }

  return (
    <Drawer
      title={`Pagamentos - ${employee.full_name}`}
      onClose={handleClose}
      width="normal"
    >
      <div className="flex flex-col h-full">
        {/* Header com resumo */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Total Pago</div>
              <div className="text-xl font-bold text-green-600">
                R$ {getTotalPaid().toLocaleString('pt-BR')}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Pendente</div>
              <div className="text-xl font-bold text-yellow-600">
                R$ {getTotalPending().toLocaleString('pt-BR')}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Total Geral</div>
              <div className="text-xl font-bold text-blue-600">
                R$ {(getTotalPaid() + getTotalPending()).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value as any)
                    setCurrentPage(1)
                  }}
                  className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="paid">Pagos</option>
                  <option value="pending">Pendentes</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={handleNewPayment}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Novo</span>
            </button>
          </div>
        </div>

        {/* Lista de pagamentos */}
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-gray-200">
            {paginatedPayments.map((payment) => (
              <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{payment.type}</h4>
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'Pago'
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'Pendente'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                    
                    {payment.description && (
                      <p className="text-sm text-gray-500 mb-2">{payment.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {new Date(payment.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        R$ {payment.amount.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {paginatedPayments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <DollarSign className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhum pagamento encontrado</p>
            </div>
          )}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {startIndex + 1} até {Math.min(startIndex + itemsPerPage, filteredPayments.length)} de {filteredPayments.length} resultados
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="px-3 py-1 text-sm">
                  {currentPage} de {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}
