import { useCurrency } from "@/contexts/CurrencyContext";
import { DollarSign } from "lucide-react";

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  const currencies = [
    { code: "BRL", label: "R$ Brasil", flag: "🇧🇷" },
    { code: "ARS", label: "$ Argentina", flag: "🇦🇷" },
    { code: "PYG", label: "₲ Paraguay", flag: "🇵🇾" },
  ];

  return (
    <div className="fixed top-32 right-6 z-50 flex items-center gap-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full p-1 shadow-lg border border-border">
      {currencies.map((curr) => (
        <button
          key={curr.code}
          onClick={() => setCurrency(curr.code as "BRL" | "ARS" | "PYG")}
          className={`px-3 py-2 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-1 ${
            currency === curr.code
              ? "bg-primary text-white shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title={curr.label}
        >
          <span>{curr.flag}</span>
          <span className="hidden sm:inline">{curr.code}</span>
        </button>
      ))}
    </div>
  );
}
