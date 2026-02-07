import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  
  const t = (key: string) => {
    const keys = key.split(".");
    let value: any = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
  
  // Número do WhatsApp (formato: 55 + DDD + número)
  const phoneNumber = "5511999999999";
  const message = language === "pt" 
    ? "Olá! Gostaria de saber mais sobre o Atendo. Qual é o melhor horário para conversar?"
    : "¡Hola! Me gustaría saber más sobre Atendo. ¿Cuál es el mejor momento para conversar?";
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <>
      {/* Botão Flutuante */}
      <div className="fixed bottom-6 left-6 z-40 group">
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="glass-card px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
            <p className="text-foreground">{t("whatsapp.tooltip")}</p>
            <div className="absolute bottom-[-4px] right-4 w-2 h-2 bg-white/80 backdrop-blur-md rotate-45"></div>
          </div>
        </div>

        {/* Botão Principal */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group-hover:from-green-500 group-hover:to-green-700 relative overflow-hidden"
        >
          {/* Efeito de pulso */}
          <div className="absolute inset-0 rounded-full bg-green-400 opacity-0 animate-pulse"></div>
          
          {/* Ícone */}
          <div className="relative z-10">
            {isOpen ? (
              <X size={24} strokeWidth={2.5} />
            ) : (
              <MessageCircle size={24} strokeWidth={2} />
            )}
          </div>
        </button>
      </div>

      {/* Menu Flutuante */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-40 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="glass-card p-6 rounded-3xl max-w-xs shadow-2xl border border-white/30">
            <h3 className="text-lg font-bold text-foreground mb-2">{t("whatsapp.greeting")}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t("whatsapp.message")}
            </p>
            
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <MessageCircle size={20} />
              {t("whatsapp.button")}
            </a>

            <p className="text-xs text-muted-foreground text-center mt-3">
              {t("whatsapp.response")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
