import { useCurrency, Currency } from "@/contexts/CurrencyContext";

const currencies: { value: Currency; label: string; symbol: string }[] = [
  { value: "INR", label: "INR", symbol: "₹" },
  { value: "USD", label: "USD", symbol: "$" },
  { value: "AED", label: "AED", symbol: "AED " },
];

export const CurrencyToggle = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center bg-muted/50 rounded-full p-0.5 border border-border/50">
      {currencies.map((curr) => (
        <button
          key={curr.value}
          onClick={() => setCurrency(curr.value)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
            currency === curr.value
              ? "bg-gold text-gold-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {curr.symbol}
        </button>
      ))}
    </div>
  );
};
