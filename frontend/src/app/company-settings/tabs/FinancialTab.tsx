'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, DollarSign, AlertTriangle, Info } from 'lucide-react'
import { toast } from 'sonner'
import companySettingsService, { FinancialSettings } from '@/services/companySettingsService'

interface Props {
  data?: FinancialSettings
  onUpdate: () => void
}

export default function FinancialTab({ data, onUpdate }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<FinancialSettings>>({
    allow_retroactive_entries: false,
    allow_invoice_edit_after_conference: false,
    edit_only_value_after_conference: true,
    allow_operations_with_closed_cash: false,
    require_category_on_transaction: true,
    require_payment_form_on_transaction: true
  })

  useEffect(() => {
    if (data) {
      setFormData(data)
    }
  }, [data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      await companySettingsService.updateFinancialSettings(formData)
      toast.success('Configurações financeiras atualizadas com sucesso!')
      onUpdate()
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error(error.response?.data?.detail || 'Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }

  const toggleSetting = (field: keyof FinancialSettings) => {
    setFormData({ ...formData, [field]: !formData[field] })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configurações Financeiras</h2>
        <p className="text-gray-600">
          Controle regras operacionais do caixa e financeiro
        </p>
      </div>

      {/* Lançamentos Retroativos */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Lançamentos Retroativos
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Permitir lançamentos retroativos?
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 mb-1">
                    Atenção
                  </p>
                  <p className="text-sm text-yellow-800">
                    Lançamentos retroativos podem comprometer o seu caixa. Use com cautela.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Se ativado:</strong> Permite registrar despesas/receitas com data anterior</p>
              <p><strong>Se desativado:</strong> Bloqueia lançamentos fora da data atual</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={formData.allow_retroactive_entries}
              onChange={() => toggleSetting('allow_retroactive_entries')}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>

      {/* Alterações após Conferência */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Alterações após Conferência
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Permitir alterações de faturas após conferência no caixa?
            </p>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="radio"
                  name="edit_after_conference"
                  checked={!formData.allow_invoice_edit_after_conference}
                  onChange={() => setFormData({ 
                    ...formData, 
                    allow_invoice_edit_after_conference: false,
                    edit_only_value_after_conference: true
                  })}
                  className="text-primary focus:ring-primary"
                />
                <div>
                  <div className="font-medium text-gray-900">Não permitir alterações</div>
                  <div className="text-sm text-gray-600">Faturas conferidas não podem ser alteradas</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="radio"
                  name="edit_after_conference"
                  checked={formData.allow_invoice_edit_after_conference && formData.edit_only_value_after_conference}
                  onChange={() => setFormData({ 
                    ...formData, 
                    allow_invoice_edit_after_conference: true,
                    edit_only_value_after_conference: true
                  })}
                  className="text-primary focus:ring-primary"
                />
                <div>
                  <div className="font-medium text-gray-900">Permitir editar apenas o valor</div>
                  <div className="text-sm text-gray-600">Apenas o valor pode ser editado</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="radio"
                  name="edit_after_conference"
                  checked={formData.allow_invoice_edit_after_conference && !formData.edit_only_value_after_conference}
                  onChange={() => setFormData({ 
                    ...formData, 
                    allow_invoice_edit_after_conference: true,
                    edit_only_value_after_conference: false
                  })}
                  className="text-primary focus:ring-primary"
                />
                <div>
                  <div className="font-medium text-gray-900">Permitir editar todos os campos</div>
                  <div className="text-sm text-gray-600">Todos os campos podem ser alterados</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Caixa Fechado */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Operações com Caixa Fechado
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Permitir movimentações financeiras com o caixa fechado?
            </p>

            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Se SIM:</strong> Inserções, edições e exclusões liberadas</p>
              <p><strong>Se NÃO:</strong> Sistema exige abertura do caixa</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={formData.allow_operations_with_closed_cash}
              onChange={() => toggleSetting('allow_operations_with_closed_cash')}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>

      {/* Validações de Transações */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Validações de Transações
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Exigir categoria nas transações</p>
                <p className="text-sm text-gray-600">Obriga o preenchimento de categoria ao criar lançamentos</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.require_category_on_transaction}
                onChange={() => toggleSetting('require_category_on_transaction')}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Exigir forma de pagamento</p>
                <p className="text-sm text-gray-600">Obriga o preenchimento da forma de pagamento</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.require_payment_form_on_transaction}
                onChange={() => toggleSetting('require_payment_form_on_transaction')}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end pt-6 border-t">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Salvar Configurações
            </>
          )}
        </button>
      </div>
    </form>
  )
}
