"use client"

import React from 'react'
import { CalendarProfessional } from '@/types/calendar'

interface ProfessionalHeaderProps {
  professional: CalendarProfessional
  onClick?: () => void
}

export function ProfessionalHeader({ professional, onClick }: ProfessionalHeaderProps) {
  const initial = professional.full_name.trim().charAt(0).toUpperCase() || 'A'

  return (
    <div className="flex-1 min-w-[200px] border-r p-3 flex flex-col items-center justify-center">
      <button
        type="button"
        onClick={onClick}
        className="mb-2 h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-primary/30 transition-all"
        title={professional.full_name}
      >
        {professional.avatar_url ? (
          <img
            src={professional.avatar_url}
            alt={professional.full_name}
            className="h-full w-full object-cover"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement
              img.style.display = 'none'
            }}
          />
        ) : (
          <span className="text-sm font-bold text-gray-700">{initial}</span>
        )}
      </button>
      <span className="text-sm font-semibold text-gray-800 truncate max-w-full text-center">
        {professional.full_name}
      </span>
    </div>
  )
}
