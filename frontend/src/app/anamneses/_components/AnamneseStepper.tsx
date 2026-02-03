'use client'

import { cn } from '@/utils'

export type AnamneseStep = 'dados' | 'assinatura' | 'link'

const steps: Array<{ id: AnamneseStep; label: string }> = [
  { id: 'dados', label: 'Dados' },
  { id: 'assinatura', label: 'Assinatura Eletrônica' },
  { id: 'link', label: 'Link' },
]

export default function AnamneseStepper({
  value,
  onChange,
  disabled,
}: {
  value: AnamneseStep
  onChange: (v: AnamneseStep) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-2">
      {steps.map((s, idx) => {
        const active = s.id === value
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            disabled={disabled}
            className={cn(
              'w-full text-left rounded-md px-3 py-2 border transition-colors',
              active
                ? 'border-primary bg-primary/5 text-gray-900'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
              disabled ? 'opacity-60 cursor-not-allowed' : ''
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold',
                  active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                )}
              >
                {idx + 1}
              </div>
              <div className="text-sm font-medium">{s.label}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
