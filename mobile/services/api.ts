/**
 * API Service Layer
 * Comunicação com backend FastAPI
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  ApiResponse, 
  AuthTokens, 
  LoginRequest, 
  RefreshTokenRequest,
  User,
  Company,
  Appointment,
  Service,
  Client,
  Payment,
  ApiError,
  PaginatedResponse
} from '../types';

// Configuração da API
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api/v1'
  : 'https://api.seudominio.com/api/v1';

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@atendo_access_token',
  REFRESH_TOKEN: '@atendo_refresh_token',
  USER: '@atendo_user',
  COMPANY: '@atendo_company'
};

// Classe de erro personalizada
class ApiClientError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

// Cliente HTTP base
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (accessToken) {
      return {
        ...this.defaultHeaders,
        'Authorization': `Bearer ${accessToken}`,
      };
    }
    return this.defaultHeaders;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: any;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      const errorMessage = data?.message || data?.detail || response.statusText;
      throw new ApiClientError(
        response.status,
        errorMessage,
        data
      );
    }

    return {
      data: data?.data || data,
      message: data?.message,
      total: data?.total,
      page: data?.page,
      limit: data?.limit,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      // Erro de rede ou outro
      throw new ApiClientError(
        0,
        'Erro de conexão com o servidor',
        error
      );
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Instância do cliente
const apiClient = new ApiClient(API_BASE_URL);

// ==================== AUTH SERVICE ====================

export class AuthService {
  // Login mobile otimizado
  static async login(credentials: LoginRequest): Promise<AuthTokens> {
    try {
      const response = await apiClient.post<AuthTokens>(
        '/auth/mobile/login',
        credentials
      );

      const tokens = response.data;
      
      // Salvar tokens
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);

      return tokens;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new Error(error.message);
      }
      throw new Error('Falha no login. Tente novamente.');
    }
  }

  // Refresh token
  static async refreshToken(): Promise<AuthTokens> {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        throw new Error('Refresh token não encontrado');
      }

      const response = await apiClient.post<AuthTokens>(
        '/auth/refresh',
        { refresh_token: refreshToken }
      );

      const tokens = response.data;
      
      // Atualizar tokens
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);

      return tokens;
    } catch (error) {
      // Se falhar, limpar tokens e forçar novo login
      await this.logout();
      throw new Error('Sessão expirada. Faça login novamente.');
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      // Chamar endpoint de logout se existir
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignorar erro de logout
    } finally {
      // Limpar storage local
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.COMPANY
      ]);
    }
  }

  // Verificar se está autenticado
  static async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  }

  // Obter usuário atual
  static async getCurrentUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  }

  // Salvar usuário atual
  static async setCurrentUser(user: User): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  // Obter empresa atual
  static async getCurrentCompany(): Promise<Company | null> {
    try {
      const companyStr = await AsyncStorage.getItem(STORAGE_KEYS.COMPANY);
      return companyStr ? JSON.parse(companyStr) : null;
    } catch (error) {
      return null;
    }
  }

  // Salvar empresa atual
  static async setCurrentCompany(company: Company): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(company));
  }
}

// ==================== USER SERVICE ====================

export class UserService {
  static async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/users/me');
    const user = response.data;
    
    // Salvar usuário no storage
    await AuthService.setCurrentUser(user);
    
    return user;
  }

  static async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/users/me', data);
    const user = response.data;
    
    // Atualizar usuário no storage
    await AuthService.setCurrentUser(user);
    
    return user;
  }

  static async uploadAvatar(imageUri: string): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    const response = await fetch(`${API_BASE_URL}/uploads/avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)}`,
      },
      body: formData,
    });

    const result = await response.json();
    return result;
  }
}

// ==================== APPOINTMENT SERVICE ====================

export class AppointmentService {
  static async getAppointments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<Appointment>> {
    const response = await apiClient.get<Appointment[]>('/appointments', params);
    
    return {
      items: response.data,
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 20,
      pages: Math.ceil((response.total || 0) / (response.limit || 20)),
    };
  }

  static async getAppointment(id: number): Promise<Appointment> {
    const response = await apiClient.get<Appointment>(`/appointments/${id}`);
    return response.data;
  }

  static async createAppointment(data: {
    client_crm_id: number;
    professional_id: number;
    service_id: number;
    start_time: string;
    end_time: string;
    client_notes?: string;
  }): Promise<Appointment> {
    const response = await apiClient.post<Appointment>('/appointments', data);
    return response.data;
  }

  static async updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment> {
    const response = await apiClient.put<Appointment>(`/appointments/${id}`, data);
    return response.data;
  }

  static async cancelAppointment(id: number, reason?: string): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(`/appointments/${id}/cancel`, {
      cancellation_reason: reason,
    });
    return response.data;
  }

  static async confirmAppointment(id: number): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(`/appointments/${id}/confirm`);
    return response.data;
  }

  static async checkInAppointment(id: number, code?: string): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(`/appointments/${id}/checkin`, {
      check_in_code: code,
    });
    return response.data;
  }
}

// ==================== SERVICE SERVICE ====================

export class ServiceService {
  static async getServices(params?: {
    page?: number;
    limit?: number;
    category_id?: number;
    is_active?: boolean;
  }): Promise<PaginatedResponse<Service>> {
    const response = await apiClient.get<Service[]>('/services', params);
    
    return {
      items: response.data,
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 20,
      pages: Math.ceil((response.total || 0) / (response.limit || 20)),
    };
  }

  static async getService(id: number): Promise<Service> {
    const response = await apiClient.get<Service>(`/services/${id}`);
    return response.data;
  }

  static async getServiceCategories(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/services/categories');
    return response.data;
  }
}

// ==================== CLIENT SERVICE ====================

export class ClientService {
  static async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<PaginatedResponse<Client>> {
    const response = await apiClient.get<Client[]>('/clients', params);
    
    return {
      items: response.data,
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 20,
      pages: Math.ceil((response.total || 0) / (response.limit || 20)),
    };
  }

  static async getClient(id: number): Promise<Client> {
    const response = await apiClient.get<Client>(`/clients/${id}`);
    return response.data;
  }

  static async createClient(data: Partial<Client>): Promise<Client> {
    const response = await apiClient.post<Client>('/clients', data);
    return response.data;
  }

  static async updateClient(id: number, data: Partial<Client>): Promise<Client> {
    const response = await apiClient.put<Client>(`/clients/${id}`, data);
    return response.data;
  }
}

// ==================== PAYMENT SERVICE ====================

export class PaymentService {
  static async getPayments(params?: {
    page?: number;
    limit?: number;
    appointment_id?: number;
    status?: string;
  }): Promise<PaginatedResponse<Payment>> {
    const response = await apiClient.get<Payment[]>('/payments', params);
    
    return {
      items: response.data,
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 20,
      pages: Math.ceil((response.total || 0) / (response.limit || 20)),
    };
  }

  static async createPayment(data: {
    appointment_id: number;
    amount: number;
    payment_method: string;
    installments?: number;
  }): Promise<Payment> {
    const response = await apiClient.post<Payment>('/payments', data);
    return response.data;
  }

  static async processPayment(id: number, data: {
    payment_method: string;
    gateway_data?: Record<string, any>;
  }): Promise<Payment> {
    const response = await apiClient.post<Payment>(`/payments/${id}/process`, data);
    return response.data;
  }
}

// ==================== NOTIFICATION SERVICE ====================

export class NotificationService {
  static async getNotifications(params?: {
    page?: number;
    limit?: number;
    is_read?: boolean;
  }): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get<any[]>('/notifications', params);
    
    return {
      items: response.data,
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 20,
      pages: Math.ceil((response.total || 0) / (response.limit || 20)),
    };
  }

  static async markAsRead(id: number): Promise<void> {
    await apiClient.post(`/notifications/${id}/read`);
  }

  static async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/read-all');
  }

  static async getUnreadCount(): Promise<{ count: number }> {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.data;
  }
}

// ==================== COMPANY SERVICE ====================

export class CompanyService {
  static async getCompany(): Promise<Company> {
    const response = await apiClient.get<Company>('/companies/me');
    const company = response.data;
    
    // Salvar empresa no storage
    await AuthService.setCurrentCompany(company);
    
    return company;
  }

  static async updateCompany(data: Partial<Company>): Promise<Company> {
    const response = await apiClient.put<Company>('/companies/me', data);
    const company = response.data;
    
    // Atualizar empresa no storage
    await AuthService.setCurrentCompany(company);
    
    return company;
  }

  static async getThemeSettings(): Promise<any> {
    const response = await apiClient.get<any>('/settings/theme');
    return response.data;
  }

  static async updateThemeSettings(data: any): Promise<any> {
    const response = await apiClient.put<any>('/settings/theme', data);
    return response.data;
  }
}

// ==================== PUSH NOTIFICATION SERVICE ====================

export class PushNotificationService {
  static async getVapidPublicKey(): Promise<{ public_key: string }> {
    const response = await apiClient.get<{ public_key: string }>('/push/vapid-public-key');
    return response.data;
  }

  static async subscribe(subscription: {
    endpoint: string;
    p256dh: string;
    auth: string;
    browser?: string;
    device_name?: string;
    user_agent?: string;
  }): Promise<any> {
    const response = await apiClient.post<any>('/push/subscribe', subscription);
    return response.data;
  }

  static async unsubscribe(endpoint: string): Promise<void> {
    await apiClient.post('/push/unsubscribe', { endpoint });
  }

  static async testNotification(data: {
    title: string;
    body: string;
    data?: Record<string, any>;
  }): Promise<void> {
    await apiClient.post('/push/test', data);
  }
}

// Export default
export default apiClient;
