'use client'

import { HelpCircle, Book, MessageCircle, Video } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Link from 'next/link'

export default function HelpPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Central de Ajuda</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <HelpCircle className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Documentação</h2>
            <p className="text-gray-600 mb-4">Acesse a documentação completa do sistema</p>
            <button className="text-primary hover:underline">Ver Documentação</button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <MessageCircle className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Suporte</h2>
            <p className="text-gray-600 mb-4">Entre em contato com nosso suporte</p>
            <button className="text-primary hover:underline">Abrir Chat</button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <Video className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Tutoriais</h2>
            <p className="text-gray-600 mb-4">Assista vídeos tutoriais</p>
            <button className="text-primary hover:underline">Ver Tutoriais</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

