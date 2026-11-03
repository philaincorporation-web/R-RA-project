import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";

/**
 * Réservations et demandes Business dans Postgres (Neon) : source unique,
 * utilisée par le site, l'espace client et le back-office.
 */

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquant");
  return neon(url);
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export interface ReservationRecord {
  reference: string;
  kind: "booking" | "business";
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  title: string;
  startDate?: string;
  endDate?: string;
  totalEstimate?: number;
  currency?: string;
  summary: Record<string, unknown>;
}

export interface Reservation {
  reference: string;
  kind: "booking" | "business";
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  title: string;
  start_date: string | null;
  end_date: string | null;
  total_estimate: string | null;
  currency: string | null;
  status: string;
  summary: Record<string, unknown>;
  created_at: string;
}

/**
 * Enregistre une réservation. Si l'utilisateur est connecté, elle lui est rattachée.
 * Sinon, un jeton de rattachement est renvoyé : il permettra de la lier au compte
 * créé juste après (seule son empreinte est stockée).
 */
export async function recordReservation(input: ReservationRecord, userId: string | null) {
  const claimToken = userId ? null : randomBytes(24).toString("base64url");
  await db()`
    INSERT INTO reservations
      (reference, kind, status, user_id, full_name, email, phone, country, title,
       start_date, end_date, total_estimate, currency, summary, claim_token_hash, claimed_at)
    VALUES
      (${input.reference}, ${input.kind}, ${input.kind === "business" ? "new" : "pending"}, ${userId}, ${input.fullName}, ${input.email},
       ${input.phone ?? null}, ${input.country ?? null}, ${input.title},
       ${input.startDate || null}, ${input.endDate || null},
       ${input.totalEstimate ?? null}, ${input.currency ?? null},
       ${JSON.stringify(input.summary)}::jsonb,
       ${claimToken ? hashToken(claimToken) : null}, ${userId ? new Date().toISOString() : null})
  `;
  return { claimToken };
}

/** Rattache une réservation faite sans compte, si le jeton correspond. Usage unique. */
export async function claimReservation(reference: string, token: string, userId: string) {
  const rows = await db()`
    UPDATE reservations
       SET user_id = ${userId}, claimed_at = now(), claim_token_hash = NULL
     WHERE reference = ${reference}
       AND user_id IS NULL
       AND claim_token_hash = ${hashToken(token)}
       AND created_at > now() - interval '7 days'
    RETURNING reference
  `;
  return rows.length > 0;
}

export async function listUserReservations(userId: string): Promise<Reservation[]> {
  const rows = await db()`
    SELECT reference, kind, full_name, email, phone, country, title,
           to_char(start_date, 'YYYY-MM-DD') AS start_date,
           to_char(end_date, 'YYYY-MM-DD') AS end_date,
           total_estimate, currency, status, summary, created_at
      FROM reservations
     WHERE user_id = ${userId}
     ORDER BY created_at DESC
  `;
  return rows as Reservation[];
}

export async function getUserReservation(userId: string, reference: string): Promise<Reservation | null> {
  const rows = await db()`
    SELECT reference, kind, full_name, email, phone, country, title,
           to_char(start_date, 'YYYY-MM-DD') AS start_date,
           to_char(end_date, 'YYYY-MM-DD') AS end_date,
           total_estimate, currency, status, summary, created_at
      FROM reservations
     WHERE user_id = ${userId} AND reference = ${reference}
     LIMIT 1
  `;
  return (rows[0] as Reservation) ?? null;
}

export async function getProfile(userId: string) {
  const rows = await db()`SELECT phone, country FROM user_profiles WHERE user_id = ${userId}`;
  return (rows[0] as { phone: string | null; country: string | null }) ?? null;
}

export async function upsertProfile(userId: string, phone?: string, country?: string) {
  await db()`
    INSERT INTO user_profiles (user_id, phone, country, updated_at)
    VALUES (${userId}, ${phone || null}, ${country || null}, now())
    ON CONFLICT (user_id) DO UPDATE
      SET phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
          country = COALESCE(EXCLUDED.country, user_profiles.country),
          updated_at = now()
  `;
}
