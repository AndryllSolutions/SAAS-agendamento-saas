'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import { adminService } from '@/services/api'
import { Shield, Key, Mail, MessageSquare, Phone, Bell, Save, Eye, EyeOff, Check, X, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationConfig {
  smtp: {
    host: string
    port: number
    user: string
    password: string
    from: string
    from_name: string
  }
  twilio: {
    account_sid: string
    auth_token: string
    phone_number: string
  }
  whatsapp: {
    api_url: string
    api_token: string
    phone_number: string
  }
  vapid: {
    public_key: string
    private_key: string
    mailto: string
  }
}

export default function NotificationsConfigPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [testing, setTesting] = useState<string | null>(null)
  
  const [config, setConfig] = useState<NotificationConfig>({
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      user: '',
      password: '',
      from: 'noreply@agendamento.com',
      from_name: 'Agendamento SaaS'
    },
    twilio: {
      account_sid: '',
      auth_token: '',
      phone_number: ''
    },
    whatsapp: {
      api_url: 'https://your-whatsapp-api.com',
      api_token: '',
      phone_number: ''
    },
    vapid: {
      public_key: '',
      private_key: '',
      mailto: 'mailto:admin@agendamento.com'
    }
  })

  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | null>>({})

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await adminService.getNotificationConfig()
      if (response.data) {
        setConfig({
          smtp: response.data.smtp || config.smtp,
          twilio: response.data.twilio || config.twilio,
          whatsapp: response.data.whatsapp || config.whatsapp,
          vapid: response.data.vapid || config.vapid
        })
      }
      setLoading(false)
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error)
      // Não mostrar erro se for 404 (configuração ainda não existe)
      if (error.response?.status !== 404) {
        toast.error('Erro ao carregar configurações')
      }
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      await adminService.saveNotificationConfig(config)
      toast.success('Configurações salvas com sucesso!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao salvar configurações'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async (service: keyof NotificationConfig) => {
    setTesting(service)
    try {
      const response = await adminService.testNotification(service)
      if (response.data.success) {
        setTestResults(prev => ({ ...prev, [service]: 'success' }))
        toast.success(`Conexão ${service} testada com sucesso!`)
      } else {
        setTestResults(prev => ({ ...prev, [service]: 'error' }))
        toast.error(response.data.error_message || `Erro ao testar conexão ${service}`)
      }
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, [service]: 'error' }))
      const errorMessage = error.response?.data?.detail || `Erro ao testar conexão ${service}`
      toast.error(errorMessage)
    } finally {
      setTesting(null)
    }
  }

  const togglePassword = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const updateConfig = (section: keyof NotificationConfig, field: string, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  // Check if user has admin permissions (normalize role for comparison)
  const normalizedRole = (user?.role || '').toUpperCase()
  const normalizedSaasRole = (user?.saas_role || '').toUpperCase()
  
  // Permitir acesso se tiver role adequado OU saas_role adequado
  const isAdmin = normalizedRole === 'SAAS_ADMIN' || 
                  normalizedRole === 'OWNER' || 
                  normalizedRole === 'ADMIN' ||
                  normalizedSaasRole === 'SAAS_OWNER' ||
                  normalizedSaasRole === 'SAAS_STAFF'
  
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h1>
            <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
            <p className="text-gray-500 text-sm mt-2">
              Necessário: OWNER, ADMIN ou SAAS_OWNER
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Seu role: {user?.role} | SaaS Role: {user?.saas_role || 'Nenhum'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando configurações...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Key className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configurações de Notificação</h1>
                <p className="text-gray-600">Configure as credenciais para envio de notificações</p>
              </div>
            </div>
            <button
              onClick={saveConfig}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SMTP Configuration */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-gray-900">Email (SMTP)</h2>
              </div>
              <button
                onClick={() => testConnection('smtp')}
                disabled={testing === 'smtp'}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50"
              >
                {testing === 'smtp' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : testResults.smtp === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : testResults.smtp === 'error' ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                Testar
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servidor SMTP</label>
                <input
                  type="text"
                  value={config.smtp.host}
                  onChange={(e) => updateConfig('smtp', 'host', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="smtp.gmail.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Porta</label>
                <input
                  type="number"
                  value={config.smtp.port}
                  onChange={(e) => updateConfig('smtp', 'port', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="587"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                <input
                  type="email"
                  value={config.smtp.user}
                  onChange={(e) => updateConfig('smtp', 'user', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="seu-email@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <div className="relative">
                  <input
                    type={showPasswords.smtp_password ? 'text' : 'password'}
                    value={config.smtp.password}
                    onChange={(e) => updateConfig('smtp', 'password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                    placeholder="Sua app password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('smtp_password')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.smtp_password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Remetente</label>
                  <input
                    type="email"
                    value={config.smtp.from}
                    onChange={(e) => updateConfig('smtp', 'from', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="noreply@agendamento.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Remetente</label>
                  <input
                    type="text"
                    value={config.smtp.from_name}
                    onChange={(e) => updateConfig('smtp', 'from_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Agendamento SaaS"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SMS Configuration */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">SMS (Twilio)</h2>
              </div>
              <button
                onClick={() => testConnection('twilio')}
                disabled={testing === 'twilio'}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 disabled:opacity-50"
              >
                {testing === 'twilio' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                ) : testResults.twilio === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : testResults.twilio === 'error' ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                Testar
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account SID</label>
                <input
                  type="text"
                  value={config.twilio.account_sid}
                  onChange={(e) => updateConfig('twilio', 'account_sid', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="ACxxxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auth Token</label>
                <div className="relative">
                  <input
                    type={showPasswords.twilio_auth_token ? 'text' : 'password'}
                    value={config.twilio.auth_token}
                    onChange={(e) => updateConfig('twilio', 'auth_token', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                    placeholder="Seu auth token"
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('twilio_auth_token')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.twilio_auth_token ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número Twilio</label>
                <input
                  type="tel"
                  value={config.twilio.phone_number}
                  onChange={(e) => updateConfig('twilio', 'phone_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+15017122661"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Configuration */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">WhatsApp API</h2>
              </div>
              <button
                onClick={() => testConnection('whatsapp')}
                disabled={testing === 'whatsapp'}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 disabled:opacity-50"
              >
                {testing === 'whatsapp' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                ) : testResults.whatsapp === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : testResults.whatsapp === 'error' ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                Testar
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API URL</label>
                <input
                  type="url"
                  value={config.whatsapp.api_url}
                  onChange={(e) => updateConfig('whatsapp', 'api_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://graph.facebook.com/v15.0/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Token</label>
                <div className="relative">
                  <input
                    type={showPasswords.whatsapp_api_token ? 'text' : 'password'}
                    value={config.whatsapp.api_token}
                    onChange={(e) => updateConfig('whatsapp', 'api_token', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                    placeholder="EAxxxxxxxxxxx"
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('whatsapp_api_token')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.whatsapp_api_token ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número WhatsApp</label>
                <input
                  type="tel"
                  value={config.whatsapp.phone_number}
                  onChange={(e) => updateConfig('whatsapp', 'phone_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+5511999999999"
                />
              </div>
            </div>
          </div>

          {/* Push Notifications Configuration */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Push Notifications (VAPID)</h2>
              </div>
              <button
                onClick={() => testConnection('vapid')}
                disabled={testing === 'vapid'}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 disabled:opacity-50"
              >
                {testing === 'vapid' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                ) : testResults.vapid === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : testResults.vapid === 'error' ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                Testar
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chave Pública</label>
                <textarea
                  value={config.vapid.public_key}
                  onChange={(e) => updateConfig('vapid', 'public_key', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  placeholder="Sua chave pública VAPID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chave Privada</label>
                <div className="relative">
                  <textarea
                    value={config.vapid.private_key}
                    onChange={(e) => updateConfig('vapid', 'private_key', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                    rows={3}
                    placeholder="Sua chave privada VAPID"
                    style={{ fontFamily: showPasswords.vapid_private_key ? 'monospace' : 'password' }}
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('vapid_private_key')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.vapid_private_key ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email VAPID</label>
                <input
                  type="email"
                  value={config.vapid.mailto}
                  onChange={(e) => updateConfig('vapid', 'mailto', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="mailto:admin@agendamento.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">Aviso de Segurança</h3>
              <p className="text-amber-800 text-sm mt-1">
                As credenciais de notificação são armazenadas de forma criptografada no banco de dados. 
                Apenas administradores com permissão podem visualizar e editar estas configurações.
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
