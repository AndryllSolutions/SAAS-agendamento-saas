import { Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../utils';
import dynamic from 'next/dynamic';

const PLANS = [
  {
    name: 'Free',
    price: 'R$ 0',
    description: 'Para pequenos negócios começando com agendamentos',
    features: [
      'Até 3 profissionais',
      '100 agendamentos/mês',
      'Notificações básicas',
      'Suporte por email',
    ],
    cta: 'Começar grátis',
    featured: false,
  },
  {
    name: 'Premium',
    price: 'R$ 199',
    description: 'Para negócios em crescimento',
    features: [
      'Até 10 profissionais',
      'Agendamentos ilimitados',
      'Notificações SMS',
      'Integração com calendário',
      'Relatórios básicos',
      'Suporte prioritário',
    ],
    cta: 'Assinar agora',
    featured: true,
  },
  {
    name: 'Plus',
    price: 'R$ 399',
    description: 'Para negócios estabelecidos',
    features: [
      'Profissionais ilimitados',
      'Agendamentos ilimitados',
      'Notificações SMS e WhatsApp',
      'Integração completa',
      'Relatórios avançados',
      'Dashboard personalizado',
      'Suporte 24/7',
      'Treinamento exclusivo',
    ],
    cta: 'Assinar agora',
    featured: false,
  },
];

export const PricingPage = () => {
  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Planos que se adaptam ao seu negócio
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Escolha o plano perfeito para suas necessidades de agendamento
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'bg-white rounded-lg shadow-lg overflow-hidden',
                plan.featured ? 'ring-2 ring-indigo-600 transform scale-105' : ''
              )}
            >
              {plan.featured && (
                <div className="bg-indigo-600 px-4 py-2 text-center text-white font-semibold">
                  Mais popular
                </div>
              )}
              
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                <p className="mt-2 text-gray-600">{plan.description}</p>
                
                <div className="mt-6">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-lg font-medium text-gray-500">
                    {plan.name !== 'Free' && '/mês'}
                  </span>
                </div>
                
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <Button
                    variant={plan.featured ? 'primary' : 'default'}
                    className="w-full py-3 text-base font-medium"
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Comparação de planos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funcionalidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Free
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Premium
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plus
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Profissionais
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Até 3
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Até 10
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Ilimitados
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Agendamentos
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    100/mês
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Ilimitados
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Ilimitados
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Notificações
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Email
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Email + SMS
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Email + SMS + WhatsApp
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(PricingPage), { ssr: false });

// Evita geração estática durante o build
export async function getServerSideProps() {
  return { props: {} };
}
