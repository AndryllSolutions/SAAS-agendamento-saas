import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { getFAQByCountry, getAllFAQCategories, type FAQItem } from "../lib/faqData";
import { useCurrency } from "../contexts/CurrencyContext";

interface FAQSectionProps {
  countryCode?: string;
}

export default function FAQSection({ countryCode = "br" }: FAQSectionProps) {
  const { currency } = useCurrency();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("geral");

  const countryFAQ = getFAQByCountry(countryCode);
  const categories = getAllFAQCategories();
  const filteredFAQs = countryFAQ.faqs.filter((faq) => faq.category === selectedCategory);

  const categoryLabels: Record<string, string> = {
    geral: countryCode === "br" ? "Geral" : "General",
    impostos: countryCode === "br" ? "Impostos" : "Impuestos",
    suporte: countryCode === "br" ? "Suporte" : "Soporte",
    conformidade: countryCode === "br" ? "Conformidade" : "Cumplimiento",
    integracao: countryCode === "br" ? "Integração" : "Integración",
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
            {countryCode === "br" ? "Perguntas Frequentes" : "Preguntas Frecuentes"}
          </h2>
          <p className="text-lg text-muted-foreground">
            {countryCode === "br"
              ? "Respostas específicas para sua região"
              : "Respuestas específicas para tu región"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {countryCode === "br"
              ? `Informações para ${countryFAQ.country} (${countryFAQ.currency})`
              : `Información para ${countryFAQ.country} (${countryFAQ.currency})`}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setExpandedId(null);
              }}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`rounded-full px-6 py-2 transition-all ${
                selectedCategory === category
                  ? "bg-primary text-white shadow-soft"
                  : "border-2 hover:border-primary/50"
              }`}
            >
              {categoryLabels[category] || category}
            </Button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <button
                  onClick={() => toggleExpanded(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${
                      expandedId === faq.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedId === faq.id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {countryCode === "br"
                  ? "Nenhuma pergunta nesta categoria"
                  : "No hay preguntas en esta categoría"}
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            {countryCode === "br"
              ? "Não encontrou sua pergunta?"
              : "¿No encontraste tu pregunta?"}
          </p>
          <Button
            variant="outline"
            className="rounded-full px-8 py-3 border-2 hover:bg-primary/5"
          >
            {countryCode === "br" ? "Enviar Mensagem" : "Enviar Mensaje"}
          </Button>
        </div>
      </div>
    </section>
  );
}
