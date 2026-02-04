import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Providers } from '@/components/Providers'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Atendo - Sistema de Agendamento Online',
  description: 'Sistema completo de agendamento online multi-tenant',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeProvider>
          <Providers>
            {children}
          </Providers>
          <Toaster 
            position="bottom-right" 
            richColors 
            toastOptions={{
              style: {
                background: '#10b981', // Verde para sucesso
                color: '#fff',
              },
              className: 'appointment-toast',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
