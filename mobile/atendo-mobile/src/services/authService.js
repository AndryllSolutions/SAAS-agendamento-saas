/**
 * Authentication Service
 * Handles all authentication operations with real backend endpoints
 * Based on: /app/api/v1/endpoints/auth_mobile.py
 */

import API_CONFIG, { getHeaders } from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authService = {
  /**
   * Mobile Login - Usa mesmo endpoint que web app
   * POST /auth/login/json
   * Body: { email, password }
   * Returns: { access_token, refresh_token, token_type, user }
   */
  async mobileLogin(email, password) {
    try {
      // Usar endpoint /auth/login/json (mesmo que web app)
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login/json`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.detail || 'Falha ao fazer login',
          status: response.status,
        };
      }

      const data = await response.json();

      // Save tokens to storage
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('refresh_token', data.refresh_token);
      await AsyncStorage.setItem('user_id', data.user.id);
      await AsyncStorage.setItem('user_email', data.user.email);
      await AsyncStorage.setItem('user_role', data.user.role);

      return {
        success: true,
        data: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          token_type: data.token_type,
          user_id: data.user.id,
          email: data.user.email,
          role: data.user.role,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Erro ao conectar com servidor',
      };
    }
  },

  /**
   * Regular Login
   * POST /auth/login
   */
  async login(email, password) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.LOGIN}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.detail || 'Falha ao fazer login',
        };
      }

      const data = await response.json();

      // Save tokens
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('refresh_token', data.refresh_token);

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Refresh Token
   * POST /auth/refresh
   */
  async refreshToken() {
    try {
      const refresh_token = await AsyncStorage.getItem('refresh_token');

      if (!refresh_token) {
        return {
          success: false,
          error: 'Sem refresh token',
        };
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.REFRESH_TOKEN}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          refresh_token,
        }),
      });

      if (!response.ok) {
        // Clear tokens if refresh fails
        await this.logout();
        return {
          success: false,
          error: 'Sessão expirada',
        };
      }

      const data = await response.json();

      // Update access token
      await AsyncStorage.setItem('access_token', data.access_token);

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Get Current User
   * GET /auth/me
   */
  async getCurrentUser() {
    try {
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        return {
          success: false,
          error: 'Sem token',
        };
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.ME}`, {
        method: 'GET',
        headers: getHeaders(token),
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Falha ao obter usuário',
        };
      }

      const data = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Change Password
   * POST /auth/change-password
   */
  async changePassword(oldPassword, newPassword) {
    try {
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        return {
          success: false,
          error: 'Sem token',
        };
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.CHANGE_PASSWORD}`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.detail || 'Falha ao alterar senha',
        };
      }

      return {
        success: true,
        message: 'Senha alterada com sucesso',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Logout
   * POST /auth/logout
   */
  async logout() {
    try {
      const token = await AsyncStorage.getItem('access_token');

      if (token) {
        await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.LOGOUT}`, {
          method: 'POST',
          headers: getHeaders(token),
        });
      }

      // Clear all stored data
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user_id');
      await AsyncStorage.removeItem('user_email');
      await AsyncStorage.removeItem('user_role');

      return {
        success: true,
        message: 'Logout realizado com sucesso',
      };
    } catch (error) {
      // Still clear tokens even if logout fails
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');

      return {
        success: true,
        message: 'Logout realizado',
      };
    }
  },

  /**
   * Get stored token
   */
  async getToken() {
    try {
      return await AsyncStorage.getItem('access_token');
    } catch (error) {
      return null;
    }
  },

  /**
   * Get stored user info
   */
  async getUserInfo() {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const email = await AsyncStorage.getItem('user_email');
      const role = await AsyncStorage.getItem('user_role');

      return {
        user_id: userId,
        email,
        role,
      };
    } catch (error) {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      return !!token;
    } catch (error) {
      return false;
    }
  },
};

export default authService;
