'use client'

import { useState, useEffect } from 'react'
import { reportsService } from '@/services/api'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import { usePermissions } from '@/hooks/usePermissions'
import {
  Calendar,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

export default function ByPeriodReportPage() {
  const permissions = usePermissions()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  })
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    loadReport()
  }, [dateRange])

  const loadReport = async () => {
    setLoading(true)
    try {
      const response = await reportsService.getFinancialResults(dateRange)
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Vendas por Período
              </h1>
              <p className="text-gray-600 mt-1">Análise temporal de vendas e receitas</p>
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
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Data Final</label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <button
              onClick={loadReport}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : reportData ? (
          <>
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-1">Receita Bruta</p>
                <p className="text-3xl font-bold">R$ {reportData.dre.receita_bruta.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Receita Líquida</p>
                <p className="text-3xl font-bold text-blue-600">R$ {reportData.dre.receita_liquida.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Total Despesas</p>
                <p className="text-3xl font-bold text-red-600">
                  R$ {reportData.dre.total_despesas_operacionais.toFixed(2)}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${reportData.dre.lucro_liquido >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <BarChart3 className={`w-6 h-6 ${reportData.dre.lucro_liquido >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Lucro Líquido</p>
                <p className={`text-3xl font-bold ${reportData.dre.lucro_liquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {reportData.dre.lucro_liquido.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Gráfico por Mês */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Evolução Mensal</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Mês</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Receita</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Despesa</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Lucro</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Margem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.by_month?.map((month: any) => (
                      <tr key={month.month} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {new Date(month.month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">
                          R$ {month.income.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-red-600 font-semibold">
                          R$ {month.expense.toFixed(2)}
                        </td>
                        <td className={`px-4 py-3 text-sm text-right font-bold ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {month.profit.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className={`px-3 py-1 rounded-full font-semibold ${
                            month.income > 0 && (month.profit / month.income * 100) >= 20 
                              ? 'bg-green-100 text-green-700' 
                              : month.income > 0 && (month.profit / month.income * 100) >= 0
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {month.income > 0 ? (month.profit / month.income * 100).toFixed(1) : 0}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Receita por Origem */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Receita por Origem</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportData.income_by_origin?.map((item: any) => (
                  <div key={item.origin} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600 capitalize">
                        {item.origin === 'command' ? 'Comandas' : 
                         item.origin === 'subscription' ? 'Assinaturas' :
                         item.origin === 'manual' ? 'Manual' : item.origin}
                      </span>
                      <span className="text-sm text-gray-500">{item.count} itens</span>
                    </div>
                    <p className="text-2xl font-bold text-indigo-600">
                      R$ {item.gross.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Líquido: R$ {item.net.toFixed(2)} | Taxas: R$ {item.fees.toFixed(2)}
                    </p>
                  </div>
                ))}
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

