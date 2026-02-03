'use client'

import { motion } from 'framer-motion'
import { Palette, Settings, SlidersHorizontal, X } from 'lucide-react'
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAgendaStore } from '@/store/agendaStore'

interface SettingsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDrawer({ open, onOpenChange }: SettingsDrawerProps) {
  const { settings, setSettings } = useAgendaStore()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] max-w-full p-0">
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 60, opacity: 0 }}
          className="flex h-full flex-col"
        >
          <SheetHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <SheetTitle>Configuracoes da Agenda</SheetTitle>
              <SheetClose className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </SheetClose>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <Tabs defaultValue="general">
              <TabsList className="w-full">
                <TabsTrigger value="general" className="flex-1">
                  <Settings className="mr-2 h-4 w-4" />
                  Geral
                </TabsTrigger>
                <TabsTrigger value="view" className="flex-1">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Visualizacao
                </TabsTrigger>
                <TabsTrigger value="colors" className="flex-1">
                  <Palette className="mr-2 h-4 w-4" />
                  Cores
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-800">Alertas inteligentes</p>
                  <p className="mt-1 text-xs text-slate-500">Avisar quando existir conflito ou cliente nao confirmado.</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-slate-600">Ativar notificacoes</span>
                    <Switch checked />
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-800">Bloqueios automaticos</p>
                  <p className="mt-1 text-xs text-slate-500">Reservar intervalo entre atendimentos.</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-slate-600">Ativar intervalo</span>
                    <Switch />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="view" className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Largura das colunas</label>
                  <Select
                    value={settings.columnWidth}
                    onValueChange={(value) => setSettings({ ...settings, columnWidth: value as any })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Automatica</SelectItem>
                      <SelectItem value="compact">Compacta</SelectItem>
                      <SelectItem value="wide">Larga</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Intervalo</label>
                  <Select
                    value={String(settings.slotMinutes)}
                    onValueChange={(value) => setSettings({ ...settings, slotMinutes: Number(value) as any })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Status padrao</label>
                  <Select
                    value={settings.defaultStatus}
                    onValueChange={(value) => setSettings({ ...settings, defaultStatus: value as any })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="unconfirmed">Nao confirmado</SelectItem>
                      <SelectItem value="waiting">Aguardando</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Exibir avatares</p>
                    <p className="text-xs text-slate-500">Mostrar foto dos profissionais.</p>
                  </div>
                  <Switch
                    checked={settings.showAvatars}
                    onCheckedChange={(value: boolean) => setSettings({ ...settings, showAvatars: Boolean(value) })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="colors" className="space-y-4">
                <div className="rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-[1.4fr_0.6fr_1fr_0.4fr] gap-3 border-b border-slate-200 px-4 py-3 text-xs font-semibold text-slate-500">
                    <span>Nome</span>
                    <span>Cor</span>
                    <span>Status</span>
                    <span>Acoes</span>
                  </div>
                  {['Cliente VIP', 'Check In', 'Em atendimento'].map((label) => (
                    <div
                      key={label}
                      className="grid grid-cols-[1.4fr_0.6fr_1fr_0.4fr] items-center gap-3 px-4 py-3 text-sm text-slate-600"
                    >
                      <span>{label}</span>
                      <span className="h-3 w-8 rounded-full bg-slate-300" />
                      <span>Ativo</span>
                      <button className="text-slate-400 hover:text-slate-600">...</button>
                    </div>
                  ))}
                </div>

                <button className="w-full rounded-2xl border border-dashed border-slate-300 py-2 text-sm font-semibold text-slate-600">
                  + Criar
                </button>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  )
}
