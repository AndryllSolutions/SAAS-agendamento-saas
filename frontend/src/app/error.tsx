"use client";

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logar o erro para diagnóstico
    console.error('Erro capturado:', error);
  }, [error]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>❌ Ocorreu um erro no sistema</h2>
      <p>{error.message}</p>
      {error.digest && (
        <p><small>ID do Erro: {error.digest}</small></p>
      )}
      <button
        onClick={reset}
        style={{
          background: '#0070f3',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Tentar novamente
      </button>
      <div style={{ marginTop: '20px' }}>
        <details>
          <summary>Detalhes técnicos</summary>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
            {error.stack}
          </pre>
        </details>
      </div>
    </div>
  );
}
