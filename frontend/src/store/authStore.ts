/**
 * Auth Store - Zustand state management for authentication
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { getApiUrl } from '@/utils/apiUrl';

// Safe localStorage that only works in browser
const safeLocalStorage = {
  getItem: (name: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(name);
    }
    return null;
  },
  setItem: (name: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(name);
    }
  },
};

interface User {
  id: number;
  email: string;
  full_name: string;
  // Legacy field (deprecated, use company_role instead)
  role?: 'OWNER' | 'MANAGER' | 'RECEPTIONIST' | 'PROFESSIONAL' | 'FINANCE' | 'SAAS_ADMIN' | 'CLIENT' | 'admin' | 'manager' | 'professional' | 'client' | string;
  // New two-layer role architecture
  saas_role?: 'SAAS_OWNER' | 'SAAS_STAFF' | 'SAAS_USER' | null;
  company_role?: 'COMPANY_OWNER' | 'COMPANY_MANAGER' | 'COMPANY_FINANCE' | 'COMPANY_RECEPTIONIST' | 'COMPANY_PROFESSIONAL' | 'COMPANY_OPERATOR' | 'COMPANY_CLIENT' | 'COMPANY_READ_ONLY' | null;
  company_id?: number;
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
  hasHydrated: boolean;
  
  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasHydrated: false,
      
      setAuth: (user, accessToken, refreshToken) => {
        const tokenData = jwtDecode<TokenPayload>(accessToken);
        const expiresIn = (tokenData.exp * 1000) - Date.now();
        
        // Salvar tokens no localStorage (só no browser)
        safeLocalStorage.setItem('access_token', accessToken);
        safeLocalStorage.setItem('refresh_token', refreshToken);
        
        // Tentar salvar em cookies tambem (mais seguro para SSR)
        if (typeof document !== 'undefined') {
          const expires = new Date(tokenData.exp * 1000);
          document.cookie = `access_token=${accessToken}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
          
          const refreshExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias
          document.cookie = `refresh_token=${refreshToken}; path=/; expires=${refreshExpires.toUTCString()}; SameSite=Strict`;
        }
        
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
        // Limpar localStorage (só no browser)
        safeLocalStorage.removeItem('access_token');
        safeLocalStorage.removeItem('refresh_token');
        
        // Limpar cookies
        if (typeof document !== 'undefined') {
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
          document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
        }
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },
      
      refreshAccessToken: async () => {
        const { refreshToken, isLoading } = get();
        
        // GUARD 1: Sem refresh token = não tentar
        if (!refreshToken) {
          console.log('[Auth] No refresh token available - skipping refresh');
          return false;
        }
        
        // GUARD 2: Verificar se está em rota pública (evitar refresh desnecessário)
        if (typeof window !== 'undefined') {
          const publicRoutes = ['/login', '/register', '/book', '/scheduling'];
          const currentPath = window.location.pathname;
          if (publicRoutes.some(route => currentPath === route || currentPath.startsWith(route + '/'))) {
            console.log('[Auth] Public route detected - skipping refresh');
            return false;
          }
        }
        
        // GUARD 3: Prevenir múltiplos refresh simultâneos (race condition)
        if (isLoading) {
          console.log('[Auth] Refresh already in progress - waiting...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          return get().accessToken !== null;
        }
        
        try {
          set({ isLoading: true });
          
          // Get API URL - sempre HTTPS em produção
          const API_BASE_URL = getApiUrl();
          
          // ENDPOINT CORRETO: /auth/refresh (não /auth/refresh-token)
          const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refresh_token: refreshToken,
            }),
          });
          
          // Se falhar, fazer logout silencioso sem loop
          if (!response.ok) {
            console.warn('[Auth] Refresh failed with status:', response.status);
            get().logout();
            return false;
          }
          
          const data = await response.json();
          
          // Atualizar tokens no state e localStorage
          set({
            accessToken: data.access_token,
            refreshToken: data.refresh_token || refreshToken,
          });
          
          // Sincronizar com localStorage separado (compatibilidade)
          localStorage.setItem('access_token', data.access_token);
          if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token);
          }
          
          // Agendar próximo refresh (5 min antes de expirar)
          const tokenData = jwtDecode<TokenPayload>(data.access_token);
          const expiresIn = (tokenData.exp * 1000) - Date.now();
          const refreshTime = Math.max(expiresIn - (5 * 60 * 1000), 60000); // Min 1 min
          
          if (refreshTime > 0 && refreshTime < 3600000) { // Max 1 hora
            setTimeout(() => {
              get().refreshAccessToken().catch(() => {
                // Falha silenciosa - não logar em loop
              });
            }, refreshTime);
          }
          
          return true;
        } catch (error) {
          console.error('[Auth] Refresh error:', error);
          // Logout silencioso - sem set error para evitar UI spam
          get().logout();
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      
      clearError: () => set({ error: null }),
      
      setHasHydrated: (hydrated: boolean) => set({ hasHydrated: hydrated }),
      
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
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Marcar que a hidratação foi concluída
        if (state) {
          state.setHasHydrated(true);
        }
        
        if (!state?.accessToken) return;

        try {
          const { exp } = jwtDecode<TokenPayload>(state.accessToken);
          const isExpired = Date.now() >= exp * 1000;

          if (isExpired) {
            if (state.refreshToken) {
              state.refreshAccessToken().then((success) => {
                if (!success) {
                  state.logout();
                }
              });
            } else {
              state.logout();
            }
            return;
          }

          if (!state.refreshToken) {
            state.logout();
            return;
          }

          if (!state.user) {
            state.logout();
            return;
          }

          safeLocalStorage.setItem('access_token', state.accessToken);
          safeLocalStorage.setItem('refresh_token', state.refreshToken);
          state.setAuth(state.user, state.accessToken, state.refreshToken);
        } catch (error) {
          console.error('Erro ao validar token:', error);
          state.logout();
        }
      },
    }
  )
);
