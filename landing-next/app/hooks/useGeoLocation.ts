"use client";

import { useEffect } from "react";
import { useCurrency, type Currency } from "../contexts/CurrencyContext";
import { useLanguage } from "../contexts/LanguageContext";

interface GeoLocationData {
  country_code: string;
  country_name: string;
}

const COUNTRY_CONFIG: Record<string, { language: "pt" | "es"; currency: Currency }> = {
  "BR": { language: "pt", currency: "BRL" },
  "AR": { language: "es", currency: "ARS" },
  "PY": { language: "es", currency: "PYG" },
};

export function useGeoLocation() {
  const { setCurrency } = useCurrency();
  const { setLanguage } = useLanguage();

  useEffect(() => {
    const detectAndSetLocale = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/", {
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
        });

        if (!response.ok) throw new Error("Geolocation API failed");

        const data: GeoLocationData = await response.json();
        const countryCode = data.country_code?.toUpperCase();

        if (countryCode && COUNTRY_CONFIG[countryCode]) {
          const config = COUNTRY_CONFIG[countryCode];
          setLanguage(config.language);
          setCurrency(config.currency);
        }
      } catch (error) {
        console.debug("Geolocation detection failed, using defaults");
      }
    };

    detectAndSetLocale();
  }, [setCurrency, setLanguage]);
}
