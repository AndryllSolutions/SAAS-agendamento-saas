/**
 * Input component with built-in validation and masking
 */

import React, { forwardRef } from 'react';
import { UseValidatedInputReturn } from '../../hooks/useValidation';

export interface ValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label?: string;
  validation: UseValidatedInputReturn;
  helperText?: string;
  showErrorIcon?: boolean;
  showSuccessIcon?: boolean;
}

/**
 * Input com validação e máscara integradas
 */
export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  (
    {
      label,
      validation,
      helperText,
      showErrorIcon = true,
      showSuccessIcon = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const { value, error, isValid, isTouched, handleChange, handleBlur } = validation;

    const hasError = isTouched && error;
    const hasSuccess = isTouched && isValid && value && !error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm
              focus:outline-none focus:ring-2 transition-colors
              ${hasError
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : hasSuccess && showSuccessIcon
                ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }
              ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
              dark:bg-gray-800 dark:border-gray-600 dark:text-white
              ${className}
            `}
            {...props}
          />

          {/* Ícone de erro */}
          {hasError && showErrorIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}

          {/* Ícone de sucesso */}
          {hasSuccess && showSuccessIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="h-5 w-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Mensagem de erro */}
        {hasError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {/* Texto de ajuda */}
        {helperText && !hasError && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';

