/**
 * API Service - Axios configuration and API calls
 */
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const { access_token, refresh_token } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          
          // Retry original request
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${access_token}`;
            return axios(error.config);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        // No refresh token, logout user
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// API Services
export const authService = {
  login: (email: string, password: string) => 
    api.post('/auth/login', new URLSearchParams({ username: email, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }),
  
  register: (data: any) => api.post('/auth/register', data),
  
  getCurrentUser: () => api.get('/users/me'),
};

export const appointmentService = {
  list: (params?: any) => api.get('/appointments', { params }),
  
  get: (id: number) => api.get(`/appointments/${id}`),
  
  create: (data: any) => api.post('/appointments', data),
  
  update: (id: number, data: any) => api.put(`/appointments/${id}`, data),
  
  cancel: (id: number, reason?: string) => 
    api.post(`/appointments/${id}/cancel`, { cancellation_reason: reason }),
  
  checkIn: (id: number, code: string) => 
    api.post(`/appointments/${id}/check-in`, { check_in_code: code }),
};

export const serviceService = {
  list: (params?: any) => api.get('/services', { params }),
  
  get: (id: number) => api.get(`/services/${id}`),
  
  create: (data: any) => api.post('/services', data),
  
  update: (id: number, data: any) => api.put(`/services/${id}`, data),
  
  delete: (id: number) => api.delete(`/services/${id}`),
  
  listCategories: () => api.get('/services/categories'),
};

export const userService = {
  list: (params?: any) => api.get('/users', { params }),
  
  get: (id: number) => api.get(`/users/${id}`),
  
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  
  updateMe: (data: any) => api.put('/users/me', data),
  
  getProfessionals: () => api.get('/users/professionals/available'),
};

export const paymentService = {
  list: (params?: any) => api.get('/payments', { params }),
  
  get: (id: number) => api.get(`/payments/${id}`),
  
  create: (data: any) => api.post('/payments', data),
  
  listPlans: () => api.get('/payments/plans'),
  
  createSubscription: (data: any) => api.post('/payments/subscriptions', data),
};

export const dashboardService = {
  getOverview: (params?: any) => api.get('/dashboard/overview', { params }),
  
  getTopServices: (params?: any) => api.get('/dashboard/top-services', { params }),
  
  getTopProfessionals: (params?: any) => api.get('/dashboard/top-professionals', { params }),
  
  getRevenueChart: (params?: any) => api.get('/dashboard/revenue-chart', { params }),
  
  getOccupancyRate: (params?: any) => api.get('/dashboard/occupancy-rate', { params }),
};

export const reviewService = {
  list: (params?: any) => api.get('/reviews', { params }),
  
  create: (data: any) => api.post('/reviews', data),
  
  getStats: (professionalId: number) => 
    api.get(`/reviews/professional/${professionalId}/stats`),
  
  respond: (id: number, response: string) => 
    api.post(`/reviews/${id}/response`, { response }),
};

export const notificationService = {
  list: (params?: any) => api.get('/notifications', { params }),
  
  getUnreadCount: () => api.get('/notifications/unread/count'),
  
  markAsRead: (id: number) => api.post(`/notifications/${id}/read`),
  
  markAllAsRead: () => api.post('/notifications/read-all'),
};
