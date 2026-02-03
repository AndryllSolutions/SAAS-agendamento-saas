'use client'

import { useState, useEffect } from 'react'
import { reportsService } from '@/services/api'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import { usePermissions } from '@/hooks/usePermissions'
import {
  DollarSign,
  Download,
  Filter,
  ArrowLeft,
  Users,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

export default function CommissionsReportPage() {
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
      const response = await reportsService.getCommissionsReport(dateRange)
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Relatório de Comissões
              </h1>
              <p className="text-gray-600 mt-1">Comissões por profissional e status de pagamento</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Data Inicial</label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Data Final</label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <button
              onClick={loadReport}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          </div>
        ) : reportData ? (
          <>
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-1">Total de Comissões</p>
                <p className="text-3xl font-bold">R$ {reportData.summary.total_commissions.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Total Pago</p>
                <p className="text-3xl font-bold text-green-600">R$ {reportData.summary.total_paid.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Total Pendente</p>
                <p className="text-3xl font-bold text-yellow-600">R$ {reportData.summary.total_pending.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Taxa de Pagamento</p>
                <p className="text-3xl font-bold text-blue-600">{reportData.summary.payment_rate.toFixed(1)}%</p>
              </div>
            </div>

            {/* Tabela por Profissional */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Comissões por Profissional</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Profissional</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Quantidade</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Valor Base</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Total Comissão</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Pago</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Pendente</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Taxa Pgto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.by_professional.map((prof: any) => (
                      <tr key={prof.professional_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{prof.professional_name}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">{prof.commission_count}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          R$ {prof.total_base.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-orange-600">
                          R$ {prof.total_commission.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-green-600">
                          R$ {prof.total_paid.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-yellow-600">
                          R$ {prof.total_pending.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className={`px-3 py-1 rounded-full font-semibold ${
                            prof.payment_rate >= 80 ? 'bg-green-100 text-green-700' :
                            prof.payment_rate >= 50 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {prof.payment_rate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td className="px-4 py-3 text-sm">TOTAL</td>
                      <td className="px-4 py-3 text-sm text-center">
                        {reportData.by_professional.reduce((sum: number, p: any) => sum + p.commission_count, 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        R$ {reportData.by_professional.reduce((sum: number, p: any) => sum + p.total_base, 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-orange-600">
                        R$ {reportData.summary.total_commissions.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-green-600">
                        R$ {reportData.summary.total_paid.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-yellow-600">
                        R$ {reportData.summary.total_pending.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-blue-600">
                        {reportData.summary.payment_rate.toFixed(1)}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum dado encontrado para o período selecionado.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

