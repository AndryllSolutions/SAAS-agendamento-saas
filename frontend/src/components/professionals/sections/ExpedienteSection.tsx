'use client'

import { useState } from 'react'
import { Clock, Plus, Minus } from 'lucide-react'
import { useDrawerStack } from '../DrawerStackManager'
import { NovaPersonalizacaoDrawer } from '../NovaPersonalizacaoDrawer'

interface Employee {
  id: number
  full_name: string
  working_hours?: any
}

interface ExpedienteSectionProps {
  employee: Employee
  onUpdate: (hasChanges: boolean) => void
}

const weekDays = [
  { id: 'monday', label: 'Segunda-feira', short: 'SEG' },
  { id: 'tuesday', label: 'Terça-feira', short: 'TER' },
  { id: 'wednesday', label: 'Quarta-feira', short: 'QUA' },
  { id: 'thursday', label: 'Quinta-feira', short: 'QUI' },
  { id: 'friday', label: 'Sexta-feira', short: 'SEX' },
  { id: 'saturday', label: 'Sábado', short: 'SAB' },
  { id: 'sunday', label: 'Domingo', short: 'DOM' }
]

// Mock data para personalizações
const mockPersonalizacoes = [
  {
    id: 1,
    description: 'Feriado - Natal',
    startDate: '2024-12-25',
    endDate: '2024-12-25',
    days: ['SEG', 'TER', 'QUA', 'QUI', 'SEX'],
    startTime: '08:00',
    endTime: '18:00'
  }
]

export default function ExpedienteSection({ employee, onUpdate }: ExpedienteSectionProps) {
  const [activeTab, setActiveTab] = useState<'horario' | 'personalizacoes'>('horario')
  const [showNovaPersonalizacao, setShowNovaPersonalizacao] = useState(false)
  const { openDrawer, updateURL } = useDrawerStack()
  const [workingDays, setWorkingDays] = useState<Record<string, boolean>>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  })
  
  const [schedules, setSchedules] = useState<Record<string, { start: string; end: string; breakStart: string; breakEnd: string }>>({
    monday: { start: '08:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00' },
    tuesday: { start: '08:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00' },
    wednesday: { start: '08:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00' },
    thursday: { start: '08:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00' },
    friday: { start: '08:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00' },
    saturday: { start: '08:00', end: '12:00', breakStart: '', breakEnd: '' },
    sunday: { start: '08:00', end: '12:00', breakStart: '', breakEnd: '' }
  })

  const handleDayToggle = (dayId: string) => {
    setWorkingDays(prev => ({ ...prev, [dayId]: !prev[dayId] }))
    onUpdate(true)
  }

  const handleScheduleChange = (dayId: string, field: string, value: string) => {
    setSchedules(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value }
    }))
    onUpdate(true)
  }

  const handleNovaPersonalizacao = () => {
    setShowNovaPersonalizacao(true)
    updateURL(employee.id, 'expediente', 'novaPersonalizacao')
  }

  const handlePersonalizacaoSuccess = () => {
    setShowNovaPersonalizacao(false)
    updateURL(employee.id, 'expediente')
    // TODO: Recarregar lista de personalizações
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Expediente
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Novo
            </span>
          </h3>
          <p className="text-sm text-gray-500">
            Configure os horários de trabalho e disponibilidade do profissional.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('horario')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'horario'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Horário
            </button>
            <button
              onClick={() => setActiveTab('personalizacoes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'personalizacoes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Personalizações de Horário
            </button>
          </nav>
        </div>

        {activeTab === 'horario' && (
          <div className="space-y-4">
            {weekDays.map((day) => (
              <div key={day.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Day Toggle */}
                    <button
                      onClick={() => handleDayToggle(day.id)}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors ${
                        workingDays[day.id]
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {day.short}
                    </button>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">{day.label}</h4>
                      <p className="text-sm text-gray-500">
                        {workingDays[day.id] ? 'Dia de trabalho' : 'Folga'}
                      </p>
                    </div>
                  </div>

                  {workingDays[day.id] && (
                    <div className="flex items-center space-x-4">
                      {/* Working Hours */}
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Expediente:</label>
                        <input
                          type="time"
                          value={schedules[day.id]?.start || ''}
                          onChange={(e) => handleScheduleChange(day.id, 'start', e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <span className="text-gray-400">às</span>
                        <input
                          type="time"
                          value={schedules[day.id]?.end || ''}
                          onChange={(e) => handleScheduleChange(day.id, 'end', e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>

                      {/* Break Hours */}
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Intervalo:</label>
                        <input
                          type="time"
                          value={schedules[day.id]?.breakStart || ''}
                          onChange={(e) => handleScheduleChange(day.id, 'breakStart', e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <span className="text-gray-400">às</span>
                        <input
                          type="time"
                          value={schedules[day.id]?.breakEnd || ''}
                          onChange={(e) => handleScheduleChange(day.id, 'breakEnd', e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'personalizacoes' && (
          <div>
            {/* Header com botão Nova Personalização */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h4 className="text-md font-medium text-gray-900">Personalizações de Horário</h4>
                <p className="text-sm text-gray-500">
                  Configure horários especiais, feriados e exceções ao expediente padrão.
                </p>
              </div>
              <button
                onClick={handleNovaPersonalizacao}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Personalização</span>
              </button>
            </div>

            {/* Lista de Personalizações */}
            <div className="space-y-3">
              {mockPersonalizacoes.length === 0 ? (
                <div className="text-center py-8 border border-gray-200 rounded-lg">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhuma personalização cadastrada</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Clique em "Nova Personalização" para configurar horários especiais
                  </p>
                </div>
              ) : (
                mockPersonalizacoes.map((personalizacao: any) => (
                  <div key={personalizacao.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">{personalizacao.description}</h5>
                        <p className="text-sm text-gray-500">
                          {personalizacao.startDate} até {personalizacao.endDate}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-400">
                            Dias: {personalizacao.days.join(', ')}
                          </span>
                          <span className="text-xs text-gray-400">
                            {personalizacao.startTime} - {personalizacao.endTime}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Sub-drawer de Nova Personalização */}
        {showNovaPersonalizacao && (
          <NovaPersonalizacaoDrawer
            employee={employee}
            level={2}
            onClose={() => {
              setShowNovaPersonalizacao(false)
              updateURL(employee.id, 'expediente')
            }}
            onSuccess={handlePersonalizacaoSuccess}
          />
        )}
      </div>
    </div>
  )
}
