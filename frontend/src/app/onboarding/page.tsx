'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { CheckCircle2, ArrowRight, Users, CalendarDays, Scissors, Settings2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    // Se não estiver autenticado, manda para login
    if (!isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-3xl w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <div>
              <h1 className="text-2xl font-bold">
                Empresa criada com sucesso!
              </h1>
              <p className="text-gray-600 text-sm">
                Vamos configurar profissionais, serviços e agenda para começar a atender.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              type="button"
              onClick={() => router.push('/professionals')}
              className="p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-semibold">Profissionais</span>
              </div>
              <p className="text-xs text-gray-600">
                Cadastre sua equipe e defina quem pode atender e acessar o sistema.
              </p>
            </button>

            <button
              type="button"
              onClick={() => router.push('/services')}
              className="p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <Scissors className="w-5 h-5 text-primary" />
                <span className="font-semibold">Serviços</span>
              </div>
              <p className="text-xs text-gray-600">
                Configure cortes, procedimentos e pacotes que serão agendados.
              </p>
            </button>

            <button
              type="button"
              onClick={() => router.push('/calendar')}
              className="p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                <span className="font-semibold">Agenda</span>
              </div>
              <p className="text-xs text-gray-600">
                Acesse a agenda para começar a marcar horários com seus clientes.
              </p>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Settings2 className="w-4 h-4" />
              <span>
                Você poderá ajustar fuso horário, moeda e plano nas configurações da empresa.
              </span>
            </div>

            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90"
            >
              Ir para o painel
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


