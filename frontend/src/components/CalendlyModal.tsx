import { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendlyUrl?: string;
}

export default function CalendlyModal({
  isOpen,
  onClose,
  calendlyUrl = "https://calendly.com/agendo-suporte",
}: CalendlyModalProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Converter URL do Calendly para URL de embed
  const getEmbedUrl = (url: string) => {
    const username = url.split("/").pop();
    return `https://calendly.com/${username}?embed_domain=${typeof window !== 'undefined' ? window.location.hostname : ''}`;
  };

  useEffect(() => {
    if (isOpen) {
      // Carregar script do Calendly
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      script.onload = () => {
        // Reinicializar widgets após carregamento
        if (window.Calendly) {
          window.Calendly.initInlineWidgets();
          setIframeLoaded(true);
        }
      };
      document.body.appendChild(script);

      return () => {
        try {
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        } catch (e) {
          // Script já foi removido
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const embedUrl = getEmbedUrl(calendlyUrl);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-secondary/5 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Agende sua Demonstração</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0 ml-2"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-6">
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Escolha o melhor horário para uma conversa com nosso especialista. 
              Você receberá um link de videoconferência por email.
            </p>

            {/* Calendly Embed - Usando iframe diretamente */}
            <div className="relative w-full" style={{ minHeight: "600px" }}>
              <iframe
                src={embedUrl}
                width="100%"
                height="600"
                frameBorder="0"
                title="Calendly Scheduling"
                onLoad={() => setIframeLoaded(true)}
                style={{ minHeight: "600px" }}
              />
              
              {!iframeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-2 sm:mb-4"></div>
                    <p className="text-xs sm:text-sm text-gray-600">Carregando calendário...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3 sm:p-6 bg-gray-50 flex justify-end shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-4 sm:px-6 text-sm sm:text-base"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

// Adicionar tipagem para window.Calendly
declare global {
  interface Window {
    Calendly: any;
  }
}
