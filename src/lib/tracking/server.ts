import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db/sql";
import type { Reservation } from "@/lib/db/reservations";

/**
 * Suivi d'une demande sans compte client :
 *   1. le visiteur donne sa référence + l'e-mail utilisé ;
 *   2. s'ils correspondent, un code à 6 chiffres lui est envoyé (valable 10 min) ;
 *   3. le bon code ouvre l'accès à cette demande pendant 30 min (cookie signé).
 * Les réponses ne révèlent jamais si une référence existe.
 */

const CODE_TTL_MIN = 10;
const ACCESS_TTL_MIN = 30;
const MAX_ATTEMPTS = 5; // essais par code
const MAX_CODES_PER_REFERENCE = 3; // par heure
const MAX_REQUESTS_PER_IP = 10; // par heure
export const TRACK_COOKIE = "rera_track";

function secret() {
  const value = process.env.TRACKING_SECRET || process.env.NEON_AUTH_COOKIE_SECRET;
  if (!value) throw new Error("TRACKING_SECRET (ou NEON_AUTH_COOKIE_SECRET) manquant");
  return value;
}

const hmac = (purpose: string, value: string) => createHmac("sha256", secret()).update(`${purpose}|${value}`).digest("hex");

export const normalizeReference = (value: string) => value.trim().toUpperCase().slice(0, 64);
export const normalizeEmail = (value: string) => value.trim().toLowerCase().slice(0, 200);

/** Référence au format RÈRA (RERA-BK-…, RERA-BIZ-…). */
export const isReferenceFormat = (value: string) => /^RERA-[A-Z]+-[A-Z0-9]+-[A-Z0-9]+$/.test(value);

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export type CodeRequestResult =
  | { outcome: "sent"; to: string; name: string; code: string }
  | { outcome: "no_match" | "rate_limited" };

/**
 * Prépare un code si la référence et l'e-mail correspondent à une demande.
 * L'appelant envoie l'e-mail ; il répond toujours la même chose au visiteur.
 */
export async function createTrackingCode(input: { reference: string; email: string; ip: string }): Promise<CodeRequestResult> {
  const sql = db();
  const reference = normalizeReference(input.reference);
  const ipHash = hmac("ip", input.ip || "unknown");

  // Purge des anciennes lignes (opportuniste) et limites d'usage.
  await sql`DELETE FROM tracking_codes WHERE created_at < now() - interval '1 day'`;
  const [limits] = (await sql`
    SELECT
      (SELECT count(*) FROM tracking_codes WHERE ip_hash = ${ipHash} AND created_at > now() - interval '1 hour')::int AS by_ip,
      (SELECT count(*) FROM tracking_codes WHERE reference = ${reference} AND code_hash IS NOT NULL
          AND created_at > now() - interval '1 hour')::int AS by_reference
  `) as { by_ip: number; by_reference: number }[];
  if (limits.by_ip >= MAX_REQUESTS_PER_IP || limits.by_reference >= MAX_CODES_PER_REFERENCE) {
    return { outcome: "rate_limited" };
  }

  const rows = (await sql`
    SELECT full_name, email FROM reservations
     WHERE reference = ${reference} AND lower(email) = ${normalizeEmail(input.email)}
     LIMIT 1
  `) as { full_name: string; email: string }[];
  const match = rows[0];

  const code = match ? String(randomInt(0, 1_000_000)).padStart(6, "0") : null;
  // Un nouveau code annule les précédents de cette référence.
  if (match) await sql`UPDATE tracking_codes SET consumed_at = now() WHERE reference = ${reference} AND consumed_at IS NULL`;
  await sql`
    INSERT INTO tracking_codes (reference, code_hash, ip_hash, expires_at)
    VALUES (${reference}, ${code ? hmac("code", `${reference}|${code}`) : null}, ${ipHash},
            now() + make_interval(mins => ${CODE_TTL_MIN}))
  `;
  if (!match || !code) return { outcome: "no_match" };
  return { outcome: "sent", to: match.email, name: match.full_name, code };
}

export type VerifyResult = "ok" | "invalid" | "expired" | "too_many";

/** Vérifie le code (5 essais maximum, usage unique). */
export async function verifyTrackingCode(referenceInput: string, codeInput: string): Promise<VerifyResult> {
  const reference = normalizeReference(referenceInput);
  const code = codeInput.replace(/\D/g, "");
  const sql = db();
  // Compte l'essai avant de comparer : impossible de contourner la limite en parallèle.
  const rows = (await sql`
    UPDATE tracking_codes SET attempts = attempts + 1
     WHERE id = (
       SELECT id FROM tracking_codes
        WHERE reference = ${reference} AND code_hash IS NOT NULL AND consumed_at IS NULL
        ORDER BY created_at DESC LIMIT 1
     )
    RETURNING id, code_hash, attempts, expires_at < now() AS expired
  `) as { id: number; code_hash: string; attempts: number; expired: boolean }[];
  const row = rows[0];
  if (!row) return "expired";
  if (row.expired) return "expired";
  if (row.attempts > MAX_ATTEMPTS) return "too_many";
  if (code.length !== 6 || !safeEqual(row.code_hash, hmac("code", `${reference}|${code}`))) return "invalid";
  await sql`UPDATE tracking_codes SET consumed_at = now() WHERE id = ${row.id}`;
  return "ok";
}

/** Jeton d'accès signé : référence + expiration. */
export function createAccessToken(referenceInput: string) {
  const reference = normalizeReference(referenceInput);
  const expires = Date.now() + ACCESS_TTL_MIN * 60_000;
  return { value: `${reference}.${expires}.${hmac("access", `${reference}|${expires}`)}`, maxAge: ACCESS_TTL_MIN * 60 };
}

/** Le visiteur a-t-il vérifié son accès à cette référence ? */
export async function hasTrackingAccess(referenceInput: string) {
  return verifyAccessToken((await cookies()).get(TRACK_COOKIE)?.value, referenceInput);
}

/** Vérifie un jeton d'accès (valeur du cookie) pour une référence donnée. */
export function verifyAccessToken(token: string | undefined, referenceInput: string) {
  if (!token) return false;
  const [reference, expires, signature] = token.split(".");
  if (!reference || !expires || !signature) return false;
  if (reference !== normalizeReference(referenceInput) || Number(expires) < Date.now()) return false;
  return safeEqual(signature, hmac("access", `${reference}|${expires}`));
}

export async function getReservationByReference(referenceInput: string): Promise<Reservation | null> {
  const rows = await db()`
    SELECT reference, kind, full_name, email, phone, country, title,
           to_char(start_date, 'YYYY-MM-DD') AS start_date,
           to_char(end_date, 'YYYY-MM-DD') AS end_date,
           total_estimate, currency, status, summary, created_at
      FROM reservations
     WHERE reference = ${normalizeReference(referenceInput)}
     LIMIT 1
  `;
  return (rows[0] as Reservation) ?? null;
}

/** Explication du statut pour le client (aussi utilisée par le futur assistant). */
export function statusExplanation(status: string, locale: "fr" | "en") {
  const fr = locale === "fr";
  switch (status) {
    case "pending":
    case "new":
      return fr
        ? "Votre demande est bien reçue. Elle est en attente de validation par notre équipe, qui vous répondra rapidement."
        : "Your request has been received and is awaiting validation by our team, who will get back to you shortly.";
    case "in_progress":
    case "quote_sent":
      return fr
        ? "Notre équipe traite votre demande. Si un devis vous a été envoyé, il vous attend dans votre boîte e-mail."
        : "Our team is handling your request. If a quote has been sent, it is waiting in your inbox.";
    case "confirmed":
    case "accepted":
      return fr ? "Votre réservation est confirmée. Nous avons hâte de vous accueillir." : "Your booking is confirmed. We look forward to welcoming you.";
    case "paid":
      return fr ? "Votre réservation est confirmée et le paiement a été reçu." : "Your booking is confirmed and payment has been received.";
    case "completed":
      return fr ? "Votre séjour est terminé. Merci de votre visite !" : "Your stay is complete. Thank you for visiting!";
    case "refused":
      return fr
        ? "Nous n'avons pas pu donner suite à cette demande. Contactez-nous pour d'autres dates ou une autre offre."
        : "We were unable to accept this request. Contact us for other dates or another offer.";
    case "cancelled":
      return fr ? "Cette réservation a été annulée." : "This booking has been cancelled.";
    default:
      return "";
  }
}
