'use client'

import { useState, useEffect } from 'react'
import { paymentService } from '@/services/api'
import { DollarSign, CreditCard, CheckCircle, XCircle, Clock, Filter } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      const response = await paymentService.list()
      setPayments(response.data)
    } catch (error) {
      toast.error('Erro ao carregar pagamentos')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', label: 'Pago', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', label: 'Falhou', icon: XCircle },
      refunded: { color: 'bg-gray-100 text-gray-800', label: 'Reembolsado', icon: XCircle },
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    )
  }

  const getMethodIcon = (method: string) => {
    return <CreditCard className="w-5 h-5" />
  }

  const filteredPayments = payments.filter((payment: any) => {
    if (filter === 'all') return true
    return payment.status === filter
  })

  const totalRevenue = payments
    .filter((p: any) => p.status === 'completed')
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0)

  const pendingAmount = payments
    .filter((p: any) => p.status === 'pending')
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0)

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Pagamentos</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">R$ {totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pagamentos Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">R$ {pendingAmount.toFixed(2)}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Transações</p>
                <p className="text-2xl font-bold">{payments.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
              >
                Pagos
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100'}`}
              >
                Pendentes
              </button>
              <button
                onClick={() => setFilter('failed')}
                className={`px-4 py-2 rounded-lg ${filter === 'failed' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
              >
                Falhados
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum pagamento encontrado</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">#{payment.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{payment.appointment?.client?.full_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      R$ {parseFloat(payment.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {getMethodIcon(payment.payment_method)}
                        <span className="capitalize">{payment.payment_method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
