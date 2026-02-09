'use client';

import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowRight, Users, Target, Lightbulb, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Sobre o <span className="text-blue-600">Atendo</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Estamos em uma missão de transformar a forma como pequenas e médias empresas 
            gerenciam seus negócios, tornando o crescimento previsível e sustentável.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Nossa Missão</h2>
              <p className="text-lg text-gray-600 mb-6">
                Capacitar pequenos empresários com ferramentas de gestão profissional 
                que antes estavam disponíveis apenas para grandes corporações.
              </p>
              <p className="text-lg text-gray-600">
                Acreditamos que cada negócio merece a oportunidade de crescer com 
                dados, organização e estratégia.
              </p>
            </div>
            <div className="bg-blue-100 rounded-2xl p-8 text-center">
              <Target className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Foco no Cliente</h3>
              <p className="text-gray-600">Seu sucesso é nosso sucesso</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossos Valores</h2>
            <p className="text-lg text-gray-600">Princípios que guiam cada decisão que tomamos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: <Users className="w-8 h-8 text-blue-600" />,
                title: 'Clientes em Primeiro',
                description: 'Cada feature é pensada para resolver problemas reais dos nossos usuários.'
              },
              {
                icon: <Lightbulb className="w-8 h-8 text-blue-600" />,
                title: 'Inovação Constante',
                description: 'Buscamos continuamente maneiras melhores de fazer a gestão acontecer.'
              },
              {
                icon: <Award className="w-8 h-8 text-blue-600" />,
                title: 'Excelência',
                description: 'Compromisso com a qualidade em cada linha de código e cada interação.'
              },
              {
                icon: <Target className="w-8 h-8 text-blue-600" />,
                title: 'Resultados',
                description: 'Focamos em entregar valor real e mensurável para seu negócio.'
              }
            ].map((value, idx) => (
              <div key={idx} className="text-center">
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <p className="text-gray-600">Empresas atendidas</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
              <p className="text-gray-600">Agendamentos/mês</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <p className="text-gray-600">Satisfação</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para crescer conosco?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Junte-se a centenas de empresas que já transformaram sua gestão com o Atendo.
          </p>
          <Link href="/pricing">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Começar Teste Grátis
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
