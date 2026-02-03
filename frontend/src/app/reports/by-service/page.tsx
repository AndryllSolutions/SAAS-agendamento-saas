'use client'

import { useState, useEffect } from 'react'
import { reportsService } from '@/services/api'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import { usePermissions } from '@/hooks/usePermissions'
import { FeatureWrapper } from '@/components/FeatureWrapper'
import {
  Briefcase,
  Download,
  Filter,
  ArrowLeft,
  DollarSign,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function ByServiceReportPage() {
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
      const response = await reportsService.getByServiceReport(dateRange)
      setReportData(response.data)
    } catch (error) {
      toast.error('Erro ao carregar relatório')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const pieChartData = reportData ? {
    labels: reportData.services.slice(0, 10).map((s: any) => s.service_name),
    datasets: [{
      data: reportData.services.slice(0, 10).map((s: any) => s.total_revenue),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(20, 184, 166, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(99, 102, 241, 0.8)',
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  } : null

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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Vendas por Serviço
              </h1>
              <p className="text-gray-600 mt-1">Performance e receita de cada serviço</p>
            </div>
          </div>
        </div>

        <FeatureWrapper feature="advanced_reports" asCard={true}>
        {/* Filtros de Data */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Data Inicial</label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Data Final</label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <button
              onClick={loadReport}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : reportData ? (
          <>
            {/* Card de Total */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-2">Receita Total de Serviços</p>
                  <p className="text-4xl font-bold">R$ {reportData.total_revenue.toFixed(2)}</p>
                  <p className="text-white/70 text-sm mt-2">
                    {reportData.services.length} serviços
                  </p>
                </div>
                <div className="bg-white/20 p-6 rounded-xl">
                  <Briefcase className="w-12 h-12" />
                </div>
              </div>
            </div>

            {/* Gráfico + Top 5 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Pizza */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Distribuição de Receita</h2>
                {pieChartData && (
                  <div className="h-80 flex items-center justify-center">
                    <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
                  </div>
                )}
              </div>

              {/* Top 5 Serviços */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Top 5 Serviços</h2>
                <div className="space-y-4">
                  {reportData.services.slice(0, 5).map((service: any, index: number) => (
                    <div key={service.service_id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                            'bg-gradient-to-br from-purple-500 to-purple-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{service.service_name}</p>
                            <p className="text-xs text-gray-500">
                              {service.item_count} vendas • Ticket médio: R$ {service.avg_value.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">R$ {service.total_revenue.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{service.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all"
                          style={{ width: `${service.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabela Completa */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Todos os Serviços</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Posição</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Serviço</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Vendas</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Ticket Médio</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Receita Total</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">% do Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.services.map((service: any, index: number) => (
                      <tr key={service.service_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                            'bg-gray-500'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{service.service_name}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">{service.item_count}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          R$ {service.avg_value.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-purple-600">
                          R$ {service.total_revenue.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                          {service.percentage.toFixed(1)}%
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

