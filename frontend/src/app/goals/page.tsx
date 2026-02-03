'use client'

import { useState, useEffect } from 'react'
import { goalService, userService } from '@/services/api'
import { Plus, Edit, Trash2, Target, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<any>(null)
  const [formData, setFormData] = useState({
    professional_id: '',
    type: 'revenue',
    target_value: 0,
    period: 'month',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [goalsRes, professionalsRes] = await Promise.all([
        goalService.list(),
        userService.getProfessionals(),
      ])
      setGoals(goalsRes.data || [])
      setProfessionals(professionalsRes.data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar metas')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const startDate = new Date(`${formData.start_date}T00:00:00`)
      let endDate = formData.end_date ? new Date(`${formData.end_date}T23:59:59`) : null

      if (!endDate) {
        endDate = new Date(startDate)
        if (formData.period === 'week') {
          endDate.setDate(endDate.getDate() + 7)
        } else if (formData.period === 'year') {
          endDate.setFullYear(endDate.getFullYear() + 1)
        } else {
          endDate.setMonth(endDate.getMonth() + 1)
        }
        endDate.setDate(endDate.getDate() - 1)
        endDate.setHours(23, 59, 59, 999)
      }

      const payload = {
        professional_id: formData.professional_id ? Number(formData.professional_id) : null,
        type: formData.type,
        target_value: formData.target_value,
        period_start: startDate.toISOString(),
        period_end: endDate.toISOString(),
      }

      if (selectedGoal) {
        await goalService.update(selectedGoal.id, payload)
        toast.success('Meta atualizada!')
      } else {
        await goalService.create(payload)
        toast.success('Meta criada!')
      }
      setShowModal(false)
      setSelectedGoal(null)
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar meta')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return
    try {
      await goalService.delete(id)
      toast.success('Meta excluída!')
      loadData()
    } catch (error: any) {
      toast.error('Erro ao excluir meta')
    }
  }

  const getProgress = (goal: any) => {
    const currentValue = Number(goal.current_value || 0)
    const targetValue = Number(goal.target_value || 0)
    if (!currentValue || !targetValue) return 0
    return Math.min((currentValue / targetValue) * 100, 100)
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'professional_id', 
      label: 'Profissional',
      render: (g: any) => {
        const prof = professionals.find(p => p.id === g.professional_id)
        return prof?.full_name || 'Todos'
      }
    },
    { 
      key: 'type', 
      label: 'Tipo',
      render: (g: any) => g.type === 'revenue' ? 'Receita' : 'Serviços'
    },
    { 
      key: 'target_value', 
      label: 'Meta',
      render: (g: any) => `R$ ${Number(g.target_value || 0).toFixed(2)}`
    },
    { 
      key: 'current_value', 
      label: 'Atual',
      render: (g: any) => `R$ ${Number(g.current_value || 0).toFixed(2)}`
    },
    {
      key: 'progress',
      label: 'Progresso',
      render: (g: any) => {
        const progress = getProgress(g)
        return (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                progress >= 100 ? 'bg-green-600' : progress >= 50 ? 'bg-yellow-600' : 'bg-red-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )
      }
    },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Metas</h1>
            <p className="text-gray-600 mt-1">Defina e acompanhe metas para profissionais</p>
          </div>
          <button
            onClick={() => {
              setSelectedGoal(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" />
            Nova Meta
          </button>
        </div>

        <DataTable
          data={goals}
          columns={columns}
          loading={loading}
          actions={(g) => (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedGoal(g)
                  setFormData({
                    professional_id: g.professional_id || '',
                    type: g.type,
                    target_value: g.target_value,
                    period: g.period,
                    start_date: g.period_start ? g.period_start.split('T')[0] : new Date().toISOString().split('T')[0],
                    end_date: g.period_end ? g.period_end.split('T')[0] : '',
                  })
                  setShowModal(true)
                }}
                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(g.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {selectedGoal ? 'Editar Meta' : 'Nova Meta'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Profissional</label>
                  <select
                    value={formData.professional_id}
                    onChange={(e) => setFormData({ ...formData, professional_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Todos</option>
                    {professionals.map(prof => (
                      <option key={prof.id} value={prof.id}>{prof.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="revenue">Receita</option>
                    <option value="services">Serviços</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valor da Meta</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Período</label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="week">Semana</option>
                    <option value="month">Mês</option>
                    <option value="year">Ano</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data Início</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setSelectedGoal(null)
                    }}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

