'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, TrendingUp, Users, LayoutDashboard, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <span className="text-sm font-semibold text-blue-700">Novo: Precificação Inteligente 2.0</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                Gestão, atendimento e <span className="text-blue-600">lucro</span> em um único sistema
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                O Atendo organiza sua agenda, controla seu financeiro e te ensina a precificar certo para crescer de forma previsível.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/pricing">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                    Quero testar o sistema
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Agendar Demo
                </Button>
              </div>

              {/* Free Trial */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <p className="text-sm font-semibold text-blue-900 mb-2">✓ Teste Grátis por 7 Dias</p>
                  <p className="text-sm text-blue-800">Acesso completo ao plano Premium. Sem cartão de crédito necessário.</p>
                </CardContent>
              </Card>

              {/* Features */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Agenda inteligente</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Controle financeiro completo</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Relatórios avançados</span>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative h-96 lg:h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl"></div>
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <LayoutDashboard size={64} className="mx-auto mb-4 text-blue-400" />
                  <p>Dashboard do Atendo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Funcionalidades Principais</h2>
            <p className="text-xl text-gray-600">Tudo que você precisa para gerenciar seu negócio</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <LayoutDashboard className="w-8 h-8 text-blue-600" />,
                title: 'Dashboard Inteligente',
                description: 'Visualize todos os dados do seu negócio em um único lugar',
              },
              {
                icon: <Users className="w-8 h-8 text-blue-600" />,
                title: 'Gestão de Clientes',
                description: 'Organize e acompanhe todos os seus clientes',
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
                title: 'Análise de Lucro',
                description: 'Entenda exatamente onde seu dinheiro está indo',
              },
            ].map((feature, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Planos e Preços</h2>
            <p className="text-xl text-gray-600 mb-8">Escolha o plano perfeito para seu negócio</p>
            <Link href="/pricing">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Ver todos os planos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">Pronto para transformar seu negócio?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Comece seu teste gratuito de 7 dias agora. Sem cartão de crédito necessário.
          </p>
          <Link href="/pricing">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Começar Teste Grátis
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
