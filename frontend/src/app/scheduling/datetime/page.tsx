'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Calendar, Clock, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { serviceService, userService } from '@/services/api'

function DateTimeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const serviceId = searchParams.get('service')
  const professionalId = searchParams.get('professional')
  const companySlug = searchParams.get('company') || ''

  const [service, setService] = useState<any>(null)
  const [professional, setProfessional] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [serviceId, professionalId])

  useEffect(() => {
    if (selectedDate) {
      generateAvailableTimes()
    }
  }, [selectedDate])

  const loadData = async () => {
    try {
      setLoading(true)
      
      if (serviceId) {
        const serviceRes = await serviceService.get(parseInt(serviceId))
        setService(serviceRes.data)
      }
      
      if (professionalId) {
        const profRes = await userService.get(parseInt(professionalId))
        setProfessional(profRes.data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAvailableTimes = () => {
    // Gerar horários disponíveis das 9h às 18h, de 30 em 30 minutos
    const times: string[] = []
    for (let hour = 9; hour < 18; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`)
      times.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    setAvailableTimes(times)
  }

  const handleNext = () => {
    if (selectedDate && selectedTime) {
      const params = new URLSearchParams()
      if (serviceId) params.set('service', serviceId)
      if (professionalId) params.set('professional', professionalId)
      params.set('date', selectedDate)
      params.set('time', selectedTime)
      if (companySlug) params.set('company', companySlug)
      
      router.push(`/scheduling/payment?${params.toString()}`)
    }
  }

  const handleBack = () => {
    const params = new URLSearchParams()
    if (serviceId) params.set('service', serviceId)
    if (companySlug) params.set('company', companySlug)
    router.push(`/scheduling/employees?${params.toString()}`)
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Passos para agendar</h1>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {/* Step 1: Serviço */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-gray-300">Serviço</span>
            </div>

            {/* Step 2: Profissional */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-gray-300">Profissional</span>
            </div>

            {/* Step 3: Data e horário */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-sm font-semibold">3</span>
              </div>
              <span className="text-sm font-medium text-white">Data e horário</span>
            </div>

            {/* Step 4: Pagamento */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-sm text-gray-400">4</span>
              </div>
              <span className="text-sm text-gray-400">Pagamento</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-6">Escolha data e horário</h2>

        <div className="space-y-6 mb-20">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Data
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horário disponível
              </label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 rounded-lg font-medium transition-all ${
                      selectedTime === time
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 border border-gray-700 hover:border-blue-500 text-gray-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {(service || professional) && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="font-semibold mb-3">Resumo</h3>
              <div className="space-y-2 text-sm text-gray-300">
                {service && (
                  <p><strong>Serviço:</strong> {service.name}</p>
                )}
                {professional && (
                  <p><strong>Profissional:</strong> {professional.full_name}</p>
                )}
                {selectedDate && (
                  <p><strong>Data:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR')}</p>
                )}
                {selectedTime && (
                  <p><strong>Horário:</strong> {selectedTime}</p>
                )}
                {service && (
                  <p className="pt-2 border-t border-gray-700">
                    <strong>Valor:</strong> {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(service.price || 0)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedDate || !selectedTime}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Continuar
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DateTimePage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <DateTimeContent />
    </Suspense>
  )
}

