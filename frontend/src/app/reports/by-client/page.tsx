'use client'

import { useState, useEffect } from 'react'
import { reportsService } from '@/services/api'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import { usePermissions } from '@/hooks/usePermissions'
import { FeatureWrapper } from '@/components/FeatureWrapper'
import {
  Users,
  Download,
  Filter,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Calendar,
  Award
} from 'lucide-react'
import Link from 'next/link'

export default function ByClientReportPage() {
  const permissions = usePermissions()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  })
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    loadReport()
  }, [dateRange])

  const loadReport = async () => {
    setLoading(true)
    try {
      const response = await reportsService.getByClientReport(dateRange)
      setReportData(response.data)
    } catch (error) {
      toast.error('Erro ao carregar relatório')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (!permissions.canManagePayments()) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-600">Você não tem permissão para acessar relatórios.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/reports">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Top Clientes
              </h1>
              <p className="text-gray-600 mt-1">Clientes com maior faturamento e frequência</p>
            </div>
          </div>
        </div>

        <FeatureWrapper feature="advanced_reports" asCard={true}>
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Data Inicial</label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Data Final</label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>
            
            <button
              onClick={loadReport}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          </div>
        ) : reportData ? (
          <>
            {/* Card de Total */}
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-2">Receita Total</p>
                  <p className="text-4xl font-bold">R$ {reportData.total_revenue.toFixed(2)}</p>
                  <p className="text-white/70 text-sm mt-2">
                    Top {reportData.clients.length} clientes
                  </p>
                </div>
                <div className="bg-white/20 p-6 rounded-xl">
                  <Users className="w-12 h-12" />
                </div>
              </div>
            </div>

            {/* Top 5 Clientes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportData.clients.slice(0, 6).map((client: any, index: number) => (
                <div key={client.client_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xl ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                      'bg-gradient-to-br from-pink-500 to-purple-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                        {client.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{client.client_name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total</span>
                      <span className="font-bold text-green-600">R$ {client.total_revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Comandas</span>
                      <span className="font-semibold">{client.command_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ticket Médio</span>
                      <span className="font-semibold">R$ {client.avg_ticket.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Última Visita</span>
                      <span className="text-xs text-gray-600">
                        {client.last_visit ? new Date(client.last_visit).toLocaleDateString() : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabela Completa */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Todos os Clientes</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Pos.</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Cliente</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Comandas</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Total</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Ticket Médio</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Última Visita</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">% do Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.clients.map((client: any, index: number) => (
                      <tr key={client.client_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                            'bg-gray-500'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{client.client_name}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">{client.command_count}</td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-green-600">
                          R$ {client.total_revenue.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          R$ {client.avg_ticket.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {client.last_visit ? new Date(client.last_visit).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                          {client.percentage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum dado encontrado para o período selecionado.</p>
          </div>
        )}
        </FeatureWrapper>
      </div>
    </DashboardLayout>
  )
}

