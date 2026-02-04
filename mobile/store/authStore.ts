/**
 * Auth Store - Gerenciamento de estado de autenticação
 * Zustand + Persist
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  Company, 
  AuthTokens, 
  AppState,
  ApiError,
  AppSettings 
} from '../types';
import { AuthService } from '../services/api';

// Estado inicial
const initialState: Omit<AppState, 'settings'> = {
  user: null,
  company: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
};

// Configurações padrão
const defaultSettings: AppSettings = {
  apiBaseUrl: __DEV__ 
    ? 'http://localhost:8000/api/v1'
    : 'https://api.seudominio.com/api/v1',
  pushNotificationEnabled: true,
  biometricEnabled: false,
  theme: 'auto',
  language: 'pt-BR',
  notifications: {
    appointments: true,
    promotions: true,
    system: true,
  },
};

// Interface do store
interface AuthStore extends Omit<AppState, 'settings'> {
  settings: AppSettings;
  
  // Actions
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  updateCompany: (company: Partial<Company>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  clearError: () => void;
  
  // Estado de erro
  error: string | null;
  setError: (error: string | null) => void;
}

// Store principal
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      ...initialState,
      settings: defaultSettings,
      error: null,

      // Actions
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          // Fazer login
          const tokens = await AuthService.login({ email, password });

          // Buscar dados do usuário
          const user = await AuthService.getCurrentUser();
          if (!user) {
            // Se não tiver usuário no storage, buscar da API
            try {
              const userService = await import('../services/api').then(m => m.UserService);
              const userData = await userService.getProfile();
              await AuthService.setCurrentUser(userData);
            } catch (error) {
              console.warn('Não foi possível buscar dados do usuário:', error);
            }
          }

          // Buscar dados da empresa
          const company = await AuthService.getCurrentCompany();
          if (!company) {
            try {
              const companyService = await import('../services/api').then(m => m.CompanyService);
              const companyData = await companyService.getCompany();
              await AuthService.setCurrentCompany(companyData);
            } catch (error) {
              console.warn('Não foi possível buscar dados da empresa:', error);
            }
          }

          // Atualizar estado
          set({
            tokens,
            user: user || null,
            company: company || null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

        } catch (error) {
          const message = error instanceof Error ? error.message : 'Falha no login';
          set({
            error: message,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            company: null,
            tokens: null,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await AuthService.logout();
        } catch (error) {
          console.warn('Erro ao fazer logout:', error);
        } finally {
          // Resetar estado
          set({
            ...initialState,
            settings: get().settings, // Manter configurações
            error: null,
            isLoading: false,
          });
        }
      },

      refreshToken: async () => {
        try {
          const tokens = await AuthService.refreshToken();
          set({ tokens });
        } catch (error) {
          // Se falhar o refresh, fazer logout
          await get().logout();
          throw error;
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          set({ user: updatedUser });
          AuthService.setCurrentUser(updatedUser);
        }
      },

      updateCompany: (companyData: Partial<Company>) => {
        const currentCompany = get().company;
        if (currentCompany) {
          const updatedCompany = { ...currentCompany, ...companyData };
          set({ company: updatedCompany });
          AuthService.setCurrentCompany(updatedCompany);
        }
      },

      updateSettings: (newSettings: Partial<AppSettings>) => {
        const currentSettings = get().settings;
        const updatedSettings = { ...currentSettings, ...newSettings };
        set({ settings: updatedSettings });
      },
    }),
    {
      name: 'atendo-auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persistir apenas estes campos
        user: state.user,
        company: state.company,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        // Quando rehidratar, verificar se os tokens ainda são válidos
        if (state?.isAuthenticated && state?.tokens) {
          // Opcional: validar tokens aqui
          console.log('Store rehidratado com usuário autenticado');
        }
      },
    }
  )
);

// Hook para verificar autenticação
export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    // Estado
    user: store.user,
    company: store.company,
    tokens: store.tokens,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    settings: store.settings,
    
    // Actions
    login: store.login,
    logout: store.logout,
    refreshToken: store.refreshToken,
    updateUser: store.updateUser,
    updateCompany: store.updateCompany,
    updateSettings: store.updateSettings,
    setLoading: store.setLoading,
    setError: store.setError,
    clearError: store.clearError,
    
    // Utilitários
    isAdmin: store.user?.role === 'admin',
    isProfessional: store.user?.role === 'professional',
    isClient: store.user?.role === 'client',
    isStaff: store.user?.role === 'staff',
    
    // Permissões baseadas no role
    canManageAppointments: store.user?.role === 'admin' || store.user?.role === 'professional' || store.user?.role === 'staff',
    canManageClients: store.user?.role === 'admin' || store.user?.role === 'professional' || store.user?.role === 'staff',
    canManageServices: store.user?.role === 'admin' || store.user?.role === 'staff',
    canManageCompany: store.user?.role === 'admin',
    canViewReports: store.user?.role === 'admin' || store.user?.role === 'staff',
  };
};

// Hook para configurações
export const useSettings = () => {
  const { settings, updateSettings } = useAuthStore();
  
  return {
    settings,
    updateSettings,
    
    // Utilitários
    isDarkMode: settings.theme === 'dark' || 
      (settings.theme === 'auto' && false), // TODO: detectar tema do sistema
    
    toggleTheme: () => {
      const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
      const currentIndex = themes.indexOf(settings.theme);
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      updateSettings({ theme: nextTheme });
    },
    
    toggleNotifications: (type: keyof AppSettings['notifications']) => {
      updateSettings({
        notifications: {
          ...settings.notifications,
          [type]: !settings.notifications[type],
        },
      });
    },
    
    toggleBiometric: () => {
      updateSettings({ biometricEnabled: !settings.biometricEnabled });
    },
    
    togglePushNotifications: () => {
      updateSettings({ pushNotificationEnabled: !settings.pushNotificationEnabled });
    },
  };
};

// Hook para loading states
export const useLoading = () => {
  const { isLoading, setLoading } = useAuthStore();
  
  return {
    isLoading,
    setLoading,
    
    // Wrapper para operações assíncronas
    withLoading: async <T>(operation: () => Promise<T>): Promise<T> => {
      try {
        setLoading(true);
        return await operation();
      } finally {
        setLoading(false);
      }
    },
  };
};

// Hook para erros
export const useError = () => {
  const { error, setError, clearError } = useAuthStore();
  
  return {
    error,
    setError,
    clearError,
    
    // Wrapper para tratamento de erros
    withErrorHandling: async <T>(operation: () => Promise<T>): Promise<T | null> => {
      try {
        clearError();
        return await operation();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ocorreu um erro';
        setError(message);
        return null;
      }
    },
  };
};

export default useAuthStore;
