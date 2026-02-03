'use client'

import { useState } from 'react'
import { Receipt, DollarSign, Calendar, CreditCard, Building, Repeat } from 'lucide-react'
import { SubDrawer } from './SubDrawer'
import { toast } from 'sonner'

interface Employee {
  id: number
  full_name: string
}

interface NovoValeDrawerProps {
  employee: Employee
  level: number
  onClose: () => void
  onSuccess?: () => void
}

export function NovoValeDrawer({ 
  employee, 
  level, 
  onClose, 
  onSuccess 
}: NovoValeDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    dueDate: '',
    category: 'alimentacao',
    paymentMethod: 'dinheiro',
    account: '',
    observation: '',
    isAdvanceCommission: false,
    generateFinancialMovement: false,
    isRecurring: false,
    recurringFrequency: 'mensal'
  })

  const categories = [
    { id: 'alimentacao', label: 'Alimentação' },
    { id: 'transporte', label: 'Transporte' },
    { id: 'outros', label: 'Outros' }
  ]

  const paymentMethods = [
    { id: 'dinheiro', label: 'Dinheiro' },
    { id: 'pix', label: 'PIX' },
    { id: 'transferencia', label: 'Transferência' },
    { id: 'cartao', label: 'Cartão' }
  ]

  const accounts = [
    { id: 'caixa', label: 'Caixa' },
    { id: 'banco', label: 'Banco' },
    { id: 'outro', label: 'Outra' }
  ]

  const recurringFrequencies = [
    { id: 'semanal', label: 'Semanal' },
    { id: 'quinzenal', label: 'Quinzenal' },
    { id: 'mensal', label: 'Mensal' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Preencha um valor válido')
      return
    }
    
    if (!formData.dueDate) {
      toast.error('Preencha a data de vencimento')
      return
    }

    setLoading(true)
    
    try {
      // TODO: Implementar chamada à API
      // await professionalService.createVoucher(employee.id, {
      //   amount: parseFloat(formData.amount),
      //   due_date: formData.dueDate,
      //   category: formData.category,
      //   payment_method: formData.paymentMethod,
      //   account: formData.account,
      //   observation: formData.observation,
      //   is_advance_commission: formData.isAdvanceCommission,
      //   generate_financial_movement: formData.generateFinancialMovement,
      //   is_recurring: formData.isRecurring,
      //   recurring_frequency: formData.isRecurring ? formData.recurringFrequency : null
      // })
      
      console.log('Novo vale:', formData)
      
      toast.success('Vale criado com sucesso!')
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error('Erro ao criar vale')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SubDrawer 
      title="Novo Vale" 
      level={level}
      onClose={onClose}
      width="normal"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Valor e Vencimento */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Valor
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0,00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Vencimento
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Categoria e Forma de Pagamento */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Receipt className="w-4 h-4 inline mr-1" />
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-1" />
              Forma de Pagamento
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {paymentMethods.map(method => (
                <option key={method.id} value={method.id}>{method.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Conta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="w-4 h-4 inline mr-1" />
            Conta
          </label>
          <select
            value={formData.account}
            onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecione...</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.label}</option>
            ))}
          </select>
        </div>

        {/* Observação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observação
          </label>
          <textarea
            value={formData.observation}
            onChange={(e) => setFormData(prev => ({ ...prev, observation: e.target.value }))}
            placeholder="Observações sobre o vale..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.isAdvanceCommission}
              onChange={(e) => setFormData(prev => ({ ...prev, isAdvanceCommission: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Adiantamento de comissão</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.generateFinancialMovement}
              onChange={(e) => setFormData(prev => ({ ...prev, generateFinancialMovement: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Gerar movimentação financeira</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Recorrência</span>
              <Repeat className="w-4 h-4 text-gray-400" />
            </div>
          </label>
          
          {formData.isRecurring && (
            <select
              value={formData.recurringFrequency}
              onChange={(e) => setFormData(prev => ({ ...prev, recurringFrequency: e.target.value }))}
              className="ml-7 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {recurringFrequencies.map(freq => (
                <option key={freq.id} value={freq.id}>{freq.label}</option>
              ))}
            </select>
          )}
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </SubDrawer>
  )
}
