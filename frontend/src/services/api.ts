/**
 * API Service - Axios configuration and API calls
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import { getApiUrl } from '@/utils/apiUrl';

const API_URL = getApiUrl();

// Remove trailing slash to avoid double slash
const cleanApiUrl = API_URL.replace(/\/+$/, '');

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${cleanApiUrl}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  timeout: 30000, // 30 segundos timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // CRITICAL: Cancelar requisição anterior do mesmo tipo
    const requestKey = getRequestKey(config.url, config.method);
    const existingController = pendingRequests.get(requestKey);
    
    if (existingController) {
      console.warn('⚠️ Cancelando requisição duplicada:', requestKey);
      existingController.abort();
      pendingRequests.delete(requestKey);
    }
    
    // Criar novo AbortController para esta requisição
    const controller = new AbortController();
    config.signal = controller.signal;
    pendingRequests.set(requestKey, controller);
    
    // Skip auth for public endpoints
    if (config.url?.includes('/public')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🌐 Public endpoint - skipping auth:', config.method?.toUpperCase(), config.url);
      }
      return config;
    }
    
    // Tentar pegar token do localStorage primeiro (compatibilidade)
    let token = localStorage.getItem('access_token');
    
    // Se não tiver, tentar pegar do authStore (Zustand)
    if (!token && typeof window !== 'undefined') {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const authData = JSON.parse(authStorage);
          token = authData?.state?.accessToken || null;
        }
      } catch (e) {
        // Ignorar erro de parse
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (process.env.NODE_ENV === 'development') {
        console.log('🔑 Token adicionado à requisição:', config.method?.toUpperCase(), config.url);
      }
    } else {
      console.warn('⚠️ Nenhum token encontrado para requisição:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// CRITICAL: AbortController para cancelamento de requisições
const pendingRequests = new Map<string, AbortController>();

// Helper para gerar chave única de requisição
const getRequestKey = (url?: string, method?: string): string => {
  return `${method || 'GET'}:${url || 'unknown'}`;
};

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Limpar requisição pendente após sucesso
    const key = getRequestKey(response.config.url, response.config.method);
    pendingRequests.delete(key);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Success:', response.config.method?.toUpperCase(), response.config.url, response.status);
    }
    return response;
  },
  async (error: AxiosError) => {
    // Limpar requisição pendente após erro
    const key = getRequestKey(error.config?.url, error.config?.method);
    pendingRequests.delete(key);
    
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    // CRITICAL: NUNCA fazer retry automático para 429 ou 404
    if (error.response?.status === 429) {
      console.error('🚫 Rate limit (429) - BLOQUEADO. Não será feito retry automático.');
      error.message = 'Muitas requisições. Aguarde antes de tentar novamente.';
      return Promise.reject(error);
    }
    
    if (error.response?.status === 404) {
      console.error('🚫 Endpoint não encontrado (404) - BLOQUEADO. Não será feito retry.');
      error.message = 'Recurso não encontrado.';
      return Promise.reject(error);
    }

    // ✅ TRATAMENTO DE LIMITE DE PLANO (402 Payment Required)
    if (error.response?.status === 402) {
      const errorData = error.response.data as { 
        detail?: string; 
        message?: string;
        feature?: string;
        required_plan?: string;
      } | undefined;
      
      const errorMessage = errorData?.detail || errorData?.message || 'Limite do plano atingido';
      const feature = errorData?.feature;
      const requiredPlan = errorData?.required_plan;
      
      console.warn('💳 Feature bloqueada (HTTP 402):', {
        message: errorMessage,
        feature,
        requiredPlan,
        url: error.config?.url
      });
      
      // Disparar evento global para modal de upgrade
      if (typeof window !== 'undefined') {
        const upgradeEvent = new CustomEvent('plan-limit-reached', {
          detail: {
            message: errorMessage,
            feature: feature,
            requiredPlan: requiredPlan,
            url: error.config?.url
          }
        });
        window.dispatchEvent(upgradeEvent);
      }
      
      // Não fazer redirect, deixar o GlobalFeatureBlockedHandler tratar
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      // GUARD: Evitar processamento em rotas públicas
      if (typeof window !== 'undefined') {
        const publicRoutes = ['/login', '/register', '/book', '/scheduling'];
        const currentPath = window.location.pathname;
        
        // Se já está em rota pública, não processar 401
        if (publicRoutes.some(route => currentPath === route || currentPath.startsWith(route + '/'))) {
          console.log('[API] 401 em rota pública - ignorando');
          return Promise.reject(error);
        }
      }
      
      // Try to refresh token (apenas uma vez por request)
      const refreshToken = localStorage.getItem('refresh_token');
      
      // GUARD: Não tentar refresh se já tentamos neste request
      const isRetry = error.config?.headers?.['X-Retry-After-Refresh'];
      if (isRetry) {
        console.log('[API] Refresh já tentado - fazendo logout');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return Promise.reject(error);
      }
      
      if (refreshToken) {
        try {
          console.log('[API] Tentando refresh token...');
          // ENDPOINT CORRETO: /auth/refresh (não /auth/refresh-token)
          const response = await axios.post(`${cleanApiUrl}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const { access_token, refresh_token: new_refresh_token } = response.data;
          localStorage.setItem('access_token', access_token);
          if (new_refresh_token) {
            localStorage.setItem('refresh_token', new_refresh_token);
          }
          
          console.log('[API] Token refreshed, retrying request...');
          
          // Retry original request COM marcador para evitar loop
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${access_token}`;
            error.config.headers['X-Retry-After-Refresh'] = 'true';
            return axios(error.config);
          }
        } catch (refreshError) {
          console.warn('[API] Refresh token failed - limpando sessão');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          // Deixar AuthProvider gerenciar redirect
        }
      } else {
        console.log('[API] Sem refresh token - limpando sessão');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    
    // Melhorar mensagem de erro
    if (error.response) {
      // Erro do servidor
      const respData = error.response.data as { detail?: string; message?: string } | undefined;
      const errorMessage = respData?.detail || respData?.message || error.response.statusText;
      error.message = errorMessage || `Erro ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      // Erro de rede (sem resposta)
      error.message = 'Erro de conexão. Verifique sua internet ou se o servidor está rodando.';
      console.error('❌ Network Error:', error.request);
    } else {
      // Erro ao configurar requisição
      error.message = error.message || 'Erro desconhecido ao fazer requisição';
    }
    
    return Promise.reject(error);
  }
);

// ========== UPLOAD SERVICE ==========
export const uploadService = {
  uploadImage: (file: File, folder: string = 'images', prefix: string = '') => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/uploads/images?folder=${folder}&prefix=${prefix}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  uploadDocument: (file: File, folder: string = 'documents', prefix: string = '') => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/uploads/documents?folder=${folder}&prefix=${prefix}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  uploadServiceImage: (serviceId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/uploads/services/${serviceId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  uploadProductImage: (productId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/uploads/products/${productId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  uploadProfessionalAvatar: (professionalId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/uploads/professionals/${professionalId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  uploadClientAvatar: (clientId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/uploads/clients/${clientId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  deleteFile: (filename: string, folder: string = 'uploads') =>
    api.delete(`/uploads/${filename}?folder=${folder}`),
};

export default api;

// ========== AUTH SERVICE ==========
// Detectar se é mobile
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const authService = {
  login: async (email: string, password: string) => {
    // Em mobile, usar endpoint mobile otimizado
    if (isMobile()) {
      try {
        console.log('🔵 Mobile detected - Using mobile login endpoint');
        const response = await api.post('/auth/mobile/login', {
          email,
          password
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        console.log('✅ Mobile login successful');
        return response;
      } catch (error: any) {
        console.error('❌ Mobile login failed:', error.response?.data || error.message);
        // Se falhar, tentar endpoint padrão como fallback
        console.warn('🔄 Trying standard endpoint as fallback...');
      }
    }
    
    // Endpoint padrão (form-urlencoded) para desktop
    console.log('🖥️ Desktop detected - Using standard login endpoint');
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    return api.post('/auth/login', formData.toString(), {
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  
  register: (data: any) => api.post('/auth/register', data),
  
  getCurrentUser: () => api.get('/users/me'),
  
  refreshToken: (refreshToken: string) => 
    api.post('/auth/refresh', { refresh_token: refreshToken }),
  
  changePassword: (data: any) => api.post('/auth/change-password', data),
};

// ========== CLIENTS SERVICE ==========
export const clientService = {
  list: (params?: any) => api.get('/clients', { params }),
  get: (id: number) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: number, data: any) => api.put(`/clients/${id}`, data),
  delete: (id: number) => api.delete(`/clients/${id}`),
  getHistory: (id: number) => api.get(`/clients/${id}/history`),
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/clients/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  export: () => api.get('/clients/export', { responseType: 'blob' }),
};

// ========== PRODUCTS SERVICE ==========
export const productService = {
  list: (params?: any) => api.get('/products', { params }),
  get: (id: number) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  adjustStock: (id: number, data: any) => api.post(`/products/${id}/adjust-stock`, data),
  
  // Brands
  listBrands: () => api.get('/products/brands'),
  createBrand: (data: any) => api.post('/products/brands', data),
  updateBrand: (id: number, data: any) => api.put(`/products/brands/${id}`, data),
  deleteBrand: (id: number) => api.delete(`/products/brands/${id}`),
  
  // Categories
  listCategories: () => api.get('/products/categories'),
  createCategory: (data: any) => api.post('/products/categories', data),
  updateCategory: (id: number, data: any) => api.put(`/products/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/products/categories/${id}`),
};

// ========== COMMANDS SERVICE ==========
export const commandService = {
  list: (params?: any) => api.get('/commands', { params }),
  get: (id: number) => api.get(`/commands/${id}`),
  create: (data: any) => api.post('/commands', data),
  update: (id: number, data: any) => api.put(`/commands/${id}`, data),
  delete: (id: number) => api.delete(`/commands/${id}`),
  addItem: (id: number, data: any) => api.post(`/commands/${id}/add-item`, data),
  removeItem: (commandId: number, itemId: number) => api.delete(`/commands/${commandId}/items/${itemId}`), // Backend usa commandId/items/itemId
  finish: (id: number) => api.post(`/commands/${id}/finish`), // Backend não requer body
  print: (id: number) => api.get(`/commands/${id}/print`), // Endpoint de impressão
  applyDiscount: (id: number, data: any) => api.post(`/commands/${id}/apply-discount`, data),
  applyCashback: (id: number, data: any) => api.post(`/commands/${id}/apply-cashback`, data),
};

// ========== PACKAGES SERVICE ==========
export const packageService = {
  // Predefined Packages
  listPredefined: (params?: any) => api.get('/packages/predefined', { params }),
  getPredefined: (id: number) => api.get(`/packages/predefined/${id}`),
  createPredefined: (data: any) => api.post('/packages/predefined', data),
  updatePredefined: (id: number, data: any) => api.put(`/packages/predefined/${id}`, data),
  deletePredefined: (id: number) => api.delete(`/packages/predefined/${id}`),
  
  // Client Packages
  list: (params?: any) => api.get('/packages', { params }),
  get: (id: number) => api.get(`/packages/${id}`),
  create: (data: any) => api.post('/packages', data),
  update: (id: number, data: any) => api.put(`/packages/${id}`, data),
  useSession: (id: number, data: any) => api.post(`/packages/${id}/use-session`, data),
};

// ========== FINANCIAL SERVICE ==========
export const financialService = {
  // Accounts
  listAccounts: () => api.get('/financial/accounts'),
  createAccount: (data: any) => api.post('/financial/accounts', data),
  updateAccount: (id: number, data: any) => api.put(`/financial/accounts/${id}`, data),
  deleteAccount: (id: number) => api.delete(`/financial/accounts/${id}`),
  
  // Payment Forms
  listPaymentForms: () => api.get('/financial/payment-forms'),
  createPaymentForm: (data: any) => api.post('/financial/payment-forms', data),
  updatePaymentForm: (id: number, data: any) => api.put(`/financial/payment-forms/${id}`, data),
  deletePaymentForm: (id: number) => api.delete(`/financial/payment-forms/${id}`),
  
  // Categories
  listCategories: () => api.get('/financial/categories'),
  createCategory: (data: any) => api.post('/financial/categories', data),
  updateCategory: (id: number, data: any) => api.put(`/financial/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/financial/categories/${id}`),
  
  // Transactions
  listTransactions: (params?: any) => api.get('/financial/transactions', { params }),
  getTransaction: (id: number) => api.get(`/financial/transactions/${id}`),
  createTransaction: (data: any) => api.post('/financial/transactions', data),
  updateTransaction: (id: number, data: any) => api.put(`/financial/transactions/${id}`, data),
  deleteTransaction: (id: number) => api.delete(`/financial/transactions/${id}`),
  getTransactionsTotals: (params?: any) => api.get('/financial/transactions/totals', { params }),
  toggleTransactionPaid: (id: number) => api.put(`/financial/transactions/${id}/toggle-paid`),
  
  // Cash Registers
  listCashRegisters: (params?: any) => api.get('/financial/cash-registers', { params }),
  openCashRegister: (data: any) => api.post('/financial/cash-registers/open', data),
  closeCashRegister: (id: number, data: any) => api.post(`/financial/cash-registers/${id}/close`, data),
  getCashRegisterConference: (id: number) => api.get(`/financial/cash-registers/${id}/conference`),
  
  // Dashboard
  getDashboard: (params?: any) => api.get('/financial/dashboard', { params }),
};

// ========== SUPPLIERS SERVICE (CADASTROS) ==========
export const supplierService = {
  list: (params?: any) => api.get('/suppliers', { params }),
  get: (id: number) => api.get(`/suppliers/${id}`),
  create: (data: any) => api.post('/suppliers', data),
  update: (id: number, data: any) => api.put(`/suppliers/${id}`, data),
  delete: (id: number) => api.delete(`/suppliers/${id}`),
};

// ========== PURCHASES SERVICE ==========
export const purchaseService = {
  // Suppliers (legacy - use supplierService instead)
  listSuppliers: () => api.get('/purchases/suppliers'),
  getSupplier: (id: number) => api.get(`/purchases/suppliers/${id}`),
  createSupplier: (data: any) => api.post('/purchases/suppliers', data),
  updateSupplier: (id: number, data: any) => api.put(`/purchases/suppliers/${id}`, data),
  deleteSupplier: (id: number) => api.delete(`/purchases/suppliers/${id}`),
  
  // Purchases
  list: (params?: any) => api.get('/purchases', { params }),
  get: (id: number) => api.get(`/purchases/${id}`),
  create: (data: any) => api.post('/purchases', data),
  update: (id: number, data: any) => api.put(`/purchases/${id}`, data),
  delete: (id: number) => api.delete(`/purchases/${id}`),
  finish: (id: number) => api.post(`/purchases/${id}/finish`),
};

// ========== ANAMNESES SERVICE ==========
export const anamnesisService = {
  // Models
  listModels: () => api.get('/anamneses/models'),
  getModel: (id: number) => api.get(`/anamneses/models/${id}`),
  createModel: (data: any) => api.post('/anamneses/models', data),
  updateModel: (id: number, data: any) => api.put(`/anamneses/models/${id}`, data),
  deleteModel: (id: number) => api.delete(`/anamneses/models/${id}`),
  
  // Anamneses
  list: (params?: any) => api.get('/anamneses', { params }),
  get: (id: number) => api.get(`/anamneses/${id}`),
  create: (data: any) => api.post('/anamneses', data),
  update: (id: number, data: any) => api.put(`/anamneses/${id}`, data),
  delete: (id: number) => api.delete(`/anamneses/${id}`),
  sign: (id: number, data: any) => api.post(`/anamneses/${id}/sign`, data),
};

// ========== COMMISSIONS SERVICE ==========
export const commissionService = {
  list: (params?: any) => api.get('/commissions', { params }),
  getSummary: (professionalId?: number) => 
    api.get('/commissions/summary', { params: { professional_id: professionalId } }),
  pay: (id: number, data: any) => api.post(`/commissions/${id}/pay`, data),
  getConfig: () => api.get('/commissions/config'),
  updateConfig: (data: any) => api.put('/commissions/config', data),
};

// ========== GOALS SERVICE ==========
export const goalService = {
  list: (params?: any) => api.get('/goals', { params }),
  get: (id: number) => api.get(`/goals/${id}`),
  create: (data: any) => api.post('/goals', data),
  update: (id: number, data: any) => api.put(`/goals/${id}`, data),
  delete: (id: number) => api.delete(`/goals/${id}`),
};

// ========== CASHBACK SERVICE ==========
export const cashbackService = {
  listRules: () => api.get('/cashback/rules'),
  createRule: (data: any) => api.post('/cashback/rules', data), // ✅ CORRIGIDO: POST ao invés de GET
  updateRule: (id: number, data: any) => api.put(`/cashback/rules/${id}`, data),
  deleteRule: (id: number) => api.delete(`/cashback/rules/${id}`),
  getBalance: (clientId: number) => api.get(`/cashback/balances/${clientId}`),
  listTransactions: (params?: any) => api.get('/cashback/transactions', { params }),
};

// ========== PROMOTIONS SERVICE ==========
export const promotionService = {
  list: (params?: any) => api.get('/promotions', { params }),
  get: (id: number) => api.get(`/promotions/${id}`),
  create: (data: any) => api.post('/promotions', data),
  update: (id: number, data: any) => api.put(`/promotions/${id}`, data),
  delete: (id: number) => api.delete(`/promotions/${id}`),
  apply: (id: number, commandId: number) => 
    api.post(`/promotions/${id}/apply`, { command_id: commandId }),
};

// ========== EVALUATIONS SERVICE ==========
export const evaluationService = {
  list: (params?: any) => api.get('/evaluations', { params }),
  get: (id: number) => api.get(`/evaluations/${id}`),
  create: (data: any) => api.post('/evaluations', data),
  update: (id: number, data: any) => api.put(`/evaluations/${id}`, data),
  delete: (id: number) => api.delete(`/evaluations/${id}`),
  getStats: () => api.get('/evaluations/stats'),
  respond: (id: number, data: any) => api.post(`/evaluations/${id}/respond`, data),
};

// ========== WHATSAPP SERVICE ==========
export const whatsappService = {
  // Providers
  getProvider: () => api.get('/whatsapp/providers'),
  createProvider: (data: any) => api.post('/whatsapp/providers', data),
  updateProvider: (id: number, data: any) => api.put(`/whatsapp/providers/${id}`, data),
  testConnection: (id: number) => api.post(`/whatsapp/providers/${id}/test`),
  
  // Templates
  listTemplates: () => api.get('/whatsapp/templates'),
  createTemplate: (data: any) => api.post('/whatsapp/templates', data),
  updateTemplate: (id: number, data: any) => api.put(`/whatsapp/templates/${id}`, data),
  deleteTemplate: (id: number) => api.delete(`/whatsapp/templates/${id}`),
  
  // Campaigns
  listCampaigns: (params?: any) => api.get('/whatsapp/campaigns', { params }),
  getCampaign: (id: number) => api.get(`/whatsapp/campaigns/${id}`),
  createCampaign: (data: any) => api.post('/whatsapp/campaigns', data),
  updateCampaign: (id: number, data: any) => api.put(`/whatsapp/campaigns/${id}`, data),
  deleteCampaign: (id: number) => api.delete(`/whatsapp/campaigns/${id}`),
  sendCampaign: (id: number) => api.post(`/whatsapp/campaigns/${id}/send`),
  getCampaignLogs: (id: number, params?: any) => 
    api.get(`/whatsapp/campaigns/${id}/logs`, { params }),
};

// ========== INVOICES SERVICE ==========
export const invoiceService = {
  list: (params?: any) => api.get('/invoices', { params }),
  get: (id: number) => api.get(`/invoices/${id}`),
  generate: (data: any) => api.post('/invoices/generate', data),
  cancel: (id: number) => api.post(`/invoices/${id}/cancel`),
  getFiscalConfig: () => api.get('/invoices/fiscal/config'),
  updateFiscalConfig: (data: any) => api.put('/invoices/fiscal/config', data),
};

// ========== SUBSCRIPTION SALES SERVICE ==========
// REMOVIDO: Endpoints /subscription-sales não existem no backend
// TODO: Implementar no backend antes de usar no frontend

// ========== DOCUMENTS SERVICE ==========
export const documentService = {
  listTemplates: () => api.get('/documents/templates'),
  getTemplate: (id: number) => api.get(`/documents/templates/${id}`),
  createTemplate: (data: any) => api.post('/documents/templates', data),
  updateTemplate: (id: number, data: any) => api.put(`/documents/templates/${id}`, data),
  deleteTemplate: (id: number) => api.delete(`/documents/templates/${id}`),
  generate: (data: any) => api.post('/documents/generate', data),
  list: (params?: any) => api.get('/documents', { params }),
  get: (id: number) => api.get(`/documents/${id}`),
  download: (id: number) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  delete: (id: number) => api.delete(`/documents/${id}`),
};

// ========== APPOINTMENTS SERVICE ==========
export const appointmentService = {
  list: (params?: any) => {
    // Adicionar datas padrão se não fornecidas
    const defaultParams = {
      start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
      ...params
    };
    return api.get('/appointments/calendar', { params: defaultParams });
  },
  get: (id: number) => api.get(`/appointments/${id}`),
  create: (data: any) => api.post('/appointments', data),
  createPublic: (data: any, companySlug?: string) => api.post('/appointments/public', data, { params: companySlug ? { company_slug: companySlug } : {} }), // Public appointment creation
  update: (id: number, data: any) => api.put(`/appointments/${id}`, data),
  delete: (id: number) => api.delete(`/appointments/${id}`),
  cancel: (id: number, reason?: string) => api.delete(`/appointments/${id}`), // Backend usa DELETE para cancelar
  // checkIn: (id: number, code: string) => api.post(`/appointments/${id}/check-in`, { check_in_code: code }), // Endpoint não existe no backend
  reschedule: (id: number, newStartTime: string) => api.post(`/appointments/${id}/reschedule?new_start_time=${encodeURIComponent(newStartTime)}`),
  // confirm: (id: number) => api.post(`/appointments/${id}/confirm`), // Endpoint não existe no backend
  getCalendar: (params: any) => api.get('/appointments/calendar', { params }),
  checkConflicts: (params: any) => api.get('/appointments/conflicts', { params }),
};

// ========== SERVICES SERVICE ==========
export const serviceService = {
  list: (params?: any) => api.get('/services', { params }),
  listPublic: (companySlug?: string) => api.get('/services/public', { params: companySlug ? { company_slug: companySlug } : {} }), // Public services without auth
  get: (id: number) => api.get(`/services/${id}`),
  create: (data: any) => api.post('/services', data),
  update: (id: number, data: any) => api.put(`/services/${id}`, data),
  delete: (id: number) => api.delete(`/services/${id}`),
  listCategories: () => api.get('/services/categories'),
};

// ========== PROFESSIONALS SERVICE ==========
export const professionalService = {
  list: () => api.get('/professionals'),
  get: (id: number) => api.get(`/professionals/${id}`),
  create: (data: any) => api.post('/professionals', data),
  update: (id: number, data: any) => api.put(`/professionals/${id}`, data),
  delete: (id: number) => api.delete(`/professionals/${id}`),
  listPublic: (companySlug?: string) => api.get('/professionals/public', { params: companySlug ? { company_slug: companySlug } : {} }),
};

// ========== USERS SERVICE ==========
export const userService = {
  list: (params?: any) => api.get('/users', { params }),
  get: (id: number) => api.get(`/users/${id}`),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  updateMe: (data: any) => api.put('/users/me', data),
  getProfessionals: () => api.get('/professionals'), // Alias for backward compatibility
  getProfessionalsPublic: (companySlug?: string) => api.get('/professionals/public', { params: companySlug ? { company_slug: companySlug } : {} }),
  getClients: () => api.get('/clients'), // Endpoint correto é /clients
  createClient: (data: any) => api.post('/clients', data), // Endpoint correto é /clients
  // getProfile: () => api.get('/users/profile'), // Endpoint não existe no backend
  // updateProfile: (data: any) => api.put('/users/profile', data), // Endpoint não existe no backend
};

// ========== PAYMENTS SERVICE ==========
export const paymentService = {
  list: (params?: any) => api.get('/payments', { params }),
  get: (id: number) => api.get(`/payments/${id}`),
  create: (data: any) => api.post('/payments', data),
  listPlans: () => api.get('/payments/plans'),
  createSubscription: (data: any) => api.post('/payments/subscriptions', data),
};

// ========== DASHBOARD SERVICE ==========
export const dashboardService = {
  getOverview: (params?: any) => api.get('/dashboard/overview', { params }),
  getTopServices: (params?: any) => api.get('/dashboard/top-services', { params }),
  getTopProfessionals: (params?: any) => api.get('/dashboard/top-professionals', { params }),
  getRevenueChart: (params?: any) => api.get('/dashboard/revenue-chart', { params }),
  getOccupancyRate: (params?: any) => api.get('/dashboard/occupancy-rate', { params }),
  
  // New endpoints for complete dashboard
  getDailySales: (params?: any) => api.get('/dashboard/daily-sales', { params }),
  getCommandsStats: (params?: any) => api.get('/dashboard/commands-stats', { params }),
  getAppointmentsByStatus: (params?: any) => api.get('/dashboard/appointments-by-status', { params }),
  getAverageTicket: (params?: any) => api.get('/dashboard/average-ticket', { params }),
  getSalesByCategory: (params?: any) => api.get('/dashboard/sales-by-category', { params }),
  getAppointmentsFunnel: (params?: any) => api.get('/dashboard/appointments-funnel', { params }),
  getProfessionalOccupancy: (params?: any) => api.get('/dashboard/professional-occupancy', { params }),
  getHeatmap: (params?: any) => api.get('/dashboard/heatmap', { params }),
  
  // Trend and growth endpoints
  getAppointmentsTrend: (params?: any) => api.get('/dashboard/appointments-trend', { params }),
  getRevenueTrend: (params?: any) => api.get('/dashboard/revenue-trend', { params }),
  getCommandsTrend: (params?: any) => api.get('/dashboard/commands-trend', { params }),
  getGrowthMetrics: (params?: any) => api.get('/dashboard/growth-metrics', { params }),
};

// ========== REPORTS SERVICE ==========
export const reportsService = {
  // Relatório de Despesas
  getExpensesReport: (params: { start_date: string; end_date: string; category_id?: number }) => 
    api.get('/reports/expenses', { params }),
  
  // Resultados Financeiros (DRE)
  getFinancialResults: (params: { start_date: string; end_date: string }) => 
    api.get('/reports/financial-results', { params }),
  
  // Projeção de Faturamento
  getRevenueForecast: (params?: { months_ahead?: number }) => 
    api.get('/reports/revenue-forecast', { params }),
  
  // Relatório de Comissões
  getCommissionsReport: (params: { start_date: string; end_date: string; professional_id?: number }) => 
    api.get('/reports/commissions', { params }),
  
  // Relatório por Serviço
  getByServiceReport: (params: { start_date: string; end_date: string }) => 
    api.get('/reports/by-service', { params }),
  
  // Relatório por Profissional
  getByProfessionalReport: (params: { start_date: string; end_date: string }) => 
    api.get('/reports/by-professional', { params }),
  
  // Relatório por Cliente
  getByClientReport: (params: { start_date: string; end_date: string; min_revenue?: number }) => 
    api.get('/reports/by-client', { params }),
  
  // Relatório Consolidado
  getConsolidatedReport: (params: { start_date: string; end_date: string }) => 
    api.get('/reports/consolidated', { params }),
};

// ========== REVIEWS SERVICE ==========
export const reviewService = {
  list: (params?: any) => api.get('/reviews', { params }),
  create: (data: any) => api.post('/reviews', data),
  getStats: (professionalId: number) => 
    api.get(`/reviews/professional/${professionalId}/stats`),
  respond: (id: number, response: string) => 
    api.post(`/reviews/${id}/response`, { response }),
};

// ========== NOTIFICATIONS SERVICE ==========
export const notificationService = {
  list: (params?: any) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id: number) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
};

// ========== ADMIN SERVICE ==========
export const adminService = {
  // Notification Configuration
  getNotificationConfig: () => api.get('/admin/notification-config'),
  saveNotificationConfig: (data: any) => api.post('/admin/notification-config', data),
  testNotification: (service: string) => api.post(`/admin/test-notification/${service}`),
  
  // System Status
  getSystemStatus: () => api.get('/admin/system-status'),
  
  // Company Management (SaaS Admin)
  listCompanies: (params?: any) => api.get('/admin/companies', { params }),
  toggleCompanyStatus: (companyId: number, isActive: boolean) => 
    api.put(`/admin/companies/${companyId}/status`, null, { params: { is_active: isActive } }),
  updateCompanySubscription: (companyId: number, plan: string, expiresAt?: string) =>
    api.put(`/admin/companies/${companyId}/subscription`, null, { params: { plan, expires_at: expiresAt } }),
  
  // Analytics (SaaS Admin)
  getAnalytics: () => api.get('/admin/analytics'),
};

// ========== SAAS ADMIN SERVICE (Global SaaS Management) ==========
export const saasAdminService = {
  // Companies Management
  listAllCompanies: (params?: any) => api.get('/saas-admin/companies', { params }),
  getCompanyDetails: (companyId: number) => api.get(`/saas-admin/companies/${companyId}`),
  updateCompany: (companyId: number, data: any) => api.put(`/saas-admin/companies/${companyId}`, data),
  toggleCompanyStatus: (companyId: number, isActive: boolean) => 
    api.post(`/saas-admin/companies/${companyId}/toggle-status`, null, { params: { is_active: isActive } }),
  
  // Subscription Management
  getCompanySubscription: (companyId: number) => api.get(`/saas-admin/companies/${companyId}/subscription`),
  updateCompanySubscription: (companyId: number, params: any) => 
    api.put(`/saas-admin/companies/${companyId}/subscription`, null, { params }),
  
  // Metrics & Analytics
  getMetricsOverview: () => api.get('/saas-admin/metrics/overview'),
  getRevenueAnalytics: (days?: number) => api.get('/saas-admin/analytics/revenue', { params: { days } }),
  getGrowthAnalytics: () => api.get('/saas-admin/analytics/growth'),
  
  // User Management
  listAllUsers: (params?: any) => api.get('/saas-admin/users', { params }),
  promoteUserToSaaS: (userId: number, saasRole: string) => 
    api.post(`/saas-admin/users/${userId}/promote-saas`, null, { params: { saas_role: saasRole } }),
  
  // Impersonation
  impersonateCompany: (companyId: number) => api.post(`/saas-admin/impersonate/${companyId}`),
  
  // Plans Management
  listPlans: () => api.get('/saas-admin/plans'),
  getPlanDetails: (planId: string) => api.get(`/saas-admin/plans/${planId}`),
};

// ========== COMPANY SERVICE ==========
export const companyService = {
  getCurrentCompany: () => api.get('/companies/me'),
  getCompany: (id: number) => api.get(`/companies/${id}`),
  updateCompany: (data: any) => api.put('/companies/me', data),
  getCompanyBySlug: (slug: string) => api.get(`/companies/slug/${slug}`),
};

// ========== API KEYS SERVICE ==========
export const apiKeyService = {
  // List available scopes
  getScopes: () => api.get('/api-keys/scopes'),
  
  // List all API keys for the company
  list: () => api.get('/api-keys'),
  
  // Create new API key
  create: (data: {
    name: string
    description?: string
    scopes?: string[]
    expires_at?: string | null
    ip_whitelist?: string[]
  }) => api.post('/api-keys', data),
  
  // Get single API key details
  get: (id: number) => api.get(`/api-keys/${id}`),
  
  // Update API key
  update: (id: number, data: {
    name?: string
    description?: string
    scopes?: string[]
    is_active?: boolean
    expires_at?: string | null
    ip_whitelist?: string[]
  }) => api.patch(`/api-keys/${id}`, data),
  
  // Delete (revoke) API key
  delete: (id: number) => api.delete(`/api-keys/${id}`),
  
  // Rotate API key (generate new key, keep same permissions)
  rotate: (id: number) => api.post(`/api-keys/${id}/rotate`),
};

// ========== REPORTS SERVICE ========== ✅ NOVO
export const reportService = {
  // Relatório de despesas
  getExpenses: (params: { start_date: string; end_date: string; category_id?: number }) => 
    api.get('/reports/expenses', { params }),
  
  // Resultados financeiros (DRE)
  getFinancialResults: (params: { start_date: string; end_date: string }) => 
    api.get('/reports/financial-results', { params }),
  
  // Projeção de faturamento
  getRevenueForecast: (months_ahead: number = 3) => 
    api.get('/reports/revenue-forecast', { params: { months_ahead } }),
  
  // Relatório de comissões
  getCommissions: (params: { start_date: string; end_date: string; professional_id?: number }) => 
    api.get('/reports/commissions', { params }),
  
  // Relatório por serviço
  getByService: (params: { start_date: string; end_date: string }) => 
    api.get('/reports/by-service', { params }),
  
  // Relatório por profissional
  getByProfessional: (params: { start_date: string; end_date: string }) => 
    api.get('/reports/by-professional', { params }),
  
  // Relatório por cliente
  getByClient: (params: { start_date: string; end_date: string; min_revenue?: number }) => 
    api.get('/reports/by-client', { params }),
  
  // Relatório consolidado
  getConsolidated: (params: { start_date: string; end_date: string }) => 
    api.get('/reports/consolidated', { params }),
};

// ========== SUBSCRIPTION SERVICE ==========
export const subscriptionService = {
  // Upgrade do plano da empresa
  upgradePlan: (data: { 
    new_plan_slug: string; 
    immediate?: boolean 
  }) => api.post('/plans/subscription/upgrade', data),
  
  // Downgrade do plano da empresa
  downgradePlan: (data: { 
    new_plan_slug: string 
  }) => api.post('/plans/subscription/downgrade', data),
  
  // Obter assinatura atual da empresa
  getCurrentSubscription: () => api.get('/plans/subscription/current'),
  
  // Obter uso atual dos recursos
  getUsage: () => api.get('/plans/subscription/usage'),
  
  // Verificar se pode adicionar profissional
  canAddProfessional: () => api.get('/plans/subscription/can-add-professional'),
  
  // Verificar acesso a feature específica
  checkFeatureAccess: (feature: string) => api.get(`/plans/subscription/check-feature/${feature}`),
  
  // Obter limites do plano atual
  getLimits: () => api.get('/plans/subscription/limits'),
  
  // Listar planos disponíveis
  listPlans: (include_inactive?: boolean) => api.get('/plans', { 
    params: { include_inactive } 
  }),
  
  // Obter detalhes de um plano específico
  getPlan: (plan_slug: string) => api.get(`/plans/${plan_slug}`),
};
