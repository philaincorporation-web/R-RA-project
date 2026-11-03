/**
 * Statuts des demandes clients, tels qu'affichés dans le back-office.
 * Partagé serveur / client (pas de "server-only"). Les couleurs sont dans
 * components/admin/status-badge.tsx : Tailwind n'analyse pas src/lib.
 */

export const BOOKING_STATUSES = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "paid", label: "Payée" },
  { value: "completed", label: "Terminée" },
  { value: "cancelled", label: "Annulée" },
] as const;

export const BUSINESS_STATUSES = [
  { value: "new", label: "Nouvelle" },
  { value: "in_progress", label: "En cours" },
  { value: "quote_sent", label: "Devis envoyé" },
  { value: "accepted", label: "Acceptée" },
  { value: "refused", label: "Refusée" },
] as const;

export const MESSAGE_STATUSES = [
  { value: "new", label: "Nouveau" },
  { value: "handled", label: "Traité" },
  { value: "archived", label: "Archivé" },
] as const;

export type RequestKind = "booking" | "business" | "message";

export function statusesFor(kind: RequestKind): readonly { value: string; label: string }[] {
  if (kind === "booking") return BOOKING_STATUSES;
  if (kind === "business") return BUSINESS_STATUSES;
  return MESSAGE_STATUSES;
}

/** 'pending' sur une demande Business vient d'une ancienne version du site : équivaut à 'new'. */
export function normalizeStatus(kind: RequestKind, status: string) {
  return kind === "business" && status === "pending" ? "new" : status;
}

export function isValidStatus(kind: RequestKind, status: string) {
  return statusesFor(kind).some((s) => s.value === status);
}

export function statusLabel(kind: RequestKind, status: string) {
  const value = normalizeStatus(kind, status);
  return statusesFor(kind).find((s) => s.value === value)?.label ?? status;
}
