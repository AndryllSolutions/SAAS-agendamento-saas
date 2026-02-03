'use client'

import { Template, AnamneseStatusUi } from '@/types/anamneses'

export type AnamneseFormDadosValue = {
  templateId: string
  clientId: string
  date: string
  status: AnamneseStatusUi
}

export default function AnamneseFormDados({
  value,
  onChange,
  templates,
  clients,
  lockClient,
  lockTemplate,
  disabled,
}: {
  value: AnamneseFormDadosValue
  onChange: (v: AnamneseFormDadosValue) => void
  templates: Template[]
  clients: Array<{ id: number; name: string; phone: string }>
  lockClient?: boolean
  lockTemplate?: boolean
  disabled?: boolean
}) {
  const activeTemplates = templates.filter((t) => t.isActive)
  const inactiveTemplates = templates.filter((t) => !t.isActive)

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Modelo de anamnese</label>
        <select
          value={value.templateId}
          onChange={(e) => onChange({ ...value, templateId: e.target.value })}
          disabled={disabled || lockTemplate}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Selecione...</option>
          <optgroup label="Ativos">
            {activeTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </optgroup>
          {inactiveTemplates.length > 0 && (
            <optgroup label="Desativados">
              {inactiveTemplates.map((t) => (
                <option key={t.id} value={t.id} disabled>
                  {t.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Cliente</label>
        <select
          value={value.clientId}
          onChange={(e) => onChange({ ...value, clientId: e.target.value })}
          disabled={disabled || lockClient}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Selecione...</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.phone ? ` — ${c.phone}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Data</label>
          <input
            type="date"
            value={value.date}
            onChange={(e) => onChange({ ...value, date: e.target.value })}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={value.status}
            onChange={(e) => onChange({ ...value, status: e.target.value as AnamneseStatusUi })}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="Aberto">Aberto</option>
            <option value="Fechado">Fechado</option>
          </select>
        </div>
      </div>
    </div>
  )
}
