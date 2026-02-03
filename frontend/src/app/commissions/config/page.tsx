'use client'

import { useState, useEffect } from 'react'
import { commissionService } from '@/services/api'
import { Save, Info } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'

export default function CommissionConfigPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState({
    date_filter_type: 'competence',
    command_type_filter: 'finished',
    fees_responsibility: 'proportional',
    discounts_responsibility: 'proportional',
    deduct_additional_service_cost: false,
    product_discount_origin: 'professional_commission',
    discount_products_from: ''
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await commissionService.getConfig()
      if (response.data) {
        setConfig(response.data)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao carregar configurações'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await commissionService.updateConfig(config)
      toast.success('Configurações salvas com sucesso!')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState message="Carregando configurações..." />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Erro ao carregar configurações"
          message={error}
          onRetry={loadConfig}
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600 mt-1">
              Estas são as configurações padrões das comissões.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Caso haja alguma negociação diferenciada para um profissional, acesse a listagem de profissionais, 
              localize o profissional e clique na aba Configurar Comissões.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-8">
          {/* Filtro por data */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtro por data</h2>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="date_filter"
                  value="competence"
                  checked={config.date_filter_type === 'competence'}
                  onChange={(e) => setConfig({ ...config, date_filter_type: e.target.value })}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">Data de competência</div>
                  <div className="text-sm text-gray-600">
                    O valor fica disponível para pagamento no dia em que o serviço é executado.
                  </div>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="date_filter"
                  value="availability"
                  checked={config.date_filter_type === 'availability'}
                  onChange={(e) => setConfig({ ...config, date_filter_type: e.target.value })}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">Data de Disponibilidade</div>
                  <div className="text-sm text-gray-600">
                    O valor fica disponível para pagamento quando é recebido pela empresa (Ex: recebimentos no cartão 
                    só são liberados após o Prazo de Recebimento informado nas configurações da forma de pagamento).
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Tipo de comanda */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tipo de comanda</h2>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="command_type"
                  value="all"
                  checked={config.command_type_filter === 'all'}
                  onChange={(e) => setConfig({ ...config, command_type_filter: e.target.value })}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">Todas as Comandas</div>
                  <div className="text-sm text-gray-600">
                    O valor fica disponível para pagamento independente do status da comanda (Pendente ou Finalizada).
                  </div>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="command_type"
                  value="finished"
                  checked={config.command_type_filter === 'finished'}
                  onChange={(e) => setConfig({ ...config, command_type_filter: e.target.value })}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">Somente Finalizadas</div>
                  <div className="text-sm text-gray-600">
                    O valor fica disponível para pagamento apenas quando a comanda é faturada e fica com o status de finalizada.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Taxas */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Taxas</h2>
            <p className="text-sm text-gray-600 mb-4">
              Defina quanto e quem pagará as taxas de cartão de crédito, boleto e outros.
            </p>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="fees"
                  value="proportional"
                  checked={config.fees_responsibility === 'proportional'}
                  onChange={(e) => setConfig({ ...config, fees_responsibility: e.target.value })}
                  className="mt-1"
                />
                <div className="font-medium text-gray-900">Proporcional ao comissionamento</div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="fees"
                  value="company_100"
                  checked={config.fees_responsibility === 'company_100'}
                  onChange={(e) => setConfig({ ...config, fees_responsibility: e.target.value })}
                  className="mt-1"
                />
                <div className="font-medium text-gray-900">Estabelecimento arca com 100%</div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="fees"
                  value="professional_100"
                  checked={config.fees_responsibility === 'professional_100'}
                  onChange={(e) => setConfig({ ...config, fees_responsibility: e.target.value })}
                  className="mt-1"
                />
                <div className="font-medium text-gray-900">Profissional arca com 100%</div>
              </label>
            </div>
          </div>

          {/* Descontos */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Descontos</h2>
            <p className="text-sm text-gray-600 mb-4">
              Defina quem será responsável pelo pagamento dos descontos aplicados nas vendas.
            </p>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="discounts"
                  value="proportional"
                  checked={config.discounts_responsibility === 'proportional'}
                  onChange={(e) => setConfig({ ...config, discounts_responsibility: e.target.value })}
                  className="mt-1"
                />
                <div className="font-medium text-gray-900">Proporcional ao comissionamento</div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="discounts"
                  value="company_100"
                  checked={config.discounts_responsibility === 'company_100'}
                  onChange={(e) => setConfig({ ...config, discounts_responsibility: e.target.value })}
                  className="mt-1"
                />
                <div className="font-medium text-gray-900">Estabelecimento arca com 100%</div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="discounts"
                  value="professional_100"
                  checked={config.discounts_responsibility === 'professional_100'}
                  onChange={(e) => setConfig({ ...config, discounts_responsibility: e.target.value })}
                  className="mt-1"
                />
                <div className="font-medium text-gray-900">Profissional arca com 100%</div>
              </label>
            </div>
          </div>

          {/* Custo adicional dos serviços */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Custo adicional dos serviços</h2>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.deduct_additional_service_cost}
                  onChange={(e) => setConfig({ ...config, deduct_additional_service_cost: e.target.checked })}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">Descontar custo adicional</div>
                  <div className="text-sm text-gray-600">
                    Se sim, ao informar um custo adicional no cadastro do serviço, o sistema irá descontar esse valor 
                    do recebimento antes de pagar o comissionamento referente ao valor líquido.
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Se não, o custo adicional cadastrado no serviço não é considerado para o pagamento de comissões.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Origem do desconto dos produtos consumidos */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Origem do desconto dos produtos consumidos</h2>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="product_discount"
                  value="professional_commission"
                  checked={config.product_discount_origin === 'professional_commission'}
                  onChange={(e) => setConfig({ ...config, product_discount_origin: e.target.value })}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">Comissão do profissional</div>
                  <div className="text-sm text-gray-600">
                    O valor dos produtos consumidos é descontado integralmente da comissão do profissional.
                  </div>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="product_discount"
                  value="service"
                  checked={config.product_discount_origin === 'service'}
                  onChange={(e) => setConfig({ ...config, product_discount_origin: e.target.value })}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">Serviço</div>
                  <div className="text-sm text-gray-600">
                    Antes de pagar o comissionamento o sistema irá descontar do valor recebido dos produtos consumidos 
                    e pagar o comissionamento referente ao valor líquido.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Descontar produtos consumidos a partir de */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Descontar produtos consumidos a partir de</h2>
            <div className="max-w-md">
              <input
                type="text"
                value={config.discount_products_from || ''}
                onChange={(e) => setConfig({ ...config, discount_products_from: e.target.value })}
                placeholder="Ex: Data específica ou critério"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Informe a partir de quando os produtos consumidos devem ser descontados (opcional).
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}

