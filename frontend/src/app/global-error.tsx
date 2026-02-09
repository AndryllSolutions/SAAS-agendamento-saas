'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erro global capturado:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <div className="text-6xl mb-4">⚠️</div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Erro inesperado
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={reset}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                Tentar novamente
              </button>
              
              <a
                href="/"
                className="block w-full text-center border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar para a página inicial
              </a>
            </div>
            
            {error.digest && (
              <div className="mt-8 text-xs text-gray-500">
                <p>ID do Erro: {error.digest}</p>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
