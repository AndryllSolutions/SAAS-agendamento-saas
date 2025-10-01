'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  Star,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react'

import { dashboardService } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date().toISOString(),
  })

  const { data: overview, isLoading } = useQuery({
    queryKey: ['dashboard-overview', dateRange],
    queryFn: () => dashboardService.getOverview(dateRange),
  })

  const { data: topServices } = useQuery({
    queryKey: ['top-services', dateRange],
    queryFn: () => dashboardService.getTopServices({ ...dateRange, limit: 5 }),
  })

  const { data: topProfessionals } = useQuery({
    queryKey: ['top-professionals', dateRange],
    queryFn: () => dashboardService.getTopProfessionals({ ...dateRange, limit: 5 }),
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  const stats = overview?.data

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="mt-1 text-gray-600">
              Bem-vindo de volta, <span className="font-semibold">{user?.full_name}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white hover:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              onChange={(e) => {
                const days = parseInt(e.target.value)
                setDateRange({
                  start_date: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
                  end_date: new Date().toISOString(),
                })
              }}
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
          </div>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Agendamentos"
            value={stats?.appointments?.total || 0}
            icon={<Calendar className="w-6 h-6" />}
            color="blue"
            subtitle={`${stats?.appointments?.completion_rate?.toFixed(1) || 0}% concluídos`}
          />
          
          <StatCard
            title="Receita Total"
            value={`R$ ${stats?.revenue?.total?.toFixed(2) || '0.00'}`}
            icon={<DollarSign className="w-6 h-6" />}
            color="green"
            subtitle={`Média: R$ ${stats?.revenue?.average_per_appointment?.toFixed(2) || '0.00'}`}
          />
          
          <StatCard
            title="Total de Clientes"
            value={stats?.clients?.total || 0}
            icon={<Users className="w-6 h-6" />}
            color="purple"
          />
          
          <StatCard
            title="Avaliação Média"
            value={stats?.satisfaction?.average_rating?.toFixed(1) || '0.0'}
            icon={<Star className="w-6 h-6" />}
            color="yellow"
            subtitle="de 5.0"
          />
        </div>

        {/* Charts and Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Services */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                🏆 Serviços Mais Populares
              </h2>
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-4">
              {topServices?.data?.map((service: any, index: number) => (
                <div key={service.service_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                      'bg-gradient-to-br from-primary to-purple-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {service.service_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {service.appointment_count} agendamentos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      R$ {service.total_revenue?.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Professionals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                ⭐ Melhores Profissionais
              </h2>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-4">
              {topProfessionals?.data?.map((prof: any, index: number) => (
                <div key={prof.professional_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                      'bg-gradient-to-br from-purple-500 to-purple-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {prof.professional_name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{prof.appointment_count} agendamentos</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {prof.average_rating?.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      R$ {prof.total_revenue?.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="Novo Agendamento"
            description="Criar um novo agendamento"
            icon={<Calendar className="w-8 h-8" />}
            href="/appointments/new"
          />
          <QuickActionCard
            title="Gerenciar Serviços"
            description="Adicionar ou editar serviços"
            icon={<Clock className="w-8 h-8" />}
            href="/services"
          />
          <QuickActionCard
            title="Relatórios"
            description="Ver relatórios detalhados"
            icon={<TrendingUp className="w-8 h-8" />}
            href="/reports"
          />
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ title, value, icon, color, subtitle }: any) {
  const colorClasses = {
    blue: { bg: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50' },
    green: { bg: 'bg-green-500', gradient: 'from-green-500 to-green-600', light: 'bg-green-50' },
    purple: { bg: 'bg-purple-500', gradient: 'from-purple-500 to-purple-600', light: 'bg-purple-50' },
    yellow: { bg: 'bg-yellow-500', gradient: 'from-yellow-500 to-yellow-600', light: 'bg-yellow-50' },
  }

  const colors = colorClasses[color as keyof typeof colorClasses]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {value}
          </p>
          {subtitle && (
            <div className="flex items-center gap-1 mt-2">
              <ArrowUp className="w-4 h-4 text-green-500" />
              <p className="text-sm text-gray-500">
                {subtitle}
              </p>
            </div>
          )}
        </div>
        <div className={`${colors.light} p-3 rounded-xl`}>
          <div className={`bg-gradient-to-br ${colors.gradient} p-2 rounded-lg text-white`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickActionCard({ title, description, icon, href }: any) {
  return (
    <a
      href={href}
      className="group bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-br from-primary to-purple-600 p-3 rounded-xl text-white group-hover:scale-110 transition-transform duration-200">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {description}
          </p>
        </div>
      </div>
    </a>
  )
}
