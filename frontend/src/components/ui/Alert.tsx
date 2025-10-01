import { X } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '../../utils';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  message: string;
  variant?: AlertVariant;
  className?: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
}

export const Alert = ({
  message,
  variant = 'info',
  className,
  onClose,
  autoClose = true,
  autoCloseDuration = 5000,
}: AlertProps) => {
  const variantClasses = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDuration, onClose]);

  return (
    <div
      className={cn(
        'relative flex items-center justify-between p-4 mb-4 border rounded-md',
        variantClasses[variant],
        className
      )}
      role="alert"
    >
      <div className="flex-1">{message}</div>
      {onClose && (
        <button
          type="button"
          className="p-1 -mr-1 rounded-md hover:bg-opacity-20 hover:bg-current focus:outline-none focus:ring-2 focus:ring-offset-2"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
