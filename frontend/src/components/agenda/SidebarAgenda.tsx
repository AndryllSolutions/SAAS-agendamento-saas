'use client'

import { Home, CalendarDays, Users, BarChart3, CreditCard, ShieldCheck, Settings, LogOut } from 'lucide-react'

interface SidebarAgendaProps {
  companyName: string
}

const mainItems = [
  { label: 'Agenda', icon: CalendarDays, active: true },
  { label: 'Dashboard', icon: Home },
  { label: 'Clientes', icon: Users },
]

const financialItems = [
  { label: 'Pagamentos', icon: CreditCard },
  { label: 'Relatorios', icon: BarChart3 },
]

const controlItems = [
  { label: 'Permissoes', icon: ShieldCheck },
  { label: 'Configuracoes', icon: Settings },
]

export function SidebarAgenda({ companyName }: SidebarAgendaProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[#16A3B8] text-white">
      <div className="flex h-full flex-col px-6 pb-6 pt-8">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg font-semibold">A</div>
          <div className="text-lg font-semibold">Atendo</div>
        </div>

        <div className="mb-8 rounded-2xl bg-white/15 p-4">
          <p className="text-sm text-white/70">Ola,</p>
          <p className="text-lg font-semibold">{companyName}</p>
          <button className="mt-3 text-sm font-medium text-white/80 hover:text-white">Meu perfil</button>
        </div>

        <button className="mb-10 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#0F6C7A] shadow-sm">
          + Novo
        </button>

        <nav className="space-y-8 text-sm">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Principal</p>
            <div className="space-y-2">
              {mainItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                      item.active ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Financeiro</p>
            <div className="space-y-2">
              {financialItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-white/80 transition-colors hover:bg-white/10"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Controle</p>
            <div className="space-y-2">
              {controlItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-white/80 transition-colors hover:bg-white/10"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        </nav>

        <div className="mt-auto">
          <button className="flex items-center gap-3 text-sm text-white/70 hover:text-white">
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  )
}
