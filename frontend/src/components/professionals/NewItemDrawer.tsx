'use client'

import { useState } from 'react'
import { Calendar, DollarSign, FileText, CreditCard, Building, Tag, MessageSquare } from 'lucide-react'
import { Drawer } from './DrawerStackManager'

interface NewItemDrawerProps {
  title: string
  onClose: () => void
  onSave: (data: any) => void
}

export default function NewItemDrawer({ title, onClose, onSave }: NewItemDrawerProps) {
  const [formData, setFormData] = useState({
    amount: '',
    dueDate: '',
    item: '',
    charges: '',
    paymentMethod: '',
    account: '',
    category: '',
    observations: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Drawer
      title={title}
      onClose={onClose}
      width="narrow"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Valor *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0,00"
              required
            />
          </div>

          {/* Vencimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Vencimento *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Item */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Item *
            </label>
            <input
              type="text"
              value={formData.item}
              onChange={(e) => handleInputChange('item', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrição do item"
              required
            />
          </div>

          {/* Encargos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Encargos
            </label>
            <input
              type="text"
              value={formData.charges}
              onChange={(e) => handleInputChange('charges', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Taxas ou encargos"
            />
          </div>

          {/* Forma de pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-1" />
              Forma de pagamento
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione</option>
              <option value="cash">Dinheiro</option>
              <option value="debit">Cartão de Débito</option>
              <option value="credit">Cartão de Crédito</option>
              <option value="pix">PIX</option>
              <option value="transfer">Transferência</option>
              <option value="check">Cheque</option>
            </select>
          </div>

          {/* Conta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="w-4 h-4 inline mr-1" />
              Conta
            </label>
            <select
              value={formData.account}
              onChange={(e) => handleInputChange('account', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione</option>
              <option value="main">Conta Principal</option>
              <option value="secondary">Conta Secundária</option>
              <option value="cash">Caixa</option>
            </select>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione</option>
              <option value="salary">Salário</option>
              <option value="commission">Comissão</option>
              <option value="bonus">Bonificação</option>
              <option value="advance">Vale/Adiantamento</option>
              <option value="other">Outros</option>
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Observações
            </label>
            <textarea
              value={formData.observations}
              onChange={(e) => handleInputChange('observations', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Observações adicionais..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Salvar
            </button>
          </div>
        </div>
      </form>
    </Drawer>
  )
}
