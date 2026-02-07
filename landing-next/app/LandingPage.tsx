"use client";

import CurrencySwitcher from "./components/CurrencySwitcher";
import Navbar from "./components/Navbar";
import WhatsAppButton from "./components/WhatsAppButton";
import PlanCheckoutButton from "./components/PlanCheckoutButton";
import DemoCarousel from "./components/DemoCarousel";
import ROICalculator from "./components/ROICalculator";
import PlanComparison from "./components/PlanComparison";
import CalendlyModal from "./components/CalendlyModal";
import FAQSection from "./components/FAQSection";
import ChatbotWidget from "./components/ChatbotWidget";
import ExitIntentPopup from "./components/ExitIntentPopup";
import TestimonialCarousel from "./components/TestimonialCarousel";
import TestimonialsSection from "./components/TestimonialsSection";
import FloatingCTA from "./components/FloatingCTA";
import FooterImproved from "./components/FooterImproved";
import { useCalendly } from "./hooks/useCalendly";
import { usePageTitle } from "./hooks/usePageTitle";
import { useGeoLocation } from "./hooks/useGeoLocation";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { useLanguage } from "./contexts/LanguageContext";
import { useCurrency } from "./contexts/CurrencyContext";
import { useAuth } from "./_core/hooks/useAuth";
import { translations } from "./lib/translations";
import { Check, ChevronRight, DollarSign, LayoutDashboard, Star, TrendingUp, Users, MessageCircle, PenTool, Calculator } from "lucide-react";
import React from "react";

export default function Home() {
  usePageTitle('Home');
  useGeoLocation(); // Detectar país e configurar idioma/moeda automaticamente
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const { language } = useLanguage();
  const { currency, convertPrice, formatPrice } = useCurrency();
  const { isOpen: isCalendlyOpen, open: openCalendly, close: closeCalendly } = useCalendly();
  const [isAnnual, setIsAnnual] = React.useState(true);
  
  const calendlyUrl = "https://calendly.com/agendo-suporte";
  
  const t = (key: string) => {
    const keys = key.split(".");
    let value: any = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <Navbar />
      <CurrencySwitcher />
      
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/10 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-in-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-primary/10 shadow-sm text-primary text-sm font-bold">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                {t("hero.badge")}
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-heading font-extrabold leading-tight text-foreground">
                {t("hero.headline").split(" ").map((word: string, i: number) => 
                  word === "lucro" || word === "ganancias" ? (
                    <span key={i} className="text-primary relative">
                      {word}{" "}
                      <svg className="absolute w-full h-3 -bottom-1 left-0 text-secondary/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                        <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                      </svg>
                    </span>
                  ) : (
                    <span key={i}>{word} </span>
                  )
                )}
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                {t("hero.subheadline")}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6 rounded-xl shadow-soft hover:shadow-soft-hover transition-all transform hover:-translate-y-1">
                  {t("hero.cta1")}
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl border-2 hover:bg-muted/50" onClick={openCalendly}>
                  {language === "pt" ? "Agendar Demo" : "Agendar Demostración"}
                </Button>
              </div>

              {/* Botão Destacado de Teste Grátis */}
              <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border-2 border-primary/20 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-1">{t("hero.trial")}</h3>
                    <p className="text-muted-foreground">{t("hero.trialSubtitle")}</p>
                  </div>
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white text-lg px-8 py-3 rounded-xl shadow-soft hover:shadow-soft-hover transition-all transform hover:-translate-y-1 whitespace-nowrap">
                    {language === "pt" ? "Começar Teste" : "Comenzar Prueba"}
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                {[t("hero.bullet1"), t("hero.bullet2"), t("hero.bullet3")].map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:h-auto flex items-center justify-center animate-slide-in-right" style={{ animationDelay: "0.2s" }}>
              <div className="relative z-10 w-full">
                <img 
                  src="/hero_atendo.png" 
                  alt="Atendo Dashboard - Sistema de Agendamento com Controle Financeiro" 
                  loading="lazy"
                  className="w-full h-auto rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BEFORE/AFTER SECTION */}
      {/* FREE TRIAL SECTION */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-16 animate-slide-in-up">
            <img 
              src={language === "pt" ? "/teste_gratis_pt.png" : "/teste_gratis_es.png"}
              alt={language === "pt" ? "Teste Grátis por 7 Dias" : "Prueba Gratis por 7 Días"}
              loading="lazy"
              className="w-full h-auto rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300"
            />
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-20 bg-muted/30 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16 animate-slide-in-up">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              {t("problem.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("problem.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: t("problem.card1Title"), desc: t("problem.card1Desc"), icon: "😫" },
              { title: t("problem.card2Title"), desc: t("problem.card2Desc"), icon: "💸" },
              { title: t("problem.card3Title"), desc: t("problem.card3Desc"), icon: "📊" }
            ].map((card: any, i: number) => (
              <div
                key={i}
                className="bg-muted/30 p-8 rounded-3xl border border-border hover:border-primary/30 transition-all hover:shadow-lg group animate-slide-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 animate-float" style={{ animationDelay: `${0.5 + i * 0.2}s` }}>{card.icon}</div>
                <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                <p className="text-muted-foreground">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 animate-slide-in-left" style={{ animationDelay: "0.2s" }}>
              <img 
                src="/images/hero-salon.jpg" 
                alt="Imagem de um salão de beleza moderno com profissionais atendendo clientes" 
                loading="lazy"
                className="rounded-3xl shadow-2xl object-cover h-[500px] w-full"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-8 animate-slide-in-right">
              <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm">
                {t("solution.badge")}
              </div>
              <h2 className="text-4xl font-heading font-bold">
                {t("solution.title")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t("solution.description")}
              </p>
              
              <div className="space-y-4">
                {[t("solution.point1"), t("solution.point2"), t("solution.point3"), t("solution.point4")].map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-border/50">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES VISUAL SECTION */}
      <section className="py-20 bg-muted/20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mb-16 animate-slide-in-up flex justify-center">
            <img 
              src={language === 'es' ? '/atendo_features_es.png' : '/atendo_features_pt.png'} 
              alt={language === 'es' ? "App Atendo mostrando Agenda Inteligente en smartphone" : "App Atendo mostrando Agenda Inteligente em smartphone"} 
              loading="lazy"
              className="w-full max-w-sm h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="funcionalidades" className="py-24 bg-white relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>

        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-slide-in-up">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              {t("features.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { key: "agenda", icon: <LayoutDashboard className="w-6 h-6" /> },
              { key: "financeiro", icon: <DollarSign className="w-6 h-6" /> },
              { key: "clientes", icon: <Users className="w-6 h-6" /> },
              { key: "relatorios", icon: <TrendingUp className="w-6 h-6" /> },
              { key: "metas", icon: <Star className="w-6 h-6" /> },
              { key: "whatsapp", icon: <MessageCircle className="w-6 h-6" /> },
              { key: "assinatura", icon: <PenTool className="w-6 h-6" /> },
              { key: "precificacao", icon: <Calculator className="w-6 h-6" /> },
            ].map((feature: any, i: number) => {
              const isClickable = feature.key === "precificacao";
              return (
              <div
                key={i}
                onClick={() => {
                  if (isClickable) {
                    window.location.href = "/dashboard/pricing";
                  }
                }}
                className={isClickable ? "cursor-pointer" : ""}
              >
                <Card
                  className="border-none shadow-soft hover:shadow-soft-hover transition-all duration-300 hover:-translate-y-1 bg-muted/20 animate-slide-in-up feature-card"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary mb-2">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{t(`features.${feature.key}.title`)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{t(`features.${feature.key}.desc`)}</p>
                  </CardContent>
                </Card>
              </div>
            );
            })
            }
          </div>
        </div>
      </section>

      {/* DIFFERENTIALS SECTION */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-white blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 animate-slide-in-left">
              <h2 className="text-4xl font-heading font-bold">
                {t("differentials.pricing.title")}
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                {t("differentials.pricing.description")}
              </p>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white shrink-0">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{t("differentials.pricing.highlight")}</h4>
                    <p className="text-blue-100 text-sm">{t("differentials.pricing.highlightDesc")}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="glass-card bg-white/10 p-8 rounded-3xl border border-white/20 animate-slide-in-right" style={{ animationDelay: "0.2s" }}>
              <div className="space-y-6">
                <h3 className="text-2xl font-bold mb-4">{t("differentials.consulting.title")}</h3>
                <p className="text-blue-100">
                  {t("differentials.consulting.description")}
                </p>
                <ul className="space-y-3">
                  {[
                    t("differentials.consulting.point1"),
                    t("differentials.consulting.point2"),
                    t("differentials.consulting.point3"),
                    t("differentials.consulting.point4")
                  ].map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">✓</div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="planos" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              {t("pricing.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("pricing.subtitle")}
            </p>
            
            {/* Toggle Mensal/Anual */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={`text-sm font-medium ${!isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>Mensal</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  isAnnual ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>Anual</span>
              {isAnnual && <span className="ml-2 text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">Economize 25%</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto animate-slide-in-up">
            {/* ESSENTIAL */}
            <Card className="border-none shadow-soft hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <CardHeader className="pb-8">
                <div className="w-12 h-1 bg-blue-300 mb-6 rounded-full"></div>
                <CardTitle className="text-2xl">{t("pricing.essential.name")}</CardTitle>
                <CardDescription className="text-base mt-2">{t("pricing.essential.subtitle")}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold">
                    {formatPrice(convertPrice(isAnnual ? 111 : Math.round(111 * 1.25)))}
                  </span>
                  <span className="text-muted-foreground">{isAnnual ? '/mês (anual)' : '/mês'}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  t("pricing.essential.features.0"),
                  t("pricing.essential.features.1"),
                  t("pricing.essential.features.2"),
                  t("pricing.essential.features.3")
                ].map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <Check size={16} className="text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="pt-8">
                <PlanCheckoutButton
                  planName="essential"
                  currency={currency}
                  language={language}
                  className="w-full bg-blue-100 text-primary hover:bg-blue-200 font-bold"
                >
                  {t("pricing.essential.cta")}
                </PlanCheckoutButton>
              </CardFooter>
            </Card>

            {/* PRO - MOST POPULAR */}
            <Card className="border-2 border-primary shadow-2xl relative transform md:-translate-y-4 z-10 animate-scale-in hover:shadow-3xl transition-all duration-300">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-primary to-secondary text-white text-center text-xs font-bold py-2 px-4 rounded-full uppercase tracking-wider shadow-lg">
                  ⭐ {t("pricing.pro.badge")} ⭐
                </div>
              </div>
              <CardHeader className="pb-8 pt-10">
                <div className="w-12 h-1 bg-primary mb-6 rounded-full"></div>
                <CardTitle className="text-2xl">{t("pricing.pro.name")}</CardTitle>
                <CardDescription className="text-base mt-2">{t("pricing.pro.subtitle")}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold">
                    {formatPrice(convertPrice(isAnnual ? 186 : Math.round(186 * 1.25)))}
                  </span>
                  <span className="text-muted-foreground">{isAnnual ? '/mês (anual)' : '/mês'}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  t("pricing.pro.features.0"),
                  t("pricing.pro.features.1"),
                  t("pricing.pro.features.2"),
                  t("pricing.pro.features.3"),
                  t("pricing.pro.features.4")
                ].map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-medium">
                    <Check size={16} className="text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="pt-8">
                <PlanCheckoutButton
                  planName="pro"
                  currency={currency}
                  language={language}
                  className="w-full bg-accent text-white hover:bg-accent/90 font-bold shadow-lg border-none"
                >
                  {t("pricing.pro.cta")}
                </PlanCheckoutButton>
              </CardFooter>
            </Card>

            {/* PREMIUM */}
            <Card className="border-none shadow-soft hover:shadow-xl transition-all duration-300 relative overflow-hidden bg-gray-900 text-white">
              <CardHeader className="pb-8">
                <div className="w-12 h-1 bg-secondary mb-6 rounded-full"></div>
                <CardTitle className="text-2xl text-white">{t("pricing.premium.name")}</CardTitle>
                <CardDescription className="text-base mt-2 text-gray-400">{t("pricing.premium.subtitle")}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold">
                    {formatPrice(convertPrice(isAnnual ? 311 : Math.round(311 * 1.25)))}
                  </span>
                  <span className="text-gray-400">{isAnnual ? '/mês (anual)' : '/mês'}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  t("pricing.premium.features.0"),
                  t("pricing.premium.features.1"),
                  t("pricing.premium.features.2"),
                  t("pricing.premium.features.3"),
                  t("pricing.premium.features.4")
                ].map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="bg-secondary/20 p-1 rounded-full">
                      <Check size={12} className="text-secondary" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="pt-8">
                <PlanCheckoutButton
                  planName="premium"
                  currency={currency}
                  language={language}
                  className="w-full bg-secondary text-white hover:bg-secondary/90 font-bold shadow-lg border-none"
                >
                  {t("pricing.premium.cta")}
                </PlanCheckoutButton>
              </CardFooter>
            </Card>

            {/* SCALE */}
            <Card className="border-none shadow-soft hover:shadow-xl transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
              <CardHeader className="pb-8">
                <div className="w-12 h-1 bg-gradient-to-r from-primary to-secondary mb-6 rounded-full"></div>
                <CardTitle className="text-2xl">{t("pricing.scale.name")}</CardTitle>
                <CardDescription className="text-base mt-2">{t("pricing.scale.subtitle")}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold text-primary">
                    {formatPrice(convertPrice(isAnnual ? 498 : Math.round(498 * 1.25)))}
                  </span>
                  <span className="text-muted-foreground">{isAnnual ? '/mês (anual)' : '/mês'}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  t("pricing.scale.features.0"),
                  t("pricing.scale.features.1"),
                  t("pricing.scale.features.2"),
                  t("pricing.scale.features.3"),
                  t("pricing.scale.features.4")
                ].map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <Check size={16} className="text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="pt-8">
                <PlanCheckoutButton
                  planName="scale"
                  currency={currency}
                  language={language}
                  className="w-full bg-primary text-white hover:bg-primary/90 font-bold"
                >
                  {t("pricing.scale.cta")}
                </PlanCheckoutButton>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* PLAN COMPARISON SECTION */}
      <section id="comparacao" className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-slide-in-up">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              {t("comparison.title") || "Compare os Planos"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("comparison.subtitle") || "Veja todas as funcionalidades de cada plano e escolha o melhor para seu negócio"}
            </p>
          </div>
          <PlanComparison />
          
          <div className="mt-12 text-center">
            <Button 
              size="lg" 
              onClick={openCalendly}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-soft hover:shadow-lg"
            >
              {language === "pt" ? "Agendar Demonstração Agora" : "Agendar Demostración Ahora"}
            </Button>
          </div>
        </div>
      </section>

      {/* ROI CALCULATOR SECTION */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-slide-in-up">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              Quanto você pode ganhar?
            </h2>
            <p className="text-lg text-muted-foreground">
              Use nossa calculadora para descobrir o impacto da precificação inteligente no seu negócio
            </p>
          </div>
          <ROICalculator />
        </div>
      </section>

      {/* TESTIMONIALS SECTION - IMPROVED */}
      <TestimonialsSection />

      {/* FAQ SECTION */}
      <FAQSection countryCode={currency === "ARS" ? "ar" : currency === "PYG" ? "py" : "br"} />

      {/* FINAL CTA */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10 animate-slide-in-up">
          <h2 className="text-4xl md:text-5xl font-heading font-extrabold mb-6">
            {t("finalCta.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {t("finalCta.description")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg px-10 py-6 rounded-xl shadow-soft hover:shadow-soft-hover transition-all transform hover:-translate-y-1">
              {t("finalCta.cta1")}
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-10 py-6 rounded-xl border-2 hover:bg-muted/50" onClick={openCalendly}>
              {language === "pt" ? "Agendar Demonstração" : "Agendar Demostración"}
            </Button>
          </div>
        </div>
      </section>

      <CalendlyModal isOpen={isCalendlyOpen} onClose={closeCalendly} calendlyUrl={calendlyUrl} />
      <ChatbotWidget countryCode={currency === "ARS" ? "ar" : currency === "PYG" ? "py" : "br"} />
      <ExitIntentPopup />
      <WhatsAppButton />
      <FloatingCTA onScheduleDemo={openCalendly} />
      <FooterImproved />
    </div>
  );
}
