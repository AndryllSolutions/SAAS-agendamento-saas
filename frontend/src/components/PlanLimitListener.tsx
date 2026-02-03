'use client'

import { useEffect, useState } from 'react'
import { UpgradeModal } from './UpgradeModal'

interface PlanLimitEvent {
  message: string
  url?: string
}

export function PlanLimitListener() {
  const [showModal, setShowModal] = useState(false)
  const [limitMessage, setLimitMessage] = useState('')

  useEffect(() => {
    const handlePlanLimit = (event: CustomEvent<PlanLimitEvent>) => {
      setLimitMessage(event.detail.message)
      setShowModal(true)
    }

    window.addEventListener('plan-limit-reached', handlePlanLimit as EventListener)

    return () => {
      window.removeEventListener('plan-limit-reached', handlePlanLimit as EventListener)
    }
  }, [])

  return (
    <UpgradeModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      feature="limit_reached"
    />
  )
}
