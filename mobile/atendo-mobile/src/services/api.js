import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// API Base URL - Configurável por ambiente
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper para storage cross-platform (web vs mobile)
const Storage = {
  async getItem(key) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  async setItem(key, value) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return await SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return await SecureStore.deleteItemAsync(key);
  }
};

export { Storage };

// Interceptor de requisição - Adiciona token JWT
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await Storage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erro ao recuperar token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta - Trata refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se erro 401 e não é tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await Storage.getItem('refresh_token');
        
        if (refreshToken) {
          // Fazer requisição de refresh
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = response.data;

          // Salvar novos tokens
          if (Platform.OS === 'web') {
            localStorage.setItem('access_token', access_token);
            if (newRefreshToken) {
              localStorage.setItem('refresh_token', newRefreshToken);
            }
          } else {
            await SecureStore.setItemAsync('access_token', access_token);
            if (newRefreshToken) {
              await SecureStore.setItemAsync('refresh_token', newRefreshToken);
            }
          }

          // Atualizar header da requisição original
          originalRequest.headers.Authorization = `Bearer ${access_token}`;

          // Repetir requisição original
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Erro ao fazer refresh token:', refreshError);
        // Limpar tokens e fazer logout
        await Storage.deleteItem('access_token');
        await Storage.deleteItem('refresh_token');
        // Emitir evento de logout
        throw new Error('Sessão expirada. Faça login novamente.');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
