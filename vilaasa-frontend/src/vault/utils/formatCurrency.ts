/**
 * Currency Formatting Helper for The Vault Investor Portal
 */

export function formatPortfolioValue(amount: number, currency = "INR"): string {
  if (isNaN(amount) || amount === 0) {
    if (currency === "INR") return "₹0";
    if (currency === "AED") return "AED 0";
    if (currency === "USD") return "$0";
    if (currency === "GBP") return "£0";
    if (currency === "EUR") return "€0";
    return `0 ${currency}`;
  }

  const absAmount = Math.abs(amount);
  const isNegative = amount < 0;
  const sign = isNegative ? "-" : "";

  if (currency === "INR") {
    if (absAmount >= 10000000) {
      const cr = (absAmount / 10000000).toFixed(1).replace(/\.0$/, "");
      return `${sign}₹${cr} Cr`;
    }
    if (absAmount >= 100000) {
      const lakh = (absAmount / 100000).toFixed(1).replace(/\.0$/, "");
      return `${sign}₹${lakh} L`;
    }
    if (absAmount >= 1000) {
      const k = (absAmount / 1000).toFixed(1).replace(/\.0$/, "");
      return `${sign}₹${k} K`;
    }
    return `${sign}₹${absAmount.toLocaleString("en-IN")}`;
  }

  if (currency === "AED") {
    if (absAmount >= 1000000) {
      const m = (absAmount / 1000000).toFixed(1).replace(/\.0$/, "");
      return `${sign}AED ${m}M`;
    }
    if (absAmount >= 1000) {
      const k = (absAmount / 1000).toFixed(1).replace(/\.0$/, "");
      return `${sign}AED ${k}K`;
    }
    return `${sign}AED ${absAmount.toLocaleString()}`;
  }

  if (currency === "USD") {
    if (absAmount >= 1000000) {
      const m = (absAmount / 1000000).toFixed(1).replace(/\.0$/, "");
      return `${sign}$${m}M`;
    }
    if (absAmount >= 1000) {
      const k = (absAmount / 1000).toFixed(1).replace(/\.0$/, "");
      return `${sign}$${k}K`;
    }
    return `${sign}$${absAmount.toLocaleString()}`;
  }

  if (currency === "GBP") {
    if (absAmount >= 1000000) {
      const m = (absAmount / 1000000).toFixed(1).replace(/\.0$/, "");
      return `${sign}£${m}M`;
    }
    if (absAmount >= 1000) {
      const k = (absAmount / 1000).toFixed(1).replace(/\.0$/, "");
      return `${sign}£${k}K`;
    }
    return `${sign}£${absAmount.toLocaleString()}`;
  }

  if (currency === "EUR") {
    if (absAmount >= 1000000) {
      const m = (absAmount / 1000000).toFixed(1).replace(/\.0$/, "");
      return `${sign}€${m}M`;
    }
    if (absAmount >= 1000) {
      const k = (absAmount / 1000).toFixed(1).replace(/\.0$/, "");
      return `${sign}€${k}K`;
    }
    return `${sign}€${absAmount.toLocaleString()}`;
  }

  return `${sign}${absAmount.toLocaleString()} ${currency}`;
}

export function formatAppreciation(
  amount: number,
  percent: number,
  currency = "INR",
): string {
  const isPositive = amount >= 0;
  const sign = isPositive ? "+" : "";
  const formattedVal = formatPortfolioValue(Math.abs(amount), currency);
  const formattedPct = `${isPositive ? "+" : ""}${percent.toFixed(1)}%`;

  return `${sign}${formattedVal} (${formattedPct})`;
}
