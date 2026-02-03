'use client'

import React, { useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as Tabs from '@radix-ui/react-tabs'
import * as Dialog from '@radix-ui/react-dialog'
import * as Switch from '@radix-ui/react-switch'
import { AnimatePresence, motion } from 'framer-motion'
import { create } from 'zustand'
import {
  Bell,
  Bolt,
  CalendarClock,
  Check,
  Edit3,
  MessageCircle,
  MessageSquareText,
  PhoneCall,
  Settings,
  UserCircle2,
  X,
} from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'

type Campaign = {
  id: string
  title: string
  description: string
  icon: React.ElementType
  autoEnabled: boolean
  availableVariables: string[]
  openModal?: boolean
}

type CampaignTemplate = {
  autoSend: boolean
  reminderHours: number
  reminderMessage: string
  welcomeMessage: string
  returnServiceMessage: string
  returnProductMessage: string
}

type StatusEventTemplate = {
  autoSend: boolean
  message: string
}

type CampaignStore = {
  toggles: Record<string, boolean>
  templates: Record<string, CampaignTemplate>
  statusTemplates: Record<string, StatusEventTemplate>
  setToggle: (id: string, enabled: boolean) => void
  setTemplate: (id: string, template: CampaignTemplate) => void
  setStatusTemplate: (id: string, template: StatusEventTemplate) => void
}

const statusEvents = [
  { id: 'created', label: 'Criacao' },
  { id: 'confirmed', label: 'Status Confirmado' },
  { id: 'unconfirmed', label: 'Nao confirmado' },
  { id: 'cancelled', label: 'Cancelado' },
  { id: 'rescheduled', label: 'Reagendado' },
  { id: 'completed', label: 'Finalizado' },
]

const mockCampaigns: Campaign[] = [
  {
    id: 'reminders',
    title: 'Evite esquecimentos',
    description: 'Lembre seus clientes dos agendamentos e reduza faltas.',
    icon: CalendarClock,
    autoEnabled: true,
    availableVariables: ['%NOME%', '%DATA%', '%HORA%', '%SERVICO%', '%PROFISSIONAL%', '%LINK%'],
  },
  {
    id: 'welcome',
    title: 'Boas-vindas',
    description: 'Encante no primeiro contato com uma mensagem personalizada.',
    icon: UserCircle2,
    autoEnabled: true,
    availableVariables: ['%NOME%', '%APELIDO%', '%SERVICO%', '%PROFISSIONAL%'],
  },
  {
    id: 'returns',
    title: 'Garanta retornos',
    description: 'Ative campanhas para sugerir novos agendamentos.',
    icon: Bolt,
    autoEnabled: false,
    availableVariables: ['%NOME%', '%SERVICO%', '%PROFISSIONAL%', '%LINK%'],
  },
  {
    id: 'status',
    title: 'Clientes bem informados',
    description: 'Notifique mudancas de status e entregue tranquilidade.',
    icon: Bell,
    autoEnabled: true,
    availableVariables: ['%NOME%', '%DATA%', '%HORA%', '%STATUS%'],
    openModal: true,
  },
]

const defaultTemplates: Record<string, CampaignTemplate> = {
  reminders: {
    autoSend: true,
    reminderHours: 4,
    reminderMessage: 'Oi %NOME%, lembrete do seu agendamento %DATA% as %HORA%.',
    welcomeMessage: '',
    returnServiceMessage: '',
    returnProductMessage: '',
  },
  welcome: {
    autoSend: true,
    reminderHours: 2,
    reminderMessage: '',
    welcomeMessage: 'Bem-vindo, %NOME%! Estamos prontos para te atender.',
    returnServiceMessage: '',
    returnProductMessage: '',
  },
  returns: {
    autoSend: false,
    reminderHours: 24,
    reminderMessage: '',
    welcomeMessage: '',
    returnServiceMessage: 'Seu servico %SERVICO% esta disponivel novamente.',
    returnProductMessage: 'Confira novidades e produtos indicados para voce.',
  },
}

const defaultStatusTemplates: Record<string, StatusEventTemplate> = {
  created: {
    autoSend: true,
    message: 'Seu agendamento foi criado. Qualquer duvida, fale com a gente.',
  },
  confirmed: {
    autoSend: true,
    message: 'Agendamento confirmado. Estamos te esperando em %DATA% as %HORA%.',
  },
  unconfirmed: {
    autoSend: false,
    message: 'Seu agendamento ainda nao foi confirmado. Podemos ajudar?',
  },
  cancelled: {
    autoSend: false,
    message: 'Seu agendamento foi cancelado. Deseja reagendar?',
  },
  rescheduled: {
    autoSend: true,
    message: 'Agendamento reagendado para %DATA% as %HORA%.',
  },
  completed: {
    autoSend: true,
    message: 'Atendimento finalizado. Obrigado por escolher a gente.',
  },
}

const useCampaignStore = create<CampaignStore>((set) => ({
  toggles: Object.fromEntries(mockCampaigns.map((c) => [c.id, c.autoEnabled])),
  templates: defaultTemplates,
  statusTemplates: defaultStatusTemplates,
  setToggle: (id, enabled) =>
    set((state) => ({ toggles: { ...state.toggles, [id]: enabled } })),
  setTemplate: (id, template) =>
    set((state) => ({ templates: { ...state.templates, [id]: template } })),
  setStatusTemplate: (id, template) =>
    set((state) => ({ statusTemplates: { ...state.statusTemplates, [id]: template } })),
}))

const insertAtCursor = (
  textarea: HTMLTextAreaElement | null,
  text: string,
  onChange: (value: string) => void
) => {
  if (!textarea) return
  const { selectionStart, selectionEnd, value } = textarea
  const next = `${value.slice(0, selectionStart)}${text}${value.slice(selectionEnd)}`
  onChange(next)
  requestAnimationFrame(() => {
    textarea.focus()
    const position = selectionStart + text.length
    textarea.setSelectionRange(position, position)
  })
}

export default function WhatsAppMarketingPage() {
  const [activeTab, setActiveTab] = useState('campaigns')
  const [drawerCampaign, setDrawerCampaign] = useState<Campaign | null>(null)
  const [modalCampaign, setModalCampaign] = useState<Campaign | null>(null)

  const campaignsQuery = useQuery({
    queryKey: ['whatsapp-marketing', 'campaigns'],
    queryFn: async () => mockCampaigns,
    staleTime: Infinity,
  })

  const campaigns = campaignsQuery.data || []

  return (
    <DashboardLayout>
      <WhatsAppMarketingPageContent
        activeTab={activeTab}
        onTabChange={setActiveTab}
        campaigns={campaigns}
        onCustomize={(campaign) => {
          if (campaign.openModal) {
            setModalCampaign(campaign)
          } else {
            setDrawerCampaign(campaign)
          }
        }}
      />

      <CampaignEditorDrawer
        campaign={drawerCampaign}
        open={!!drawerCampaign}
        onClose={() => setDrawerCampaign(null)}
      />

      <CampaignEditorModal
        campaign={modalCampaign}
        open={!!modalCampaign}
        onClose={() => setModalCampaign(null)}
      />
    </DashboardLayout>
  )
}

function WhatsAppMarketingPageContent({
  activeTab,
  onTabChange,
  campaigns,
  onCustomize,
}: {
  activeTab: string
  onTabChange: (value: string) => void
  campaigns: Campaign[]
  onCustomize: (campaign: Campaign) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-3xl font-bold text-gray-900">WhatsApp Marketing</div>
        <p className="text-gray-600 mt-1">Engaje clientes com campanhas inteligentes.</p>
      </div>

      <MarketingTabs activeTab={activeTab} onTabChange={onTabChange}>
        <Tabs.Content value="campaigns" className="space-y-6">
          <CampaignGrid campaigns={campaigns} onCustomize={onCustomize} />
        </Tabs.Content>
        <Tabs.Content value="custom" className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center">
                <MessageSquareText className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">Campanhas personalizadas</div>
                <p className="text-sm text-gray-600 mt-1">
                  Crie fluxos sob medida para datas especiais, aniversarios ou campanhas sazonais.
                </p>
                <button className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Criar nova campanha
                </button>
              </div>
            </div>
          </div>
        </Tabs.Content>
        <Tabs.Content value="settings" className="space-y-6">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Telefone conectado</div>
                  <div className="text-2xl font-semibold text-gray-900">+55 (45) 99999-9999</div>
                </div>
                <button className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  <Edit3 className="h-4 w-4" />
                  Editar
                </button>
              </div>
              <div className="mt-8 flex items-center justify-center">
                <div className="h-64 w-64 rounded-2xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                  <PhoneCall className="h-16 w-16 text-gray-300" />
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between text-sm text-gray-500">
                <button className="hover:text-gray-700">Precisa de ajuda?</button>
                <button className="hover:text-gray-700">Passo a passo</button>
              </div>
            </div>
          </div>
        </Tabs.Content>
      </MarketingTabs>
    </div>
  )
}

function MarketingTabs({
  activeTab,
  onTabChange,
  children,
}: {
  activeTab: string
  onTabChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <Tabs.Root value={activeTab} onValueChange={onTabChange}>
      <Tabs.List className="flex flex-wrap gap-6 border-b border-gray-200">
        <Tabs.Trigger
          value="campaigns"
          className="px-1 py-4 text-sm font-semibold text-gray-500 border-b-2 border-transparent data-[state=active]:text-teal-600 data-[state=active]:border-teal-500"
        >
          Campanhas
        </Tabs.Trigger>
        <Tabs.Trigger
          value="custom"
          className="px-1 py-4 text-sm font-semibold text-gray-500 border-b-2 border-transparent data-[state=active]:text-teal-600 data-[state=active]:border-teal-500"
        >
          Campanhas Personalizadas
        </Tabs.Trigger>
        <Tabs.Trigger
          value="settings"
          className="px-1 py-4 text-sm font-semibold text-gray-500 border-b-2 border-transparent data-[state=active]:text-teal-600 data-[state=active]:border-teal-500"
        >
          Configuracoes
        </Tabs.Trigger>
      </Tabs.List>
      <div className="pt-6">{children}</div>
    </Tabs.Root>
  )
}

function CampaignGrid({
  campaigns,
  onCustomize,
}: {
  campaigns: Campaign[]
  onCustomize: (campaign: Campaign) => void
}) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} onCustomize={onCustomize} />
      ))}
    </div>
  )
}

function CampaignCard({
  campaign,
  onCustomize,
}: {
  campaign: Campaign
  onCustomize: (campaign: Campaign) => void
}) {
  const Icon = campaign.icon
  const enabled = useCampaignStore((state) => state.toggles[campaign.id])
  const setToggle = useCampaignStore((state) => state.setToggle)

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col gap-4">
      <div className="h-14 w-14 rounded-2xl bg-teal-50 flex items-center justify-center">
        <Icon className="h-7 w-7 text-teal-600" />
      </div>
      <div>
        <div className="text-lg font-semibold text-gray-900">{campaign.title}</div>
        <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
      </div>
      <div className="h-px bg-gray-100" />
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">Envio automatico ativado</div>
        <Switch.Root
          checked={enabled}
          onCheckedChange={(checked: boolean) => setToggle(campaign.id, checked)}
          className="h-6 w-11 rounded-full bg-gray-200 data-[state=checked]:bg-teal-500 relative"
        >
          <Switch.Thumb className="block h-5 w-5 bg-white rounded-full translate-x-1 data-[state=checked]:translate-x-5 transition" />
        </Switch.Root>
      </div>
      <button
        onClick={() => onCustomize(campaign)}
        className="mt-auto text-sm font-semibold text-teal-600 hover:text-teal-500"
      >
        Personalizar
      </button>
    </div>
  )
}

function CampaignEditorDrawer({
  campaign,
  open,
  onClose,
}: {
  campaign: Campaign | null
  open: boolean
  onClose: () => void
}) {
  const setTemplate = useCampaignStore((state) => state.setTemplate)
  const template = useCampaignStore((state) =>
    campaign ? state.templates[campaign.id] || defaultTemplates[campaign.id] : undefined
  )

  const [localTemplate, setLocalTemplate] = useState<CampaignTemplate | null>(null)
  const reminderRef = useRef<HTMLTextAreaElement | null>(null)
  const welcomeRef = useRef<HTMLTextAreaElement | null>(null)
  const returnServiceRef = useRef<HTMLTextAreaElement | null>(null)
  const returnProductRef = useRef<HTMLTextAreaElement | null>(null)

  const activeTemplate = useMemo(() => {
    if (!campaign) return null
    if (localTemplate) return localTemplate
    return template ? { ...template } : null
  }, [campaign, localTemplate, template])

  const updateTemplateField = (field: keyof CampaignTemplate, value: string | number | boolean) => {
    if (!activeTemplate) return
    setLocalTemplate({ ...activeTemplate, [field]: value })
  }

  const handleSave = () => {
    if (!campaign || !activeTemplate) return
    setTemplate(campaign.id, activeTemplate)
    setLocalTemplate(null)
    onClose()
  }

  const handleClose = () => {
    setLocalTemplate(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && campaign && activeTemplate ? (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className="absolute right-0 top-0 h-full w-full max-w-3xl bg-white shadow-xl flex flex-col"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <div className="text-xl font-semibold text-gray-900">Personalizar campanha</div>
                <div className="text-sm text-gray-500">{campaign.title}</div>
              </div>
              <button
                onClick={handleClose}
                className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">Enviar automaticamente?</div>
                <Switch.Root
                  checked={activeTemplate.autoSend}
                  onCheckedChange={(checked: boolean) => updateTemplateField('autoSend', checked)}
                  className="h-6 w-11 rounded-full bg-gray-200 data-[state=checked]:bg-teal-500 relative"
                >
                  <Switch.Thumb className="block h-5 w-5 bg-white rounded-full translate-x-1 data-[state=checked]:translate-x-5 transition" />
                </Switch.Root>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5 space-y-4">
                <div className="text-sm font-semibold text-gray-900">Evite esquecimentos</div>
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Antecedencia (horas)</label>
                    <input
                      type="number"
                      value={activeTemplate.reminderHours}
                      onChange={(event) => updateTemplateField('reminderHours', Number(event.target.value))}
                      className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <TextareaWithCounter
                    ref={reminderRef}
                    label="Mensagem"
                    value={activeTemplate.reminderMessage}
                    onChange={(value) => updateTemplateField('reminderMessage', value)}
                  />
                </div>
                <VariableChips
                  variables={campaign.availableVariables}
                  onInsert={(variable) =>
                    insertAtCursor(reminderRef.current, variable, (value) =>
                      updateTemplateField('reminderMessage', value)
                    )
                  }
                />
              </div>

              <div className="rounded-2xl border border-gray-200 p-5 space-y-4">
                <div className="text-sm font-semibold text-gray-900">Boas-vindas</div>
                <TextareaWithCounter
                  ref={welcomeRef}
                  label="Mensagem"
                  value={activeTemplate.welcomeMessage}
                  onChange={(value) => updateTemplateField('welcomeMessage', value)}
                />
                <VariableChips
                  variables={campaign.availableVariables}
                  onInsert={(variable) =>
                    insertAtCursor(welcomeRef.current, variable, (value) =>
                      updateTemplateField('welcomeMessage', value)
                    )
                  }
                />
              </div>

              <div className="rounded-2xl border border-gray-200 p-5 space-y-4">
                <div className="text-sm font-semibold text-gray-900">Garanta retornos</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextareaWithCounter
                    ref={returnServiceRef}
                    label="Mensagem para servicos"
                    value={activeTemplate.returnServiceMessage}
                    onChange={(value) => updateTemplateField('returnServiceMessage', value)}
                  />
                  <TextareaWithCounter
                    ref={returnProductRef}
                    label="Mensagem para produtos"
                    value={activeTemplate.returnProductMessage}
                    onChange={(value) => updateTemplateField('returnProductMessage', value)}
                  />
                </div>
                <VariableChips
                  variables={campaign.availableVariables}
                  onInsert={(variable) =>
                    insertAtCursor(returnServiceRef.current, variable, (value) =>
                      updateTemplateField('returnServiceMessage', value)
                    )
                  }
                />
              </div>
            </div>

            <StickyFooterActions
              onCancel={handleClose}
              onSave={handleSave}
            />
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

function CampaignEditorModal({
  campaign,
  open,
  onClose,
}: {
  campaign: Campaign | null
  open: boolean
  onClose: () => void
}) {
  const [selectedEvent, setSelectedEvent] = useState(statusEvents[0].id)
  const statusTemplate = useCampaignStore((state) => state.statusTemplates[selectedEvent])
  const setStatusTemplate = useCampaignStore((state) => state.setStatusTemplate)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const activeVariables = campaign?.availableVariables || ['%NOME%', '%DATA%', '%HORA%']

  const handleSave = () => {
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(value) => !value && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content className="fixed inset-6 bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-teal-50 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-gray-900">Clientes bem informados</div>
                  <div className="text-sm text-gray-500">Edite os gatilhos de status</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-0 overflow-hidden">
              <div className="border-r border-gray-200 bg-gray-50 p-6 space-y-2 overflow-y-auto">
                {statusEvents.map((event) => {
                  const active = event.id === selectedEvent
                  return (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event.id)}
                      className={`w-full text-left rounded-xl px-4 py-3 text-sm font-medium transition border ${
                        active
                          ? 'border-teal-500 bg-white text-teal-600'
                          : 'border-transparent text-gray-600 hover:bg-white'
                      }`}
                    >
                      {event.label}
                    </button>
                  )
                })}
              </div>

              <div className="p-8 overflow-y-auto space-y-6">
                <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-5 text-sm text-teal-700 flex items-start gap-3">
                  <Check className="h-5 w-5 mt-0.5" />
                  <div>
                    Mensagens enviadas automaticamente mantem os clientes informados sobre cada etapa.
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">Enviar automaticamente?</div>
                  <Switch.Root
                    checked={statusTemplate?.autoSend}
                    onCheckedChange={(checked: boolean) =>
                      setStatusTemplate(selectedEvent, { ...statusTemplate, autoSend: checked })
                    }
                    className="h-6 w-11 rounded-full bg-gray-200 data-[state=checked]:bg-teal-500 relative"
                  >
                    <Switch.Thumb className="block h-5 w-5 bg-white rounded-full translate-x-1 data-[state=checked]:translate-x-5 transition" />
                  </Switch.Root>
                </div>

                <TextareaWithCounter
                  ref={textareaRef}
                  label="Mensagem"
                  value={statusTemplate?.message || ''}
                  onChange={(value) =>
                    setStatusTemplate(selectedEvent, { ...statusTemplate, message: value })
                  }
                />

                <VariableChips
                  variables={activeVariables}
                  onInsert={(variable) =>
                    insertAtCursor(textareaRef.current, variable, (value) =>
                      setStatusTemplate(selectedEvent, { ...statusTemplate, message: value })
                    )
                  }
                />
              </div>
            </div>

            <StickyFooterActions onCancel={onClose} onSave={handleSave} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

const TextareaWithCounter = React.forwardRef<
  HTMLTextAreaElement,
  {
    label: string
    value: string
    onChange: (value: string) => void
  }
>(({ label, value, onChange }, ref) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <div className="relative">
        <textarea
          ref={ref}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
          {value.length} / 750
        </div>
      </div>
    </div>
  )
})

TextareaWithCounter.displayName = 'TextareaWithCounter'

function VariableChips({
  variables,
  onInsert,
}: {
  variables: string[]
  onInsert: (variable: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {variables.map((variable) => (
        <button
          key={variable}
          onClick={() => onInsert(variable)}
          className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
        >
          {variable}
        </button>
      ))}
    </div>
  )
}

function StickyFooterActions({
  onCancel,
  onSave,
}: {
  onCancel: () => void
  onSave: () => void
}) {
  return (
    <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4 flex items-center justify-end gap-3">
      <button
        onClick={onCancel}
        className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50"
      >
        Cancelar
      </button>
      <button
        onClick={onSave}
        className="px-6 py-2 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500"
      >
        Salvar
      </button>
    </div>
  )
}
