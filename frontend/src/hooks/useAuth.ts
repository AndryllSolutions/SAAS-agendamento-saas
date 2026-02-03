import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    checkAuth, 
    clearError,
    setAuth,
    setUser,
    logout,
    refreshAccessToken,
  } = useAuthStore();

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    if (isAuthenticated) {
      checkAuth().catch(console.error);
    }
  }, [isAuthenticated, checkAuth]);

  // Limpar erros ao desmontar o componente
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    checkAuth,
    clearError,
    setAuth,
    setUser,
    logout,
    refreshAccessToken,
  };
};

// Hook para verificar permissões de usuário
export const useUserRole = (allowedRoles: string[]) => {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated || !user) {
    return { hasPermission: false, isAuthenticated: false };
  }
  
  return {
    hasPermission: allowedRoles.includes(user.role),
    isAuthenticated: true,
    userRole: user.role,
  };
};
