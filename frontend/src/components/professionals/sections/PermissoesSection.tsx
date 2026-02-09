'use client'

import { Shield, Check, X, LockKeyhole, Sparkles, Workflow, Users2, Megaphone, Wallet, ClipboardList, PieChart } from 'lucide-react'

interface Employee {
  id: number
  full_name: string
}

interface PermissoesSectionProps {
  employee: Employee
  onUpdate: (hasChanges: boolean) => void
}

const permissionGroups = [
  {
    title: 'Painel e Relatórios',
    icon: PieChart,
    items: [
      { id: 'dashboard_view', label: 'Visão geral', description: 'Acesso ao dashboard principal e KPIs.' },
      { id: 'analytics_full', label: 'Relatórios completos', description: 'Exportar relatórios financeiros e operacionais.' }
    ]
  },
  {
    title: 'Clientes & Agenda',
    icon: Users2,
    items: [
      { id: 'clients_manage', label: 'Gerenciar clientes', description: 'Criar, editar e excluir fichas de clientes.' },
      { id: 'schedule_manage', label: 'Agenda completa', description: 'Controlar agendamentos e abrir comanda.' }
    ]
  },
  {
    title: 'Comandas e Serviços',
    icon: ClipboardList,
    items: [
      { id: 'commands_discount', label: 'Conceder descontos', description: 'Aplicar descontos e cortesias nas comandas.' },
      { id: 'services_customize', label: 'Personalizar serviços', description: 'Alterar preços e duração.' }
    ]
  },
  {
    title: 'Campanhas & Marketing',
    icon: Megaphone,
    items: [
      { id: 'campaigns_manage', label: 'Gerenciar campanhas', description: 'Criar campanhas de SMS, WhatsApp e e-mail.' },
      { id: 'reviews_reply', label: 'Responder avaliações', description: 'Gerenciar feedbacks dos clientes.' }
    ]
  },
  {
    title: 'Financeiro & Comissões',
    icon: Wallet,
    items: [
      { id: 'financial_full', label: 'Financeiro completo', description: 'Acessa fluxo de caixa, pagamentos e vales.' },
      { id: 'commissions_config', label: 'Configurar comissões', description: 'Define regras de comissionamento e aprova pagamentos.' }
    ]
  }
]

const specialPermissions = [
  { id: 'admin', label: 'Administrador', description: 'Acesso total ao sistema incluindo configurações sensíveis.' },
  { id: 'manager', label: 'Gerente', description: 'Pode aprovar pagamentos e editar equipe.' },
  { id: 'auditor', label: 'Análises', description: 'Somente leitura em relatórios e histórico.' },
  { id: 'campaign_lead', label: 'Campanhas', description: 'Controle completo sobre automações e disparos.' }
]

export default function PermissoesSection({ employee, onUpdate }: PermissoesSectionProps) {
  const handlePermissionChange = (permissionId: string, granted: boolean) => {
    onUpdate(true)
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Permissões
          </h3>
          <p className="text-sm text-gray-500">
            Defina papéis como administrador, agenda, análises, campanhas, clientes, comandas, comissões, compras e financeiro.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
          <LockKeyhole className="w-5 h-5 text-amber-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">Atenção ao compartilhamento</p>
            <p className="text-xs text-amber-800">Algumas permissões liberam dados financeiros e histórico de clientes. Ative apenas para perfis confiáveis.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {permissionGroups.map(group => (
            <div key={group.title} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-3">
                <group.icon className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{group.title}</p>
                  <p className="text-xs text-gray-500">Selecione o nível de acesso desejado.</p>
                </div>
              </div>

              <div className="space-y-3">
                {group.items.map(item => (
                  <div key={item.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePermissionChange(item.id, true)}
                          className="p-2 rounded-lg border-2 border-emerald-200 hover:bg-emerald-50"
                          title="Conceder"
                        >
                          <Check className="w-4 h-4 text-emerald-600" />
                        </button>
                        <button
                          onClick={() => handlePermissionChange(item.id, false)}
                          className="p-2 rounded-lg border-2 border-rose-200 hover:bg-rose-50"
                          title="Revogar"
                        >
                          <X className="w-4 h-4 text-rose-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Permissões especiais</p>
              <p className="text-xs text-gray-500">Combine papéis adicionais como administrador, agenda, análises e financeiro.</p>
            </div>
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {specialPermissions.map(permission => (
              <label key={permission.id} className="flex items-center space-x-3 border border-gray-100 rounded-xl p-4 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  onChange={() => onUpdate(true)}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{permission.label}</p>
                  <p className="text-xs text-gray-500">{permission.description}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm text-gray-600">
            {[
              { title: 'Última revisão', value: '02/02/2024 por Camila' },
              { title: 'Vinculado ao plano', value: 'Controle completo' },
              { title: 'Fluxo de aprovação', value: 'Exige confirmação do gerente' }
            ].map(info => (
              <div key={info.title} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs uppercase tracking-wide text-gray-500">{info.title}</p>
                <p className="text-sm font-semibold text-gray-900">{info.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-5">
          <div className="flex items-start space-x-3">
            <Workflow className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Auditoria de permissões</p>
              <p className="text-xs text-gray-500">Gerencie quem pode acessar administrador, agenda, análises, campanhas, clientes, comandas, comissões, compras e financeiro. Esse log fica salvo para futuras revisões.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
