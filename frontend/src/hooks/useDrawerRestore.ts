'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDrawerStack } from '@/components/professionals/DrawerStackManager'

interface UseDrawerRestoreProps {
  onRestoreProfessional?: (professionalId: number, section?: string) => void
  onRestoreOverlay?: (overlay: string) => void
}

export function useDrawerRestore({ onRestoreProfessional, onRestoreOverlay }: UseDrawerRestoreProps) {
  const searchParams = useSearchParams()
  const { updateURL } = useDrawerStack()

  useEffect(() => {
    const professionalId = searchParams?.get('drawerProfessionalId')
    const section = searchParams?.get('section')
    const overlay = searchParams?.get('overlay')

    // Restore professional drawer
    if (professionalId && onRestoreProfessional) {
      const id = parseInt(professionalId)
      if (!isNaN(id)) {
        onRestoreProfessional(id, section || undefined)
      }
    }

    // Restore overlay (sub-drawer)
    if (overlay && onRestoreOverlay) {
      onRestoreOverlay(overlay)
    }
  }, [searchParams, onRestoreProfessional, onRestoreOverlay])

  return { updateURL }
}
