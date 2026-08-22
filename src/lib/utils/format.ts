import type { AppLocale } from "@/lib/i18n/config";

export function formatPrice(amount: number, currency: string, locale: AppLocale) {
  if (!amount) return locale === "fr" ? "Sur devis" : "On request";
  try {
    return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency: currency === "XAF" ? "XAF" : currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} ${currency}`;
  }
}

export function formatDate(date: string, locale: AppLocale) {
  try {
    return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

export function pick<T extends { fr: string; en: string }>(field: T, locale: AppLocale) {
  return locale === "fr" ? field.fr : field.en;
}
