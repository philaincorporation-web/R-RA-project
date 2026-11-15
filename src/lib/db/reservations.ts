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

/** Stock à vérifier au moment de l'enregistrement (offre dont le stock est géré). */
export interface CapacityGuard {
  /** Période occupée [start, end) : départ exclu, ou lendemain pour une activité. */
  start: string;
  end: string;
  unitsTotal: number;
}

/** Clé du verrou Postgres par offre : sérialise les écritures concurrentes sur une même offre. */
const lockKey = (offerSlug: string) => `rera-offer:${offerSlug}`;

/**
 * Enregistre une réservation. Si l'utilisateur est connecté, elle lui est rattachée.
 * Sinon, un jeton de rattachement est renvoyé : il permettra de la lier au compte
 * créé juste après (seule son empreinte est stockée).
 *
 * Avec `capacity` : verrou sur l'offre puis insertion conditionnelle, dans une même transaction.
 * Renvoie { full: true } (rien n'est enregistré) s'il ne reste plus assez de place.
 */
export async function recordReservation(
  input: ReservationRecord & { offerSlug?: string; units?: number; holdHours?: number; source?: "site" | "assistant" },
  userId: string | null,
  capacity?: CapacityGuard
): Promise<{ claimToken: string | null; full?: boolean }> {
  const claimToken = userId ? null : randomBytes(24).toString("base64url");
  const sql = db();
  const units = input.units ?? 1;
  const holdUntil = input.holdHours ? new Date(Date.now() + input.holdHours * 3_600_000).toISOString() : null;
  const offerSlug = input.offerSlug ?? null;
  const guarded = Boolean(capacity && offerSlug);

  const insert = sql`
    INSERT INTO reservations
      (reference, kind, status, user_id, full_name, email, phone, country, title,
       start_date, end_date, total_estimate, currency, summary, claim_token_hash, claimed_at,
       offer_slug, units, hold_expires_at, source)
    SELECT
       ${input.reference}, ${input.kind}, ${input.kind === "business" ? "new" : "pending"}, ${userId}, ${input.fullName}, ${input.email},
       ${input.phone ?? null}, ${input.country ?? null}, ${input.title},
       ${input.startDate || null}::date, ${input.endDate || null}::date,
       ${input.totalEstimate ?? null}::numeric, ${input.currency ?? null},
       ${JSON.stringify(input.summary)}::jsonb,
       ${claimToken ? hashToken(claimToken) : null}, ${userId ? new Date().toISOString() : null}::timestamptz,
       ${offerSlug}, ${units}, ${holdUntil}::timestamptz, ${input.source ?? "site"}
     WHERE NOT ${guarded}::boolean OR NOT EXISTS (
       SELECT 1
         FROM generate_series(${capacity?.start ?? null}::date, ${capacity?.end ?? null}::date - 1, interval '1 day') AS n(night),
              LATERAL rera_capacity_used(${offerSlug}, n.night::date, NULL) AS u
        WHERE u.closed OR u.firm + u.held + u.blocked + ${units} > ${capacity?.unitsTotal ?? 0}
     )
    RETURNING reference
  `;

  if (!guarded) {
    await insert;
    return { claimToken };
  }
  const [, inserted] = await sql.transaction([
    sql`SELECT pg_advisory_xact_lock(hashtext(${lockKey(offerSlug!)}))`,
    insert,
  ]);
  if ((inserted as unknown[]).length === 0) return { claimToken: null, full: true };
  return { claimToken };
}

/**
 * Change le statut d'une réservation en revérifiant le stock (confirmation).
 * Seules les réservations fermes (confirmées, payées, terminées) et les blocages comptent :
 * les autres demandes en attente ne bloquent pas une confirmation.
 * Renvoie "conflict" si la fiche a changé depuis son affichage, "full" s'il n'y a plus de place.
 */
export async function updateStatusWithCapacity(input: {
  reference: string;
  version: string;
  status: string;
  notes: string;
  offerSlug: string;
  capacity: CapacityGuard;
}): Promise<{ previousStatus: string; previousNotes: string } | "conflict" | "full"> {
  const sql = db();
  const [, rows] = await sql.transaction([
    sql`SELECT pg_advisory_xact_lock(hashtext(${lockKey(input.offerSlug)}))`,
    sql`
      WITH old AS (
        SELECT reference, status, internal_notes, units FROM reservations
         WHERE reference = ${input.reference} AND COALESCE(updated_at::text, '') = ${input.version}
         FOR UPDATE
      ),
      fits AS (
        SELECT NOT EXISTS (
          SELECT 1
            FROM old,
                 generate_series(${input.capacity.start}::date, ${input.capacity.end}::date - 1, interval '1 day') AS n(night),
                 LATERAL rera_capacity_used(${input.offerSlug}, n.night::date, ${input.reference}) AS u
           WHERE u.closed OR u.firm + u.blocked + old.units > ${input.capacity.unitsTotal}
        ) AS ok
      ),
      upd AS (
        UPDATE reservations r
           SET status = ${input.status}, internal_notes = ${input.notes || null}, updated_at = now()
          FROM old, fits
         WHERE r.reference = old.reference AND fits.ok
        RETURNING old.status AS "previousStatus", COALESCE(old.internal_notes, '') AS "previousNotes"
      )
      SELECT (SELECT count(*) FROM old)::int AS found, fits.ok, upd."previousStatus", upd."previousNotes"
        FROM fits LEFT JOIN upd ON true
    `,
  ]);
  const row = (rows as { found: number; ok: boolean; previousStatus: string | null; previousNotes: string | null }[])[0];
  if (!row || row.found === 0) return "conflict";
  if (!row.ok || row.previousStatus === null) return "full";
  return { previousStatus: row.previousStatus, previousNotes: row.previousNotes ?? "" };
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
