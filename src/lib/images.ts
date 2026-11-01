/**
 * Hôtes d'images distants autorisés. Utilisé par next.config.ts (remotePatterns)
 * et par safeImage() pour éviter qu'une URL non configurée (saisie dans Google Sheets)
 * ne fasse planter next/image.
 */
export const ALLOWED_IMAGE_HOSTS = ["images.unsplash.com", "res.cloudinary.com"];

export function safeImage(value: string | undefined, fallback: string): string {
  const src = value?.trim();
  if (!src) return fallback;
  if (src.startsWith("/")) return src;
  try {
    const url = new URL(src);
    if (url.protocol === "https:" && ALLOWED_IMAGE_HOSTS.includes(url.hostname)) return src;
  } catch {
    // URL invalide
  }
  return fallback;
}
