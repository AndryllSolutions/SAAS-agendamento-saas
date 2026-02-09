'use client'

import { Users, Download, Settings2, PackageSearch, Percent, ScissorsSquare, Building2 } from 'lucide-react'

interface Employee {
  id: number
}

interface ComissoesAuxiliaresSectionProps {
  employee: Employee
  onUpdate: (hasChanges: boolean) => void
}

const serviceMatrix = [
  {
    id: 1,
    name: 'Corte feminino premium',
    product: 'Kit tratamento intenso',
    base: 'Valor bruto do serviço',
    commission: 35,
    auxiliarCommission: 10,
    discount: 5,
    responsibility: 'Estabelecimento'
  },
  {
    id: 2,
    name: 'Coloração completa',
    product: 'Máscara reconstrutora',
    base: 'Valor líquido com descontos',
    commission: 30,
    auxiliarCommission: 8,
    discount: 10,
    responsibility: 'Profissional'
  },
  {
    id: 3,
    name: 'Escova modelada',
    product: 'Finalizador termoativo',
    base: 'Valor bruto do serviço',
    commission: 25,
    auxiliarCommission: 5,
    discount: 0,
    responsibility: 'Estabelecimento'
  }
]

export default function ComissoesAuxiliaresSection({ employee, onUpdate }: ComissoesAuxiliaresSectionProps) {
  return (
    <div className="p-6">
      <div className="max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Comissões e Auxiliares
            </h3>
            <p className="text-sm text-gray-500">
              Configure percentuais por serviço, produtos consumidos e quem assume cada desconto.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
              Exportar planilha
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" />
              <span>Importar serviços</span>
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Serviços com regras personalizadas', value: '12', icon: ScissorsSquare, accent: 'text-blue-600' },
            { label: 'Produtos vinculados', value: '27 itens', icon: PackageSearch, accent: 'text-emerald-600' },
            { label: 'Auxiliares ativos', value: '5 profissionais', icon: Users, accent: 'text-purple-600' }
          ].map(card => (
            <div key={card.label} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center space-x-3">
              <card.icon className={`w-10 h-10 ${card.accent}`} />
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">{card.label}</p>
                <p className="text-lg font-semibold text-gray-900">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Produtos e comissões por serviço</p>
              <p className="text-xs text-gray-500">Defina porcentagens, descontos e quem arca com cada custo.</p>
            </div>
            <button className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-full hover:border-blue-200" onClick={() => onUpdate(true)}>
              Duplicar regra
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="flex justify-between mb-4">
              <button className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
                Comissão
              </button>
              <button className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
                Auxiliar
              </button>
            </div>

            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold text-gray-500 uppercase">
                  <th className="px-6 py-3 text-left">Serviço</th>
                  <th className="px-6 py-3 text-left">Produto do serviço</th>
                  <th className="px-6 py-3 text-left">Comissão</th>
                  <th className="px-6 py-3 text-left">Desconto</th>
                  <th className="px-6 py-3 text-left">Descontar de</th>
                  <th className="px-6 py-3 text-left">Sobre</th>
                  <th className="px-6 py-3 text-left bg-blue-50">Auxiliar (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {serviceMatrix.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{row.name}</p>
                      <span className="text-xs text-gray-500">ID #{row.id.toString().padStart(3, '0')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <PackageSearch className="w-4 h-4 text-gray-400" />
                        <span>{row.product}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Percent className="w-4 h-4 text-blue-600" />
                        <select
                          value={row.commission}
                          onChange={() => onUpdate(true)}
                          className="border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          {[15, 20, 25, 30, 35, 40].map(value => (
                            <option key={value} value={value}>{value}%</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">{row.discount}%</span>
                        <select
                          defaultValue="comanda"
                          onChange={() => onUpdate(true)}
                          className="border-gray-200 rounded-lg text-xs focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="comanda">Comanda</option>
                          <option value="manual">Manual</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={row.responsibility}
                        onChange={() => onUpdate(true)}
                        className="border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Estabelecimento">Descontar do estabelecimento</option>
                        <option value="Profissional">Descontar do profissional</option>
                        <option value="Compartilhado">Compartilhado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={row.base}
                        onChange={() => onUpdate(true)}
                        className="border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Valor bruto do serviço">Valor bruto do serviço</option>
                        <option value="Valor líquido com descontos">Valor líquido com descontos</option>
                        <option value="Ticket médio semanal">Ticket médio semanal</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 bg-blue-50">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          defaultValue={row.auxiliarCommission}
                          onChange={() => onUpdate(true)}
                          className="w-20 px-2 py-1 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                        <span className="text-xs text-blue-600">sobre {row.base.toLowerCase()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">Regras avançadas</h4>
              <p className="text-sm text-gray-500">Combine percentuais com valores fixos e defina responsáveis pelo pagamento.</p>
            </div>
            <Settings2 className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <label className="flex items-center justify-between border border-gray-100 rounded-xl p-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Aplicar bônus por produto do serviço</p>
                <p className="text-xs text-gray-500">Crédito automático quando o profissional vender o produto usado no atendimento.</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={() => onUpdate(true)} />
            </label>
            <label className="flex items-center justify-between border border-gray-100 rounded-xl p-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Descontar produtos do estoque interno</p>
                <p className="text-xs text-gray-500">Controla o custo dos insumos diretamente no fechamento de comissão.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={() => onUpdate(true)} />
            </label>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { title: 'Responsável', value: 'Financeiro / Loja matriz', icon: Building2 },
              { title: 'Percentual auxiliar padrão', value: '6% sobre valor bruto', icon: Percent },
              { title: 'Atualização', value: 'Última revisão há 5 dias', icon: Settings2 }
            ].map(item => (
              <div key={item.title} className="flex items-center space-x-3 border border-dashed border-gray-200 rounded-xl p-4">
                <item.icon className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">{item.title}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
