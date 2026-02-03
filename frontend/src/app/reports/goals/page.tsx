'use client'

import { useState, useEffect } from 'react'
import { goalService } from '@/services/api'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import { usePermissions } from '@/hooks/usePermissions'
import {
  Target,
  ArrowLeft,
  TrendingUp,
  Award,
  Users,
  Calendar,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface Goal {
  id: number
  title: string
  description?: string
  target_type: 'revenue' | 'appointments' | 'clients' | 'services'
  target_value: number
  current_value: number
  start_date: string
  end_date: string
  professional_id?: number
  professional_name?: string
  status: 'active' | 'completed' | 'expired'
}

export default function GoalsReportPage() {
  const permissions = usePermissions()
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState<Goal[]>([])

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    setLoading(true)
    try {
      const response = await goalService.list()
      setGoals(response.data || [])
    } catch (error) {
      toast.error('Erro ao carregar metas')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.current_value / goal.target_value) * 100, 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getTargetTypeLabel = (type: string) => {
    switch (type) {
      case 'revenue': return 'Faturamento'
      case 'appointments': return 'Agendamentos'
      case 'clients': return 'Clientes'
      case 'services': return 'Serviços'
      default: return type
    }
  }

  const formatValue = (type: string, value: number) => {
    if (type === 'revenue') return `R$ ${value.toFixed(2)}`
    return value.toString()
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

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')
  const totalProgress = activeGoals.length > 0 
    ? activeGoals.reduce((sum, g) => sum + getProgressPercentage(g), 0) / activeGoals.length 
    : 0

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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Metas e Objetivos
              </h1>
              <p className="text-gray-600 mt-1">Acompanhamento de metas individuais e da empresa</p>
            </div>
          </div>
          <Link href="/goals/new">
            <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
              <Plus className="w-5 h-5" />
              Nova Meta
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Target className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-1">Metas Ativas</p>
                <p className="text-3xl font-bold">{activeGoals.length}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Metas Concluídas</p>
                <p className="text-3xl font-bold text-green-600">{completedGoals.length}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Progresso Médio</p>
                <p className="text-3xl font-bold text-blue-600">{totalProgress.toFixed(0)}%</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Total de Metas</p>
                <p className="text-3xl font-bold text-purple-600">{goals.length}</p>
              </div>
            </div>

            {/* Lista de Metas Ativas */}
            {activeGoals.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Metas Ativas</h2>
                <div className="space-y-4">
                  {activeGoals.map((goal) => {
                    const progress = getProgressPercentage(goal)
                    return (
                      <div key={goal.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                            <p className="text-sm text-gray-500">{goal.description}</p>
                          </div>
                          <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                            {getTargetTypeLabel(goal.target_type)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full ${getProgressColor(progress)} transition-all duration-500`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-bold text-gray-700 w-16 text-right">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            {formatValue(goal.target_type, goal.current_value)} de {formatValue(goal.target_type, goal.target_value)}
                          </span>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Até {new Date(goal.end_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        
                        {goal.professional_name && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                            <Users className="w-4 h-4" />
                            <span>{goal.professional_name}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Metas Concluídas */}
            {completedGoals.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Metas Concluídas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedGoals.map((goal) => (
                    <div key={goal.id} className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatValue(goal.target_type, goal.target_value)} alcançado!
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {goals.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma meta cadastrada</h3>
                <p className="text-gray-500 mb-4">Crie metas para acompanhar o progresso da sua equipe</p>
                <Link href="/goals/new">
                  <button className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                    Criar Primeira Meta
                  </button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

