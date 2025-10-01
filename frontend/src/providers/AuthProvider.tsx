import { ReactNode, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Spinner } from '../components/ui/Spinner';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { checkAuth, isLoading } = useAuthStore();

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [checkAuth]);

  // Mostrar um spinner enquanto a autenticação está sendo verificada
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
