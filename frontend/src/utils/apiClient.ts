/**
 * API Client - Centralized HTTP client with automatic HTTPS enforcement
 */
import { getApiUrl } from './apiUrl';

/**
 * Make authenticated API call with automatic HTTPS enforcement
 */
export const makeApiCall = async (endpoint: string, options: RequestInit = {}) => {
  const apiUrl = getApiUrl();
  const token = localStorage.getItem('access_token');
  
  const url = `${apiUrl}/api/v1/${endpoint.replace(/^\/+/, '')}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };
  
  return fetch(url, config);
};

/**
 * GET request helper
 */
export const apiGet = (endpoint: string, options?: RequestInit) => 
  makeApiCall(endpoint, { ...options, method: 'GET' });

/**
 * POST request helper
 */
export const apiPost = (endpoint: string, data?: any, options?: RequestInit) =>
  makeApiCall(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });

/**
 * PUT request helper
 */
export const apiPut = (endpoint: string, data?: any, options?: RequestInit) =>
  makeApiCall(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });

/**
 * DELETE request helper
 */
export const apiDelete = (endpoint: string, options?: RequestInit) =>
  makeApiCall(endpoint, { ...options, method: 'DELETE' });
