/**
 * Currency and formatting utilities for FinOrganizer
 */

export const formatCurrency = (amount: number, currency: string = "EUR"): string => {
  const localeMap: Record<string, string> = {
    EUR: "en-IE", // European format with decimals
    BRL: "pt-BR", // Brazilian Real format
    USD: "en-US", // US Dollar format
  };

  const locale = localeMap[currency.toUpperCase()] || "en-US";
  
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercent = (value: number): string => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString + "T00:00:00");
  if (isNaN(date.getTime())) return dateString;
  const locale = typeof navigator !== "undefined" ? (navigator.language || "en-US") : "en-US";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const formatMonth = (monthString: string): string => {
  if (!monthString) return "";
  const [year, month] = monthString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  const locale = typeof navigator !== "undefined" ? (navigator.language || "en-US") : "en-US";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
  }).format(date);
};
