'use client'

import { useState } from 'react'
import { Calendar, Clock, Plus, X } from 'lucide-react'
import { SubDrawer } from './SubDrawer'
import { toast } from 'sonner'

interface Employee {
  id: number
  full_name: string
}

interface NovaPersonalizacaoDrawerProps {
  employee: Employee
  level: number
  onClose: () => void
  onSuccess?: () => void
}

const weekDays = [
  { id: 'monday', label: 'Segunda', short: 'SEG' },
  { id: 'tuesday', label: 'Terça', short: 'TER' },
  { id: 'wednesday', label: 'Quarta', short: 'QUA' },
  { id: 'thursday', label: 'Quinta', short: 'QUI' },
  { id: 'friday', label: 'Sexta', short: 'SEX' },
  { id: 'saturday', label: 'Sábado', short: 'SAB' },
  { id: 'sunday', label: 'Domingo', short: 'DOM' }
]

export function NovaPersonalizacaoDrawer({ 
  employee, 
  level, 
  onClose, 
  onSuccess 
}: NovaPersonalizacaoDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    description: '',
    selectedDays: [] as string[],
    startTime: '08:00',
    breakTime: '12:00',
    endTime: '18:00'
  })

  const handleDayToggle = (dayId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayId)
        ? prev.selectedDays.filter(d => d !== dayId)
        : [...prev.selectedDays, dayId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!formData.startDate || !formData.endDate) {
      toast.error('Preencha as datas inicial e final')
      return
    }
    
    if (formData.selectedDays.length === 0) {
      toast.error('Selecione pelo menos um dia da semana')
      return
    }
    
    if (!formData.description.trim()) {
      toast.error('Preencha a descrição')
      return
    }

    setLoading(true)
    
    try {
      // TODO: Implementar chamada à API
      // await professionalService.createScheduleOverride(employee.id, {
      //   start_date: formData.startDate,
      //   end_date: formData.endDate,
      //   description: formData.description,
      //   week_days: formData.selectedDays,
      //   start_time: formData.startTime,
      //   break_time: formData.breakTime,
      //   end_time: formData.endTime
      // })
      
      console.log('Nova personalização:', formData)
      
      toast.success('Personalização criada com sucesso!')
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error('Erro ao criar personalização')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SubDrawer 
      title="Nova Personalização de Horário" 
      level={level}
      onClose={onClose}
      width="normal"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Datas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Data Inicial
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Data Final
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              min={formData.startDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Ex: Feriado, Folga, Curso, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Dias da Semana */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dias da Semana
          </label>
          <div className="flex flex-wrap gap-2">
            {weekDays.map(day => (
              <button
                key={day.id}
                type="button"
                onClick={() => handleDayToggle(day.id)}
                className={`px-3 py-2 rounded-lg border transition-colors ${
                  formData.selectedDays.includes(day.id)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {day.short}
              </button>
            ))}
          </div>
        </div>

        {/* Horários */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Horários
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Início</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">Intervalo</label>
              <input
                type="time"
                value={formData.breakTime}
                onChange={(e) => setFormData(prev => ({ ...prev, breakTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fim</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </SubDrawer>
  )
}
