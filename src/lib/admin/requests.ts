import "server-only";
import { db } from "@/lib/db/sql";
import type { Reservation } from "@/lib/db/reservations";

export const REQUESTS_PAGE_SIZE = 30;

export interface AdminReservation extends Reservation {
  user_id: string | null;
  internal_notes: string | null;
  source: string;
  /** Jeton de version : détecte une modification concurrente par un autre membre. */
  version: string;
}

export interface ContactMessage {
  reference: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  internal_notes: string | null;
  source: string;
  created_at: string;
  version: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const orNull = (value?: string) => (value && value.trim() ? value.trim() : null);
const dateOrNull = (value?: string) => (value && ISO_DATE.test(value) && !Number.isNaN(Date.parse(value)) ? value : null);

export interface RequestFilters {
  q?: string;
  status?: string;
  offerType?: string;
  from?: string;
  to?: string;
  page?: number;
}

export async function listAdminReservations(kind: "booking" | "business", filters: RequestFilters) {
  const q = orNull(filters.q);
  const status = orNull(filters.status);
  const offerType = orNull(filters.offerType);
  const from = dateOrNull(filters.from);
  const to = dateOrNull(filters.to);
  const page = Math.max(1, filters.page ?? 1);
  const rows = await db()`
    SELECT reference, kind, user_id, full_name, email, phone, country, title,
           to_char(start_date, 'YYYY-MM-DD') AS start_date,
           to_char(end_date, 'YYYY-MM-DD') AS end_date,
           total_estimate, currency, status, summary, created_at, internal_notes, source,
           COALESCE(updated_at::text, '') AS version
      FROM reservations
     WHERE kind = ${kind}
       AND (${q}::text IS NULL OR strpos(lower(reference || ' ' || full_name || ' ' || email || ' ' || COALESCE(phone, '') || ' ' || title), lower(${q}::text)) > 0)
       AND (${status}::text IS NULL OR status = ${status}::text OR (${status}::text = 'new' AND status = 'pending'))
       AND (${offerType}::text IS NULL OR summary->>'offerType' = ${offerType}::text)
       AND (${from}::date IS NULL OR start_date >= ${from}::date)
       AND (${to}::date IS NULL OR start_date <= ${to}::date)
     ORDER BY created_at DESC
     LIMIT ${REQUESTS_PAGE_SIZE + 1} OFFSET ${(page - 1) * REQUESTS_PAGE_SIZE}
  `;
  return { items: rows.slice(0, REQUESTS_PAGE_SIZE) as AdminReservation[], hasNext: rows.length > REQUESTS_PAGE_SIZE, page };
}

export async function getAdminReservation(kind: "booking" | "business", reference: string): Promise<AdminReservation | null> {
  const rows = await db()`
    SELECT reference, kind, user_id, full_name, email, phone, country, title,
           to_char(start_date, 'YYYY-MM-DD') AS start_date,
           to_char(end_date, 'YYYY-MM-DD') AS end_date,
           total_estimate, currency, status, summary, created_at, internal_notes, source,
           COALESCE(updated_at::text, '') AS version
      FROM reservations
     WHERE kind = ${kind} AND reference = ${reference}
  `;
  return (rows[0] as AdminReservation) ?? null;
}

/** Type réel d'une demande : les droits se décident sur la base, jamais sur le formulaire. */
export async function getReservationKind(reference: string) {
  const rows = await db()`SELECT kind FROM reservations WHERE reference = ${reference}`;
  return ((rows[0] as { kind: "booking" | "business" } | undefined)?.kind) ?? null;
}

type UpdateResult = { previousStatus: string; previousNotes: string } | null;

/** Mise à jour atomique : renvoie null si la fiche a changé depuis son affichage (ou n'existe plus). */
export async function updateReservationRow(reference: string, version: string, status: string, notes: string): Promise<UpdateResult> {
  const rows = await db()`
    WITH old AS (
      SELECT reference, status, internal_notes FROM reservations
       WHERE reference = ${reference} AND COALESCE(updated_at::text, '') = ${version}
       FOR UPDATE
    )
    UPDATE reservations r
       SET status = ${status}, internal_notes = ${notes || null}, updated_at = now()
      FROM old
     WHERE r.reference = old.reference
    RETURNING old.status AS "previousStatus", COALESCE(old.internal_notes, '') AS "previousNotes"
  `;
  return (rows[0] as UpdateResult) ?? null;
}

export async function listContactMessages(filters: RequestFilters) {
  const q = orNull(filters.q);
  const status = orNull(filters.status);
  const page = Math.max(1, filters.page ?? 1);
  const rows = await db()`
    SELECT reference, full_name, email, subject, message, status, internal_notes, source, created_at,
           COALESCE(updated_at::text, '') AS version
      FROM contact_messages
     WHERE (${q}::text IS NULL OR strpos(lower(reference || ' ' || full_name || ' ' || email || ' ' || subject), lower(${q}::text)) > 0)
       AND (${status}::text IS NULL OR status = ${status}::text)
     ORDER BY created_at DESC
     LIMIT ${REQUESTS_PAGE_SIZE + 1} OFFSET ${(page - 1) * REQUESTS_PAGE_SIZE}
  `;
  return { items: rows.slice(0, REQUESTS_PAGE_SIZE) as ContactMessage[], hasNext: rows.length > REQUESTS_PAGE_SIZE, page };
}

export async function getContactMessage(reference: string): Promise<ContactMessage | null> {
  const rows = await db()`
    SELECT reference, full_name, email, subject, message, status, internal_notes, source, created_at,
           COALESCE(updated_at::text, '') AS version
      FROM contact_messages
     WHERE reference = ${reference}
  `;
  return (rows[0] as ContactMessage) ?? null;
}

export async function updateMessageRow(reference: string, version: string, status: string, notes: string): Promise<UpdateResult> {
  const rows = await db()`
    WITH old AS (
      SELECT reference, status, internal_notes FROM contact_messages
       WHERE reference = ${reference} AND COALESCE(updated_at::text, '') = ${version}
       FOR UPDATE
    )
    UPDATE contact_messages m
       SET status = ${status}, internal_notes = ${notes || null}, updated_at = now()
      FROM old
     WHERE m.reference = old.reference
    RETURNING old.status AS "previousStatus", COALESCE(old.internal_notes, '') AS "previousNotes"
  `;
  return (rows[0] as UpdateResult) ?? null;
}

/** Compteurs « à traiter » du tableau de bord et du menu. Ne bloque jamais l'affichage. */
export async function getRequestCounts() {
  try {
    const rows = await db()`
      SELECT
        (SELECT count(*)::int FROM reservations WHERE kind = 'booking' AND status = 'pending') AS bookings,
        (SELECT count(*)::int FROM reservations WHERE kind = 'business' AND status IN ('new', 'pending')) AS business,
        (SELECT count(*)::int FROM contact_messages WHERE status = 'new') AS messages
    `;
    return rows[0] as { bookings: number; business: number; messages: number };
  } catch (error) {
    console.error("[admin] compteurs indisponibles", error);
    return { bookings: 0, business: 0, messages: 0 };
  }
}
