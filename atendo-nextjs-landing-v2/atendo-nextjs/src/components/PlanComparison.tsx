import { useState } from "react";
import { Check, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Feature {
  id: string;
  name: string;
  category: string;
  essential: boolean | string;
  pro: boolean | string;
  premium: boolean | string;
  scale: boolean | string;
}

const features: Feature[] = [
  // Agenda
  {
    id: "agenda-base",
    name: "Agenda Online",
    category: "Agenda",
    essential: true,
    pro: true,
    premium: true,
    scale: true,
  },
  {
    id: "agenda-sync",
    name: "Sincronização em Tempo Real",
    category: "Agenda",
    essential: true,
    pro: true,
    premium: true,
    scale: true,
  },
  {
    id: "agenda-notif",
    name: "Notificações Automáticas",
    category: "Agenda",
    essential: false,
    pro: true,
    premium: true,
    scale: true,
  },
  {
    id: "agenda-recur",
    name: "Agendamentos Recorrentes",
    category: "Agenda",
    essential: false,
    pro: true,
    premium: true,
    scale: true,
  },
  {
    id: "agenda-waitlist",
    name: "Lista de Espera",
    category: "Agenda",
    essential: false,
    pro: false,
    premium: true,
    scale: true,
  },

  // Financeiro
  {
    id: "fin-dashboard",
    name: "Dashboard Financeiro",
    category: "Financeiro",
    essential: true,
    pro: true,
    premium: true,
    scale: true,
  },
  {
    id: "fin-reports",
    name: "Relatórios Detalhados",
    category: "Financeiro",
    essential: false,
    pro: true,
    premium: true,
    scale: true,
  },
  {
    id: "fin-forecast",
    name: "Previsão de Fluxo de Caixa",
    category: "Financeiro",
    essential: false,
    pro: false,
    premium: true,
    scale: true,
  },
  {
    id: "fin-tax",
    name: "Cálculo de Impostos",
    category: "Financeiro",
    essential: false,
    pro: false,
    premium: true,
    scale: true,
  },
  {
    id: "fin-invoice",
    name: "Geração de Notas Fiscais",
    category: "Financeiro",
    essential: false,
    pro: false,
    premium: false,
    scale: true,
  },

  // Clientes
  {
    id: "client-db",
    name: "Banco de Dados de Clientes",
    category: "Clientes",
    essential: true,
    pro: true,
    premium: true,
    scale: true,
  },
  {
    id: "client-history",
    name: "Histórico de Atendimentos",
    category: "Clientes",
    essential: true,
    pro: true,
    premium: true,
    scale: true,
  },
  {
    id: "client-segmentation",
    name: "Segmentação de Clientes",
    category: "Clientes",
    essential: false,
    pro: true,
    premium: true,
    scale: true,
  },
  {
    id: "client-loyalty",
    name: "Programa de Fidelização",
    category: "Clientes",
    essential: false,
    pro: false,
    premium: true,
    scale: true,
  },

  // Integrações
  {
    id: "int-whatsapp",
    name: "Integração WhatsApp",
    category: "Integrações",
    essential: false,
    pro: true,
    premium: true,
    scale: true,
  },
  {
    id: "int-email",
    name: "Integração Email",
    category: "Integrações",
    essential: false,
    pro: true,
    premium: true,
    scale: true,
  },
  {
    id: "int-payment",
    name: "Integração Pagamento Online",
    category: "Integrações",
    essential: false,
    pro: false,
    premium: true,
    scale: true,
  },
  {
    id: "int-api",
    name: "API Customizada",
    category: "Integrações",
    essential: false,
    pro: false,
    premium: false,
    scale: true,
  },

  // Suporte
  {
    id: "support-email",
    name: "Suporte por Email",
    category: "Suporte",
    essential: true,
    pro: true,
    premium: true,
    scale: true,
  },
  {
    id: "support-chat",
    name: "Suporte por Chat",
    category: "Suporte",
    essential: false,
    pro: true,
    premium: true,
    scale: true,
  },
  {
    id: "support-phone",
    name: "Suporte Telefônico",
    category: "Suporte",
    essential: false,
    pro: false,
    premium: true,
    scale: true,
  },
  {
    id: "support-dedicated",
    name: "Gerente de Conta Dedicado",
    category: "Suporte",
    essential: false,
    pro: false,
    premium: false,
    scale: true,
  },
];

const categories = ["Todos", "Agenda", "Financeiro", "Clientes", "Integrações", "Suporte"];

const plans = [
  { id: "essential", name: "Essencial", color: "blue" },
  { id: "pro", name: "Pro", color: "primary" },
  { id: "premium", name: "Premium", color: "purple" },
  { id: "scale", name: "Scale", color: "orange" },
];

export default function PlanComparison() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredFeatures = features.filter((feature) =>
    selectedCategory === "Todos" ? true : feature.category === selectedCategory
  );

  const getFeatureValue = (feature: Feature, plan: string) => {
    return feature[plan as keyof Feature];
  };

  const FeatureIcon = ({ value }: { value: boolean | string }) => {
    if (typeof value === "string") {
      return <span className="text-sm font-semibold text-gray-700">{value}</span>;
    }
    return value ? (
      <Check className="w-5 h-5 text-green-500 mx-auto" />
    ) : (
      <X className="w-5 h-5 text-gray-300 mx-auto" />
    );
  };

  return (
    <div className="w-full">
      {/* Filter Buttons */}
      <div className="mb-8 flex flex-wrap gap-3 justify-center">
        <div className="flex items-center gap-2 mr-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700">Filtrar por:</span>
        </div>
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => setSelectedCategory(category)}
            variant={selectedCategory === category ? "default" : "outline"}
            className={`rounded-full ${
              selectedCategory === category
                ? "bg-primary text-white"
                : "border-gray-300 text-gray-700 hover:border-primary"
            }`}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Comparison Table */}
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-200 shadow-soft">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 w-1/4">
                Funcionalidade
              </th>
              {plans.map((plan) => (
                <th
                  key={plan.id}
                  className="px-6 py-4 text-center text-sm font-bold text-gray-900 w-1/6"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span>{plan.name}</span>
                    <span className="text-xs font-normal text-gray-600">
                      {plan.id === "essential" && "R$ 89/mês"}
                      {plan.id === "pro" && "R$ 149/mês"}
                      {plan.id === "premium" && "R$ 249/mês"}
                      {plan.id === "scale" && "A partir de R$ 399/mês"}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {filteredFeatures.map((feature, idx) => (
              <tr
                key={feature.id}
                className={`transition-colors hover:bg-gray-50 ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{feature.name}</span>
                    <span className="text-xs text-gray-500 mt-1">{feature.category}</span>
                  </div>
                </td>
                {plans.map((plan) => (
                  <td key={`${feature.id}-${plan.id}`} className="px-6 py-4 text-center">
                    <FeatureIcon value={getFeatureValue(feature, plan.id)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-6">
        {plans.map((plan) => (
          <div key={plan.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-soft">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-4">
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <p className="text-sm font-semibold text-gray-600 mt-1">
                {plan.id === "essential" && "R$ 89/mês"}
                {plan.id === "pro" && "R$ 149/mês"}
                {plan.id === "premium" && "R$ 249/mês"}
                {plan.id === "scale" && "A partir de R$ 399/mês"}
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredFeatures.map((feature) => (
                <div key={feature.id} className="px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{feature.name}</span>
                  <div className="ml-2">
                    <FeatureIcon value={getFeatureValue(feature, plan.id)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const enabledFeatures = filteredFeatures.filter(
            (f) => getFeatureValue(f, plan.id) === true
          ).length;
          const totalFeatures = filteredFeatures.length;

          return (
            <div
              key={plan.id}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200"
            >
              <h4 className="font-bold text-gray-900 mb-2">{plan.name}</h4>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {enabledFeatures}
                </span>
                <span className="text-gray-600">de {totalFeatures} funcionalidades</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    plan.id === "essential"
                      ? "bg-blue-500"
                      : plan.id === "pro"
                      ? "bg-primary"
                      : plan.id === "premium"
                      ? "bg-purple-500"
                      : "bg-orange-500"
                  }`}
                  style={{ width: `${(enabledFeatures / totalFeatures) * 100}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Section */}
      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-6">
          Não tem certeza qual plano é melhor para você? Fale com nosso especialista!
        </p>
        <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-soft hover:shadow-lg">
          Conversar com Especialista
        </Button>
      </div>
    </div>
  );
}
