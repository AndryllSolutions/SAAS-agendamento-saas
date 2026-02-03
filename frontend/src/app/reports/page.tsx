'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { usePermissions } from '@/hooks/usePermissions'
import { 
  FileText, 
  TrendingDown, 
  PieChart, 
  TrendingUp, 
  Users,
  Briefcase,
  DollarSign,
  Calendar,
  Star,
  Target
} from 'lucide-react'
import Link from 'next/link'

interface ReportCard {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  href: string
  category: 'financeiro' | 'vendas' | 'clientes' | 'profissionais'
  isFavorite?: boolean
}

const reports: ReportCard[] = [
  // FINANCEIRO
  {
    id: 'despesas',
    title: 'Despesas',
    description: 'Análise completa de todas as despesas por categoria e origem',
    icon: <TrendingDown className="w-6 h-6" />,
    color: 'from-red-500 to-red-600',
    href: '/reports/expenses',
    category: 'financeiro'
  },
  {
    id: 'resultados',
    title: 'Resultados Financeiros',
    description: 'DRE completo com receitas, despesas e lucro líquido',
    icon: <PieChart className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600',
    href: '/reports/financial-results',
    category: 'financeiro'
  },
  {
    id: 'projecao',
    title: 'Projeção de Faturamento',
    description: 'Previsão de receita baseada em histórico e assinaturas',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'from-green-500 to-green-600',
    href: '/reports/revenue-forecast',
    category: 'financeiro'
  },
  {
    id: 'comissoes',
    title: 'Comissões',
    description: 'Relatório de comissões por profissional',
    icon: <DollarSign className="w-6 h-6" />,
    color: 'from-orange-500 to-orange-600',
    href: '/reports/commissions',
    category: 'financeiro'
  },
  // VENDAS
  {
    id: 'por-servico',
    title: 'Vendas por Serviço',
    description: 'Performance e receita de cada serviço',
    icon: <Briefcase className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
    href: '/reports/by-service',
    category: 'vendas'
  },
  {
    id: 'por-periodo',
    title: 'Vendas por Período',
    description: 'Análise temporal de vendas e agendamentos',
    icon: <Calendar className="w-6 h-6" />,
    color: 'from-indigo-500 to-indigo-600',
    href: '/reports/by-period',
    category: 'vendas'
  },
  // CLIENTES
  {
    id: 'top-clientes',
    title: 'Top Clientes',
    description: 'Clientes com maior faturamento e frequência',
    icon: <Users className="w-6 h-6" />,
    color: 'from-pink-500 to-pink-600',
    href: '/reports/by-client',
    category: 'clientes'
  },
  // PROFISSIONAIS
  {
    id: 'por-profissional',
    title: 'Por Profissional',
    description: 'Performance, faturamento e avaliações de cada profissional',
    icon: <Star className="w-6 h-6" />,
    color: 'from-yellow-500 to-yellow-600',
    href: '/reports/by-professional',
    category: 'profissionais'
  },
  {
    id: 'metas',
    title: 'Metas e Objetivos',
    description: 'Acompanhamento de metas individuais e da empresa',
    icon: <Target className="w-6 h-6" />,
    color: 'from-teal-500 to-teal-600',
    href: '/reports/goals',
    category: 'profissionais'
  }
]

const categories = [
  { id: 'all', label: 'Todos', icon: <FileText /> },
  { id: 'financeiro', label: 'Financeiro', icon: <DollarSign /> },
  { id: 'vendas', label: 'Vendas', icon: <TrendingUp /> },
  { id: 'clientes', label: 'Clientes', icon: <Users /> },
  { id: 'profissionais', label: 'Profissionais', icon: <Star /> }
]

export default function ReportsPage() {
  const permissions = usePermissions()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [favorites, setFavorites] = useState<string[]>([])

  const filteredReports = selectedCategory === 'all' 
    ? reports 
    : reports.filter(r => r.category === selectedCategory)

  const toggleFavorite = (reportId: string) => {
    setFavorites(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    )
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
          <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Relatórios
            </h1>
          <p className="text-gray-600 mt-1">Análises completas do seu negócio</p>
        </div>

        {/* Categorias */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
            <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                <span className="font-medium">{category.label}</span>
            </button>
            ))}
          </div>
        </div>

        {/* Favoritos */}
        {favorites.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Favoritos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.filter(r => favorites.includes(r.id)).map(report => (
                <Link key={report.id} href={report.href}>
                  <div className="bg-white rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer border border-yellow-300">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`bg-gradient-to-br ${report.color} p-3 rounded-lg text-white`}>
                        {report.icon}
          </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          toggleFavorite(report.id)
                        }}
                        className="text-yellow-500"
                      >
                        <Star className="w-5 h-5 fill-yellow-500" />
                      </button>
                  </div>
                    <h3 className="font-bold text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  </div>
                </Link>
              ))}
                  </div>
                </div>
        )}

        {/* Grid de Relatórios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map(report => (
            <Link key={report.id} href={report.href}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:scale-105 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`bg-gradient-to-br ${report.color} p-4 rounded-xl text-white group-hover:scale-110 transition-transform`}>
                    {report.icon}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      toggleFavorite(report.id)
                    }}
                    className={`transition-colors ${
                      favorites.includes(report.id) 
                        ? 'text-yellow-500' 
                        : 'text-gray-300 hover:text-yellow-500'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${favorites.includes(report.id) ? 'fill-yellow-500' : ''}`} />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{report.title}</h3>
                <p className="text-gray-600 text-sm">{report.description}</p>
                <div className="mt-4 flex items-center text-blue-600 font-medium text-sm">
                  Ver relatório
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
                </div>
                
        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum relatório encontrado nesta categoria.</p>
            </div>
        )}
      </div>
    </DashboardLayout>
  )
}
