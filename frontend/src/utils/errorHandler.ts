/**
 * Utility function to format API error messages
 * Handles Pydantic validation errors and generic errors
 */

interface PydanticValidationError {
  type: string
  loc: (string | number)[]
  msg: string
  input?: any
  ctx?: any
  url?: string
}

export function formatApiError(error: any): string {
  // Check if it's an axios error with response
  if (!error.response?.data?.detail) {
    return error.message || 'Erro desconhecido'
  }

  const detail = error.response.data.detail

  // Handle array of Pydantic validation errors
  if (Array.isArray(detail)) {
    const errors = detail.map((err: PydanticValidationError) => {
      const field = err.loc?.slice(1).join('.') || 'campo desconhecido'
      const message = err.msg || 'erro de validação'
      
      // Clean up field name (remove 'body.' prefix if exists)
      const cleanField = field.replace(/^body\./, '')
      
      return `${cleanField}: ${message}`
    }).join('; ')
    
    return `Erro de validação: ${errors}`
  }

  // Handle single Pydantic validation error object
  if (typeof detail === 'object' && detail.type && detail.loc && detail.msg) {
    const field = detail.loc?.slice(1).join('.') || 'campo desconhecido'
    const cleanField = field.replace(/^body\./, '')
    return `${cleanField}: ${detail.msg}`
  }

  // Handle string error message
  if (typeof detail === 'string') {
    return detail
  }

  // Fallback
  return 'Erro ao processar requisição'
}

/**
 * Utility function to show API error as toast
 * @param error - The error object from axios
 * @param fallbackMessage - Default message if error can't be parsed
 */
export function showApiError(error: any, fallbackMessage: string = 'Erro ao processar requisição'): string {
  try {
    return formatApiError(error)
  } catch (e) {
    console.error('Error formatting API error:', e)
    return fallbackMessage
  }
}

