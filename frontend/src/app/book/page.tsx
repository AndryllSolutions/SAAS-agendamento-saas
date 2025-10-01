'use client'

import { useState, useEffect } from 'react'
import { serviceService, userService, appointmentService } from '@/services/api'
import { Calendar, Clock, User, Check, ArrowRight, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function BookAppointmentPage() {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [servicesRes, profsRes] = await Promise.all([
        serviceService.list(),
        userService.getProfessionals()
      ])
      setServices(servicesRes.data)
      setProfessionals(profsRes.data)
    } catch (error) {
      toast.error('Erro ao carregar dados')
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const appointmentData = {
        service_id: selectedService.id,
        professional_id: selectedProfessional.id,
        start_time: `${selectedDate}T${selectedTime}:00`,
        notes: clientInfo.notes,
        client_name: clientInfo.name,
        client_email: clientInfo.email,
        client_phone: clientInfo.phone
      }

      await appointmentService.create(appointmentData)
      
      toast.success('🎉 Agendamento realizado com sucesso!')
      setStep(5) // Success step
    } catch (error) {
      toast.error('Erro ao criar agendamento')
    } finally {
      setLoading(false)
    }
  }

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Agende seu Horário
          </h1>
          <p className="text-gray-600">Escolha o melhor momento para você ✨</p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= s ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-110' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 4 && (
                  <div className={`flex-1 h-1 mx-2 transition-all ${
                    step > s ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Serviço</span>
            <span>Profissional</span>
            <span>Data/Hora</span>
            <span>Confirmar</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Select Service */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center mb-6">Escolha o Serviço</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service: any) => (
                  <div
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service)
                      setStep(2)
                    }}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-500 group"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{service.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-purple-600">R$ {service.price}</span>
                        <span className="text-sm text-gray-500">{service.duration_minutes} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Professional */}
          {step === 2 && (
            <div className="space-y-4">
              <button onClick={() => setStep(1)} className="text-purple-600 hover:underline mb-4">← Voltar</button>
              <h2 className="text-2xl font-bold text-center mb-6">Escolha o Profissional</h2>
              
              {professionals.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                  <p className="text-gray-600">Nenhum profissional disponível no momento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {professionals.map((prof: any) => (
                    <div
                      key={prof.id}
                      onClick={() => {
                        setSelectedProfessional(prof)
                        setStep(3)
                      }}
                      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-500 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                          {prof.full_name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{prof.full_name}</h3>
                          {prof.specialties && prof.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {prof.specialties.slice(0, 2).map((spec: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                  {spec}
                                </span>
                              ))}
                              {prof.specialties.length > 2 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{prof.specialties.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                          {prof.bio && (
                            <p className="text-xs text-gray-500 line-clamp-2">{prof.bio}</p>
                          )}
                        </div>
                        <ArrowRight className="w-6 h-6 text-purple-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Select Date and Time */}
          {step === 3 && (
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <button onClick={() => setStep(2)} className="text-purple-600 hover:underline mb-4">← Voltar</button>
              <h2 className="text-2xl font-bold text-center mb-6">Escolha Data e Horário</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Data</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Horário Disponível</label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-3 rounded-xl font-medium transition-all ${
                            selectedTime === time
                              ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-105'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDate && selectedTime && (
                  <button
                    onClick={() => setStep(4)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    Continuar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Client Info */}
          {step === 4 && (
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <button onClick={() => setStep(3)} className="text-purple-600 hover:underline mb-4">← Voltar</button>
              <h2 className="text-2xl font-bold text-center mb-6">Seus Dados</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome Completo</label>
                  <input
                    type="text"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">WhatsApp</label>
                  <input
                    type="tel"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
                  <textarea
                    value={clientInfo.notes}
                    onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500"
                    rows={3}
                    placeholder="Alguma observação?"
                  />
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mt-6">
                  <h3 className="font-bold mb-4">Resumo do Agendamento</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Serviço:</strong> {selectedService?.name}</p>
                    <p><strong>Profissional:</strong> {selectedProfessional?.full_name}</p>
                    <p><strong>Data:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Horário:</strong> {selectedTime}</p>
                    <p><strong>Valor:</strong> R$ {selectedService?.price}</p>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !clientInfo.name || !clientInfo.email || !clientInfo.phone}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Agendando...' : '✨ Confirmar Agendamento'}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Agendamento Confirmado! 🎉</h2>
              <p className="text-gray-600 mb-6">
                Enviamos uma confirmação para seu email e WhatsApp com todos os detalhes.
              </p>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
                <h3 className="font-bold mb-4">Detalhes do Agendamento</h3>
                <div className="space-y-2 text-sm text-left">
                  <p><strong>Serviço:</strong> {selectedService?.name}</p>
                  <p><strong>Profissional:</strong> {selectedProfessional?.full_name}</p>
                  <p><strong>Data:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Horário:</strong> {selectedTime}</p>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Voltar ao Início
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
