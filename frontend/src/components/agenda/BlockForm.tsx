'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { appointmentService } from '@/services/api'

interface Professional {
  id: number
  full_name: string
}

interface BlockFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  professionals: Professional[]
  selectedDate?: Date
  selectedProfessionalId?: number
}

const BLOCK_REASONS = [
  'Folga',
  'Academia',
  'Viagem',
  'Almoço',
  'Reunião',
  'Compromisso pessoal',
  'Outro'
]

export function BlockForm({
  isOpen,
  onClose,
  onSuccess,
  professionals,
  selectedDate,
  selectedProfessionalId
}: BlockFormProps) {
  const [professionalId, setProfessionalId] = useState(selectedProfessionalId?.toString() || '')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [reason, setReason] = useState('Folga')
  const [customReason, setCustomReason] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!professionalId || !startTime || !endTime) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)

    try {
      const date = selectedDate || new Date()
      const startDateTime = new Date(`${date.toISOString().split('T')[0]}T${startTime}:00`)
      const endDateTime = new Date(`${date.toISOString().split('T')[0]}T${endTime}:00`)

      const finalReason = reason === 'Outro' ? customReason : reason

      // Criar appointment sem service_id (bloqueio)
      await appointmentService.create({
        professional_id: parseInt(professionalId),
        service_id: null,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        internal_notes: `BLOQUEIO: ${finalReason}`
      })

      toast.success('Bloqueio criado com sucesso!')
      onSuccess()
    } catch (error) {
      console.error('Erro ao criar bloqueio:', error)
      toast.error('Erro ao criar bloqueio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Novo Bloqueio</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profissional *
            </label>
            <select
              value={professionalId}
              onChange={(e) => setProfessionalId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecione um profissional</option>
              {professionals.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Início *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fim *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {BLOCK_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {reason === 'Outro' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especifique o motivo
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Digite o motivo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Bloqueio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
