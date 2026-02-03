'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import { Shield, Save, AlertTriangle, Settings, Database, Lock, Globe, Server } from 'lucide-react'
import { toast } from 'sonner'

interface SystemConfig {
  maintenance_mode: boolean
  allow_registration: boolean
  max_users_per_company: number
  session_timeout: number
  api_rate_limit: number
  enable_analytics: boolean
  enable_logs: boolean
}

export default function SystemConfigPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [config, setConfig] = useState<SystemConfig>({
    maintenance_mode: false,
    allow_registration: true,
    max_users_per_company: 50,
    session_timeout: 3600,
    api_rate_limit: 100,
    enable_analytics: true,
    enable_logs: true
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const { systemConfigService } = await import('@/services/systemConfigService')
      const response = await systemConfigService.getConfig()
      setConfig(prev => ({ ...prev, ...response.data }))
      setLoading(false)
    } catch (error) {
      toast.error('Erro ao carregar configurações')
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      const { systemConfigService } = await import('@/services/systemConfigService')
      await systemConfigService.updateConfig(config)
      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (field: keyof SystemConfig, value: boolean | number) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
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
            <p className="text-gray-600">Apenas administradores SaaS podem acessar esta página.</p>
            <p className="text-gray-500 text-sm mt-2">
              Necessário: OWNER, ADMIN ou SAAS_OWNER
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
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Configurações de Sistema</h1>
                  <p className="text-gray-600">Configure as opções gerais do sistema</p>
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
            {/* System Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Server className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-gray-900">Status do Sistema</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modo Manutenção
                    </label>
                    <p className="text-xs text-gray-500">
                      Desabilita o acesso de todos os usuários exceto admins
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.maintenance_mode}
                      onChange={(e) => updateConfig('maintenance_mode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Permitir Registro
                    </label>
                    <p className="text-xs text-gray-500">
                      Permite que novos usuários se registrem
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.allow_registration}
                      onChange={(e) => updateConfig('allow_registration', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Limits & Security */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-gray-900">Limites e Segurança</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Máximo de Usuários por Empresa
                  </label>
                  <input
                    type="number"
                    value={config.max_users_per_company}
                    onChange={(e) => updateConfig('max_users_per_company', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timeout de Sessão (segundos)
                  </label>
                  <input
                    type="number"
                    value={config.session_timeout}
                    onChange={(e) => updateConfig('session_timeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate Limit da API (req/min)
                  </label>
                  <input
                    type="number"
                    value={config.api_rate_limit}
                    onChange={(e) => updateConfig('api_rate_limit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="10"
                  />
                </div>
              </div>
            </div>

            {/* Analytics & Logs */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-gray-900">Analytics e Logs</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Habilitar Analytics
                    </label>
                    <p className="text-xs text-gray-500">
                      Coleta dados de uso para melhorias
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enable_analytics}
                      onChange={(e) => updateConfig('enable_analytics', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Habilitar Logs
                    </label>
                    <p className="text-xs text-gray-500">
                      Registra eventos do sistema
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enable_logs}
                      onChange={(e) => updateConfig('enable_logs', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Global Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-gray-900">Configurações Globais</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    As configurações globais afetam todas as empresas e usuários da plataforma. 
                    Use com cuidado.
                  </p>
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
                  Alterações nas configurações do sistema podem afetar o funcionamento de toda a plataforma. 
                  Certifique-se de entender o impacto de cada alteração antes de salvar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

