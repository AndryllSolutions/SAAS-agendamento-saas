import { AlertCircle, RefreshCw } from 'lucide-react'
import Button from './Button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
}

export default function ErrorState({ 
  title = 'Erro ao carregar dados', 
  message = 'Ocorreu um erro ao carregar as informações. Tente novamente.',
  onRetry,
  retryLabel = 'Tentar novamente'
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          {retryLabel}
        </Button>
      )}
    </div>
  )
}

