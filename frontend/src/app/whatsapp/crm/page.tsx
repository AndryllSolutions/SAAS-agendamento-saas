'use client'

import { MessageSquare, Users } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'

export default function WhatsAppCRMPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">CRM no WhatsApp</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-8 h-8 text-primary" />
            <h2 className="text-xl font-bold">Gerenciamento de Conversas</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Gerencie conversas e interações com clientes via WhatsApp.
          </p>
          <div className="text-center py-8 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Funcionalidade em desenvolvimento</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

