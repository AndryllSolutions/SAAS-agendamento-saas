import React from 'react';
import { useCurrency, type Currency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const LANGUAGE_CURRENCY_OPTIONS: { 
  language: 'pt' | 'es'; 
  currency: Currency;
  flag: string; 
  country: string;
}[] = [
  { language: 'pt', currency: 'BRL', flag: '🇧🇷', country: 'Brasil' },
  { language: 'es', currency: 'ARS', flag: '🇦🇷', country: 'Argentina' },
  { language: 'es', currency: 'PYG', flag: '🇵🇾', country: 'Paraguai' },
];

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage } = useLanguage();

  const handleCountryChange = (lang: 'pt' | 'es', curr: Currency) => {
    setLanguage(lang);
    setCurrency(curr);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Language & Currency Selector - Only Flags */}
      <div className="flex items-center gap-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full p-1 shadow-lg border border-border">
        {LANGUAGE_CURRENCY_OPTIONS.map((option) => (
          <button
            key={`${option.flag}-${option.currency}`}
            type="button"
            onClick={() => handleCountryChange(option.language, option.currency)}
            className={`text-xl px-3 py-2 rounded-full transition-all duration-300 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
              language === option.language && currency === option.currency
                ? 'bg-primary/20 scale-110'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={`${option.country} - ${option.language === 'pt' ? 'Português' : 'Español'} (${option.currency})`}
          >
            {option.flag}
          </button>
        ))}
      </div>
    </div>
  );
}
