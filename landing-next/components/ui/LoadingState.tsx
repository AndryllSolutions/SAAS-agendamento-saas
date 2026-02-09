import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  fullScreen?: boolean
}

export default function LoadingState({ message = 'Carregando...', fullScreen = false }: LoadingStateProps) {
  const containerClass = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 z-50' 
    : 'flex items-center justify-center p-12'

  return (
    <div className={containerClass}>
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}

