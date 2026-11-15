import "server-only";
import { db } from "@/lib/db/sql";
import type {
  AvailabilityResult,
  InventoryMode,
  NightUsage,
  OfferInventory,
  OfferType,
} from "./types";

/**
 * Moteur de disponibilités RÈRA.
 * Le calcul d'occupation est fait par la fonction Postgres rera_capacity_used (db/schema.sql),
 * utilisée à l'identique pour l'affichage, l'enregistrement d'une demande et la confirmation.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_NIGHTS = 60;

/** Date du jour à Libreville (AAAA-MM-JJ). */
export function todayLibreville() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Libreville" }).format(new Date());
}

export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function nightsBetween(start: string, end: string) {
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000);
}

function isValidIso(value: string | undefined): value is string {
  return Boolean(value && ISO_DATE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)));
}

type InventoryRow = {
  offer_slug: string;
  offer_type: OfferType;
  mode: InventoryMode;
  units_total: number | null;
  guests_per_unit: number | null;
  min_nights: number;
  updated_at: string | null;
};

const mapInventory = (r: InventoryRow): OfferInventory => ({
  offerSlug: r.offer_slug,
  offerType: r.offer_type,
  mode: r.mode,
  unitsTotal: r.units_total,
  guestsPerUnit: r.guests_per_unit,
  minNights: r.min_nights,
  updatedAt: r.updated_at,
});

export async function getInventory(offerSlug: string): Promise<OfferInventory | null> {
  const rows = (await db()`
    SELECT offer_slug, offer_type, mode, units_total, guests_per_unit, min_nights, updated_at::text
      FROM offer_inventory WHERE offer_slug = ${offerSlug}
  `) as InventoryRow[];
  return rows[0] ? mapInventory(rows[0]) : null;
}

export async function listInventory(): Promise<OfferInventory[]> {
  const rows = (await db()`
    SELECT offer_slug, offer_type, mode, units_total, guests_per_unit, min_nights, updated_at::text
      FROM offer_inventory ORDER BY offer_slug
  `) as InventoryRow[];
  return rows.map(mapInventory);
}

/** Le stock de cette offre est-il géré (sinon : « sur demande ») ? */
export function isManaged(inv: OfferInventory | null): inv is OfferInventory & { unitsTotal: number; mode: "nightly" | "daily" } {
  return Boolean(inv && inv.mode !== "on_request" && inv.unitsTotal !== null);
}

/** Unités consommées : logements pour un hébergement, places pour une activité. */
export function unitsFor(inv: OfferInventory | null, guests: number) {
  const g = Math.max(1, Math.floor(guests));
  if (inv?.mode === "daily") return g;
  if (inv?.mode === "nightly") return inv.guestsPerUnit ? Math.ceil(g / inv.guestsPerUnit) : 1;
  return 1;
}

/** Période occupée [début, fin) selon le mode : départ exclu, ou lendemain pour une activité. */
export function periodFor(mode: InventoryMode, startDate: string, endDate?: string | null) {
  if (mode === "nightly") return { start: startDate, end: endDate || addDays(startDate, 1) };
  return { start: startDate, end: addDays(startDate, 1) };
}

/** Occupation nuit par nuit (ou jour par jour) sur [start, end). */
export async function getUsage(offerSlug: string, start: string, end: string, excludeReference: string | null = null) {
  const rows = (await db()`
    SELECT to_char(n.night, 'YYYY-MM-DD') AS date, u.firm, u.held, u.blocked, u.closed
      FROM generate_series(${start}::date, ${end}::date - 1, interval '1 day') AS n(night),
           LATERAL rera_capacity_used(${offerSlug}, n.night::date, ${excludeReference}) AS u
     ORDER BY n.night
  `) as Omit<NightUsage, "left">[];
  return rows;
}

export interface CheckInput {
  offerSlug: string;
  startDate: string;
  endDate?: string | null;
  guests: number;
  /** Unités déjà fixées (demande existante) : remplace le calcul à partir du nombre de voyageurs. */
  units?: number;
  /** Ignore cette demande dans le calcul (confirmation d'une demande existante). */
  excludeReference?: string | null;
  inventory?: OfferInventory | null;
}

/**
 * Vérifie la disponibilité d'une offre. Ne lève pas d'erreur métier :
 * les cas invalides sont renvoyés avec status = "invalid" et une raison.
 * Lève une erreur si la base est injoignable (à traiter par l'appelant).
 */
export async function checkAvailability(input: CheckInput): Promise<AvailabilityResult> {
  const inv = input.inventory !== undefined ? input.inventory : await getInventory(input.offerSlug);
  const mode: InventoryMode = isManaged(inv) ? inv.mode : "on_request";
  const base = {
    offerSlug: input.offerSlug,
    mode,
    startDate: input.startDate,
    endDate: input.endDate ?? input.startDate,
    unitsRequested: input.units ?? unitsFor(inv, input.guests),
    unitsTotal: isManaged(inv) ? inv.unitsTotal : null,
    unitsLeft: null,
    unitsLeftFirm: null,
    nights: [] as NightUsage[],
  };

  if (!isValidIso(input.startDate) || (input.endDate && !isValidIso(input.endDate))) {
    return { ...base, status: "invalid", reason: "invalid_dates" };
  }
  if (input.startDate < todayLibreville() && !input.excludeReference) {
    return { ...base, status: "invalid", reason: "past_date" };
  }
  if (!isManaged(inv)) return { ...base, status: "on_request", reason: "not_managed" };

  const { start, end } = periodFor(inv.mode, input.startDate, input.endDate);
  const nightCount = nightsBetween(start, end);
  if (nightCount < 1) return { ...base, endDate: end, status: "invalid", reason: "invalid_dates" };
  if (nightCount > MAX_NIGHTS) return { ...base, endDate: end, status: "invalid", reason: "too_long" };
  if (inv.mode === "nightly" && nightCount < inv.minNights) {
    return { ...base, endDate: end, status: "invalid", reason: "min_nights", minNights: inv.minNights };
  }

  const usage = await getUsage(input.offerSlug, start, end, input.excludeReference ?? null);
  const nights: NightUsage[] = usage.map((n) => ({
    ...n,
    left: n.closed ? 0 : Math.max(0, inv.unitsTotal - n.firm - n.held - n.blocked),
  }));
  const unitsLeft = Math.min(...nights.map((n) => n.left));
  const unitsLeftFirm = Math.min(...nights.map((n) => (n.closed ? 0 : Math.max(0, inv.unitsTotal - n.firm - n.blocked))));
  const units = base.unitsRequested;

  const result = { ...base, endDate: end, unitsLeft, unitsLeftFirm, nights, minNights: inv.minNights };
  if (unitsLeft >= units) return { ...result, status: "available" };
  if (nights.some((n) => n.closed)) return { ...result, status: "unavailable", reason: "closed" };
  if (unitsLeftFirm >= units) return { ...result, status: "unavailable", reason: "held" };
  return { ...result, status: "unavailable", reason: "full" };
}
