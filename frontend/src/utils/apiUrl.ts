/**
 * API URL Utilities - Centralized URL management for production SaaS
 * 
 * REGRAS:
 * 1. SEMPRE remover trailing slashes da URL base
 * 2. SEMPRE usar HTTPS em produção (VPS)
 * 3. NUNCA permitir barras duplas (//api)
 * 4. Paths de endpoint NUNCA começam com /api - apenas o recurso
 */

/**
 * Normaliza URL removendo trailing slashes e garantindo protocolo correto
 */
const normalizeUrl = (url: string): string => {
  // Remove trailing slashes
  let normalized = url.replace(/\/+$/, '');
  
  // Force HTTPS for production VPS
  if (normalized.includes('72.62.138.239') && normalized.startsWith('http://')) {
    normalized = normalized.replace('http://', 'https://');
  }
  
  return normalized;
};

/**
 * Get API base URL (SEM /api/v1 - apenas o host)
 * Retorna: https://72.62.138.239 (produção) ou http://localhost:8000 (dev)
 */
export const getApiUrl = (): string => {
  // Server-side rendering
  if (typeof window === 'undefined') {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) {
      return normalizeUrl(envUrl);
    }
    return process.env.NODE_ENV === 'production' 
      ? 'https://72.62.138.239' 
      : 'http://localhost:8000';
  }

  // Client-side: detect from current page
  const hostname = window.location.hostname;

  // Localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }

  // Production VPS: Use domain name for proper CORS
  if (hostname === '72.62.138.239' || hostname === 'atendo.website') {
    return 'https://atendo.website';
  }

  // Check env var first (for production builds)
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return normalizeUrl(envUrl);
  }

  // Other production: Use atendo.website for proper CORS
  return 'https://atendo.website';
};

/**
 * Get full API v1 base URL (COM /api/v1)
 * Retorna: https://atendo.website/api/v1
 */
export const getApiBaseUrl = (): string => {
  return `${getApiUrl()}/api/v1`;
};

/**
 * Build full API endpoint URL
 * @param path - Caminho do recurso SEM /api/v1 (ex: 'auth/login', 'users/me')
 */
export const getApiEndpoint = (path: string): string => {
  const baseUrl = getApiUrl();
  // Remove leading slashes and /api/v1 prefix if accidentally included
  let cleanPath = path
    .replace(/^\/+/, '')           // Remove leading slashes
    .replace(/^api\/v1\/?/, '');   // Remove /api/v1 prefix if present
  
  const fullUrl = `${baseUrl}/api/v1/${cleanPath}`;
  
  // Validate URL in development
  if (process.env.NODE_ENV === 'development') {
    if (fullUrl.includes('//api') || fullUrl.includes('///')) {
      console.error('[API URL] Malformed URL detected:', fullUrl);
    }
    if (fullUrl.includes('http://72.62.138.239')) {
      console.error('[API URL] HTTP detected for production - should be HTTPS:', fullUrl);
    }
  }
  
  return fullUrl;
};

export const toAbsoluteImageUrl = (url?: string | null): string | null => {
  if (!url) return null

  const trimmed = String(url).trim()
  if (!trimmed) return null

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed
  }

  const base = getApiUrl()
  if (trimmed.startsWith('/')) return `${base}${trimmed}`
  return `${base}/${trimmed}`
}
