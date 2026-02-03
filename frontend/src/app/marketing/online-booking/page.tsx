'use client'

import { useState } from 'react'
import { Building2, Settings, Link2, Image, Briefcase, Clock, CreditCard } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'

// Importar componentes das abas
import CompanyDetailsTab from './tabs/CompanyDetailsTab'
import ConfigurationsTab from './tabs/ConfigurationsTab'
import LinksTab from './tabs/LinksTab'
import GalleryTab from './tabs/GalleryTab'
import ServicesTab from './tabs/ServicesTab'
import BusinessHoursTab from './tabs/BusinessHoursTab'
import PaymentsTab from './tabs/PaymentsTab'

type TabType = 'details' | 'config' | 'links' | 'gallery' | 'services' | 'hours' | 'payments'

export default function OnlineBookingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('details')

  const tabs = [
    { id: 'details' as TabType, label: 'Detalhes da empresa', icon: Building2 },
    { id: 'config' as TabType, label: 'Configurações', icon: Settings },
    { id: 'links' as TabType, label: 'Links', icon: Link2 },
    { id: 'gallery' as TabType, label: 'Galeria de fotos', icon: Image },
    { id: 'services' as TabType, label: 'Serviços', icon: Briefcase },
    { id: 'hours' as TabType, label: 'Horário de atendimento', icon: Clock },
    { id: 'payments' as TabType, label: 'Pagamentos', icon: CreditCard },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return <CompanyDetailsTab />
      case 'config':
        return <ConfigurationsTab />
      case 'links':
        return <LinksTab />
      case 'gallery':
        return <GalleryTab />
      case 'services':
        return <ServicesTab />
      case 'hours':
        return <BusinessHoursTab />
      case 'payments':
        return <PaymentsTab />
      default:
        return <CompanyDetailsTab />
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Agendamento Online</h1>
          <p className="text-gray-600 mt-1">
            Configure sua página pública de agendamento online
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap
                      border-b-2 transition-colors
                      ${
                        activeTab === tab.id
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

