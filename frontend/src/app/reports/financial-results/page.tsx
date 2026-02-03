'use client'

import { useState, useEffect } from 'react'
import { reportsService } from '@/services/api'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import { usePermissions } from '@/hooks/usePermissions'
import {
  PieChart,
  Download,
  Filter,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent
} from 'lucide-react'
import Link from 'next/link'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

export default function FinancialResultsPage() {
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
      const response = await reportsService.getFinancialResults(dateRange)
      setReportData(response.data)
    } catch (error) {
      toast.error('Erro ao carregar relatório')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!reportData) return

    const { dre } = reportData

    const csvContent = [
      ['Demonstrativo de Resultados do Exercício (DRE)'],
      ['Período', `${dateRange.start_date} até ${dateRange.end_date}`],
      [''],
      ['RECEITAS'],
      ['Receita Bruta', `R$ ${dre.receita_bruta.toFixed(2)}`],
      ['(-) Taxas Gateway', `R$ ${dre.taxas_gateway.toFixed(2)}`],
      ['(=) Receita Líquida', `R$ ${dre.receita_liquida.toFixed(2)}`],
      [''],
      ['CUSTOS DIRETOS'],
      ['(-) Comissões', `R$ ${dre.comissoes.toFixed(2)}`],
      ['(=) Lucro Bruto', `R$ ${dre.lucro_bruto.toFixed(2)}`],
      ['Margem Bruta', `${dre.margem_bruta.toFixed(1)}%`],
      [''],
      ['DESPESAS OPERACIONAIS'],
      ['(-) Compras', `R$ ${dre.compras.toFixed(2)}`],
      ['(-) Outras Despesas', `R$ ${dre.outras_despesas.toFixed(2)}`],
      ['(=) Total Despesas Operacionais', `R$ ${dre.total_despesas_operacionais.toFixed(2)}`],
      [''],
      ['RESULTADO'],
      ['(=) Lucro Operacional', `R$ ${dre.lucro_operacional.toFixed(2)}`],
      ['Margem Operacional', `${dre.margem_operacional.toFixed(1)}%`],
      ['(=) Lucro Líquido', `R$ ${dre.lucro_liquido.toFixed(2)}`],
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `dre-${dateRange.start_date}-${dateRange.end_date}.csv`
    link.click()
    
    toast.success('DRE exportado!')
  }

  const chartData = reportData ? {
    labels: reportData.by_month.map((m: any) => m.month),
    datasets: [
      {
        label: 'Receita',
        data: reportData.by_month.map((m: any) => m.income),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2
      },
      {
        label: 'Despesas',
        data: reportData.by_month.map((m: any) => m.expense),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2
      },
      {
        label: 'Lucro',
        data: reportData.by_month.map((m: any) => m.profit),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Resultados Financeiros (DRE)
              </h1>
              <p className="text-gray-600 mt-1">Demonstrativo de Resultados do Exercício</p>
            </div>
          </div>
          
          <button
            onClick={exportToCSV}
            disabled={!reportData}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            Exportar CSV
          </button>
        </div>

        {/* Filtros de Data */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Data Inicial</label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Data Final</label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={loadReport}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : reportData ? (
          <>
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-1">Receita Líquida</p>
                <p className="text-3xl font-bold">R$ {reportData.dre.receita_liquida.toFixed(2)}</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-1">Total Despesas</p>
                <p className="text-3xl font-bold">
                  R$ {(reportData.dre.comissoes + reportData.dre.total_despesas_operacionais).toFixed(2)}
                </p>
              </div>

              <div className={`bg-gradient-to-br ${
                reportData.dre.lucro_liquido >= 0 
                  ? 'from-blue-500 to-blue-600' 
                  : 'from-red-500 to-red-600'
              } rounded-xl shadow-lg p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Percent className="w-4 h-4" />
                    <span className="text-sm">{reportData.dre.margem_operacional.toFixed(1)}%</span>
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-1">Lucro Líquido</p>
                <p className="text-3xl font-bold">R$ {reportData.dre.lucro_liquido.toFixed(2)}</p>
              </div>
            </div>

            {/* DRE Detalhado */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                Demonstrativo de Resultados (DRE)
              </h2>
              
              <div className="space-y-4">
                {/* Receitas */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-bold text-gray-900 mb-3">RECEITAS</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Receita Bruta</span>
                      <span className="font-semibold">R$ {reportData.dre.receita_bruta.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>(-) Taxas Gateway</span>
                      <span>R$ {reportData.dre.taxas_gateway.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t-2 font-bold text-green-600">
                      <span>(=) Receita Líquida</span>
                      <span>R$ {reportData.dre.receita_liquida.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Custos Diretos */}
                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="font-bold text-gray-900 mb-3">CUSTOS DIRETOS</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-red-600">
                      <span>(-) Comissões</span>
                      <span>R$ {reportData.dre.comissoes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t-2 font-bold text-blue-600">
                      <span>(=) Lucro Bruto</span>
                      <span>R$ {reportData.dre.lucro_bruto.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Margem Bruta</span>
                      <span>{reportData.dre.margem_bruta.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Despesas Operacionais */}
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-bold text-gray-900 mb-3">DESPESAS OPERACIONAIS</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-red-600">
                      <span>(-) Compras</span>
                      <span>R$ {reportData.dre.compras.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>(-) Outras Despesas</span>
                      <span>R$ {reportData.dre.outras_despesas.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-semibold text-red-600">
                      <span>(=) Total Despesas Operacionais</span>
                      <span>R$ {reportData.dre.total_despesas_operacionais.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Resultado */}
                <div className={`border-l-4 ${
                  reportData.dre.lucro_liquido >= 0 ? 'border-blue-500' : 'border-red-500'
                } pl-4 bg-gray-50 p-4 rounded-r-lg`}>
                  <h3 className="font-bold text-gray-900 mb-3">RESULTADO</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between font-bold text-blue-600">
                      <span>(=) Lucro Operacional</span>
                      <span>R$ {reportData.dre.lucro_operacional.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Margem Operacional</span>
                      <span>{reportData.dre.margem_operacional.toFixed(1)}%</span>
                    </div>
                    <div className={`flex justify-between pt-3 border-t-2 text-xl font-bold ${
                      reportData.dre.lucro_liquido >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      <span>(=) Lucro Líquido</span>
                      <span>R$ {reportData.dre.lucro_liquido.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico de Evolução */}
            {chartData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Evolução Mensal</h2>
                <div className="h-96">
                  <Bar 
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
                      }
                    }} 
                  />
                </div>
              </div>
            )}

            {/* Receitas por Origem */}
            {reportData.income_by_origin.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Receitas por Origem</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Origem</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Receita Bruta</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Taxas</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Receita Líquida</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Quantidade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reportData.income_by_origin.map((item: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{item.origin}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            R$ {item.gross.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-red-600">
                            R$ {item.fees.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-green-600">
                            R$ {item.net.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600">
                            {item.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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

