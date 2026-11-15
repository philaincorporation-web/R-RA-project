import "server-only";
import { createHmac } from "node:crypto";
import { db } from "@/lib/db/sql";

/**
 * Compteur d'usage de l'assistant : un nombre de messages par visiteur et par jour.
 * Le visiteur est identifié par une empreinte anonyme de son adresse IP (jamais l'IP elle-même).
 */

export function visitorHash(ip: string) {
  const secret = process.env.TRACKING_SECRET || process.env.NEON_AUTH_COOKIE_SECRET || "rera";
  return createHmac("sha256", secret).update(`assistant|${ip || "unknown"}`).digest("hex").slice(0, 32);
}

export type UsageCheck = { allowed: true } | { allowed: false; reason: "visitor_limit" | "global_limit" };

/** Compte un message ; refuse si le visiteur ou le site a atteint sa limite du jour. */
export async function countAssistantMessage(hash: string, limits: { perVisitor: number; visitorsPerDay: number }): Promise<UsageCheck> {
  const sql = db();
  const [state] = (await sql`
    WITH today AS (SELECT (now() AT TIME ZONE 'Africa/Libreville')::date AS d)
    SELECT
      (SELECT messages FROM assistant_usage, today WHERE day = today.d AND visitor_hash = ${hash}) AS mine,
      (SELECT count(*) FROM assistant_usage, today WHERE day = today.d)::int AS visitors
  `) as { mine: number | null; visitors: number }[];

  if (state.mine === null && state.visitors >= limits.visitorsPerDay) return { allowed: false, reason: "global_limit" };
  if ((state.mine ?? 0) >= limits.perVisitor) return { allowed: false, reason: "visitor_limit" };

  await sql`
    INSERT INTO assistant_usage (day, visitor_hash, messages)
    VALUES ((now() AT TIME ZONE 'Africa/Libreville')::date, ${hash}, 1)
    ON CONFLICT (day, visitor_hash) DO UPDATE SET messages = assistant_usage.messages + 1
  `;
  // Purge des jours anciens (opportuniste).
  if (Math.random() < 0.05) await sql`DELETE FROM assistant_usage WHERE day < CURRENT_DATE - 30`;
  return { allowed: true };
}
