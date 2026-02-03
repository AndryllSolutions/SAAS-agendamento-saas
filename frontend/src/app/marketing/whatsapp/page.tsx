'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { MessageCircle, Sparkles, Settings as SettingsIcon, FileText, Send } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'

export default function WhatsAppMarketingPage() {
  const router = useRouter()
  const pathname = usePathname()
  
  const getActiveTab = () => {
    if (pathname?.includes('/custom-campaigns')) return 'custom'
    if (pathname?.includes('/templates')) return 'templates'
    if (pathname?.includes('/campaigns')) return 'manual'
    if (pathname?.includes('/settings')) return 'settings'
    return 'campaigns'
  }
  
  const [activeTab, setActiveTab] = useState(getActiveTab())

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === 'campaigns') {
      router.push('/marketing/whatsapp/automated-campaigns')
    } else if (tab === 'custom') {
      router.push('/marketing/whatsapp/custom-campaigns')
    } else if (tab === 'templates') {
      router.push('/marketing/whatsapp/templates')
    } else if (tab === 'manual') {
      router.push('/marketing/whatsapp/campaigns')
    } else if (tab === 'settings') {
      router.push('/marketing/whatsapp/settings')
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Marketing</h1>
          <p className="text-gray-600 mt-1">Gerencie suas campanhas automáticas de WhatsApp</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('campaigns')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'campaigns'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Campanhas Automáticas
            </button>
            <button
              onClick={() => handleTabChange('manual')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'manual'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Send className="w-4 h-4" />
              Campanhas Manuais
            </button>
            <button
              onClick={() => handleTabChange('custom')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'custom'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Campanhas Personalizadas
            </button>
            <button
              onClick={() => handleTabChange('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              Templates
            </button>
            <button
              onClick={() => handleTabChange('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              Configurações
            </button>
          </nav>
        </div>

        {/* Info: As subpáginas renderizam o conteúdo */}
        <div className="text-sm text-gray-500 text-center py-4">
          Selecione uma aba acima para começar
        </div>
      </div>
    </DashboardLayout>
  )
}
