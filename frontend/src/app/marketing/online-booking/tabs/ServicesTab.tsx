'use client'

import { useState, useEffect } from 'react'
import { Loader2, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { onlineBookingService } from '@/services/onlineBookingService'

interface Service {
  id: number
  name: string
  description?: string
  price: number
  duration_minutes: number
  available_online?: boolean
}

export default function ServicesTab() {
  const [loading, setLoading] = useState(true)
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [unavailableServices, setUnavailableServices] = useState<Service[]>([])

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      const [available, unavailable] = await Promise.all([
        onlineBookingService.listAvailableServices(),
        onlineBookingService.listUnavailableServices()
      ])
      setAvailableServices(available)
      setUnavailableServices(unavailable)
    } catch (error: any) {
      console.error('Erro ao carregar serviços:', error)
      toast.error('Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAvailability = async (serviceId: number, makeAvailable: boolean) => {
    try {
      await onlineBookingService.toggleServiceAvailability(serviceId, makeAvailable)
      toast.success(makeAvailable ? 'Serviço disponibilizado!' : 'Serviço indisponibilizado!')
      loadServices()
    } catch (error: any) {
      console.error('Erro ao alterar disponibilidade:', error)
      toast.error('Erro ao alterar disponibilidade')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${mins}min`
    }
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
        <h3 className="text-lg font-semibold mb-2">Serviços Disponíveis</h3>
        <p className="text-sm text-gray-600 mb-6">
          Gerencie quais serviços estarão disponíveis para agendamento online
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Serviços Disponíveis */}
        <div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-green-900 mb-1">Disponíveis</h4>
            <p className="text-sm text-green-700">
              Serviços que estão disponíveis para seus clientes agendarem online. Clique em "Indisponibilizar" para removê-lo do Agendamento Online.
            </p>
          </div>

          <div className="space-y-3">
            {availableServices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum serviço disponível</p>
                <p className="text-sm mt-1">Disponibilize serviços para agendamento online</p>
              </div>
            ) : (
              availableServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <img
                          src={`https://ui-avatars.com/api/?name=${service.name}&background=random`}
                          alt={service.name}
                          className="w-10 h-10 rounded-lg"
                        />
                        <div>
                          <h5 className="font-semibold text-gray-900">{service.name}</h5>
                          {service.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">{service.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                        <span>{formatDuration(service.duration_minutes)}</span>
                        <span className="font-semibold text-green-600">
                          A partir de {formatPrice(service.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleAvailability(service.id, false)}
                    className="w-full mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Indisponibilizar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Serviços Indisponíveis */}
        <div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-1">Indisponíveis</h4>
            <p className="text-sm text-gray-600">
              Serviços que estão cadastrados, porém, não estão disponíveis para seus clientes agendarem. Clique em "Disponibilizar" para torná-lo ativo.
            </p>
          </div>

          <div className="space-y-3">
            {unavailableServices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Todos os serviços estão disponíveis</p>
              </div>
            ) : (
              unavailableServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <img
                          src={`https://ui-avatars.com/api/?name=${service.name}&background=cccccc`}
                          alt={service.name}
                          className="w-10 h-10 rounded-lg grayscale"
                        />
                        <div>
                          <h5 className="font-semibold text-gray-900">{service.name}</h5>
                          {service.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">{service.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                        <span>{formatDuration(service.duration_minutes)}</span>
                        <span className="font-semibold">
                          A partir de {formatPrice(service.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleAvailability(service.id, true)}
                    className="w-full mt-3 text-sm text-primary hover:text-primary/80 font-medium flex items-center justify-center gap-1"
                  >
                    Disponibilizar
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Nota */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Dica:</strong> Mantenha apenas os serviços mais populares disponíveis para agendamento online. Isso facilita a escolha do cliente e aumenta a conversão.
        </p>
      </div>
    </div>
  )
}
