"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Currency = "BRL" | "USD" | "ARS" | "PYG";

interface ExchangeRates {
  BRL: number;
  USD: number;
  ARS: number;
  PYG: number;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  rates: ExchangeRates;
  convertPrice: (priceInBRL: number) => number;
  formatPrice: (price: number) => string;
  getCurrencySymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const DEFAULT_RATES: ExchangeRates = {
  BRL: 1,
  USD: 0.20,
  ARS: 0.022,
  PYG: 0.00013,
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("BRL");
  const [rates, setRates] = useState<ExchangeRates>(DEFAULT_RATES);

  useEffect(() => {
    const savedCurrency = localStorage.getItem("selectedCurrency") as Currency | null;
    if (savedCurrency && ["BRL", "USD", "ARS", "PYG"].includes(savedCurrency)) {
      setCurrency(savedCurrency);
      return;
    }

    const detectCurrency = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        const country = data.country_code;

        if (country === "AR") {
          setCurrency("ARS");
        } else if (country === "PY") {
          setCurrency("PYG");
        } else {
          setCurrency("BRL");
        }
      } catch (error) {
        setCurrency("BRL");
      }
    };

    detectCurrency();
  }, []);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/BRL");
        const data = await response.json();
        
        if (data.rates) {
          setRates({
            BRL: 1,
            USD: data.rates.USD || DEFAULT_RATES.USD,
            ARS: data.rates.ARS || DEFAULT_RATES.ARS,
            PYG: data.rates.PYG || DEFAULT_RATES.PYG,
          });
        }
      } catch (error) {
        setRates(DEFAULT_RATES);
      }
    };

    fetchRates();
  }, []);

  const convertPrice = (priceInBRL: number): number => {
    const rate = rates[currency];
    return Math.round(priceInBRL * rate * 100) / 100;
  };

  const formatPrice = (price: number): string => {
    if (currency === "BRL") {
      return `R$ ${price.toFixed(2).replace(".", ",")}`;
    } else if (currency === "USD") {
      return `$ ${price.toFixed(2)}`;
    } else if (currency === "ARS") {
      return `$${price.toFixed(2).replace(".", ",")}`;
    } else {
      return `₲ ${Math.round(price).toLocaleString("es-PY")}`;
    }
  };

  const getCurrencySymbol = (): string => {
    if (currency === "BRL") return "R$";
    if (currency === "USD") return "$";
    if (currency === "ARS") return "$";
    return "₲";
  };

  const handleSetCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem("selectedCurrency", newCurrency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
        rates,
        convertPrice,
        formatPrice,
        getCurrencySymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
