/**
 * Types du moteur de disponibilités. Partagé serveur / client (pas de "server-only").
 */

export type OfferType = "accommodation" | "activity" | "package";
export type InventoryMode = "nightly" | "daily" | "on_request";

export const INVENTORY_MODES: { value: InventoryMode; label: string; help: string }[] = [
  { value: "on_request", label: "Sur demande", help: "Pas de stock géré : l'équipe vérifie chaque demande à la main." },
  { value: "nightly", label: "Par nuit (hébergement)", help: "Nombre de logements disponibles chaque nuit." },
  { value: "daily", label: "Par jour (activité)", help: "Nombre de places disponibles chaque jour." },
];

/** Durée pendant laquelle une demande en attente bloque la place, si elle n'est pas traitée. */
export const HOLD_HOURS = 48;

/** Statuts qui occupent définitivement le stock. */
export const FIRM_STATUSES = ["confirmed", "paid", "completed"] as const;

export interface OfferInventory {
  offerSlug: string;
  offerType: OfferType;
  mode: InventoryMode;
  unitsTotal: number | null;
  guestsPerUnit: number | null;
  minNights: number;
  updatedAt: string | null;
}

/**
 * - available   : il reste assez de place
 * - unavailable : complet (ou fermé) sur au moins une nuit / le jour demandé
 * - on_request  : stock non géré pour cette offre, l'équipe vérifiera
 * - invalid     : demande incohérente (dates, durée minimale, nombre de voyageurs)
 */
export type AvailabilityStatus = "available" | "unavailable" | "on_request" | "invalid";

export type AvailabilityReason =
  | "full" // complet (réservations confirmées / blocages)
  | "held" // complet à cause de demandes en attente : une place peut se libérer
  | "closed" // fermeture manuelle
  | "past_date"
  | "invalid_dates"
  | "too_long"
  | "min_nights"
  | "not_managed";

export interface NightUsage {
  date: string;
  firm: number;
  held: number;
  blocked: number;
  closed: boolean;
  /** Unités libres en comptant les demandes en attente. */
  left: number;
}

export interface AvailabilityResult {
  offerSlug: string;
  status: AvailabilityStatus;
  reason?: AvailabilityReason;
  mode: InventoryMode;
  startDate: string;
  /** Exclu : jour du départ (hébergement) ou lendemain (activité). */
  endDate: string;
  unitsRequested: number;
  unitsTotal: number | null;
  /** Minimum d'unités libres sur la période, demandes en attente comprises. */
  unitsLeft: number | null;
  /** Minimum d'unités libres en ne comptant que les réservations confirmées. */
  unitsLeftFirm: number | null;
  minNights?: number;
  nights: NightUsage[];
}
