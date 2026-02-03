'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { onlineBookingService, OnlineBookingConfig } from '@/services/onlineBookingService'

export default function ConfigurationsTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<OnlineBookingConfig>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await onlineBookingService.getConfig()
      setConfig(data)
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await onlineBookingService.updateConfig(config)
      toast.success('Configurações salvas com sucesso!')
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof OnlineBookingConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cor primária */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cor primária
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Escolha qual será a cor primária da sua página de agendamento. Ela será aplicada em botões, links etc.
        </p>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={config.primary_color || '#6366f1'}
            onChange={(e) => handleChange('primary_color', e.target.value)}
            className="w-20 h-10 rounded border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={config.primary_color || '#6366f1'}
            onChange={(e) => handleChange('primary_color', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="#6366f1"
          />
        </div>
      </div>

      {/* Tema */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tema
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Aqui você pode escolher se quer deixar sua aplicação com o tema claro, escuro ou opcional e seu cliente escolhe.
        </p>
        <select
          value={config.theme || 'light'}
          onChange={(e) => handleChange('theme', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
          <option value="optional">Opcional (cliente escolhe)</option>
        </select>
      </div>

      {/* Fluxo de agendamento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fluxo de agendamento
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Escolha como seu cliente deverá realizar o agendamento. Se vai ser escolhendo primeiro o serviço ou o profissional.
        </p>
        <select
          value={config.booking_flow || 'service_first'}
          onChange={(e) => handleChange('booking_flow', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="service_first">Serviços</option>
          <option value="professional_first">Profissional</option>
        </select>
      </div>

      {/* Login obrigatório */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Login obrigatório
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Desativando essa opção seu cliente poderá agendar online apenas com nome e telefone, sem fazer login.
        </p>
        <label className="flex items-center gap-3">
          <div className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              checked={config.require_login || false}
              onChange={(e) => handleChange('require_login', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </div>
          <span className="text-sm text-gray-700">
            {config.require_login ? 'Ativado' : 'Desativado'}
          </span>
        </label>
        {!config.require_login && (
          <p className="text-xs text-amber-600 mt-2">
            ⚠️ O login opcional só funcionará se a opção de pagamento no local estiver ativa.
          </p>
        )}
      </div>

      {/* Tempo de antecedência */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tempo de antecedência para agendamentos
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Deixando em 0, seu cliente poderá agendar a qualquer momento. Você pode personalizar esse tempo para cada serviço, indo em suas configurações.
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={config.min_advance_time_minutes || 0}
            onChange={(e) => handleChange('min_advance_time_minutes', parseInt(e.target.value))}
            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <span className="text-sm text-gray-600">minutos</span>
        </div>
      </div>

      {/* Cancelar agendamentos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cancelar agendamentos
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Isso permite que o seu cliente cancele o próprio agendamento.
        </p>
        <label className="flex items-center gap-3 mb-4">
          <div className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              checked={config.allow_cancellation !== false}
              onChange={(e) => handleChange('allow_cancellation', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </div>
          <span className="text-sm text-gray-700">
            {config.allow_cancellation !== false ? 'Permitir cancelamento' : 'Não permitir cancelamento'}
          </span>
        </label>

        {config.allow_cancellation !== false && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horas de antecedência do cancelamento
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={config.cancellation_min_hours || 24}
                onChange={(e) => handleChange('cancellation_min_hours', parseInt(e.target.value))}
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <span className="text-sm text-gray-600">horas</span>
            </div>
          </div>
        )}
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar
            </>
          )}
        </button>
      </div>
    </div>
  )
}
