import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600">404</h1>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Página não encontrada
        </h2>
        
        <p className="text-lg text-gray-600 mb-8">
          Ops! A página que você está procurando não existe ou foi movida.
        </p>
        
        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Voltar para a página inicial
            </Button>
          </Link>
          
          <Link href="/pricing">
            <Button variant="outline" className="w-full">
              Ver nossos planos
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          <p>Se você acredita que isso é um erro, entre em contato com nosso suporte.</p>
        </div>
      </div>
    </div>
  );
}