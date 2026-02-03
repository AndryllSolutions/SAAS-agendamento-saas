'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para login se não estiver autenticado
    const timer = setTimeout(() => {
      // Verificar autenticação aqui se necessário
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mt-4">Página não encontrada</h2>
          <p className="text-gray-600 mt-2">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={() => router.push('/')}
            className="w-full"
          >
            Voltar para o Início
          </Button>
          
          <Link href="/login">
            <Button variant="secondary" className="w-full">
              Fazer Login
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          Se você acredita que isso é um erro, entre em contato com o suporte.
        </div>
      </div>
    </div>
  )
}
