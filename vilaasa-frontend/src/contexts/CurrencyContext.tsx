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
  convertAmount: (amountInINR: number) => number;
  formatAmount: (amountInINR: number, showSymbol?: boolean) => string;
  symbol: string;
  exchangeRates: Record<Currency, number>;
}

const currencySymbols: Record<Currency, string> = {
  INR: "\u20B9",
  USD: "$",
  AED: "\u062F.\u0625",
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
    USD: 1,
    AED: 1,
  });

  const fetchRates = async () => {
    try {
      const res = await axios.get(
        "https://v6.exchangerate-api.com/v6/12ed1b69a6664c335d3c6aa8/latest/INR",
      );

      setExchangeRates({
        INR: 1,
        USD: res.data.conversion_rates.USD,
        AED: res.data.conversion_rates.AED,
      });
    } catch (err) {
      console.error("Currency API error:", err);
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

  const convertAmount = (amountInINR: number): number => {
    return amountInINR * exchangeRates[currency];
  };

  const formatAmount = (amountInINR: number, showSymbol = true): string => {
    const converted = convertAmount(amountInINR);
    const symbol = showSymbol ? currencySymbols[currency] : "";

    if (currency === "INR") {
      if (converted >= 10000000) {
        return `${symbol}${(converted / 10000000).toFixed(2)} Cr`;
      } else if (converted >= 100000) {
        return `${symbol}${(converted / 100000).toFixed(2)} L`;
      }
      return `${symbol}${converted.toLocaleString("en-IN")}`;
    } else {
      if (converted >= 1000000) {
        return `${symbol}${(converted / 1000000).toFixed(2)}M`;
      } else if (converted >= 1000) {
        return `${symbol}${(converted / 1000).toFixed(1)}K`;
      }
      return `${symbol}${converted.toLocaleString("en-US", {
        maximumFractionDigits: 0,
      })}`;
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertAmount,
        formatAmount,
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
