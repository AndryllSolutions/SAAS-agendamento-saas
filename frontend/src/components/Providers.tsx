'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { queryRetryFn, queryRetryDelay } from '@/utils/retryStrategy'

export function Providers({ children }: { children: React.ReactNode }) {
  // ✅ OTIMIZAÇÃO: Configurações para reduzir requisições e evitar rate limit
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000, // ✅ Aumentado para 10 minutos (reduz refetch)
        cacheTime: 15 * 60 * 1000, // ✅ Cache por 15 minutos
        refetchOnWindowFocus: false, // ✅ Não refaz requisição ao focar janela
        refetchOnMount: false, // ✅ Não refaz ao montar componente se dados estão em cache
        refetchOnReconnect: false, // ✅ Não refaz ao reconectar
        refetchInterval: false, // ✅ Desabilitar polling automático
        retry: queryRetryFn, // ✅ Retry inteligente com rate limit handling
        retryDelay: queryRetryDelay, // ✅ Exponential backoff com rate limit especial
        networkMode: 'online', // ✅ Só faz requisições quando online
      },
      mutations: {
        retry: 1, // ✅ Mutations também com 1 tentativa apenas
        retryDelay: 3000, // ✅ 3 segundos entre tentativas de mutation
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
