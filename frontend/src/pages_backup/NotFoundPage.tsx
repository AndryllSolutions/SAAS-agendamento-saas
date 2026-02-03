import Link from 'next/link';
import { Button } from '../components/ui/Button';
import dynamic from 'next/dynamic';

export const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Página não encontrada</p>
      <Link href="/">
        <Button variant="primary">Voltar para a página inicial</Button>
      </Link>
    </div>
  );
};

export default dynamic(() => Promise.resolve(NotFoundPage), { ssr: false });

// Evita geração estática durante o build
export async function getServerSideProps() {
  return { props: {} };
}
