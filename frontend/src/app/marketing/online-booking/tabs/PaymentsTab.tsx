'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, CreditCard, Smartphone, Banknote } from 'lucide-react'
import { toast } from 'sonner'
import { onlineBookingService, OnlineBookingConfig } from '@/services/onlineBookingService'

export default function PaymentsTab() {
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
      <div>
        <h3 className="text-lg font-semibold mb-2">Formas de Pagamento</h3>
        <p className="text-sm text-gray-600 mb-6">
          Escolha quais formas de pagamento estarão disponíveis no agendamento online. Você recebe o dinheiro na sua conta da Atendo Pay.
        </p>
      </div>

      {/* Formas de Pagamento */}
      <div className="space-y-4">
        {/* Pagamento no Local */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Banknote className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">No local</h4>
                <p className="text-sm text-gray-600">
                  Cliente paga diretamente no estabelecimento após o atendimento
                </p>
              </div>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                checked={config.enable_payment_local !== false}
                onChange={(e) => handleChange('enable_payment_local', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Cartão */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-purple-100 p-2 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">No cartão</h4>
                <p className="text-sm text-gray-600">
                  Cliente paga com cartão de crédito ou débito online
                </p>
              </div>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                checked={config.enable_payment_card || false}
                onChange={(e) => handleChange('enable_payment_card', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* PIX */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-green-100 p-2 rounded-lg">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">No Pix</h4>
                <p className="text-sm text-gray-600">
                  Cliente paga via PIX instantaneamente
                </p>
              </div>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                checked={config.enable_payment_pix || false}
                onChange={(e) => handleChange('enable_payment_pix', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Pagamento por Sinal */}
      <div className="border-t pt-6">
        <h4 className="font-semibold text-gray-900 mb-2">Ativar pagamento por sinal</h4>
        <p className="text-sm text-gray-600 mb-4">
          Pagamento por sinal é uma forma de você cobrar um valor antecipado do seu cliente, é um compromisso dele contigo. Quando o cliente efetivar um pagamento de sinal, o valor pago será adicionado como crédito à conta do cliente e utilizado como forma de pagamento quando for criada uma comanda para o serviço. Ativando essa opção, seu cliente poderá escolher pagar o sinal ou o valor total do serviço.
        </p>

        <label className="flex items-center gap-3 mb-4">
          <div className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              checked={config.enable_deposit_payment || false}
              onChange={(e) => handleChange('enable_deposit_payment', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {config.enable_deposit_payment ? 'Ativado' : 'Desativado'}
          </span>
        </label>

        {config.enable_deposit_payment && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor do pagamento por sinal
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Escolha o valor cobrado no sinal. Essa opção se aplicará a todos os serviços disponíveis para agendamento online.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">%</span>
              <input
                type="number"
                min="0"
                max="100"
                step="5"
                value={config.deposit_percentage || 50}
                onChange={(e) => handleChange('deposit_percentage', parseFloat(e.target.value))}
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <span className="text-sm text-gray-600">do valor do serviço</span>
            </div>
          </div>
        )}
      </div>

      {/* Nota */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>⚠️ Importante:</strong> Para aceitar pagamentos online (cartão e PIX), você precisa configurar sua conta de pagamentos. Entre em contato com o suporte para ativar.
        </p>
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
