"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker uniquement en production et si le navigateur
 * le supporte. Volontairement désactivé en développement (`npm run dev`)
 * pour ne jamais interférer avec le hot-reload de Next.js — un service
 * worker actif en dev peut servir des pages en cache périmées et rendre
 * le débogage très confus.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("[PWA] Échec de l'enregistrement du service worker :", error);
      });
    };

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}