"use client";

import LandingPage from "./landing/LandingPage";
import { LanguageProvider } from "./landing/contexts/LanguageContext";
import { CurrencyProvider } from "./landing/contexts/CurrencyContext";

export default function HomePage() {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <LandingPage />
      </CurrencyProvider>
    </LanguageProvider>
  );
}
