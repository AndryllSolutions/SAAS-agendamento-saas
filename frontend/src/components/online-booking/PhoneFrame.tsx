import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PhoneFrameProps {
  children: ReactNode
  className?: string
  dark?: boolean
}

export function PhoneFrame({ children, className, dark = true }: PhoneFrameProps) {
  return (
    <div
      className={cn(
        'relative mx-auto w-[390px] max-w-full rounded-[48px] border border-black/10 p-4 shadow-[0_40px_80px_rgba(15,23,42,0.45)]',
        dark ? 'bg-neutral-950' : 'bg-white',
        className
      )}
    >
      <div className="pointer-events-none absolute left-1/2 top-4 z-20 h-5 w-32 -translate-x-1/2 rounded-full bg-black/40" />
      <div className="pointer-events-none absolute left-[18%] top-6 z-20 h-2 w-8 rounded-full bg-black/60" />
      <div className="pointer-events-none absolute right-[18%] top-6 z-20 h-2 w-8 rounded-full bg-black/60" />
      <div className="relative overflow-hidden rounded-[36px] bg-white">
        {children}
      </div>
    </div>
  )
}

export default PhoneFrame
