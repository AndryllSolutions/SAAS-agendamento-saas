'use client'

import { Percent, HelpCircle, Plus } from 'lucide-react'

interface Employee {
  id: number
}

interface ComissoesConfigSectionProps {
  employee: Employee
  onUpdate: (hasChanges: boolean) => void
}

export default function ComissoesConfigSection({ employee, onUpdate }: ComissoesConfigSectionProps) {
  return (
    <div className="p-6">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
            <Percent className="w-5 h-5 mr-2" />
            Configurar Comissões
          </h3>
          <p className="text-sm text-gray-500">
            Configure como as comissões serão calculadas para este profissional.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configurações de Comissão */}
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Tipo de Comissão</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="radio" name="commission_type" value="percentage" className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Percentual sobre o valor do serviço</span>
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </label>
                <label className="flex items-center space-x-3">
                  <input type="radio" name="commission_type" value="fixed" className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Valor fixo por serviço</span>
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </label>
                <label className="flex items-center space-x-3">
                  <input type="radio" name="commission_type" value="mixed" className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Misto (percentual + valor fixo)</span>
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">Base de Cálculo</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="radio" name="calculation_base" value="gross" className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Valor bruto do serviço</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="radio" name="calculation_base" value="net" className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Valor líquido (após descontos)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Texto de Recebimento */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Recebimento de Comissão</h4>
            <textarea
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descreva como e quando as comissões serão pagas..."
            />
            
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200">
                + Valor
              </button>
              <button className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200">
                + Nome da empresa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
