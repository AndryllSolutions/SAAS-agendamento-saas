/**
 * Auth Store - Zustand state management for authentication
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'professional' | 'client';
  company_id: number;
  avatar_url?: string;
}

interface TokenPayload {
  sub: string;
  exp: number;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:8000';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      setAuth: (user, accessToken, refreshToken) => {
        const tokenData = jwtDecode<TokenPayload>(accessToken);
        const expiresIn = (tokenData.exp * 1000) - Date.now();
        
        // Schedule token refresh before it expires (5 minutes before)
        const refreshTime = Math.max(expiresIn - (5 * 60 * 1000), 0);
        
        if (refreshTime > 0) {
          setTimeout(() => {
            get().refreshAccessToken().catch(console.error);
          }, refreshTime);
        }
        
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          error: null,
        });
      },
      
      setUser: (user) => set({ user }),
      
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },
      
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        
        try {
          set({ isLoading: true });
          
          const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refresh_token: refreshToken,
            }),
          });
          
          if (!response.ok) {
            throw new Error('Falha ao renovar o token');
          }
          
          const data = await response.json();
          
          set({
            accessToken: data.access_token,
            refreshToken: data.refresh_token || refreshToken,
          });
          
          return true;
        } catch (error) {
          console.error('Erro ao renovar token:', error);
          set({ error: 'Sessão expirada. Por favor, faça login novamente.' });
          get().logout();
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      
      clearError: () => set({ error: null }),
      
      checkAuth: async () => {
        const { accessToken, refreshAccessToken } = get();
        
        if (!accessToken) return false;
        
        try {
          const { exp } = jwtDecode<TokenPayload>(accessToken);
          
          // Check if token is expired or will expire in the next 5 minutes
          if (Date.now() >= exp * 1000 - 300000) {
            return await refreshAccessToken();
          }
          
          return true;
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
