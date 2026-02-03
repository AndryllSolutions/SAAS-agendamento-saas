'use client'

import { useState, useEffect } from 'react'
import { reportsService } from '@/services/api'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import { usePermissions } from '@/hooks/usePermissions'
import {
  TrendingDown,
  Download,
  Filter,
  ArrowLeft,
  PieChart,
  Calendar,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
  '#f43f5e'
]

export default function ExpensesReportPage() {
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
      const response = await reportsService.getExpensesReport(dateRange)
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

    const csvContent = [
      ['Relatório de Despesas'],
      ['Período', `${dateRange.start_date} até ${dateRange.end_date}`],
      [''],
      ['Total de Despesas', `R$ ${reportData.total_expenses.toFixed(2)}`],
      [''],
      ['Despesas por Categoria'],
      ['Categoria', 'Total', 'Quantidade', 'Percentual'],
      ...reportData.by_category.map((c: any) => [
        c.category,
        `R$ ${c.total.toFixed(2)}`,
        c.count,
        `${c.percentage.toFixed(1)}%`
      ]),
      [''],
      ['Despesas por Origem'],
      ['Origem', 'Total', 'Quantidade', 'Percentual'],
      ...reportData.by_origin.map((o: any) => [
        o.origin,
        `R$ ${o.total.toFixed(2)}`,
        o.count,
        `${o.percentage.toFixed(1)}%`
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio-despesas-${dateRange.start_date}-${dateRange.end_date}.csv`
    link.click()
    
    toast.success('Relatório exportado!')
  }

  // Preparar dados para os gráficos
  const pieChartData = reportData?.by_category?.map((c: any) => ({
    name: c.category || 'Sem categoria',
    value: c.total
  })) || []

  const barChartData = reportData?.by_month?.map((m: any) => ({
    month: m.month,
    total: m.total
  })) || []

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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Relatório de Despesas
              </h1>
              <p className="text-gray-600 mt-1">Análise completa de despesas por categoria e origem</p>
            </div>
          </div>
          
          <button
            onClick={exportToCSV}
            disabled={!reportData}
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
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
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Data Final</label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <button
              onClick={loadReport}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          </div>
        ) : reportData ? (
          <>
            {/* Card de Total */}
            <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-2">Total de Despesas</p>
                  <p className="text-4xl font-bold">R$ {reportData.total_expenses.toFixed(2)}</p>
                  <p className="text-white/70 text-sm mt-2">
                    Período: {new Date(dateRange.start_date).toLocaleDateString('pt-BR')} até {new Date(dateRange.end_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="bg-white/20 p-6 rounded-xl">
                  <TrendingDown className="w-12 h-12" />
                </div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Pizza - Por Categoria */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-red-600" />
                  Despesas por Categoria
                </h2>
                {pieChartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={true}
                        >
                          {pieChartData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    Nenhum dado disponível
                  </div>
                )}
              </div>

              {/* Gráfico de Barras - Por Mês */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-red-600" />
                  Despesas por Mês
                </h2>
                {barChartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `R$ ${value}`} />
                        <Tooltip 
                          formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Total']}
                        />
                        <Legend />
                        <Bar 
                          dataKey="total" 
                          name="Despesas" 
                          fill="#ef4444" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    Nenhum dado disponível
                  </div>
                )}
              </div>
            </div>

            {/* Tabelas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Por Categoria */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Detalhamento por Categoria</h2>
                <div className="space-y-4">
                  {reportData.by_category.map((category: any, index: number) => (
                    <div key={index} className="border-b pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900">{category.category || 'Sem categoria'}</span>
                        <span className="text-red-600 font-bold">R$ {category.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{category.count} transações</span>
                        <span>{category.percentage.toFixed(1)}% do total</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-orange-600 h-2 rounded-full transition-all"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Por Origem */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Detalhamento por Origem</h2>
                <div className="space-y-4">
                  {reportData.by_origin.map((origin: any, index: number) => (
                    <div key={index} className="border-b pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900 capitalize">
                          {origin.origin === 'commission' ? 'Comissões' :
                           origin.origin === 'purchase' ? 'Compras' :
                           origin.origin === 'manual' ? 'Manual' : origin.origin}
                        </span>
                        <span className="text-red-600 font-bold">R$ {origin.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{origin.count} transações</span>
                        <span>{origin.percentage.toFixed(1)}% do total</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-orange-600 h-2 rounded-full transition-all"
                          style={{ width: `${origin.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top 10 Maiores Despesas */}
            {reportData.top_expenses?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  Top 10 Maiores Despesas
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Data</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Descrição</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Origem</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Categoria</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reportData.top_expenses.map((expense: any) => (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(expense.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{expense.description || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                            {expense.origin === 'commission' ? 'Comissões' :
                             expense.origin === 'purchase' ? 'Compras' :
                             expense.origin === 'manual' ? 'Manual' : expense.origin}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{expense.category || '-'}</td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-red-600">
                            R$ {expense.value.toFixed(2)}
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
