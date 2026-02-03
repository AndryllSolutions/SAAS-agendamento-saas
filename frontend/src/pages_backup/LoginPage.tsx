import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { authService } from '../services/api';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { error, clearError, setAuth } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      const response = await authService.login(email, password);
      const data = response.data;
      
      setAuth({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name,
        role: data.user.role,
        saas_role: data.user.saas_role,
        company_role: data.user.company_role,
        company_id: data.user.company_id,
      }, data.access_token, data.refresh_token);

      // Redirecionar para o dashboard (ou origem se aplicável no futuro)
      const from = '/dashboard';
      router.replace(from);
    } catch (err) {
      console.error('Erro no login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Login</h2>
          <p className="mt-2 text-sm text-gray-600">
            Acesse sua conta para continuar
          </p>
        </div>

        {error && (
          <Alert 
            message={error} 
            variant="error" 
            onClose={clearError} 
          />
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-900">
                Lembrar de mim
              </label>
            </div>

            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Esqueceu sua senha?
              </a>
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>

        <div className="text-sm text-center text-gray-600">
          Não tem uma conta?{' '}
          <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Cadastre-se
          </a>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(LoginPage), { ssr: false });

// Evita geração estática durante o build
export async function getServerSideProps() {
  return { props: {} };
}
