import { cn } from '@/lib/utils'

interface TimeSlotsProps {
  slots: string[]
  selected?: string
  onSelect?: (slot: string) => void
  loading?: boolean
}

export function TimeSlots({ slots, selected, onSelect, loading }: TimeSlotsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-12 animate-pulse rounded-2xl bg-gray-200" />
        ))}
      </div>
    )
  }

  if (!slots.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-6 text-center text-sm text-gray-500">
        Nenhum horário disponível para esta data. Tente escolher outra data.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          onClick={() => onSelect?.(slot)}
          className={cn(
            'rounded-2xl border py-3 text-sm font-semibold transition',
            selected === slot
              ? 'border-primary bg-primary text-white shadow-lg'
              : 'border-gray-200 bg-white/90 text-gray-700 hover:border-primary hover:text-primary'
          )}
        >
          {slot}
        </button>
      ))}
    </div>
  )
}
