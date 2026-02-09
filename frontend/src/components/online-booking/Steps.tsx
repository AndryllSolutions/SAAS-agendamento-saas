import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type Step = {
  label: string
}

interface StepsProps {
  steps: Step[]
  currentStep: number
}

export function Steps({ steps, currentStep }: StepsProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/90 p-4 shadow-sm">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === currentStep
        const isCompleted = stepNumber < currentStep

        return (
          <div key={step.label} className="flex flex-1 flex-col items-center gap-2 text-center">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition',
                isCompleted && 'bg-emerald-500 text-white shadow-md',
                isActive && !isCompleted && 'bg-primary text-white shadow-md',
                !isActive && !isCompleted && 'bg-gray-100 text-gray-500'
              )}
            >
              {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
            </div>
            <span
              className={cn(
                'text-xs font-medium uppercase tracking-wide text-gray-400',
                isActive && 'text-gray-900'
              )}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
