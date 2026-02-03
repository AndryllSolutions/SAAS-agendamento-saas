'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, ChevronDown, ArrowRight, Crown } from 'lucide-react'
import { serviceService, companyService } from '@/services/api'
import Image from 'next/image'

function SchedulingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const companySlug = searchParams.get('company') || ''
  
  const [company, setCompany] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompanyAndServices()
  }, [companySlug])

  const loadCompanyAndServices = async () => {
    try {
      setLoading(true)
      
      // Buscar empresa pelo slug
      if (companySlug) {
        const companyRes = await companyService.getCompanyBySlug(companySlug)
        setCompany(companyRes.data)
      }
      
      // Buscar serviços públicos
      const servicesRes = await serviceService.listPublic(companySlug || undefined)
      const servicesData = servicesRes.data || []
      setServices(servicesData)
      
      // Extrair categorias únicas dos serviços
      const uniqueCategories = Array.from(
        new Set(servicesData.map((s: any) => s.category?.name).filter(Boolean))
      )
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter((service: any) => {
    const matchesSearch = service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || service.category?.name === selectedCategory
    return matchesSearch && matchesCategory
  })

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}:${mins.toString().padStart(2, '0')} h` : `${hours}:00 h`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(price)
  }

  const handleServiceClick = (serviceId: number) => {
    router.push(`/scheduling/employees?service=${serviceId}${companySlug ? `&company=${companySlug}` : ''}`)
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-400" />
                <h1 className="text-xl font-bold">{company?.name || 'IMPÉRIO CAPELLI'}</h1>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gray-600"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            <button className="px-4 py-3 text-gray-400 hover:text-white border-b-2 border-transparent hover:border-gray-600">
              Detalhes
            </button>
            <button className="px-4 py-3 text-white border-b-2 border-blue-500 font-medium">
              Serviços
            </button>
            <button className="px-4 py-3 text-gray-400 hover:text-white border-b-2 border-transparent hover:border-gray-600">
              Profissionais
            </button>
            <button className="px-4 py-3 text-gray-400 hover:text-white border-b-2 border-transparent hover:border-gray-600">
              Assinaturas
            </button>
            <button className="px-4 py-3 text-gray-400 hover:text-white border-b-2 border-transparent hover:border-gray-600">
              Avaliações
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Procurar serviço"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-6">
            <div className="relative inline-block">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">Todas as categorias</option>
                {categories.map((cat: string) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Services List */}
        <div className="space-y-4 mb-8">
          {filteredServices.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>Nenhum serviço encontrado.</p>
            </div>
          ) : (
            filteredServices.map((service: any) => (
              <div
                key={service.id}
                onClick={() => handleServiceClick(service.id)}
                className="bg-gray-800 rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-750 transition-colors border border-gray-700 hover:border-gray-600"
              >
                {/* Service Image */}
                <div className="w-20 h-20 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                  {service.image_url ? (
                    <Image
                      src={service.image_url}
                      alt={service.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <span className="text-2xl">✂️</span>
                    </div>
                  )}
                </div>

                {/* Service Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 truncate">{service.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{formatDuration(service.duration_minutes || 0)}</span>
                    <span>A partir de {formatPrice(service.price || 0)}</span>
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Schedule Button */}
        {filteredServices.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4">
            <button
              onClick={() => {
                if (filteredServices.length > 0) {
                  handleServiceClick(filteredServices[0].id)
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition-colors"
            >
              Agendar agora
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default function SchedulingPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SchedulingContent />
    </Suspense>
  )
}

