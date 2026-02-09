import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatbotWidgetProps {
  countryCode?: string;
}

export default function ChatbotWidget({ countryCode = "br" }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        countryCode === "br"
          ? "Olá! 👋 Sou o assistente Atendo. Como posso ajudá-lo hoje?"
          : "¡Hola! 👋 Soy el asistente Atendo. ¿Cómo puedo ayudarte hoy?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const { currency } = useCurrency();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getSystemPrompt = () => {
    const countryInfo =
      countryCode === "br"
        ? "Brasil (moeda: BRL)"
        : countryCode === "ar"
          ? "Argentina (moeda: ARS)"
          : "Paraguai (moeda: PYG)";

    return `Você é um assistente de suporte pré-venda para o Atendo, um sistema de gestão B2B para salões de beleza e clínicas estéticas.

Contexto:
- País: ${countryInfo}
- Idioma: ${language === "pt" ? "Português Brasileiro" : "Espanhol Neutro"}
- Produto: Atendo - Sistema de Gestão de Agenda, Financeiro e Precificação Inteligente
- Planos: Essencial (R$89), Pro (R$149), Premium (R$249), Scale (R$399+)

Diretrizes:
1. Seja amigável, profissional e conciso
2. Responda em ${language === "pt" ? "português" : "espanhol"} sempre
3. Foque em benefícios do Atendo para o negócio do usuário
4. Se não souber algo, sugira agendar uma demo com um especialista
5. Mencione conformidade local (LGPD no Brasil, Proteção de Dados na Argentina/Paraguai)
6. Seja honesto sobre limitações e sempre ofereça alternativas
7. Mantenha respostas curtas (máximo 3-4 linhas)

Tópicos que você pode ajudar:
- Funcionalidades do Atendo
- Comparação de planos
- Preços e moedas
- Conformidade e segurança
- Integração com WhatsApp
- Suporte técnico básico
- Agendamento de demos

Se o usuário quiser fazer uma compra ou tem problemas técnicos complexos, sugira contato direto via WhatsApp ou agendamento de demo.`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Chamar a IA via tRPC para processar a mensagem
      // Por enquanto, vamos simular uma resposta
      // Quando as chaves de IA estiverem configuradas, isso funcionará automaticamente

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          language === "pt"
            ? "Obrigado pela sua pergunta! Estou processando... Para uma resposta mais precisa, você pode agendar uma demo com nosso especialista ou entrar em contato via WhatsApp."
            : "¡Gracias por tu pregunta! Estoy procesando... Para una respuesta más precisa, puedes agendar una demo con nuestro especialista o contactarnos por WhatsApp.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          language === "pt"
            ? "Desculpe, ocorreu um erro. Por favor, tente novamente ou entre em contato via WhatsApp."
            : "Disculpa, ocurrió un error. Por favor, intenta de nuevo o contáctanos por WhatsApp.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-110 animate-bounce"
        aria-label={language === "pt" ? "Abrir chat" : "Abrir chat"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Widget do Chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col h-[500px] animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-t-2xl">
            <h3 className="font-bold text-lg">
              {language === "pt" ? "Assistente Atendo" : "Asistente Atendo"}
            </h3>
            <p className="text-xs text-white/80">
              {language === "pt" ? "Responde em tempo real" : "Responde en tiempo real"}
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleSendMessage();
                  }
                }}
                placeholder={language === "pt" ? "Digite sua pergunta..." : "Escribe tu pregunta..."}
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-100"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {language === "pt"
                ? "Resposta automática. Para suporte urgente, use WhatsApp."
                : "Respuesta automática. Para soporte urgente, usa WhatsApp."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
