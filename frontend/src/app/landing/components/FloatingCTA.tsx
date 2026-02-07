import { useState, useEffect } from "react";
import { X, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

interface FloatingCTAProps {
  onScheduleDemo: () => void;
}

export default function FloatingCTA({ onScheduleDemo }: FloatingCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Mostrar após 5 segundos
    const timer = setTimeout(() => setIsVisible(true), 5000);

    // Detectar scroll
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!isVisible || !isScrolled) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={() => setIsVisible(false)}
      />

      {/* Floating CTA Card */}
      <div className="fixed bottom-8 right-8 z-50 animate-slide-in-up">
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm border border-border">
          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="pr-8">
            <h3 className="text-xl font-bold mb-2">Pronto para começar?</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Agende uma demonstração gratuita e veja como o Atendo pode transformar seu negócio.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={onScheduleDemo}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
              >
                Agendar Demo Agora
                <ArrowRight size={16} className="ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsVisible(false)}
                className="w-full"
              >
                Talvez Depois
              </Button>
            </div>
          </div>

          {/* Badge */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              ✓ Sem cartão de crédito • ✓ Acesso imediato • ✓ Suporte 24/7
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
