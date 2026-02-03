'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { companySettingsService } from '@/services/companySettingsService'
import { userService } from '@/services/api'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import ImageUpload from '@/components/ui/ImageUpload'
import { useThemeSettings } from '@/hooks/useThemeSettings'
import { 
  Settings, 
  Building2, 
  DollarSign, 
  Bell, 
  Palette, 
  Shield,
  Save,
  Globe,
  Flag,
  Coins,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'

interface AdminSettings {
  language: string
  currency: string
  country: string
}

interface PersonalizarSettings {
  language: string
  sidebar_color: string
}

interface NotificationPreference {
  novo_agendamento: boolean
  exclusao_cancelamento_agendamentos: boolean
  novas_avaliacoes: boolean
  respostas_sms: boolean
  retorno_cliente: boolean
  metas: boolean
  cliente_aguardando: boolean
}

interface NotificacoesSettings {
  no_computador: NotificationPreference
  no_aplicativo: NotificationPreference
}

interface FinanceiroSettings {
  permitir_lancamentos_retroativos: boolean
  permitir_alteracoes_faturas_apos_conferencia: boolean
  permitir_movimentacoes_com_caixa_fechado: boolean
}

const tabs = [
  { id: 'admin', label: 'Admin', icon: Shield },
  { id: 'personalizar', label: 'Personalizar', icon: Palette },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
]

// Opções de idioma disponíveis
const languageOptions = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español (España)' },
  { value: 'es-MX', label: 'Español (México)' },
  { value: 'es-AR', label: 'Español (Argentina)' },
]

export default function ConfiguracoesPage() {
  const { user, updateProfile } = useAuthStore()
  const { sidebarColor, updateSidebarColor } = useThemeSettings()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('empresa')

  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar_url || '')

  useEffect(() => {
    setAvatarUrl(user?.avatar_url || '')
  }, [user?.avatar_url])

  // Admin settings
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    language: 'pt-BR',
    currency: 'BRL',
    country: 'BR'
  })

  // Personalizar settings
  const [personalizarSettings, setPersonalizarSettings] = useState<PersonalizarSettings>({
    language: 'pt-BR',
    sidebar_color: sidebarColor
  })

  // Notificações settings
  const [notificacoesSettings, setNotificacoesSettings] = useState<NotificacoesSettings>({
    no_computador: {
      novo_agendamento: true,
      exclusao_cancelamento_agendamentos: true,
      novas_avaliacoes: true,
      respostas_sms: true,
      retorno_cliente: true,
      metas: true,
      cliente_aguardando: true
    },
    no_aplicativo: {
      novo_agendamento: true,
      exclusao_cancelamento_agendamentos: true,
      novas_avaliacoes: true,
      respostas_sms: true,
      retorno_cliente: true,
      metas: true,
      cliente_aguardando: true
    }
  })

  // Financeiro settings
  const [financeiroSettings, setFinanceiroSettings] = useState<FinanceiroSettings>({
    permitir_lancamentos_retroativos: false,
    permitir_alteracoes_faturas_apos_conferencia: false,
    permitir_movimentacoes_com_caixa_fechado: false
  })

  // Load settings
  useEffect(() => {
    loadSettings()
  }, [])

  // Sync sidebar color with hook
  useEffect(() => {
    setPersonalizarSettings(prev => ({
      ...prev,
      sidebar_color: sidebarColor
    }))
  }, [sidebarColor])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const data = await companySettingsService.getAllSettings()

      if (data.admin) setAdminSettings({
        language: data.admin.default_message_language || 'pt-BR',
        currency: data.admin.currency || 'BRL',
        country: data.admin.country || 'BR'
      })
      if (data.theme) setPersonalizarSettings({
        language: data.theme.interface_language || 'pt-BR',
        sidebar_color: data.theme.sidebar_color || '#3B82F6'
      })
      if (data.notifications) setNotificacoesSettings({
        no_computador: {
          novo_agendamento: data.notifications.notify_new_appointment || true,
          exclusao_cancelamento_agendamentos: data.notifications.notify_appointment_cancellation || true,
          novas_avaliacoes: data.notifications.notify_new_review || true,
          respostas_sms: data.notifications.notify_sms_response || true,
          retorno_cliente: data.notifications.notify_client_return || true,
          metas: data.notifications.notify_goal_achievement || true,
          cliente_aguardando: data.notifications.notify_client_waiting || true
        },
        no_aplicativo: {
          novo_agendamento: data.notifications.notify_new_appointment || true,
          exclusao_cancelamento_agendamentos: data.notifications.notify_appointment_cancellation || true,
          novas_avaliacoes: data.notifications.notify_new_review || true,
          respostas_sms: data.notifications.notify_sms_response || true,
          retorno_cliente: data.notifications.notify_client_return || true,
          metas: data.notifications.notify_goal_achievement || true,
          cliente_aguardando: data.notifications.notify_client_waiting || true
        }
      })
      if (data.financial) setFinanceiroSettings({
        permitir_lancamentos_retroativos: data.financial.allow_retroactive_entries || false,
        permitir_alteracoes_faturas_apos_conferencia: data.financial.allow_invoice_edit_after_conference || false,
        permitir_movimentacoes_com_caixa_fechado: data.financial.allow_operations_with_closed_cash || false
      })
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error)
      // Não mostrar erro se endpoint não existir ainda (backend não implementado)
      if (error.response?.status !== 404) {
        toast.error('Erro ao carregar configurações')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAdmin = async () => {
    setSaving(true)
    try {
      await companySettingsService.updateAdminSettings({
        default_message_language: adminSettings.language as any,
        currency: adminSettings.currency as any,
        country: adminSettings.country as any,
        timezone: 'America/Sao_Paulo',
        date_format: 'DD/MM/YYYY',
        time_format: 'HH:mm'
      })
      toast.success('✅ Configurações Admin salvas com sucesso!')
    } catch (error: any) {
      toast.error(`❌ ${error.response?.data?.detail || 'Erro ao salvar configurações'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleSavePersonalizar = async () => {
    setSaving(true)
    try {
      await updateSidebarColor(personalizarSettings.sidebar_color)
      toast.success('✅ Configurações de Personalização salvas com sucesso!')
      // Atualizar estado local
      setPersonalizarSettings(prev => ({
        ...prev,
        sidebar_color: sidebarColor
      }))
    } catch (error: any) {
      toast.error(`❌ ${error.response?.data?.detail || 'Erro ao salvar configurações'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotificacoes = async () => {
    setSaving(true)
    try {
      await companySettingsService.updateNotificationSettings({
        notify_new_appointment: notificacoesSettings.no_computador.novo_agendamento,
        notify_appointment_cancellation: notificacoesSettings.no_computador.exclusao_cancelamento_agendamentos,
        notify_appointment_deletion: notificacoesSettings.no_computador.exclusao_cancelamento_agendamentos,
        notify_new_review: notificacoesSettings.no_computador.novas_avaliacoes,
        notify_sms_response: notificacoesSettings.no_computador.respostas_sms,
        notify_client_return: notificacoesSettings.no_computador.retorno_cliente,
        notify_goal_achievement: notificacoesSettings.no_computador.metas,
        notify_client_waiting: notificacoesSettings.no_computador.cliente_aguardando,
        notification_sound_enabled: true,
        notification_duration_seconds: 5
      })
      toast.success('✅ Configurações de Notificações salvas com sucesso!')
    } catch (error: any) {
      toast.error(`❌ ${error.response?.data?.detail || 'Erro ao salvar configurações'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveFinanceiro = async () => {
    setSaving(true)
    try {
      await companySettingsService.updateFinancialSettings({
        allow_retroactive_entries: financeiroSettings.permitir_lancamentos_retroativos,
        allow_invoice_edit_after_conference: financeiroSettings.permitir_alteracoes_faturas_apos_conferencia,
        edit_only_value_after_conference: false,
        allow_operations_with_closed_cash: financeiroSettings.permitir_movimentacoes_com_caixa_fechado,
        require_category_on_transaction: false,
        require_payment_form_on_transaction: false
      })
      toast.success('✅ Configurações Financeiras salvas com sucesso!')
    } catch (error: any) {
      toast.error(`❌ ${error.response?.data?.detail || 'Erro ao salvar configurações'}`)
    } finally {
      setSaving(false)
    }
  }

  const updateNotificationPreference = (
    platform: 'no_computador' | 'no_aplicativo',
    key: keyof NotificationPreference,
    value: boolean
  ) => {
    setNotificacoesSettings(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [key]: value
      }
    }))
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando configurações...</p>
          </div>
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
              Configurações
            </h1>
            <p className="text-gray-600 mt-1">Gerencie as configurações do sistema</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Minha conta</h2>
              <p className="text-sm text-gray-600">Envie sua foto para aparecer na agenda</p>
            </div>
          </div>

          <div className="mt-4">
            <ImageUpload
              value={avatarUrl}
              onChange={async (url) => {
                try {
                  setAvatarUrl(url)
                  const response = await userService.updateMe({ avatar_url: url })
                  setUser(response.data)
                  toast.success('Foto atualizada!')
                } catch (error: any) {
                  toast.error(error?.response?.data?.detail || 'Erro ao atualizar foto')
                }
              }}
              folder="professionals"
              prefix={user?.id ? `me_${user.id}` : 'me'}
              label="Sua foto"
            />
          </div>
        </div>

        <div className="mt-4">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${isActive
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
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Admin Tab */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Configurações Administrativas</h2>
                
                {/* Idioma */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Idioma
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Beta</span>
                    </div>
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Este será o idioma padrão utilizado para o envio de mensagens pelo sistema.
                  </p>
                  <select
                    value={adminSettings.language}
                    onChange={(e) => setAdminSettings({ ...adminSettings, language: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {languageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Moeda */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4" />
                      Moeda
                    </div>
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Esta moeda será utilizada nos campos do sistema, relatórios e agendamento online.
                  </p>
                  <select
                    value={adminSettings.currency}
                    onChange={(e) => setAdminSettings({ ...adminSettings, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="BRL">R$ (Real Brasileiro)</option>
                    <option value="USD">$ (Dólar Americano)</option>
                    <option value="EUR">€ (Euro)</option>
                    <option value="ARS">$ (Peso Argentino)</option>
                    <option value="MXN">$ (Peso Mexicano)</option>
                    <option value="CLP">$ (Peso Chileno)</option>
                  </select>
                </div>

                {/* País */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4" />
                      País
                    </div>
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Este país será utilizado para sugerir estados e cidades no cadastro de endereço e na máscara dos campos de telefone.
                  </p>
                  <select
                    value={adminSettings.country}
                    onChange={(e) => setAdminSettings({ ...adminSettings, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="BR">Brasil</option>
                    <option value="US">Estados Unidos</option>
                    <option value="ES">Espanha</option>
                    <option value="MX">México</option>
                    <option value="AR">Argentina</option>
                    <option value="CL">Chile</option>
                    <option value="CO">Colômbia</option>
                    <option value="PE">Peru</option>
                  </select>
                </div>

                <button
                  onClick={handleSaveAdmin}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          )}

          {/* Personalizar Tab */}
          {activeTab === 'personalizar' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Personalização</h2>
                
                {/* Idioma */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Idioma
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Beta</span>
                    </div>
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Escolha o idioma para utilizar em seu sistema.
                  </p>
                  <select
                    value={personalizarSettings.language}
                    onChange={(e) => setPersonalizarSettings({ ...personalizarSettings, language: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {languageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cor do Menu Lateral */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Cor
                    </div>
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Escolha a cor do menu lateral do seu sistema.
                  </p>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={personalizarSettings.sidebar_color}
                      onChange={(e) => setPersonalizarSettings({ ...personalizarSettings, sidebar_color: e.target.value })}
                      className="w-20 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <div 
                      className="w-32 h-12 rounded-lg border border-gray-300"
                      style={{ backgroundColor: personalizarSettings.sidebar_color }}
                    />
                    <input
                      type="text"
                      value={personalizarSettings.sidebar_color}
                      onChange={(e) => setPersonalizarSettings({ ...personalizarSettings, sidebar_color: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSavePersonalizar}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          )}

          {/* Notificações Tab */}
          {activeTab === 'notificacoes' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Configurações de Notificações</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* No Computador */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">No computador</h3>
                    <div className="space-y-4">
                      {Object.entries(notificacoesSettings.no_computador).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <label className="text-sm font-medium text-gray-700 capitalize">
                            {key.replace(/_/g, ' ')}
                          </label>
                          <button
                            onClick={() => updateNotificationPreference('no_computador', key as keyof NotificationPreference, !value)}
                            className="focus:outline-none"
                          >
                            {value ? (
                              <ToggleRight className="w-10 h-10 text-primary" />
                            ) : (
                              <ToggleLeft className="w-10 h-10 text-gray-400" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* No Aplicativo */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">No aplicativo</h3>
                    <div className="space-y-4">
                      {Object.entries(notificacoesSettings.no_aplicativo).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <label className="text-sm font-medium text-gray-700 capitalize">
                            {key.replace(/_/g, ' ')}
                          </label>
                          <button
                            onClick={() => updateNotificationPreference('no_aplicativo', key as keyof NotificationPreference, !value)}
                            className="focus:outline-none"
                          >
                            {value ? (
                              <ToggleRight className="w-10 h-10 text-primary" />
                            ) : (
                              <ToggleLeft className="w-10 h-10 text-gray-400" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleSaveNotificacoes}
                    disabled={saving}
                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Financeiro Tab */}
          {activeTab === 'financeiro' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Configurações Financeiras</h2>
                
                {/* Permitir lançamentos retroativos */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Permitir lançamentos retroativos?
                      </h3>
                      <p className="text-sm text-gray-600">
                        Ative essa opção se precisar lançar recebimentos e despesas com datas anteriores à atual. 
                        Lançamentos retroativos podem comprometer o seu caixa.
                      </p>
                    </div>
                    <button
                      onClick={() => setFinanceiroSettings({
                        ...financeiroSettings,
                        permitir_lancamentos_retroativos: !financeiroSettings.permitir_lancamentos_retroativos
                      })}
                      className="ml-4 focus:outline-none"
                    >
                      {financeiroSettings.permitir_lancamentos_retroativos ? (
                        <ToggleRight className="w-10 h-10 text-primary" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Permitir alterações de faturas */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Permitir alterações de faturas após a sua conferência no caixa?
                      </h3>
                      <p className="text-sm text-gray-600">
                        Se sim, será possível alterar todas as informações dos recebimentos e despesas. 
                        Se não, somente o valor poderá ser alterado.
                      </p>
                    </div>
                    <button
                      onClick={() => setFinanceiroSettings({
                        ...financeiroSettings,
                        permitir_alteracoes_faturas_apos_conferencia: !financeiroSettings.permitir_alteracoes_faturas_apos_conferencia
                      })}
                      className="ml-4 focus:outline-none"
                    >
                      {financeiroSettings.permitir_alteracoes_faturas_apos_conferencia ? (
                        <ToggleRight className="w-10 h-10 text-primary" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Permitir movimentações com caixa fechado */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Permitir movimentações financeiras com o caixa fechado?
                      </h3>
                      <p className="text-sm text-gray-600">
                        Se sim, você permite que inserções, edições e exclusões financeiras sejam realizadas dentro do sistema 
                        mesmo com o caixa fechado. Se não, um aviso será exibido no momento de realizar alguma transação 
                        financeira pedindo a abertura do caixa.
                      </p>
                    </div>
                    <button
                      onClick={() => setFinanceiroSettings({
                        ...financeiroSettings,
                        permitir_movimentacoes_com_caixa_fechado: !financeiroSettings.permitir_movimentacoes_com_caixa_fechado
                      })}
                      className="ml-4 focus:outline-none"
                    >
                      {financeiroSettings.permitir_movimentacoes_com_caixa_fechado ? (
                        <ToggleRight className="w-10 h-10 text-primary" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSaveFinanceiro}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

