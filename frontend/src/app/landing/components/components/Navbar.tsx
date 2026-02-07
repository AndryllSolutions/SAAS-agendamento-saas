import { Button } from "./ui/button";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../lib/translations";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AtendoLogo } from "./AtendoLogo";
import CurrencySelector from "./CurrencySelector";

export default function Navbar() {
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary transition-all duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a href="/">
          <div className="cursor-pointer">
            <AtendoLogo size="md" showText={true} textColor="light" className="text-white" />
          </div>
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          <a href="#funcionalidades" className="navbar-link text-white/80 hover:text-white font-medium transition-colors">{t("navbar.funcionalidades")}</a>

          <a href="#sobre" className="navbar-link text-white/80 hover:text-white font-medium transition-colors">{t("navbar.sobre")}</a>
          <CurrencySelector />
          <Button variant="ghost" className="navbar-button font-bold text-white hover:bg-white/10">{t("navbar.entrar")}</Button>
          <Button className="navbar-button bg-white hover:bg-white/90 text-primary shadow-soft hover:shadow-soft-hover transition-all transform hover:-translate-y-0.5 font-bold">
            {t("navbar.comecaAgora")}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border p-4 flex flex-col gap-3 shadow-xl animate-in slide-in-from-top-5 max-h-[calc(100vh-70px)] overflow-y-auto">
          <a href="#funcionalidades" className="text-base font-medium p-3 hover:bg-muted rounded-lg transition-colors min-h-[44px] flex items-center" onClick={() => setIsOpen(false)}>{t("navbar.funcionalidades")}</a>

          <a href="#sobre" className="text-base font-medium p-3 hover:bg-muted rounded-lg transition-colors min-h-[44px] flex items-center" onClick={() => setIsOpen(false)}>{t("navbar.sobre")}</a>
          <div className="flex flex-col gap-2 mt-2">
            <Button variant="outline" className="w-full justify-center h-12">{t("navbar.entrar")}</Button>
            <Button className="w-full justify-center bg-white text-primary font-bold h-12">{t("navbar.comecaAgora")}</Button>
          </div>
        </div>
      )}
    </nav>
  );
}
