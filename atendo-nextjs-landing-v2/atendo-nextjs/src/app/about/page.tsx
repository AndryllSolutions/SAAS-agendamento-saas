'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="pt-20 pb-16 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Sobre o Atendo</h1>
          <p className="text-xl text-gray-600">
            Transformando negócios através de tecnologia inteligente
          </p>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Target className="w-8 h-8 text-blue-600 mb-4" />
                <CardTitle>Nossa Missão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Capacitar pequenos e médios negócios com ferramentas de gestão inteligentes que transformam dados em decisões lucrativas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="w-8 h-8 text-blue-600 mb-4" />
                <CardTitle>Nossa Visão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ser a plataforma de gestão mais confiável e intuitiva para profissionais que querem crescer de forma previsível.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-blue-600 mb-4" />
                <CardTitle>Nossos Valores</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Simplicidade, transparência e foco no sucesso dos nossos clientes. Acreditamos que tecnologia deve ser acessível.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Nossa História</h2>
          <div className="space-y-6 text-gray-600 leading-relaxed">
            <p>
              O Atendo nasceu da frustração de profissionais que não conseguiam gerenciar seus negócios de forma eficiente. 
              Nosso founder percebeu que a maioria das ferramentas de gestão eram complexas, caras e não atendiam às necessidades reais.
            </p>
            <p>
              Em 2022, começamos a desenvolver uma solução que fosse simples, intuitiva e focada em resultados. 
              Hoje, o Atendo ajuda milhares de profissionais a organizar suas agendas, controlar seus financeiros e crescer de forma previsível.
            </p>
            <p>
              Nossa missão é continuar inovando e entregando valor real aos nossos clientes, sempre mantendo o foco em simplicidade e resultados.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Nosso Time</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { name: 'João Silva', role: 'CEO & Founder', image: '👨‍💼' },
              { name: 'Maria Santos', role: 'CTO', image: '👩‍💻' },
              { name: 'Pedro Costa', role: 'Product Manager', image: '👨‍💼' },
              { name: 'Ana Oliveira', role: 'Head of Support', image: '👩‍💼' },
            ].map((member, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-4">{member.image}</div>
                  <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600 mt-2">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
