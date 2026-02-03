'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, ArrowRight, Check, User, ArrowLeft } from 'lucide-react'
import { userService, serviceService } from '@/services/api'
import Image from 'next/image'

function EmployeesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const serviceId = searchParams.get('service')
  const companySlug = searchParams.get('company') || ''

  const [service, setService] = useState<any>(null)
  const [professionals, setProfessionals] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [serviceId])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Buscar serviço selecionado
      if (serviceId) {
        const serviceRes = await serviceService.get(parseInt(serviceId))
        setService(serviceRes.data)
      }
      
      // Buscar profissionais públicos
      const profsRes = await userService.getProfessionalsPublic(companySlug || undefined)
      setProfessionals(profsRes.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProfessionals = professionals.filter((prof: any) => {
    return prof.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleProfessionalClick = (professionalId: number | null) => {
    const params = new URLSearchParams()
    if (serviceId) params.set('service', serviceId)
    if (professionalId) params.set('professional', professionalId.toString())
    if (companySlug) params.set('company', companySlug)
    
    router.push(`/scheduling/datetime?${params.toString()}`)
  }

  const handleBack = () => {
    const params = new URLSearchParams()
    if (companySlug) params.set('company', companySlug)
    router.push(`/scheduling?${params.toString()}`)
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
                <span className="text-sm font-semibold">2</span>
              </div>
              <span className="text-sm font-medium text-white">Profissional</span>
            </div>

            {/* Step 3: Data e horário */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-sm text-gray-400">3</span>
              </div>
              <span className="text-sm text-gray-400">Data e horário</span>
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
        <h2 className="text-xl font-semibold mb-6">Escolha um profissional</h2>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Procurar profissional"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Professionals List */}
        <div className="space-y-3 mb-20">
          {/* Option: No Preference */}
          <div
            onClick={() => handleProfessionalClick(null)}
            className="bg-gray-800 rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-750 transition-colors border border-gray-700 hover:border-gray-600"
          >
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-1">Sem preferência</h3>
              <p className="text-sm text-gray-400">Exibe todos os horários disponíveis</p>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
          </div>

          {/* Professionals */}
          {filteredProfessionals.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>Nenhum profissional encontrado.</p>
            </div>
          ) : (
            filteredProfessionals.map((prof: any) => (
              <div
                key={prof.id}
                onClick={() => handleProfessionalClick(prof.id)}
                className="bg-gray-800 rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-750 transition-colors border border-gray-700 hover:border-gray-600"
              >
                {/* Professional Avatar */}
                <div className="w-12 h-12 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                  {prof.avatar_url ? (
                    <Image
                      src={prof.avatar_url}
                      alt={prof.full_name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Professional Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1 truncate">{prof.full_name}</h3>
                  <p className="text-sm text-gray-400">
                    {prof.role === 'PROFESSIONAL' ? 'Cabeleireiro(a)' : 
                     prof.role === 'MANICURE' ? 'Manicure' : 
                     prof.specialties?.[0] || 'Profissional'}
                  </p>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Back Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4">
          <button
            onClick={handleBack}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
        </div>
      </main>
    </div>
  )
}

export default function EmployeesPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <EmployeesContent />
    </Suspense>
  )
}

