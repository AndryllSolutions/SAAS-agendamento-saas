'use client'

import { useState, useEffect } from 'react'
import { Loader2, Building2, DollarSign, Bell, Palette, Settings, Save } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import companySettingsService from '@/services/companySettingsService'
import type { AllSettings } from '@/services/companySettingsService'

// Importar componentes das abas
import CompanyDetailsTab from './tabs/CompanyDetailsTab'
import FinancialTab from './tabs/FinancialTab'
import NotificationsTab from './tabs/NotificationsTab'
import ThemeTab from './tabs/ThemeTab'
import AdminTab from './tabs/AdminTab'

type TabId = 'details' | 'financial' | 'notifications' | 'theme' | 'admin'

export default function CompanySettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('details')
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<AllSettings | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await companySettingsService.getAllSettings()
      setSettings(data)
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error)
      toast.error('Erro ao carregar configurações da empresa')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    {
      id: 'details' as TabId,
      label: 'Detalhes da Empresa',
      icon: Building2,
      description: 'Dados cadastrais e fiscais'
    },
    {
      id: 'financial' as TabId,
      label: 'Financeiro',
      icon: DollarSign,
      description: 'Regras de caixa e lançamentos'
    },
    {
      id: 'notifications' as TabId,
      label: 'Notificações',
      icon: Bell,
      description: 'Alertas e avisos do sistema'
    },
    {
      id: 'theme' as TabId,
      label: 'Personalizar',
      icon: Palette,
      description: 'Aparência e idioma'
    },
    {
      id: 'admin' as TabId,
      label: 'Admin',
      icon: Settings,
      description: 'Configurações globais'
    }
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Configurações da Empresa
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie todas as preferências operacionais da sua empresa
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Navegação por Abas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 sticky top-6">
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-md'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <tab.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      activeTab === tab.id ? 'text-white' : 'text-primary'
                    }`} />
                    <div className="text-left">
                      <div className="font-medium">{tab.label}</div>
                      <div className={`text-xs mt-0.5 ${
                        activeTab === tab.id ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {tab.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content - Conteúdo da Aba Ativa */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {activeTab === 'details' && (
                <CompanyDetailsTab
                  data={settings?.details}
                  onUpdate={loadSettings}
                />
              )}

              {activeTab === 'financial' && (
                <FinancialTab
                  data={settings?.financial}
                  onUpdate={loadSettings}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationsTab
                  data={settings?.notifications}
                  onUpdate={loadSettings}
                />
              )}

              {activeTab === 'theme' && (
                <ThemeTab
                  data={settings?.theme}
                  onUpdate={loadSettings}
                />
              )}

              {activeTab === 'admin' && (
                <AdminTab
                  data={settings?.admin}
                  onUpdate={loadSettings}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
