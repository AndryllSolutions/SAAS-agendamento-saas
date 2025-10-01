import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina classes do Tailwind CSS de forma segura
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma data para o formato brasileiro
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

/**
 * Formata um valor monetário para o formato brasileiro
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Verifica se o usuário tem permissão baseada nas roles
 */
export function hasPermission(
  userRole: string, 
  allowedRoles: string[]
): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Verifica se um token JWT está expirado
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.exp * 1000 < Date.now();
  } catch (e) {
    return true;
  }
}

/**
 * Extrai o payload de um token JWT
 */
export function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}
