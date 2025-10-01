'use client'

import Link from 'next/link'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function UnauthorizedPage() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Acesso Negado
          </h1>

          <p className="text-gray-600 mb-2">
            Você não tem permissão para acessar esta página.
          </p>

          <p className="text-sm text-gray-500 mb-8">
            Seu perfil atual: <span className="font-semibold capitalize">{user?.role || 'Desconhecido'}</span>
          </p>

          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Home className="w-5 h-5" />
              Ir para Dashboard
            </Link>

            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Dica:</strong> Se você precisa de acesso adicional, entre em contato com o administrador do sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
