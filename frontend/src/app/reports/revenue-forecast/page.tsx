'use client'

import { useState, useEffect } from 'react'
import { reportsService } from '@/services/api'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import { usePermissions } from '@/hooks/usePermissions'
import {
  TrendingUp,
  Download,
  ArrowLeft,
  Calendar,
  DollarSign,
  Repeat,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function RevenueForecastPage() {
  const permissions = usePermissions()
  const [loading, setLoading] = useState(true)
  const [monthsAhead, setMonthsAhead] = useState(3)
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    loadReport()
  }, [monthsAhead])

  const loadReport = async () => {
    setLoading(true)
    try {
      const response = await reportsService.getRevenueForecast({ months_ahead: monthsAhead })
      setReportData(response.data)
    } catch (error) {
      toast.error('Erro ao carregar projeção')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = reportData ? {
    labels: [
      ...reportData.historical.map((m: any) => m.month),
      ...reportData.forecast.map((m: any) => m.month)
    ],
    datasets: [
      {
        label: 'Histórico',
        data: [
          ...reportData.historical.map((m: any) => m.revenue),
          ...Array(reportData.forecast.length).fill(null)
        ],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Projeção Variável',
        data: [
          ...Array(reportData.historical.length).fill(null),
          ...reportData.forecast.map((m: any) => m.projected_variable)
        ],
        borderColor: 'rgba(251, 146, 60, 1)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        borderWidth: 3,
        borderDash: [5, 5],
        fill: true,
        tension: 0.4
      },
      {
        label: 'MRR (Receita Recorrente)',
        data: [
          ...Array(reportData.historical.length).fill(null),
          ...reportData.forecast.map((m: any) => m.projected_recurring)
        ],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        borderDash: [10, 5],
        fill: true,
        tension: 0.4
      },
      {
        label: 'Total Projetado',
        data: [
          ...Array(reportData.historical.length).fill(null),
          ...reportData.forecast.map((m: any) => m.projected_total)
        ],
        borderColor: 'rgba(168, 85, 247, 1)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }
    ]
  } : null

  if (!permissions.canManagePayments()) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-600">Você não tem permissão para acessar relatórios financeiros.</p>
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Projeção de Faturamento
              </h1>
              <p className="text-gray-600 mt-1">Previsão de receita baseada em histórico e assinaturas</p>
            </div>
          </div>
        </div>

        {/* Controle de Meses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Projetar para:</label>
            <div className="flex gap-2">
              {[3, 6, 12].map(months => (
                <button
                  key={months}
                  onClick={() => setMonthsAhead(months)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    monthsAhead === months
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {months} meses
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : reportData ? (
          <>
            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-1">Média Histórica</p>
                <p className="text-3xl font-bold">R$ {reportData.metrics.avg_historical_revenue.toFixed(2)}</p>
                <p className="text-white/70 text-xs mt-2">Últimos 6 meses</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Repeat className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-1">MRR (Recorrente)</p>
                <p className="text-3xl font-bold">R$ {reportData.metrics.mrr.toFixed(2)}</p>
                <p className="text-white/70 text-xs mt-2">{reportData.metrics.active_subscriptions} assinaturas ativas</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-1">A Receber</p>
                <p className="text-3xl font-bold">R$ {reportData.metrics.commands_open_value.toFixed(2)}</p>
                <p className="text-white/70 text-xs mt-2">Comandas em aberto</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-1">Taxa de Crescimento</p>
                <p className="text-3xl font-bold">{reportData.metrics.growth_rate.toFixed(1)}%</p>
                <p className="text-white/70 text-xs mt-2">Estimado por mês</p>
              </div>
            </div>

            {/* Gráfico de Projeção */}
            {chartData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Evolução e Projeção de Receita
                </h2>
                <div className="h-96">
                  <Line 
                    data={chartData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => `R$ ${value}`
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            )}

            {/* Tabela de Projeção */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Detalhamento da Projeção
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Mês</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Receita Variável</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">MRR</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Total Projetado</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.historical.map((month: any, index: number) => (
                      <tr key={`hist-${index}`} className="hover:bg-blue-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{month.month}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          R$ {month.revenue.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-500">-</td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-blue-600">
                          R$ {month.revenue.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Histórico
                          </span>
                        </td>
                      </tr>
                    ))}
                    {reportData.forecast.map((month: any, index: number) => (
                      <tr key={`forecast-${index}`} className="hover:bg-green-50 bg-green-50/30">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{month.month}</td>
                        <td className="px-4 py-3 text-sm text-right text-orange-600">
                          R$ {month.projected_variable.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-green-600">
                          R$ {month.projected_recurring.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-purple-600">
                          R$ {month.projected_total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Projeção
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Observações */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Como a projeção é calculada?
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Receita Variável:</strong> Baseada na média histórica dos últimos 6 meses, aplicando uma taxa de crescimento estimada.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span><strong>MRR (Monthly Recurring Revenue):</strong> Soma dos valores mensais de todas as assinaturas ativas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Total Projetado:</strong> Soma da receita variável estimada + MRR para cada mês futuro.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span><strong>Taxa de Crescimento:</strong> Atualmente estimada em {reportData.metrics.growth_rate.toFixed(1)}% ao mês com base em padrões históricos.</span>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum dado disponível para projeção.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

