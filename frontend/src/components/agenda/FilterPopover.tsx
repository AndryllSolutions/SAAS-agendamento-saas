'use client'

import { motion } from 'framer-motion'
import { Filter, Settings } from 'lucide-react'
import { useAgendaStore } from '@/store/agendaStore'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'

const statusOptions = [
  { label: 'Confirmado', value: 'confirmed' },
  { label: 'Nao confirmado', value: 'unconfirmed' },
  { label: 'Aguardando', value: 'waiting' },
  { label: 'Cancelado', value: 'cancelled' },
  { label: 'Faturado', value: 'billed' },
  { label: 'Bloqueado', value: 'blocked' },
]

const professionals = [
  { id: 1, name: 'Amanda Costa' },
  { id: 2, name: 'Bruno Rocha' },
  { id: 3, name: 'Carla Araujo' },
  { id: 4, name: 'Daniela Lima' },
]

export function FilterPopover() {
  const { filters, toggleProfessional, toggleStatus, clearProfessionals } = useAgendaStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600">
          <Filter className="h-4 w-4" />
          Filtrar
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent asChild sideOffset={12} align="end">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="w-[320px] space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
        >
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Profissionais</p>
              <button onClick={clearProfessionals} className="text-xs font-medium text-slate-400 hover:text-slate-600">
                Desmarcar tudo
              </button>
            </div>
            <div className="space-y-3">
              {professionals.map((prof) => (
                <div key={prof.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <label className="flex items-center gap-3 text-sm text-slate-700">
                    <Checkbox
                      checked={filters.professionalIds.includes(prof.id)}
                      onCheckedChange={() => toggleProfessional(prof.id)}
                    />
                    {prof.name}
                  </label>
                  <button className="text-slate-400 hover:text-slate-600">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800">Status</p>
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((status) => (
                <label key={status.value} className="flex items-center gap-2 text-sm text-slate-600">
                  <Checkbox
                    checked={filters.statuses.includes(status.value as any)}
                    onCheckedChange={() => toggleStatus(status.value as any)}
                  />
                  {status.label}
                </label>
              ))}
            </div>
          </div>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
