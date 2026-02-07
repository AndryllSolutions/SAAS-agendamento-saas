import { Platform } from 'react-native';

/**
 * API Configuration
 * Centralized configuration for all backend endpoints
 * Based on real backend structure from /app/api/v1/
 */

// Para mobile físico, use o IP da máquina de desenvolvimento
// Exemplo: 'http://192.168.1.100:8000/api/v1'
// Para web/emulador, use localhost
const DEV_MACHINE_IP = '192.168.1.100'; // <-- ALTERE PARA O IP DO SEU PC

const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:8000/api/v1'
  : `http://${DEV_MACHINE_IP}:8000/api/v1`;

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  
  // ============ AUTHENTICATION ============
  AUTH: {
    MOBILE_LOGIN: '/auth/mobile/login',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // ============ USERS ============
  USERS: {
    LIST: '/users',
    GET: (id) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
  },

  // ============ COMPANIES ============
  COMPANIES: {
    LIST: '/companies',
    GET: (id) => `/companies/${id}`,
    CREATE: '/companies',
    UPDATE: (id) => `/companies/${id}`,
    DELETE: (id) => `/companies/${id}`,
    SETTINGS: '/settings',
  },

  // ============ APPOINTMENTS ============
  APPOINTMENTS: {
    LIST: '/appointments',
    GET: (id) => `/appointments/${id}`,
    CREATE: '/appointments',
    UPDATE: (id) => `/appointments/${id}`,
    DELETE: (id) => `/appointments/${id}`,
    CANCEL: (id) => `/appointments/${id}/cancel`,
    CHECK_IN: (id) => `/appointments/${id}/check-in`,
    MOVE: (id) => `/appointments/${id}/move`,
    CALENDAR: '/calendar',
    AVAILABILITY: '/appointments/availability',
    PUBLIC_CREATE: '/appointments/public',
  },

  // ============ SERVICES ============
  SERVICES: {
    LIST: '/services',
    GET: (id) => `/services/${id}`,
    CREATE: '/services',
    UPDATE: (id) => `/services/${id}`,
    DELETE: (id) => `/services/${id}`,
    STANDALONE: '/standalone-services',
  },

  // ============ PROFESSIONALS ============
  PROFESSIONALS: {
    LIST: '/professionals',
    GET: (id) => `/professionals/${id}`,
    CREATE: '/professionals',
    UPDATE: (id) => `/professionals/${id}`,
    DELETE: (id) => `/professionals/${id}`,
    SCHEDULE: (id) => `/professionals/${id}/schedule`,
    AVAILABILITY: (id) => `/professionals/${id}/availability`,
    SCHEDULE_OVERRIDES: '/schedule-overrides',
    VOUCHERS: '/vouchers',
  },

  // ============ CLIENTS ============
  CLIENTS: {
    LIST: '/clients',
    GET: (id) => `/clients/${id}`,
    CREATE: '/clients',
    UPDATE: (id) => `/clients/${id}`,
    DELETE: (id) => `/clients/${id}`,
    NOTES: '/clients/notes',
    HISTORY: (id) => `/clients/${id}/history`,
    ANAMNESES: '/anamneses',
  },

  // ============ COMMANDS ============
  COMMANDS: {
    LIST: '/commands',
    GET: (id) => `/commands/${id}`,
    CREATE: '/commands',
    UPDATE: (id) => `/commands/${id}`,
    DELETE: (id) => `/commands/${id}`,
    CLOSE: (id) => `/commands/${id}/close`,
    ITEMS: (id) => `/commands/${id}/items`,
  },

  // ============ PACKAGES ============
  PACKAGES: {
    LIST: '/packages',
    GET: (id) => `/packages/${id}`,
    CREATE: '/packages',
    UPDATE: (id) => `/packages/${id}`,
    DELETE: (id) => `/packages/${id}`,
  },

  // ============ PRODUCTS ============
  PRODUCTS: {
    LIST: '/products',
    GET: (id) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
  },

  // ============ PURCHASES ============
  PURCHASES: {
    LIST: '/purchases',
    GET: (id) => `/purchases/${id}`,
    CREATE: '/purchases',
    UPDATE: (id) => `/purchases/${id}`,
    DELETE: (id) => `/purchases/${id}`,
  },

  // ============ SUPPLIERS ============
  SUPPLIERS: {
    LIST: '/suppliers',
    GET: (id) => `/suppliers/${id}`,
    CREATE: '/suppliers',
    UPDATE: (id) => `/suppliers/${id}`,
    DELETE: (id) => `/suppliers/${id}`,
  },

  // ============ FINANCIAL ============
  FINANCIAL: {
    DASHBOARD: '/financial/dashboard',
    TRANSACTIONS: '/financial/transactions',
    SUMMARY: '/financial/summary',
    DRE: '/financial/dre',
    CASH_FLOW: '/financial/cash-flow',
  },

  // ============ PAYMENTS ============
  PAYMENTS: {
    LIST: '/payments',
    GET: (id) => `/payments/${id}`,
    CREATE: '/payments',
    UPDATE: (id) => `/payments/${id}`,
    DELETE: (id) => `/payments/${id}`,
    PROCESS: (id) => `/payments/${id}/process`,
    REFUND: (id) => `/payments/${id}/refund`,
  },

  // ============ COMMISSIONS ============
  COMMISSIONS: {
    LIST: '/commissions',
    GET: (id) => `/commissions/${id}`,
    CALCULATE: '/commissions/calculate',
    PROFESSIONAL: (id) => `/commissions/professional/${id}`,
  },

  // ============ GOALS ============
  GOALS: {
    LIST: '/goals',
    GET: (id) => `/goals/${id}`,
    CREATE: '/goals',
    UPDATE: (id) => `/goals/${id}`,
    DELETE: (id) => `/goals/${id}`,
    PROGRESS: (id) => `/goals/${id}/progress`,
  },

  // ============ CASHBACK ============
  CASHBACK: {
    BALANCE: '/cashback/balance',
    TRANSACTIONS: '/cashback/transactions',
    REDEEM: '/cashback/redeem',
    HISTORY: '/cashback/history',
  },

  // ============ PROMOTIONS ============
  PROMOTIONS: {
    LIST: '/promotions',
    GET: (id) => `/promotions/${id}`,
    CREATE: '/promotions',
    UPDATE: (id) => `/promotions/${id}`,
    DELETE: (id) => `/promotions/${id}`,
  },

  // ============ EVALUATIONS ============
  EVALUATIONS: {
    LIST: '/evaluations',
    GET: (id) => `/evaluations/${id}`,
    CREATE: '/evaluations',
    UPDATE: (id) => `/evaluations/${id}`,
    DELETE: (id) => `/evaluations/${id}`,
    RESPOND: (id) => `/evaluations/${id}/respond`,
  },

  // ============ INVOICES ============
  INVOICES: {
    LIST: '/invoices',
    GET: (id) => `/invoices/${id}`,
    CREATE: '/invoices',
    UPDATE: (id) => `/invoices/${id}`,
    DELETE: (id) => `/invoices/${id}`,
    DOWNLOAD: (id) => `/invoices/${id}/download`,
  },

  // ============ REPORTS ============
  REPORTS: {
    DASHBOARD: '/reports/dashboard',
    DRE: '/reports/dre',
    REVENUE: '/reports/revenue',
    EXPENSES: '/reports/expenses',
    CLIENTS: '/reports/clients',
    SERVICES: '/reports/services',
    PROFESSIONALS: '/reports/professionals',
    CUSTOM: '/reports/custom',
  },

  // ============ WHATSAPP ============
  WHATSAPP: {
    CAMPAIGNS: '/whatsapp',
    CREATE_CAMPAIGN: '/whatsapp',
    SEND_MESSAGE: '/whatsapp/send',
    STATS: '/whatsapp/stats',
    CRM_MESSAGES: '/whatsapp/crm/messages',
    AUTOMATED_CAMPAIGNS: '/whatsapp-campaigns',
  },

  // ============ SUBSCRIPTION SALES ============
  SUBSCRIPTION_SALES: {
    LIST: '/subscription-sales',
    GET: (id) => `/subscription-sales/${id}`,
    CREATE: '/subscription-sales',
    UPDATE: (id) => `/subscription-sales/${id}`,
    DELETE: (id) => `/subscription-sales/${id}`,
    CANCEL: (id) => `/subscription-sales/${id}/cancel`,
  },

  // ============ DOCUMENTS ============
  DOCUMENTS: {
    GENERATE: '/documents/generate',
    LIST: '/documents',
    GET: (id) => `/documents/${id}`,
    DELETE: (id) => `/documents/${id}`,
  },

  // ============ UPLOADS ============
  UPLOADS: {
    UPLOAD: '/uploads',
    DELETE: (id) => `/uploads/${id}`,
  },

  // ============ NOTIFICATIONS ============
  NOTIFICATIONS: {
    LIST: '/notifications',
    GET: (id) => `/notifications/${id}`,
    MARK_READ: (id) => `/notifications/${id}/read`,
    DELETE: (id) => `/notifications/${id}`,
    PUSH: '/push',
  },

  // ============ DASHBOARD ============
  DASHBOARD: {
    OVERVIEW: '/dashboard',
    SUMMARY: '/dashboard/summary',
    METRICS: '/dashboard/metrics',
    APPOINTMENTS_TODAY: '/dashboard/appointments-today',
    REVENUE_TODAY: '/dashboard/revenue-today',
  },

  // ============ ONLINE BOOKING ============
  ONLINE_BOOKING: {
    CONFIG: '/online-booking',
    GET_CONFIG: '/online-booking',
    UPDATE_CONFIG: '/online-booking',
    PUBLIC_SERVICES: '/online-booking/services',
    PUBLIC_AVAILABILITY: '/online-booking/availability',
  },

  // ============ GOOGLE CALENDAR ============
  GOOGLE_CALENDAR: {
    CONNECT: '/google-calendar/connect',
    DISCONNECT: '/google-calendar/disconnect',
    SYNC: '/google-calendar/sync',
    EVENTS: '/google-calendar/events',
  },

  // ============ CALENDLY ============
  CALENDLY: {
    CONNECT: '/calendly/connect',
    DISCONNECT: '/calendly/disconnect',
    SYNC: '/calendly/sync',
  },

  // ============ REVIEWS ============
  REVIEWS: {
    LIST: '/reviews',
    GET: (id) => `/reviews/${id}`,
    CREATE: '/reviews',
    UPDATE: (id) => `/reviews/${id}`,
    DELETE: (id) => `/reviews/${id}`,
  },

  // ============ LEADS ============
  LEADS: {
    LIST: '/leads',
    GET: (id) => `/leads/${id}`,
    CREATE: '/leads',
    UPDATE: (id) => `/leads/${id}`,
    DELETE: (id) => `/leads/${id}`,
    CONVERT: (id) => `/leads/${id}/convert`,
  },

  // ============ API KEYS ============
  API_KEYS: {
    LIST: '/api-keys',
    CREATE: '/api-keys',
    DELETE: (id) => `/api-keys/${id}`,
    REGENERATE: (id) => `/api-keys/${id}/regenerate`,
  },

  // ============ ADDONS ============
  ADDONS: {
    LIST: '/addons',
    GET: (id) => `/addons/${id}`,
    INSTALL: (id) => `/addons/${id}/install`,
    UNINSTALL: (id) => `/addons/${id}/uninstall`,
  },

  // ============ PLANS ============
  PLANS: {
    LIST: '/plans',
    GET: (id) => `/plans/${id}`,
  },
};

// ============ HTTP HEADERS ============
export const getHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// ============ API RESPONSE TYPES ============
export const API_RESPONSE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  VALIDATION_ERROR: 'validation_error',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  SERVER_ERROR: 'server_error',
};

// ============ PAGINATION ============
export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 1000,
};

// ============ APPOINTMENT STATUS ============
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

// ============ USER ROLES ============
export const USER_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  PROFESSIONAL: 'professional',
  RECEPTIONIST: 'receptionist',
  FINANCE: 'finance',
  CLIENT: 'client',
};

// ============ PAYMENT STATUS ============
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
};

export default API_CONFIG;
