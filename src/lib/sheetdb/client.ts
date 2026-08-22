import "server-only";

/**
 * Client SheetDB minimal, utilisé uniquement côté serveur
 * (Server Components, Route Handlers). Ne jamais importer ce
 * fichier depuis un composant "use client".
 */

const SHEETDB_API_URL = process.env.SHEETDB_API_URL;
const SHEETDB_API_KEY = process.env.SHEETDB_API_KEY;

interface SheetDBOptions {
  sheet?: string;
  revalidateSeconds?: number;
}

function buildUrl(path: string, sheet?: string) {
  if (!SHEETDB_API_URL) return null;
  const url = new URL(`${SHEETDB_API_URL.replace(/\/$/, "")}${path}`);
  if (sheet) url.searchParams.set("sheet", sheet);
  return url.toString();
}

function authHeaders(): HeadersInit {
  return SHEETDB_API_KEY
    ? { Authorization: `Bearer ${SHEETDB_API_KEY}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

/**
 * Récupère toutes les lignes d'une feuille SheetDB.
 * Retourne `null` si SheetDB n'est pas configuré (permet un fallback
 * gracieux vers les données de démonstration en développement).
 */
export async function sheetdbGetAll<T = Record<string, unknown>>(
  options: SheetDBOptions = {}
): Promise<T[] | null> {
  const url = buildUrl("/", options.sheet);
  if (!url) return null;

  try {
    const res = await fetch(url, {
      headers: authHeaders(),
      next: { revalidate: options.revalidateSeconds ?? 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T[];
  } catch {
    return null;
  }
}

/**
 * Récupère une ligne unique par colonne/valeur.
 */
export async function sheetdbGetBy<T = Record<string, unknown>>(
  column: string,
  value: string,
  options: SheetDBOptions = {}
): Promise<T[] | null> {
  const url = buildUrl(`/search?${encodeURIComponent(column)}=${encodeURIComponent(value)}`, options.sheet);
  if (!url) return null;

  try {
    const res = await fetch(url, {
      headers: authHeaders(),
      next: { revalidate: options.revalidateSeconds ?? 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T[];
  } catch {
    return null;
  }
}

/**
 * Insère une nouvelle ligne (écriture) dans une feuille SheetDB.
 * Réservé aux Route Handlers (jamais appelé côté client).
 */
export async function sheetdbInsert(
  data: Record<string, unknown>,
  options: SheetDBOptions = {}
): Promise<{ ok: boolean; created?: number }> {
  const url = buildUrl("/", options.sheet);
  if (!url) {
    // Pas de SheetDB configuré : on simule un succès pour ne pas bloquer
    // le développement / la démo, mais on log clairement l'absence de config.
    console.warn("[sheetdb] SHEETDB_API_URL manquant : insertion simulée.", data);
    return { ok: true, created: 1 };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ data: [data] }),
    });
    if (!res.ok) return { ok: false };
    const json = await res.json();
    return { ok: true, created: json.created ?? 1 };
  } catch {
    return { ok: false };
  }
}
