import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { ServiceItem } from './types'
import { cn } from '@/lib/utils'

interface ServiceCardProps {
  service: ServiceItem
  onSelect?: (service: ServiceItem) => void
  active?: boolean
}

export function ServiceCard({ service, onSelect, active }: ServiceCardProps) {
  const duration = service.duration_minutes ?? service.durationMin
  const price = service.price_from ?? service.priceFrom
  const category = service.category
  const imageUrl = service.image_url ?? service.imageUrl

  return (
    <button
      type="button"
      onClick={() => onSelect?.(service)}
      className={cn(
        'flex w-full items-center gap-4 rounded-2xl border bg-white/90 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
        active ? 'border-primary/90 shadow-lg' : 'border-gray-100'
      )}
    >
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100">
        {imageUrl ? (
          <Image src={imageUrl} alt={service.name} width={80} height={80} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">✂️</div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="font-medium text-gray-400">{category || 'Serviço'}</span>
          {duration ? <span>{duration} min</span> : null}
        </div>
        <h3 className="truncate text-lg font-semibold text-gray-900">{service.name}</h3>
        {price ? (
          <p className="text-sm text-gray-500">A partir de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}</p>
        ) : null}
      </div>

      <ArrowRight className="h-5 w-5 text-gray-400" />
    </button>
  )
}
