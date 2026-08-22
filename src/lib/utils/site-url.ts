/**
 * Retourne l'URL publique du site, avec un fallback sûr.
 * Utilise `||` (et non `??`) volontairement : sur certaines plateformes
 * (Vercel notamment), une variable d'environnement déclarée mais laissée
 * vide côté dashboard vaut une chaîne vide `""` — qui n'est pas `undefined`
 * et ne déclencherait donc pas le fallback avec `??`, provoquant un crash
 * de `new URL("")`.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return raw && raw.length > 0 ? raw : "https://rera-pointedenis.com";
}