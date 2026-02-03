'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Check, CreditCard, User, Mail, Phone, Calendar, Clock } from 'lucide-react'
import { serviceService, userService, appointmentService } from '@/services/api'
import { toast } from 'sonner'
import { showAppointmentToast } from '@/utils/toastHelpers'

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const serviceId = searchParams.get('service')
  const professionalId = searchParams.get('professional')
  const date = searchParams.get('date')
  const time = searchParams.get('time')
  const companySlug = searchParams.get('company') || ''

  const [service, setService] = useState<any>(null)
  const [professional, setProfessional] = useState<any>(null)
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [serviceId, professionalId])

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

  const handleSubmit = async () => {
    if (!clientInfo.name || !clientInfo.email || !clientInfo.phone) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (!serviceId || !date || !time) {
      toast.error('Dados do agendamento incompletos')
      return
    }

    setSubmitting(true)
    try {
      // Criar datetime combinando data e hora
      const appointmentDateTime = new Date(`${date}T${time}:00`)
      
      const appointmentData = {
        service_id: parseInt(serviceId),
        professional_id: professionalId ? parseInt(professionalId) : null,
        start_time: appointmentDateTime.toISOString(),
        client_name: clientInfo.name,
        client_email: clientInfo.email,
        client_phone: clientInfo.phone,
        notes: clientInfo.notes
      }

      const appointmentResponse = await appointmentService.createPublic(appointmentData, companySlug || undefined)
      
      // Mostrar toast customizado
      const appointmentDate = new Date(`${date}T${time}:00`)
      showAppointmentToast({
        date: appointmentDate,
        time: time,
        professionalName: professional?.full_name,
        serviceName: service?.name,
      })
      
      // Redirecionar para página de sucesso
      const params = new URLSearchParams()
      if (companySlug) params.set('company', companySlug)
      router.push(`/scheduling/success?${params.toString()}`)
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error)
      toast.error(error.response?.data?.detail || 'Erro ao criar agendamento')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    const params = new URLSearchParams()
    if (serviceId) params.set('service', serviceId)
    if (professionalId) params.set('professional', professionalId)
    if (companySlug) params.set('company', companySlug)
    router.push(`/scheduling/datetime?${params.toString()}`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(price)
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
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-gray-300">Data e horário</span>
            </div>

            {/* Step 4: Pagamento */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-sm font-semibold">4</span>
              </div>
              <span className="text-sm font-medium text-white">Pagamento</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-6">Seus dados</h2>

        <div className="space-y-6 mb-20">
          {/* Client Info Form */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome completo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={clientInfo.name}
                onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={clientInfo.email}
                onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                WhatsApp <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={clientInfo.phone}
                onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Observações (opcional)
              </label>
              <textarea
                value={clientInfo.notes}
                onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                rows={3}
                placeholder="Alguma observação sobre o agendamento?"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Resumo do agendamento
            </h3>
            <div className="space-y-3 text-sm">
              {service && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Serviço:</span>
                  <span className="font-medium">{service.name}</span>
                </div>
              )}
              {professional && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Profissional:</span>
                  <span className="font-medium">{professional.full_name}</span>
                </div>
              )}
              {date && (
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Data:
                  </span>
                  <span className="font-medium">{new Date(date).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
              {time && (
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Horário:
                  </span>
                  <span className="font-medium">{time}</span>
                </div>
              )}
              {service && (
                <div className="flex justify-between pt-3 border-t border-gray-700">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold text-blue-400">
                    {formatPrice(service.price || 0)}
                  </span>
                </div>
              )}
            </div>
          </div>
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
              onClick={handleSubmit}
              disabled={submitting || !clientInfo.name || !clientInfo.email || !clientInfo.phone}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors"
            >
              {submitting ? 'Agendando...' : 'Confirmar agendamento'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PaymentContent />
    </Suspense>
  )
}

