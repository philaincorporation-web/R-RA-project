/**
 * Service Worker RÈRA — écrit à la main (pas de next-pwa / Workbox)
 * afin de rester compatible avec Turbopack, le bundler par défaut de
 * Next.js 16. Stratégie volontairement simple et prévisible :
 *
 *  - App shell (page hors-ligne) : mis en cache à l'installation.
 *  - Pages HTML (navigations) : "network first" → si hors-ligne, on sert
 *    la page hors-ligne mise en cache.
 *  - Assets statiques (images, icônes, css/js Next) : "cache first" avec
 *    mise à jour en arrière-plan (stale-while-revalidate).
 *
 * Le cache est versionné : changez CACHE_VERSION à chaque changement de
 * stratégie pour forcer la purge des anciens caches chez les visiteurs.
 */

const CACHE_VERSION = "rera-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const OFFLINE_URL = "/offline.html";

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  "/images/logo.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("rera-") && key !== STATIC_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/images/") ||
    /\.(png|jpg|jpeg|svg|webp|gif|ico|woff2?)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // On ne gère que les requêtes GET same-origin ; le reste part au réseau normalement.
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) {
    return;
  }

  // Navigations (changement de page) : network-first avec fallback hors-ligne.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.open(STATIC_CACHE).then((cache) => cache.match(OFFLINE_URL))
      )
    );
    return;
  }

  // Assets statiques : cache-first + rafraîchissement silencieux en arrière-plan.
  if (isStaticAsset(request)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
  }
});