import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Atendo - Sistema de Gestão B2B',
  description: 'Gestão, atendimento e lucro em um único sistema',
  keywords: ['gestão', 'atendimento', 'sistema', 'B2B', 'salão', 'clínica', 'estética'],
  authors: [{ name: 'Atendo' }],
  openGraph: {
    title: 'Atendo - Sistema de Gestão B2B',
    description: 'Gestão, atendimento e lucro em um único sistema',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
