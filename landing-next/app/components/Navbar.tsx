"use client";

import { Button } from "@/components/ui/Button";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../lib/translations";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

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
        <Link href="/">
          <div className="cursor-pointer flex items-center gap-2">
            <span className="text-white font-bold text-xl">Atendo</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <a href="#funcionalidades" className="text-white/80 hover:text-white font-medium transition-colors">
            {t("navbar.funcionalidades")}
          </a>
          <a href="#planos" className="text-white/80 hover:text-white font-medium transition-colors">
            {t("navbar.planos")}
          </a>
          <Link href="/login">
            <Button variant="secondary" className="font-bold text-white hover:bg-white/10 bg-transparent border border-white/30">
              {t("navbar.entrar")}
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" className="bg-white hover:bg-white/90 text-primary shadow-soft hover:shadow-soft-hover transition-all transform hover:-translate-y-0.5 font-bold">
              {t("navbar.comecaAgora")}
            </Button>
          </Link>
        </div>

        <button 
          className="md:hidden text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border p-4 flex flex-col gap-3 shadow-xl max-h-[calc(100vh-70px)] overflow-y-auto">
          <a href="#funcionalidades" className="text-base font-medium p-3 hover:bg-muted rounded-lg transition-colors min-h-[44px] flex items-center" onClick={() => setIsOpen(false)}>
            {t("navbar.funcionalidades")}
          </a>
          <a href="#planos" className="text-base font-medium p-3 hover:bg-muted rounded-lg transition-colors min-h-[44px] flex items-center" onClick={() => setIsOpen(false)}>
            {t("navbar.planos")}
          </a>
          <div className="flex flex-col gap-2 mt-2">
            <Link href="/login">
              <Button variant="secondary" className="w-full justify-center h-12">{t("navbar.entrar")}</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" className="w-full justify-center bg-white text-primary font-bold h-12">{t("navbar.comecaAgora")}</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
