'use client'

import { motion } from 'framer-motion'
import { CalendarDays, ChevronLeft, ChevronRight, Filter, Play, Settings, SlidersHorizontal, Sparkles } from 'lucide-react'
import { useAgendaStore } from '@/store/agendaStore'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { FilterPopover } from './FilterPopover'

interface TopbarAgendaProps {
  onOpenSettings: () => void
  onNew: () => void
}

const viewOptions = [
  { label: 'Diario', value: 'daily' },
  { label: 'Semanal', value: 'weekly' },
  { label: 'Mensal', value: 'monthly' },
]

export function TopbarAgenda({ onOpenSettings, onNew }: TopbarAgendaProps) {
  const { view, setView, date, setDate } = useAgendaStore()

  const handleToday = () => setDate(new Date())
  const handlePrev = () => setDate(new Date(date.getTime() - 24 * 60 * 60 * 1000))
  const handleNext = () => setDate(new Date(date.getTime() + 24 * 60 * 60 * 1000))

  return (
    <div className="flex items-center justify-between rounded-3xl bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
          <button className="rounded-full p-2 text-slate-600 hover:bg-white" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="rounded-full px-3 text-sm font-semibold text-slate-700" onClick={handleToday}>
            Hoje
          </button>
          <button className="rounded-full p-2 text-slate-600 hover:bg-white" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <button className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600">
          <Play className="h-4 w-4" />
          Agora
        </button>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600">
              <CalendarDays className="h-4 w-4" />
              Visualizacao
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent asChild sideOffset={10} align="end">
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
            >
              {viewOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={() => setView(option.value as typeof view)}
                  className={`rounded-lg ${view === option.value ? 'bg-slate-100 font-semibold' : ''}`}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>

        <FilterPopover />

        <button className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600">
          <SlidersHorizontal className="h-4 w-4" />
          Acoes
        </button>

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600"
        >
          <Settings className="h-4 w-4" />
          Ajustes
        </button>

        <button
          onClick={onNew}
          className="flex items-center gap-2 rounded-full bg-[#6D28D9] px-4 py-2 text-sm font-semibold text-white shadow"
        >
          <Sparkles className="h-4 w-4" />
          + Novo
        </button>
      </div>
    </div>
  )
}
