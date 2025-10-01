import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../ui/Spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectTo = '/login',
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuth = await checkAuth();
      
      if (!isAuth) {
        // Redirecionar para login com o caminho de retorno
        navigate(redirectTo, { 
          state: { from: location },
          replace: true 
        });
        return;
      }

      // Verificar se o usuário tem a role necessária
      if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        // Redirecionar para página de acesso não autorizado
        navigate('/unauthorized', { replace: true });
      }
    };

    verifyAuth();
  }, [isAuthenticated, checkAuth, navigate, location, allowedRoles, user, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirecionamento já ocorre no useEffect
  }

  // Verificar se o usuário tem a role necessária
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return null; // Redirecionamento já ocorre no useEffect
  }

  return <>{children}</>;
};

export default ProtectedRoute;
