import { cn } from '../../utils';
import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'block w-full px-3 py-2 border rounded-md shadow-sm',
            'focus:outline-none focus:ring-indigo-500 focus:border-indigo-500',
            'sm:text-sm',
            {
              'border-gray-300': !error,
              'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500': error,
            },
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600" id={`${props.id}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
