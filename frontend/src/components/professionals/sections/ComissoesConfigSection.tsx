'use client'

import { Percent } from 'lucide-react'

interface Employee {
  id: number
}

interface ComissoesConfigSectionProps {
  employee: Employee
  onUpdate: (hasChanges: boolean) => void
}

const radioOptions: Record<string, { id: string; label: string }[]> = {
  dateFilter: [
    { id: 'competencia', label: 'Data de competência' },
    { id: 'disponibilidade', label: 'Data de disponibilidade' }
  ],
  commandType: [
    { id: 'todas', label: 'Todas as comandas' },
    { id: 'finalizadas', label: 'Somente finalizadas' }
  ],
  fees: [
    { id: 'proporcional', label: 'Proporcional ao comissionamento' },
    { id: 'estabelecimento', label: 'Estabelecimento arca com 100%' },
    { id: 'profissional', label: 'Profissional arca com 100%' }
  ],
  discounts: [
    { id: 'proporcional', label: 'Proporcional ao comissionamento' },
    { id: 'estabelecimento', label: 'Estabelecimento arca com 100%' },
    { id: 'profissional', label: 'Profissional arca com 100%' }
  ],
  extraCosts: [
    { id: 'desconta', label: 'Desconta' },
    { id: 'nao-desconta', label: 'Não desconta' }
  ],
  products: [
    { id: 'nao-descontar', label: 'Não descontar' },
    { id: 'custo', label: 'Preço de custo' },
    { id: 'venda', label: 'Preço de venda' },
    { id: 'profissional', label: 'Preço para profissional' }
  ],
  deductProducts: [
    { id: 'comissao', label: 'Comissão do profissional' },
    { id: 'servico', label: 'Serviço' }
  ],
  showGrossReport: [
    { id: 'sim', label: 'Sim' },
    { id: 'nao', label: 'Não' }
  ]
}

export default function ComissoesConfigSection({ employee, onUpdate }: ComissoesConfigSectionProps) {
  const handleChange = () => onUpdate(true)

  const renderRadioGroup = (name: string, options: { id: string; label: string }[], defaultValue?: string) => (
    <div className="space-y-2">
      {options.map(option => (
        <label key={option.id} className="flex items-center space-x-2 text-sm text-gray-700">
          <input
            type="radio"
            name={name}
            value={option.id}
            defaultChecked={defaultValue ? defaultValue === option.id : undefined}
            onChange={handleChange}
            className="text-blue-600"
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  )

  return (
    <div className="p-6">
      <div className="max-w-5xl space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Percent className="w-5 h-5 mr-2" />
            Configurar comissões
          </h3>
          <p className="text-sm text-gray-500">
            Ajuste filtros, taxas e descontos exatamente como exibido no layout atual do sistema.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Filtro por data:</p>
              {renderRadioGroup('date_filter', radioOptions.dateFilter, 'competencia')}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Tipo de comanda:</p>
              {renderRadioGroup('command_type', radioOptions.commandType, 'todas')}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Taxas:</p>
              {renderRadioGroup('fees', radioOptions.fees, 'proporcional')}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Descontos:</p>
              {renderRadioGroup('discounts', radioOptions.discounts, 'proporcional')}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Custo adicional dos serviços:</p>
              {renderRadioGroup('extra_costs', radioOptions.extraCosts, 'desconta')}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Produtos consumidos:</p>
              {renderRadioGroup('products', radioOptions.products, 'nao-descontar')}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Descontar produtos consumidos:</p>
              {renderRadioGroup('deduct_products', radioOptions.deductProducts, 'comissao')}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Exibir valor bruto no relatório de comissões:</p>
              {renderRadioGroup('show_gross', radioOptions.showGrossReport, 'sim')}
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-900 mb-2">Recebimento de comissão:</p>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descreva como e quando este profissional recebe a comissão."
              onChange={handleChange}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {['Valor', 'Nome da empresa'].map(token => (
                <button
                  key={token}
                  onClick={handleChange}
                  className="px-3 py-1 text-xs text-blue-700 bg-blue-50 rounded-full border border-blue-100"
                >
                  {token}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
