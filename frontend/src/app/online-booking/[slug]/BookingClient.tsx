"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  CalendarDays,
  Clock,
  Instagram,
  Loader2,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { Steps } from '@/components/online-booking/Steps'
import { ServiceCard } from '@/components/online-booking/ServiceCard'
import { ProfessionalList } from '@/components/online-booking/ProfessionalList'
import { TimeSlots } from '@/components/online-booking/TimeSlots'
import { BookingForm } from '@/components/online-booking/BookingForm'
import type {
  BookingFormValues,
  CompanyProfile,
  ProfessionalItem,
  ServiceItem,
} from '@/components/online-booking/types'
import {
  createPublicAppointment,
  getPublicAvailability,
  getPublicProfessionals,
  getPublicServices,
} from '@/services/publicBookingService'

interface BookingClientProps {
  company: CompanyProfile
  slug: string
  apiBaseUrl: string
}

type Tab = 'services' | 'professionals' | 'details'

const steps = [
  { label: 'Serviço' },
  { label: 'Profissional' },
  { label: 'Horário' },
  { label: 'Confirmar' },
]

export default function BookingClient({ company, slug, apiBaseUrl }: BookingClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('services')
  const [services, setServices] = useState<ServiceItem[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [servicesError, setServicesError] = useState<string | null>(null)

  const [professionals, setProfessionals] = useState<ProfessionalItem[]>([])
  const [professionalsLoading, setProfessionalsLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalItem | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')

  const [slots, setSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  const [submitLoading, setSubmitLoading] = useState(false)

  const companyId = company.id

  const currentStep = useMemo(() => {
    if (!selectedService) return 1
    if (!selectedProfessional) return 2
    if (!selectedDate || !selectedSlot) return 3
    return 4
  }, [selectedDate, selectedProfessional, selectedService, selectedSlot])

  const categories = useMemo(() => {
    const unique = new Set<string>()
    services.forEach((service) => {
      if (service.category) {
        unique.add(service.category)
      }
    })
    return Array.from(unique)
  }, [services])

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const term = search.trim().toLowerCase()
      const matchesTerm = term
        ? service.name.toLowerCase().includes(term) || service.description?.toLowerCase().includes(term)
        : true
      const matchesCategory = categoryFilter ? service.category === categoryFilter : true
      return matchesTerm && matchesCategory
    })
  }, [categoryFilter, search, services])

  const fetchServices = useCallback(async () => {
    setServicesLoading(true)
    setServicesError(null)
    try {
      const data = await getPublicServices(apiBaseUrl, companyId)
      setServices(data)
    } catch (error: any) {
      const message = error?.message || 'Erro ao carregar serviços.'
      setServicesError(message)
      toast.error(message)
    } finally {
      setServicesLoading(false)
    }
  }, [apiBaseUrl, companyId])

  const fetchProfessionals = useCallback(async () => {
    setProfessionalsLoading(true)
    try {
      const data = await getPublicProfessionals(apiBaseUrl, companyId)
      setProfessionals(data)
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao carregar profissionais.')
    } finally {
      setProfessionalsLoading(false)
    }
  }, [apiBaseUrl, companyId])

  const fetchAvailability = useCallback(async () => {
    if (!selectedService || !selectedProfessional || !selectedDate) {
      setSlots([])
      return
    }

    setSlotsLoading(true)
    try {
      const data = await getPublicAvailability(apiBaseUrl, {
        companyId,
        serviceId: selectedService.id,
        professionalId: selectedProfessional.id,
        date: selectedDate,
      })
      setSlots(data.slots || [])
    } catch (error: any) {
      setSlots([])
      toast.error(error?.message || 'Erro ao buscar horários disponíveis.')
    } finally {
      setSlotsLoading(false)
    }
  }, [apiBaseUrl, companyId, selectedDate, selectedProfessional, selectedService])

  useEffect(() => {
    fetchServices()
    fetchProfessionals()
  }, [fetchProfessionals, fetchServices])

  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  const handleServiceSelect = (service: ServiceItem) => {
    setSelectedService(service)
    setSelectedProfessional(null)
    setSelectedDate('')
    setSelectedSlot('')
    setActiveTab('professionals')
  }

  const handleProfessionalSelect = (professional: ProfessionalItem) => {
    setSelectedProfessional(professional)
    setSelectedDate('')
    setSelectedSlot('')
  }

  const handleDateChange = (value: string) => {
    setSelectedDate(value)
    setSelectedSlot('')
  }

  const minDate = useMemo(() => new Date().toISOString().split('T')[0], [])

  const canSubmit = Boolean(selectedService && selectedProfessional && selectedDate && selectedSlot)

  const handleSubmit = async (values: BookingFormValues) => {
    if (!canSubmit || !selectedService || !selectedProfessional) {
      toast.error('Selecione serviço, profissional, data e horário antes de confirmar.')
      return
    }

    setSubmitLoading(true)
    try {
      await createPublicAppointment(apiBaseUrl, {
        companyId,
        serviceId: selectedService.id,
        professionalId: selectedProfessional.id,
        date: selectedDate,
        time: selectedSlot,
        customer: {
          name: values.name,
          phone: values.phone,
          email: values.email,
          notes: values.notes,
        },
      })

      toast.success('Agendamento confirmado! Você receberá os detalhes por email/WhatsApp.')
      setSelectedService(null)
      setSelectedProfessional(null)
      setSelectedDate('')
      setSelectedSlot('')
      setActiveTab('services')
      router.push(`/online-booking/${slug}/success`)
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao confirmar agendamento.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const renderServicesTab = () => (
    <div className="space-y-6">
      <div>
        <label className="flex items-center text-sm font-medium text-gray-500">
          <Search className="mr-2 h-4 w-4" /> Procurar serviço
        </label>
        <input
          type="text"
          placeholder="Procure por nome ou descrição"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none"
        />
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter('')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              categoryFilter === ''
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 shadow-sm'
            }`}
          >
            Todas
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setCategoryFilter(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                categoryFilter === category
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 shadow-sm'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {servicesLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-white/60" />
          ))
        ) : servicesError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">
            {servicesError}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-6 text-center text-sm text-gray-500">
            Nenhum serviço encontrado com esse filtro.
          </div>
        ) : (
          filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              active={selectedService?.id === service.id}
              onSelect={handleServiceSelect}
            />
          ))
        )}
      </div>
    </div>
  )

  const renderProfessionalsTab = () => (
    <div className="space-y-6">
      {!selectedService && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-6 text-center text-sm text-gray-500">
          Escolha um serviço para listar os profissionais disponíveis.
        </div>
      )}

      {selectedService && (
        <ProfessionalList
          professionals={professionals}
          loading={professionalsLoading}
          selectedId={selectedProfessional?.id}
          onSelect={handleProfessionalSelect}
        />
      )}

      {selectedProfessional && (
        <div className="space-y-4 rounded-2xl bg-white/90 p-4 shadow-sm">
          <label className="text-sm font-semibold text-gray-600">Escolha a data</label>
          <input
            type="date"
            min={minDate}
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-gray-900 focus:outline-none"
          />

          {selectedDate && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <Clock className="h-4 w-4" /> Horários disponíveis
              </div>
              <TimeSlots
                slots={slots}
                selected={selectedSlot}
                onSelect={setSelectedSlot}
                loading={slotsLoading}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )

  const renderDetailsTab = () => (
    <div className="space-y-4 rounded-2xl bg-white/90 p-4 shadow-sm">
      <div className="flex items-center gap-3 text-gray-600">
        <MapPin className="h-4 w-4" />
        <span>{company.address || 'Endereço não informado'}</span>
      </div>
      <div className="flex items-center gap-3 text-gray-600">
        <Phone className="h-4 w-4" />
        <span>{company.phone || company.whatsapp || 'Telefone não informado'}</span>
      </div>
      {company.instagram && (
        <a
          href={company.instagram}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 text-gray-600 transition hover:text-gray-900"
        >
          <Instagram className="h-4 w-4" />
          {company.instagram.replace('https://', '')}
        </a>
      )}
      {company.description && <p className="text-sm text-gray-500">{company.description}</p>}
      <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
        Atendimento rápido, confirmação instantânea e lembretes automáticos. Qualquer dúvida, fale com nossa equipe.
      </div>
    </div>
  )

  const summaryCard = selectedService || selectedProfessional || selectedDate ? (
    <div className="space-y-2 rounded-2xl bg-white/90 p-4 text-sm text-gray-600 shadow-sm">
      <h4 className="text-base font-semibold text-gray-900">Resumo</h4>
      {selectedService && (
        <div className="flex items-center justify-between">
          <span>Serviço</span>
          <strong>{selectedService.name}</strong>
        </div>
      )}
      {selectedProfessional && (
        <div className="flex items-center justify-between">
          <span>Profissional</span>
          <strong>{selectedProfessional.name || selectedProfessional.full_name}</strong>
        </div>
      )}
      {selectedDate && (
        <div className="flex items-center justify-between">
          <span>Data</span>
          <strong>{new Date(selectedDate).toLocaleDateString('pt-BR')}</strong>
        </div>
      )}
      {selectedSlot && (
        <div className="flex items-center justify-between">
          <span>Horário</span>
          <strong>{selectedSlot}</strong>
        </div>
      )}
    </div>
  ) : null

  return (
    <div className="min-h-screen bg-[#f5f6f8] px-4 py-8 text-gray-900">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {company.logo_url || company.logoUrl ? (
              <Image
                src={company.logo_url || (company.logoUrl as string)}
                alt={company.name}
                width={72}
                height={72}
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-2xl font-bold">
                {company.name?.slice(0, 1) || 'A'}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm uppercase tracking-widest text-gray-400">{slug.replace('-', ' ')}</p>
              <h1 className="text-2xl font-bold">{company.name}</h1>
              <p className="text-sm text-gray-500">{company.description || 'Escolha um serviço e agende em segundos.'}</p>
            </div>
            <div className="rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-700">
              {company.status === 'closed' ? 'Fechado' : 'Aberto agora'}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" /> Atendimento com hora marcada
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> Confirmação instantânea
            </div>
          </div>
        </header>

        <nav className="flex gap-2 rounded-3xl bg-white p-2 shadow-sm">
          {[
            { id: 'services', label: 'Serviços' },
            { id: 'professionals', label: 'Profissionais' },
            { id: 'details', label: 'Detalhes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <Steps steps={steps} currentStep={currentStep} />

        {activeTab === 'services' && renderServicesTab()}
        {activeTab === 'professionals' && renderProfessionalsTab()}
        {activeTab === 'details' && renderDetailsTab()}

        {summaryCard}

        <div className="space-y-4 rounded-3xl bg-white p-6 shadow-lg">
          <h2 className="text-xl font-semibold">Finalize seu agendamento</h2>
          <p className="text-sm text-gray-500">
            Informe seus dados para confirmarmos o horário e enviarmos notificações.
          </p>

          {!selectedService && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
              Escolha um serviço para liberar o formulário de agendamento.
            </div>
          )}

          <BookingForm onSubmit={handleSubmit} loading={submitLoading} disabled={!canSubmit || submitLoading} />
        </div>

        {!canSubmit && (
          <div className="text-center text-xs text-gray-500">
            Selecione serviço, profissional, data e horário para liberar o botão “Agendar agora”.
          </div>
        )}

        {(servicesLoading || professionalsLoading || submitLoading) && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Atualizando disponibilidade em tempo real
          </div>
        )}
      </div>
    </div>
  )
}
