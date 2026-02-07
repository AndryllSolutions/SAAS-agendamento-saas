import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

interface GuideItem {
  title: string;
  description: string;
  example: string;
  tips: string[];
}

const guideItems: GuideItem[] = [
  {
    title: "Lucro Desejado (%)",
    description:
      "Qual é a margem de lucro que você deseja ter em cada serviço? Este é o valor que você quer ganhar após todos os custos.",
    example:
      "Se você quer ganhar R$ 10 de lucro em um serviço que custa R$ 100, seu lucro desejado é 10%.",
    tips: [
      "Comece com 10-15% para serviços padrão",
      "Aumente para 20-30% para serviços premium",
      "Considere a concorrência do seu mercado",
      "Quanto maior, mais rentável seu negócio",
    ],
  },
  {
    title: "Marketing (%)",
    description:
      "Quanto do seu faturamento você investe em marketing e publicidade? (redes sociais, Google Ads, influenciadores, etc)",
    example:
      "Se você gasta R$ 200/mês em marketing e fatura R$ 10.000/mês, seu marketing é 2%.",
    tips: [
      "Salões iniciantes: 2-3%",
      "Salões consolidados: 1-2%",
      "Salões em expansão: 3-5%",
      "Inclua: Instagram Ads, Google My Business, influenciadores",
    ],
  },
  {
    title: "Taxa de Cartão Média (%)",
    description:
      "Qual é a taxa média que você paga ao processar pagamentos com cartão de crédito/débito?",
    example:
      "Se você paga R$ 3 de taxa em um pagamento de R$ 100, sua taxa é 3%.",
    tips: [
      "Débito: geralmente 1-2%",
      "Crédito à vista: 2-3%",
      "Crédito parcelado: 3-5%",
      "Calcule a média ponderada de seus clientes",
      "Considere também PIX (0%) e dinheiro (0%)",
    ],
  },
  {
    title: "Imposto (%)",
    description:
      "Qual é o percentual total de impostos que você paga? (ISS, ICMS, PIS, COFINS, IR, etc)",
    example:
      "Um salão que paga ISS (5%) + outros impostos pode ter ~6-8% de carga tributária.",
    tips: [
      "Serviços (ISS): 2-5% (varia por cidade)",
      "Produtos (ICMS): 7-18%",
      "Lucro (IR): 15-27,5%",
      "Consulte seu contador para valor exato",
      "Varia por regime tributário (Simples, Lucro Real, etc)",
    ],
  },
  {
    title: "Custo Fixo + Investimento (%)",
    description:
      "Qual é o percentual do seu faturamento que vai para custos fixos? (aluguel, salários, utilidades, equipamentos, etc)",
    example:
      "Se seus custos fixos são R$ 3.600/mês e você fatura R$ 10.000/mês, é 36%.",
    tips: [
      "Aluguel: 10-15% do faturamento",
      "Salários: 20-30% do faturamento",
      "Utilidades (água, luz, internet): 2-4%",
      "Manutenção de equipamentos: 1-2%",
      "Quanto menor, mais lucrativo",
    ],
  },
];

export function ParametersGuide() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="text-blue-600" size={24} />
          <CardTitle className="text-lg text-blue-900">
            📚 Guia Rápido: Como Preencher os Parâmetros
          </CardTitle>
        </div>
        <p className="text-sm text-blue-700 mt-2">
          Clique em cada item para entender melhor como calcular e preencher corretamente
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {guideItems.map((item, index) => (
          <div
            key={index}
            className="border border-blue-200 rounded-lg bg-white overflow-hidden"
          >
            <button
              onClick={() => toggleExpand(index)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="text-2xl font-bold text-blue-600 w-8">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
              {expandedIndex === index ? (
                <ChevronUp className="text-blue-600" size={20} />
              ) : (
                <ChevronDown className="text-blue-600" size={20} />
              )}
            </button>

            {expandedIndex === index && (
              <div className="px-4 py-4 bg-blue-50 border-t border-blue-200 space-y-4">
                {/* Exemplo */}
                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    💡 Exemplo Prático:
                  </p>
                  <p className="text-sm text-gray-700">{item.example}</p>
                </div>

                {/* Dicas */}
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    ✅ Dicas Importantes:
                  </p>
                  <ul className="space-y-2">
                    {item.tips.map((tip, tipIndex) => (
                      <li
                        key={tipIndex}
                        className="text-sm text-gray-700 flex items-start gap-2"
                      >
                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded text-white text-sm">
                  <p className="font-semibold mb-1">🎯 Próximo Passo:</p>
                  <p>
                    Preencha este campo com o valor que você calculou e veja como
                    afeta o preço sugerido dos seus serviços!
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Resumo Final */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900 mb-2">
            ✨ Dica de Ouro: Fórmula de Precificação
          </h4>
          <div className="bg-white p-3 rounded font-mono text-sm text-gray-700 mb-3">
            <p>Preço Sugerido = Custo Total ÷ (1 - Total de Percentuais)</p>
          </div>
          <p className="text-sm text-green-800">
            Quanto mais precisos seus parâmetros, mais preciso será o preço sugerido.
            Revise esses valores a cada 3-6 meses para manter a precificação atualizada!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
