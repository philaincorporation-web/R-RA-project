"use client";

import { useEffect } from "react";

/** Synchronise l'attribut <html lang> avec la langue de la page (fr/en). */
export function HtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
