"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/** Pages non suivies : back-office et espace client (données personnelles). */
const EXCLUDED = /^\/[a-z]{2}\/(admin|account)(\/|$)/;

/**
 * Vercel Analytics (sans cookie). Avant envoi :
 *  - le back-office et l'espace client ne sont pas suivis ;
 *  - les références de demande sont masquées (/fr/track/RERA-… → /fr/track/[reference]) ;
 *  - les paramètres d'URL sont retirés (ex. ?ref=…).
 */
function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = new URL(event.url);
  if (EXCLUDED.test(url.pathname)) return null;
  url.pathname = url.pathname.replace(/^(\/[a-z]{2}\/track)\/[^/]+/, "$1/[reference]");
  url.search = "";
  return { ...event, url: url.toString() };
}

export function SiteAnalytics() {
  return <Analytics beforeSend={beforeSend} />;
}
