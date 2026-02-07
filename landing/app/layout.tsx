import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Atendo - Sistema de Agendamento Online',
  description: 'Simplifique sua agenda e atraia mais clientes com o Atendo. Sistema completo para salões, barbearias e clínicas.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
