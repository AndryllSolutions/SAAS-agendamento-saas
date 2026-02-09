'use client'

import { DollarSign, Plus, MoreHorizontal, Calendar, FileText, Clock8, ArrowRight, Receipt, History, ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react'
import { useDrawerStack } from '../DrawerStackManager'
import PaymentsDrawer from '../PaymentsDrawer'
import NewItemDrawer from '../NewItemDrawer'

interface Employee {
  id: number
  full_name: string
}

interface PagarSalarioSectionProps {
  employee: Employee
  onUpdate: (hasChanges: boolean) => void
}

const mockCommissions = [
  { id: 1, dueDate: '2024-02-05', item: 'Comissão Semana 1', amount: 870.5, history: 'Comandas #124-#130', status: 'Aberto' },
  { id: 2, dueDate: '2024-02-10', item: 'Salário fixo', amount: 2500, history: 'Janeiro/2024', status: 'Programado' }
]

const mockHistory = [
  { id: 9, type: 'Comissão', due: '2024-01-20', value: 640, note: 'Campanha de dezembro', status: 'Pago' },
  { id: 10, type: 'Salário', due: '2024-01-10', value: 2500, note: 'Férias proporcionais', status: 'Pago' }
]

export default function PagarSalarioSection({ employee, onUpdate }: PagarSalarioSectionProps) {
  const { openDrawer } = useDrawerStack()

  const handleOpenPayments = () => {
    openDrawer(2, <PaymentsDrawer employee={employee} onClose={() => {}} />)
  }

  const handleNewPayment = () => {
    openDrawer(3,
      <NewItemDrawer
        title="Novo pagamento"
        onClose={() => {}}
        onSave={(data) => {
          console.log('Salvar pagamento', data)
          onUpdate(true)
        }}
      />
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Comissões & Salário
            </h3>
            <p className="text-sm text-gray-500">Acompanhe vencimentos, histórico de itens pagos e registre novos pagamentos.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleOpenPayments}
              className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Ver recebimentos
            </button>
            <button
              onClick={handleNewPayment}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Pagar</span>
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total líquido a pagar', value: 'R$ 1.745,50', trend: '+12% vs mês anterior', icon: ArrowUpRight, accent: 'text-emerald-600' },
            { label: 'Comissões em aberto', value: 'R$ 870,50', trend: '2 comandas aguardando', icon: History, accent: 'text-blue-600' },
            { label: 'Salários pendentes', value: 'R$ 2.500,00', trend: 'Próximo vencimento em 5 dias', icon: Clock8, accent: 'text-amber-600' },
            { label: 'Pagamentos do mês', value: 'R$ 5.290,00', trend: '4 lançamentos', icon: Receipt, accent: 'text-purple-600' }
          ].map(card => (
            <div key={card.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-gray-500">{card.label}</p>
                <card.icon className={`w-5 h-5 ${card.accent}`} />
              </div>
              <p className="text-2xl font-semibold text-gray-900 mt-2">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.trend}</p>
            </div>
          ))}
        </div>

        {/* Próximos vencimentos */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Próximos vencimentos</p>
              <p className="text-xs text-gray-500">Controle o que precisa ser pago e mantenha o histórico organizado.</p>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium" onClick={() => onUpdate(true)}>
              Gerar relatório
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {mockCommissions.map((item) => (
              <div key={item.id} className="px-6 py-4 flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-3 w-full md:w-auto">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.item}</p>
                    <p className="text-xs text-gray-500">Vence em {new Date(item.dueDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex-1 min-w-[160px]">
                  <p className="text-sm font-semibold text-gray-900">R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-gray-500">{item.history}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.status === 'Aberto' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                    {item.status}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600" onClick={() => onUpdate(true)}>
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleNewPayment}
                  className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Realizar pagamento</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Histórico de pagamentos */}
        <div className="bg-white border border-gray-200 rounded-2xl">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Histórico de comissões e salários</p>
              <p className="text-xs text-gray-500">Acompanhe vencimento, item, valor, observação e pagamento.</p>
            </div>
            <button className="flex items-center space-x-2 text-sm text-blue-600 font-medium" onClick={handleOpenPayments}>
              <Eye className="w-4 h-4" />
              <span>Abrir painel completo</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Vencimento</th>
                  <th className="px-6 py-3 text-left">Item</th>
                  <th className="px-6 py-3 text-left">Valor</th>
                  <th className="px-6 py-3 text-left">Histórico</th>
                  <th className="px-6 py-3 text-left">Pagamento</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 text-sm">
                {mockHistory.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900">{new Date(row.due).toLocaleDateString('pt-BR')}</p>
                      <p className="text-xs text-gray-500">{row.status}</p>
                    </td>
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900">{row.type}</p>
                      <p className="text-xs text-gray-500">{row.note}</p>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center space-x-2">
                        {row.type === 'Comissão' ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-blue-500" />
                        )}
                        <span className="font-semibold text-gray-900">
                          R$ {row.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{row.note}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-900">Transferência PIX</span>
                        <button className="text-xs text-blue-600 hover:underline" onClick={() => onUpdate(true)}>
                          Ver recibo
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
