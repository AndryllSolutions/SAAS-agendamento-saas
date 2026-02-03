'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { serviceService, userService, appointmentService } from '@/services/api'
import { Calendar, Clock, User, Check, ArrowRight, Sparkles, Building2, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { onlineBookingService } from '@/services/onlineBookingService'

export default function CompanyBookingPage() {
  const { slug } = useParams()
  const router = useRouter()
  
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
  const [bookingConfig, setBookingConfig] = useState<any>(null)
  const [companyInfo, setCompanyInfo] = useState<any>(null)

  useEffect(() => {
    if (slug) {
      loadData()
    }
  }, [slug])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Carregar configuração da empresa
      const [servicesRes, profsRes, configRes] = await Promise.all([
        serviceService.listPublic({ company_slug: slug }),
        userService.getProfessionalsPublic({ company_slug: slug }),
        onlineBookingService.getLinks().catch(() => null)
      ])
      
      setServices(servicesRes.data || [])
      setProfessionals(profsRes.data || [])
      
      // Carregar informações da empresa (se disponível)
      if (configRes?.data?.company_name) {
        setCompanyInfo(configRes.data)
      }
      
      // Carregar configuração de agendamento
      try {
        const config = await onlineBookingService.getConfig()
        setBookingConfig(config)
      } catch (error) {
        console.log('Config not found, using defaults')
      }
      
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Create proper ISO datetime with timezone
      const appointmentDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      
      const appointmentData = {
        service_id: selectedService.id,
        professional_id: selectedProfessional.id,
        start_time: appointmentDateTime.toISOString(),
        client_name: clientInfo.name,
        client_email: clientInfo.email,
        client_phone: clientInfo.phone,
        client_notes: clientInfo.notes,
        company_slug: slug
      }
      
      await appointmentService.createPublic(appointmentData)
      
      toast.success('Agendamento realizado com sucesso! 🎉')
      
      // Reset form
      setSelectedService(null)
      setSelectedProfessional(null)
      setSelectedDate('')
      setSelectedTime('')
      setClientInfo({ name: '', email: '', phone: '', notes: '' })
      setStep(1)
      
    } catch (error: any) {
      console.error('Error creating appointment:', error)
      toast.error(error.response?.data?.detail || 'Erro ao realizar agendamento')
    } finally {
      setLoading(false)
    }
  }

  const getAvailableTimeSlots = (date: string) => {
    // Lógica para gerar horários disponíveis
    const slots = []
    const startHour = 9
    const endHour = 18
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    
    return slots
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Escolha o Serviço</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service: any) => (
                <div
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service)
                    setStep(2)
                  }}
                  className="p-6 border rounded-lg cursor-pointer hover:shadow-lg transition-all hover:border-primary"
                >
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <p className="text-gray-600 text-sm mt-2">{service.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-2xl font-bold text-primary">
                      R$ {service.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      {service.duration_minutes} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
        
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Escolha o Profissional</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {professionals.map((professional: any) => (
                <div
                  key={professional.id}
                  onClick={() => {
                    setSelectedProfessional(professional)
                    setStep(3)
                  }}
                  className="p-6 border rounded-lg cursor-pointer hover:shadow-lg transition-all hover:border-primary"
                >
                  <div className="flex items-center gap-3">
                    {professional.avatar_url ? (
                      <img
                        src={professional.avatar_url}
                        alt={professional.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {professional.full_name?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{professional.full_name}</h3>
                      {professional.specialties && (
                        <p className="text-sm text-gray-600">
                          {professional.specialties.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
        
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Escolha Data e Horário</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Data</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Horário</label>
                <div className="grid grid-cols-3 gap-2">
                  {getAvailableTimeSlots(selectedDate).map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-3 py-2 border rounded-lg text-sm ${
                        selectedTime === time
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
        
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Seus Dados</h2>
            
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Seu nome"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Telefone</label>
                <input
                  type="tel"
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
                <textarea
                  value={clientInfo.notes}
                  onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Alguma observação..."
                />
              </div>
            </div>
          </div>
        )
        
      case 5:
        return (
          <div className="space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Confirmar Agendamento</h2>
            
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold">Resumo do Agendamento</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Serviço:</span>
                    <span className="font-medium">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profissional:</span>
                    <span className="font-medium">{selectedProfessional?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium">
                      {new Date(selectedDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Horário:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor:</span>
                    <span className="font-medium text-primary">
                      R$ {selectedService?.price}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Voltar
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Agendando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header com Branding da Empresa */}
      {companyInfo && (
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {companyInfo.logo_url ? (
                  <img
                    src={companyInfo.logo_url}
                    alt={companyInfo.public_name || companyInfo.company_name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {(companyInfo.public_name || companyInfo.company_name || 'Atendo')?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {companyInfo.public_name || companyInfo.company_name}
                  </h1>
                  {companyInfo.public_description && (
                    <p className="text-sm text-gray-600">
                      {companyInfo.public_description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {companyInfo.public_phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{companyInfo.public_phone}</span>
                  </div>
                )}
                {companyInfo.public_whatsapp && (
                  <div className="flex items-center gap-1">
                    <span className="text-green-600">WhatsApp:</span>
                    <span>{companyInfo.public_whatsapp}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-12">
        {/* Progress Indicator */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= 1 ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-110' : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              <div className="flex-1 h-1 mx-2 transition-all bg-gray-200"></div>
            </div>
            <div className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= 2 ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-110' : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              <div className="flex-1 h-1 mx-2 transition-all bg-gray-200"></div>
            </div>
            <div className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= 3 ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-110' : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              <div className="flex-1 h-1 mx-2 transition-all bg-gray-200"></div>
            </div>
              <div className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= 4 ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-110' : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Serviço</span>
              <span>Profissional</span>
              <span>Data/Hora</span>
              <span>Dados</span>
              <span>Confirmar</span>
            </div>
          </div>
        </div>
        
        {/* Step Content */}
        {renderStep()}
      </div>
    </div>
  )
}
