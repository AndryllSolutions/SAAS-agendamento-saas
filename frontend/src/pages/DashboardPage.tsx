import { useAuth } from '../hooks/useAuth';

export const DashboardPage = () => {
  const { user } = useAuth();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Bem-vindo, {user?.full_name}</h1>
      <p className="mt-2 text-gray-600">
        Você está logado como {user?.role}
      </p>
    </div>
  );
};

export default DashboardPage;
