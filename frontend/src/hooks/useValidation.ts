/**
 * Hook customizado para validação de formulários
 */

import { useState, useCallback, ChangeEvent } from 'react';
import { ValidationRule, validate } from '../utils/validators';
import { MaskType, applyMask } from '../utils/masks';

export interface UseValidatedInputOptions {
  initialValue?: string;
  rules?: ValidationRule[];
  mask?: MaskType;
  onChange?: (value: string) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseValidatedInputReturn {
  value: string;
  error: string | null;
  isValid: boolean;
  isTouched: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleBlur: () => void;
  setValue: (value: string) => void;
  validateField: () => boolean;
  reset: () => void;
  setError: (error: string | null) => void;
}

/**
 * Hook para input com validação e máscara
 */
export const useValidatedInput = ({
  initialValue = '',
  rules = [],
  mask,
  onChange,
  validateOnChange = false,
  validateOnBlur = true,
}: UseValidatedInputOptions = {}): UseValidatedInputReturn => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState(false);

  const validateField = useCallback((): boolean => {
    if (rules.length === 0) return true;
    
    const validationError = validate(value, rules);
    setError(validationError);
    return validationError === null;
  }, [value, rules]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let newValue = e.target.value;
    
    // Aplica máscara se especificada
    if (mask) {
      newValue = applyMask(newValue, mask);
    }
    
    setValue(newValue);
    
    // Valida durante digitação se habilitado
    if (validateOnChange && isTouched) {
      const validationError = validate(newValue, rules);
      setError(validationError);
    }
    
    // Callback externo
    onChange?.(newValue);
  }, [mask, validateOnChange, isTouched, rules, onChange]);

  const handleBlur = useCallback(() => {
    setIsTouched(true);
    
    if (validateOnBlur) {
      validateField();
    }
  }, [validateOnBlur, validateField]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setIsTouched(false);
  }, [initialValue]);

  return {
    value,
    error,
    isValid: error === null && isTouched,
    isTouched,
    handleChange,
    handleBlur,
    setValue,
    validateField,
    reset,
    setError,
  };
};

// ========== HOOK PARA FORMULÁRIO COMPLETO ==========

export interface FormField {
  value: string;
  error: string | null;
  isTouched: boolean;
  rules?: ValidationRule[];
  mask?: MaskType;
}

export interface UseFormOptions<T extends Record<string, FormField>> {
  initialValues: T;
  onSubmit?: (values: Record<keyof T, string>) => void | Promise<void>;
}

export interface UseFormReturn<T extends Record<string, FormField>> {
  fields: T;
  values: Record<keyof T, string>;
  errors: Record<keyof T, string | null>;
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (fieldName: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleBlur: (fieldName: keyof T) => () => void;
  setValue: (fieldName: keyof T, value: string) => void;
  setError: (fieldName: keyof T, error: string | null) => void;
  validateField: (fieldName: keyof T) => boolean;
  validateForm: () => boolean;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
}

/**
 * Hook para gerenciar formulário completo com validações
 */
export const useForm = <T extends Record<string, FormField>>({
  initialValues,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> => {
  const [fields, setFields] = useState<T>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((fieldName: keyof T) => {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let newValue = e.target.value;
      const field = fields[fieldName];
      
      // Aplica máscara se especificada
      if (field.mask) {
        newValue = applyMask(newValue, field.mask);
      }
      
      setFields(prev => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          value: newValue,
          // Valida durante digitação se o campo já foi tocado
          error: prev[fieldName].isTouched && field.rules 
            ? validate(newValue, field.rules) 
            : prev[fieldName].error,
        },
      }));
    };
  }, [fields]);

  const handleBlur = useCallback((fieldName: keyof T) => {
    return () => {
      setFields(prev => {
        const field = prev[fieldName];
        return {
          ...prev,
          [fieldName]: {
            ...field,
            isTouched: true,
            error: field.rules ? validate(field.value, field.rules) : null,
          },
        };
      });
    };
  }, []);

  const setValue = useCallback((fieldName: keyof T, value: string) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
      },
    }));
  }, []);

  const setError = useCallback((fieldName: keyof T, error: string | null) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        error,
      },
    }));
  }, []);

  const validateField = useCallback((fieldName: keyof T): boolean => {
    const field = fields[fieldName];
    if (!field.rules) return true;
    
    const error = validate(field.value, field.rules);
    setError(fieldName, error);
    return error === null;
  }, [fields, setError]);

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newFields = { ...fields };
    
    Object.keys(fields).forEach(key => {
      const fieldName = key as keyof T;
      const field = fields[fieldName];
      
      if (field.rules) {
        const error = validate(field.value, field.rules);
        newFields[fieldName] = {
          ...field,
          error,
          isTouched: true,
        };
        if (error) isValid = false;
      }
    });
    
    setFields(newFields);
    return isValid;
  }, [fields]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const values = Object.keys(fields).reduce((acc, key) => {
        acc[key as keyof T] = fields[key as keyof T].value;
        return acc;
      }, {} as Record<keyof T, string>);
      
      await onSubmit?.(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [fields, validateForm, onSubmit]);

  const reset = useCallback(() => {
    setFields(initialValues);
  }, [initialValues]);

  const values = Object.keys(fields).reduce((acc, key) => {
    acc[key as keyof T] = fields[key as keyof T].value;
    return acc;
  }, {} as Record<keyof T, string>);

  const errors = Object.keys(fields).reduce((acc, key) => {
    acc[key as keyof T] = fields[key as keyof T].error;
    return acc;
  }, {} as Record<keyof T, string | null>);

  const isValid = Object.values(fields).every(field => !field.error);

  return {
    fields,
    values,
    errors,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    setValue,
    setError,
    validateField,
    validateForm,
    handleSubmit,
    reset,
  };
};

// ========== HOOK PARA VALIDAÇÃO ASSÍNCRONA ==========

export interface UseAsyncValidationOptions {
  validator: (value: string) => Promise<boolean>;
  errorMessage: string;
  debounceMs?: number;
}

export interface UseAsyncValidationReturn {
  isValidating: boolean;
  error: string | null;
  validateAsync: (value: string) => Promise<boolean>;
}

/**
 * Hook para validação assíncrona (ex: verificar se email já existe)
 */
export const useAsyncValidation = ({
  validator,
  errorMessage,
  debounceMs = 500,
}: UseAsyncValidationOptions): UseAsyncValidationReturn => {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const validateAsync = useCallback(async (value: string): Promise<boolean> => {
    // Limpa timeout anterior
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise((resolve) => {
      const newTimeoutId = setTimeout(async () => {
        setIsValidating(true);
        
        try {
          const isValid = await validator(value);
          setError(isValid ? null : errorMessage);
          resolve(isValid);
        } catch (err) {
          setError(errorMessage);
          resolve(false);
        } finally {
          setIsValidating(false);
        }
      }, debounceMs);

      setTimeoutId(newTimeoutId);
    });
  }, [validator, errorMessage, debounceMs, timeoutId]);

  return {
    isValidating,
    error,
    validateAsync,
  };
};

