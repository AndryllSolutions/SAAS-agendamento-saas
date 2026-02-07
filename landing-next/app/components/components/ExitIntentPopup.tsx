import { useState, useEffect } from "react";
import { X, MessageCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ExitIntentPopupProps {
  onClose?: () => void;
}

export default function ExitIntentPopup({ onClose }: ExitIntentPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { language } = useLanguage();
  const { currency } = useCurrency();

  // Detectar exit-intent
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Verificar se o mouse saiu pela parte superior da página
      if (e.clientY <= 0 && !isOpen && !isSubmitted) {
        // Verificar se o popup já foi mostrado nesta sessão
        const popupShown = sessionStorage.getItem("exitIntentPopupShown");
        if (!popupShown) {
          setIsOpen(true);
          sessionStorage.setItem("exitIntentPopupShown", "true");
        }
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [isOpen, isSubmitted]);

  const validatePhoneNumber = (phone: string): boolean => {
    // Remover caracteres não numéricos
    const cleaned = phone.replace(/\D/g, "");

    // Validar conforme o país
    if (currency === "ARS") {
      // Argentina: 10-11 dígitos
      return cleaned.length >= 10 && cleaned.length <= 11;
    } else if (currency === "PYG") {
      // Paraguai: 9-10 dígitos
      return cleaned.length >= 9 && cleaned.length <= 10;
    } else {
      // Brasil: 10-11 dígitos
      return cleaned.length >= 10 && cleaned.length <= 11;
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, "");

    if (currency === "ARS") {
      // Argentina: +54 9 XXXX XXXXXX
      if (cleaned.length === 10) return `+54 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
      if (cleaned.length === 11) return `+54 9 ${cleaned.slice(1, 5)} ${cleaned.slice(5)}`;
    } else if (currency === "PYG") {
      // Paraguai: +595 XXXXXXXXX
      if (cleaned.length === 9) return `+595 ${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      if (cleaned.length === 10) return `+595 ${cleaned.slice(1, 4)} ${cleaned.slice(4)}`;
    } else {
      // Brasil: +55 (XX) XXXXX-XXXX
      if (cleaned.length === 10) return `+55 (${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
      if (cleaned.length === 11) return `+55 (${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }

    return phone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phoneNumber.trim()) {
      setError(language === "pt" ? "Digite seu número de WhatsApp" : "Ingresa tu número de WhatsApp");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError(
        language === "pt"
          ? "Número de WhatsApp inválido para sua região"
          : "Número de WhatsApp inválido para tu región"
      );
      return;
    }

    setIsLoading(true);

    try {
      // Aqui você pode enviar o número para seu backend
      // Por enquanto, vamos simular o envio
      const formattedPhone = formatPhoneNumber(phoneNumber);

      // Simular envio para backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Número de WhatsApp capturado:", formattedPhone);

      // Armazenar no localStorage para referência
      const leads = JSON.parse(localStorage.getItem("atendoLeads") || "[]");
      leads.push({
        phone: formattedPhone,
        timestamp: new Date().toISOString(),
        country: currency === "ARS" ? "AR" : currency === "PYG" ? "PY" : "BR",
      });
      localStorage.setItem("atendoLeads", JSON.stringify(leads));

      setIsSubmitted(true);
      setPhoneNumber("");

      // Fechar popup após 3 segundos
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err) {
      setError(language === "pt" ? "Erro ao enviar. Tente novamente." : "Error al enviar. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in scale-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
          aria-label="Fechar"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                {language === "pt" ? "Espera! 👋" : "¡Espera! 👋"}
              </h2>
              <p className="text-sm text-white/90">
                {language === "pt"
                  ? "Receba uma proposta personalizada no WhatsApp"
                  : "Recibe una propuesta personalizada en WhatsApp"}
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-gray-700 mb-6 text-center text-sm">
                {language === "pt"
                  ? "Deixe seu número de WhatsApp e nosso especialista entrará em contato com uma proposta customizada para seu negócio."
                  : "Deja tu número de WhatsApp y nuestro especialista se pondrá en contacto con una propuesta personalizada para tu negocio."}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === "pt" ? "Seu número de WhatsApp" : "Tu número de WhatsApp"}
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setError("");
                    }}
                    placeholder={
                      currency === "ARS"
                        ? "+54 9 1234 5678"
                        : currency === "PYG"
                          ? "+595 123 456789"
                          : "+55 (11) 98765-4321"
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary transition-colors"
                    disabled={isLoading}
                  />
                  {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105"
                >
                  {isLoading
                    ? language === "pt"
                      ? "Enviando..."
                      : "Enviando..."
                    : language === "pt"
                      ? "Enviar Número"
                      : "Enviar Número"}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  {language === "pt"
                    ? "Não compartilharemos seu número com terceiros"
                    : "No compartiremos tu número con terceros"}
                </p>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-center text-xs text-gray-600">
              {language === "pt"
                ? "Resposta em até 2 horas úteis"
                : "Respuesta en hasta 2 horas hábiles"}
            </div>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 rounded-full p-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {language === "pt" ? "Obrigado! ✓" : "¡Gracias! ✓"}
              </h2>

              <p className="text-gray-700 mb-6">
                {language === "pt"
                  ? "Recebemos seu número. Nosso especialista entrará em contato em breve com uma proposta personalizada."
                  : "Recibimos tu número. Nuestro especialista se pondrá en contacto pronto con una propuesta personalizada."}
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  {language === "pt"
                    ? "💡 Dica: Abra o WhatsApp agora para não perder a mensagem"
                    : "💡 Consejo: Abre WhatsApp ahora para no perder el mensaje"}
                </p>
              </div>

              <Button
                onClick={handleClose}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg"
              >
                {language === "pt" ? "Fechar" : "Cerrar"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
