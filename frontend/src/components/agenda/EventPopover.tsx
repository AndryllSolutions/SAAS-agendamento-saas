'use client'

import { motion } from 'framer-motion'
import { Phone, MessageCircle, ChevronRight, Palette, CheckCircle2, Trash2, NotebookPen } from 'lucide-react'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'

interface EventPopoverProps {
  clientName: string
  phone: string
  timeLabel: string
  serviceName: string
  statusOptions: { label: string; value: string; color: string }[]
  colorTags: { label: string; value: string; color: string }[]
}

export function EventPopover({ clientName, phone, timeLabel, serviceName, statusOptions, colorTags }: EventPopoverProps) {
  return (
    <DropdownMenuContent asChild sideOffset={8} align="start">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        className="w-[280px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">{clientName}</p>
              <p className="text-xs text-slate-500">{phone}</p>
            </div>
            <button className="flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
              <MessageCircle className="h-3 w-3" />
              Conversar
            </button>
          </div>

          <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <p>{timeLabel}</p>
            <p className="mt-1 flex items-center gap-2">
              <Phone className="h-3 w-3" />
              {serviceName}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator className="my-3" />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center justify-between rounded-lg">
            <span className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle2 className="h-4 w-4" />
              Status
            </span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-[200px]">
            {statusOptions.map((status) => (
              <DropdownMenuItem key={status.value} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: status.color }} />
                <span className="text-sm" style={{ color: status.color }}>
                  {status.label}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center justify-between rounded-lg">
            <span className="flex items-center gap-2 text-sm text-slate-700">
              <Palette className="h-4 w-4" />
              Cor
            </span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-[200px]">
            {colorTags.map((tag) => (
              <DropdownMenuItem key={tag.value} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
                <span className="text-sm" style={{ color: tag.color }}>
                  {tag.label}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm text-slate-500">Remover</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="my-3" />

        <DropdownMenuItem className="flex items-center gap-2 text-sm text-slate-700">
          <NotebookPen className="h-4 w-4" />
          Criar Comanda (+)
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 text-sm text-red-500">
          <Trash2 className="h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </motion.div>
    </DropdownMenuContent>
  )
}
