import Image from 'next/image'
import { ProfessionalItem } from './types'
import { cn } from '@/lib/utils'
import { toAbsoluteImageUrl } from '@/utils/apiUrl'

interface ProfessionalListProps {
  professionals: ProfessionalItem[]
  selectedId?: number
  onSelect?: (professional: ProfessionalItem) => void
  loading?: boolean
}

function SkeletonCard() {
  return (
    <div className="flex w-full animate-pulse items-center gap-4 rounded-2xl border border-gray-100 bg-white/60 p-4">
      <div className="h-14 w-14 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded bg-gray-200" />
        <div className="h-3 w-1/3 rounded bg-gray-100" />
      </div>
    </div>
  )
}

export function ProfessionalList({ professionals, selectedId, onSelect, loading }: ProfessionalListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((key) => (
          <SkeletonCard key={key} />
        ))}
      </div>
    )
  }

  if (!professionals.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-6 text-center text-sm text-gray-500">
        Nenhum profissional disponível para esta empresa.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {professionals.map((professional) => (
        <button
          type="button"
          key={professional.id}
          onClick={() => onSelect?.(professional)}
          className={cn(
            'flex w-full items-center gap-4 rounded-2xl border bg-white/90 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
            selectedId === professional.id ? 'border-primary shadow-lg' : 'border-gray-100'
          )}
        >
          <div className="h-14 w-14 overflow-hidden rounded-full bg-gray-100">
            {toAbsoluteImageUrl(professional.avatar_url || professional.avatarUrl) ? (
              <Image
                src={toAbsoluteImageUrl(professional.avatar_url || professional.avatarUrl) as string}
                alt={professional.name || professional.full_name || 'Profissional'}
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg text-gray-400">
                {(professional.name || professional.full_name || '?').slice(0, 1)}
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-base font-semibold text-gray-900">
              {professional.name || professional.full_name}
            </span>
            <span className="text-sm text-gray-500">
              {professional.specialty || professional.role || 'Profissional' }
            </span>
          </div>
          <span
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
              selectedId === professional.id
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-gray-200 bg-gray-50 text-gray-500'
            )}
          >
            Selecionar
          </span>
        </button>
      ))}
    </div>
  )
}
