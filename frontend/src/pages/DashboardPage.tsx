'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'sonner'
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  Star,
  Settings
} from 'lucide-react'

import { useAuthStore } from '../store/authStore'
import DashboardLayout from '../components/DashboardLayout'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState({
    appointments: { total: 0, completed: 0 },
    revenue: { total: 0, pending: 0 },
    clients: { total: 0 },
    satisfaction: { average_rating: 0 }
  })

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setOverview({
        appointments: { total: 150, completed: 120 },
        revenue: { total: 15000, pending: 2000 },
        clients: { total: 85 },
        satisfaction: { average_rating: 4.8 }
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Visão geral do seu negócio
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Configurações de Tema */}
            <button
              onClick={() => router.push('/company-settings')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Configurações</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Agendamentos */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Agendamentos</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.appointments.total}
                </p>
                <p className="text-sm text-gray-500">
                  {overview.appointments.completed} concluídos
                </p>
              </div>
            </div>
          </div>

          {/* Receita */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Receita</h3>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {overview.revenue.total.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  R$ {overview.revenue.pending.toFixed(2)} pendentes
                </p>
              </div>
            </div>
          </div>

          {/* Clientes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Clientes</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.clients.total}
                </p>
                <p className="text-sm text-gray-500">
                  Total cadastrados
                </p>
              </div>
            </div>
          </div>

          {/* Satisfação */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Satisfação</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.satisfaction.average_rating.toFixed(1)}
                </p>
                <p className="text-sm text-gray-500">
                  Avaliação média
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Informações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card de Agendamentos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo de Agendamentos</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hoje</span>
                <span className="text-sm font-medium text-gray-900">12 agendamentos</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Esta semana</span>
                <span className="text-sm font-medium text-gray-900">85 agendamentos</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Este mês</span>
                <span className="text-sm font-medium text-gray-900">320 agendamentos</span>
              </div>
            </div>
          </div>

          {/* Card de Receita */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo de Receita</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hoje</span>
                <span className="text-sm font-medium text-gray-900">R$ 1.200,00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Esta semana</span>
                <span className="text-sm font-medium text-gray-900">R$ 8.500,00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Este mês</span>
                <span className="text-sm font-medium text-gray-900">R$ 32.000,00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/appointments')}
              className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Calendar className="w-6 h-6 text-indigo-600 mb-2" />
              <span className="text-sm font-medium text-indigo-900">Novo Agendamento</span>
            </button>
            <button
              onClick={() => router.push('/clients')}
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Users className="w-6 h-6 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">Cadastrar Cliente</span>
            </button>
            <button
              onClick={() => router.push('/services')}
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Clock className="w-6 h-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">Gerenciar Serviços</span>
            </button>
            <button
              onClick={() => router.push('/company-settings')}
              className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <Settings className="w-6 h-6 text-yellow-600 mb-2" />
              <span className="text-sm font-medium text-yellow-900">Configurações</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
