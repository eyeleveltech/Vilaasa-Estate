import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

export type Currency = "INR" | "USD" | "AED";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertAmount: (amount: number, fromCurrency?: Currency | string) => number;
  formatAmount: (amount: number, fromCurrency?: Currency | string, showSymbol?: boolean) => string;
  formatDynamicValue: (value: string | number | undefined | null, fromCurrency?: Currency | string, showSymbol?: boolean) => string;
  symbol: string;
  exchangeRates: Record<Currency, number>;
}

const currencySymbols: Record<Currency, string> = {
  INR: "₹",
  USD: "$",
  AED: "AED ",
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("vilaasa-currency") as Currency) || "INR";
    }
    return "INR";
  });

  const [exchangeRates, setExchangeRates] = useState<Record<Currency, number>>({
    INR: 1,
    USD: 0.01058, // 1 INR ≈ 0.01058 USD (1 USD ≈ 94.5 INR)
    AED: 0.03884, // 1 INR ≈ 0.03884 AED (1 AED ≈ 25.75 INR)
  });

  const fetchRates = async () => {
    try {
      const res = await axios.get(
        "https://v6.exchangerate-api.com/v6/77e4f8229fe63ae93b72b3dd/latest/INR",
      );

      if (res.data?.conversion_rates) {
        setExchangeRates({
          INR: 1,
          USD: res.data.conversion_rates.USD || 0.01058,
          AED: res.data.conversion_rates.AED || 0.03884,
        });
      }
    } catch (err) {
      console.warn("Currency API warning, using reliable baseline rates:", err);
    }
  };

  useEffect(() => {
    fetchRates();

    const interval = setInterval(fetchRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("vilaasa-currency", currency);
  }, [currency]);

  const convertAmount = (
    amount: number,
    fromCurrency: Currency | string = "INR",
  ): number => {
    if (isNaN(amount) || amount === 0) return 0;
    const validFrom = (fromCurrency && exchangeRates[fromCurrency as Currency] !== undefined)
      ? (fromCurrency as Currency)
      : "INR";
    if (validFrom === currency) return amount;
    const fromRate = exchangeRates[validFrom] || 1;
    const toRate = exchangeRates[currency] || 1;
    // Normalize to base INR, then convert to selected currency
    const inINR = amount / fromRate;
    return inINR * toRate;
  };

  const formatAmount = (
    amount: number,
    fromCurrency: Currency | string = "INR",
    showSymbol = true,
  ): string => {
    if (isNaN(amount) || amount === 0) {
      return showSymbol ? `${currencySymbols[currency]}0` : "0";
    }

    const converted = convertAmount(amount, fromCurrency);
    const symbol = showSymbol ? currencySymbols[currency] : "";

    if (currency === "INR") {
      if (converted >= 10000000) {
        return `${symbol}${(converted / 10000000).toFixed(2)} Cr`;
      } else if (converted >= 100000) {
        return `${symbol}${(converted / 100000).toFixed(2)} L`;
      }
      return `${symbol}${Math.round(converted).toLocaleString("en-IN")}`;
    } else if (currency === "USD") {
      if (converted >= 1000000) {
        return `${symbol}${(converted / 1000000).toFixed(2)}M`;
      } else if (converted >= 1000) {
        return `${symbol}${(converted / 1000).toFixed(1)}K`;
      }
      return `${symbol}${Math.round(converted).toLocaleString("en-US")}`;
    } else {
      // AED
      if (converted >= 1000000) {
        return `${symbol}${(converted / 1000000).toFixed(2)}M`;
      } else if (converted >= 1000) {
        return `${symbol}${(converted / 1000).toFixed(1)}K`;
      }
      return `${symbol}${Math.round(converted).toLocaleString("en-US")}`;
    }
  };

  /**
   * Helper that intelligently handles numbers or raw strings like "₹70,00,000",
   * "AED 5,000,000", "₹70,00,000 - ₹1,50,00,000" while leaving non-monetary strings intact.
   */
  const formatDynamicValue = (
    value: string | number | undefined | null,
    fromCurrency: Currency | string = "INR",
    showSymbol = true,
  ): string => {
    if (value === undefined || value === null) return "";
    if (typeof value === "number") return formatAmount(value, fromCurrency, showSymbol);

    const str = String(value).trim();
    if (!str) return "";

    const lower = str.toLowerCase();

    // Explicit non-monetary units / percentages / time periods MUST NOT be converted:
    if (
      lower.includes("year") ||
      lower.includes("yr") ||
      lower.includes("month") ||
      lower.includes("day") ||
      lower.includes("%") ||
      lower.includes("p.a") ||
      lower.includes("roi") ||
      lower.includes("irr") ||
      lower.includes("yield") ||
      lower.includes("foco") ||
      lower.includes("fofo") ||
      lower.includes("sq.ft") ||
      lower.includes("sqft") ||
      lower.includes("sqm") ||
      lower.includes("acre") ||
      lower.includes("bhk") ||
      lower.includes("bedroom") ||
      lower.includes("bathroom")
    ) {
      return str;
    }

    // Detect source currency from string tokens if present, else fallback to fromCurrency
    let detectedCurrency = (fromCurrency && exchangeRates[fromCurrency as Currency] !== undefined)
      ? (fromCurrency as Currency)
      : "INR";

    if (lower.includes("aed") || lower.includes("dhs") || lower.includes("dirham")) {
      detectedCurrency = "AED";
    } else if (str.includes("$") || lower.includes("usd")) {
      detectedCurrency = "USD";
    } else if (str.includes("₹") || lower.includes("inr") || lower.includes("rs")) {
      detectedCurrency = "INR";
    }

    // Check if it's a range like "₹70,00,000 - ₹1,50,00,000" or "AED 3,000,000 - AED 5,000,000"
    if (str.includes(" - ")) {
      const parts = str.split(" - ");
      if (parts.length === 2 && (/[\d₹$]/.test(parts[0]) || /aed/i.test(parts[0]))) {
        return `${formatDynamicValue(parts[0], detectedCurrency, showSymbol)} - ${formatDynamicValue(parts[1], detectedCurrency, showSymbol)}`;
      }
    }

    const digitsOnly = str.replace(/[^0-9.]/g, "");
    const hasCurrencyToken =
      str.includes("₹") ||
      str.includes("$") ||
      lower.includes("aed") ||
      lower.includes("inr") ||
      lower.includes("usd") ||
      lower.includes("rs");

    if (hasCurrencyToken || (/^\d+$/.test(digitsOnly) && digitsOnly.length >= 4)) {
      let num = parseFloat(digitsOnly);
      if (!isNaN(num)) {
        // Check for 'Cr' or 'Lakh' / 'L' suffix
        if (lower.includes("cr") && num < 10000) {
          num = num * 10000000;
        } else if ((lower.includes("lakh") || lower.includes("lac") || lower.endsWith("l")) && num < 10000) {
          num = num * 100000;
        } else if ((lower.endsWith("m") || lower.includes("million") || lower.includes("mn")) && num < 10000) {
          num = num * 1000000;
        } else if ((lower.endsWith("k") || lower.includes("thousand")) && num < 100000) {
          num = num * 1000;
        }

        return formatAmount(num, detectedCurrency, showSymbol);
      }
    }

    // Default: Return unchanged
    return str;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertAmount,
        formatAmount,
        formatDynamicValue,
        symbol: currencySymbols[currency],
        exchangeRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
