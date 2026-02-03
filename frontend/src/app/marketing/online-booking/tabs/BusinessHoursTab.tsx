'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { onlineBookingService, BusinessHours } from '@/services/onlineBookingService'

const DAYS_OF_WEEK = [
  { id: 0, name: 'Domingo' },
  { id: 1, name: 'Segunda-Feira' },
  { id: 2, name: 'Terça-Feira' },
  { id: 3, name: 'Quarta-Feira' },
  { id: 4, name: 'Quinta-Feira' },
  { id: 5, name: 'Sexta-Feira' },
  { id: 6, name: 'Sábado' },
]

export default function BusinessHoursTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hours, setHours] = useState<BusinessHours[]>([])

  useEffect(() => {
    loadBusinessHours()
  }, [])

  const loadBusinessHours = async () => {
    try {
      setLoading(true)
      const data = await onlineBookingService.listBusinessHours()
      
      // Garantir que temos horários para todos os dias
      const allDays = DAYS_OF_WEEK.map(day => {
        const existing = data.find(h => h.day_of_week === day.id)
        return existing || {
          day_of_week: day.id,
          is_active: false,
          start_time: '09:00',
          break_start_time: '12:00',
          break_end_time: '13:00',
          end_time: '18:00'
        }
      })
      
      setHours(allDays)
    } catch (error: any) {
      console.error('Erro ao carregar horários:', error)
      toast.error('Erro ao carregar horários')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await onlineBookingService.bulkUpdateBusinessHours(hours)
      toast.success('Horários salvos com sucesso!')
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar horários')
    } finally {
      setSaving(false)
    }
  }

  const handleDayChange = (dayIndex: number, field: keyof BusinessHours, value: any) => {
    setHours(prev => {
      const newHours = [...prev]
      newHours[dayIndex] = { ...newHours[dayIndex], [field]: value }
      return newHours
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Horário de Atendimento</h3>
        <p className="text-sm text-gray-600 mb-6">
          Considerar de todos os profissionais ativos, o horário inicial mais cedo e o horário final mais tarde.{' '}
          <button className="text-primary hover:underline">Visualizar sugestão</button>.
        </p>
      </div>

      {/* Tabela de Horários */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 border-b font-semibold text-sm text-gray-700">
                Dias de atendimento
              </th>
              <th className="text-center p-3 border-b font-semibold text-sm text-gray-700">
                Início expediente
              </th>
              <th className="text-center p-3 border-b font-semibold text-sm text-gray-700">
                Início intervalo
              </th>
              <th className="text-center p-3 border-b font-semibold text-sm text-gray-700">
                Fim intervalo
              </th>
              <th className="text-center p-3 border-b font-semibold text-sm text-gray-700">
                Fim expediente
              </th>
            </tr>
          </thead>
          <tbody>
            {DAYS_OF_WEEK.map((day, index) => {
              const dayHours = hours[index]
              const isActive = dayHours?.is_active !== false
              
              return (
                <tr key={day.id} className={`border-b ${!isActive ? 'bg-gray-50 opacity-60' : ''}`}>
                  <td className="p-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => handleDayChange(index, 'is_active', e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="font-medium text-gray-900">{day.name}</span>
                    </label>
                  </td>
                  <td className="p-3">
                    <input
                      type="time"
                      value={dayHours?.start_time || '09:00'}
                      onChange={(e) => handleDayChange(index, 'start_time', e.target.value)}
                      disabled={!isActive}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="time"
                      value={dayHours?.break_start_time || '12:00'}
                      onChange={(e) => handleDayChange(index, 'break_start_time', e.target.value)}
                      disabled={!isActive}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="time"
                      value={dayHours?.break_end_time || '13:00'}
                      onChange={(e) => handleDayChange(index, 'break_end_time', e.target.value)}
                      disabled={!isActive}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="time"
                      value={dayHours?.end_time || '18:00'}
                      onChange={(e) => handleDayChange(index, 'end_time', e.target.value)}
                      disabled={!isActive}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Nota */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Dica:</strong> Configure os horários de acordo com a disponibilidade dos seus profissionais. Os clientes só poderão agendar dentro destes horários.
        </p>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar
            </>
          )}
        </button>
      </div>
    </div>
  )
}
