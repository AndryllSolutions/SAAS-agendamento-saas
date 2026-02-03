'use client'

import { Bell, Sparkles } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'

export default function NewsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Novidades</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h2 className="text-xl font-bold">Bem-vindo ao Atendo!</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Fique por dentro das últimas atualizações e melhorias do sistema.
          </p>
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold">Sistema em constante evolução</h3>
              <p className="text-sm text-gray-600">Novas funcionalidades são adicionadas regularmente.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

