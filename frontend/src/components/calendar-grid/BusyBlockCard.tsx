"use client"

import React from 'react'
import { BusyBlock } from '@/types/calendar'

interface BusyBlockCardProps {
  block: BusyBlock
}

export function BusyBlockCard({ block }: BusyBlockCardProps) {
  return (
    <div className="h-full rounded-md bg-gray-300 border-l-4 border-gray-600 p-2 flex flex-col justify-center items-center">
      <div className="text-sm font-semibold text-gray-800">Ocupado</div>
      <div className="text-xs text-gray-700 mt-1 truncate w-full text-center">
        {block.reason}
      </div>
    </div>
  )
}
