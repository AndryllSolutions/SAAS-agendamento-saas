'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      id: 'essential',
      name: 'Essencial',
      price: 89,
      description: 'Para quem está começando',
      features: [
        'Agenda online',
        'Sincronização em tempo real',
        'Dashboard financeiro básico',
        'Até 100 clientes',
        'Suporte por email',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 149,
      description: 'Para profissionais',
      featured: true,
      features: [
        'Tudo do Essencial',
        'Notificações automáticas',
        'Agendamentos recorrentes',
        'Relatórios detalhados',
        'Até 500 clientes',
        'Suporte prioritário',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 249,
      description: 'Para controle total',
      features: [
        'Tudo do Pro',
        'Lista de espera',
        'Previsão de fluxo de caixa',
        'Cálculo de impostos',
        'Clientes ilimitados',
        'Gerente de conta dedicado',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="pt-20 pb-16 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Planos e Preços</h1>
          <p className="text-xl text-gray-600">
            Escolha o plano perfeito para seu negócio. Todos incluem teste grátis de 7 dias.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative transition-all ${
                  plan.featured ? 'md:scale-105 shadow-2xl border-blue-600' : 'shadow-lg'
                }`}
              >
                {plan.featured && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Mais Popular
                    </span>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">R$ {plan.price}</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Button className="w-full" variant={plan.featured ? 'default' : 'outline'}>
                    Começar Teste Grátis
                  </Button>

                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Perguntas Frequentes</h2>

          <div className="space-y-6">
            {[
              {
                q: 'Posso cancelar a qualquer momento?',
                a: 'Sim, você pode cancelar sua assinatura a qualquer momento, sem penalidades.',
              },
              {
                q: 'Há contrato de longo prazo?',
                a: 'Não, todos os nossos planos são mensais e podem ser cancelados a qualquer momento.',
              },
              {
                q: 'Como funciona o teste grátis?',
                a: 'Você recebe acesso completo ao plano Premium por 7 dias, sem necessidade de cartão de crédito.',
              },
              {
                q: 'Posso mudar de plano depois?',
                a: 'Sim, você pode fazer upgrade ou downgrade de plano a qualquer momento.',
              },
            ].map((item, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Comece seu teste gratuito de 7 dias agora. Sem cartão de crédito necessário.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            Começar Teste Grátis
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
