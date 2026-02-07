import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full p-1 shadow-lg border border-border">
      <button
        onClick={() => setLanguage("pt")}
        className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 ${
          language === "pt"
            ? "bg-primary text-white shadow-md"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        PT
      </button>
      <div className="w-px h-6 bg-border"></div>
      <button
        onClick={() => setLanguage("es")}
        className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 ${
          language === "es"
            ? "bg-primary text-white shadow-md"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        ES
      </button>
      <div className="w-px h-6 bg-border"></div>
      <div className="px-3 text-muted-foreground">
        <Globe size={18} />
      </div>
    </div>
  );
}
