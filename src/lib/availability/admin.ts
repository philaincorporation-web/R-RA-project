import "server-only";
import { db, isUuid } from "@/lib/db/sql";
import type { InventoryMode, OfferType } from "./types";

/** Écritures du back-office : règles de stock et fermetures. Les droits sont vérifiés par les actions. */

export async function upsertInventory(input: {
  offerSlug: string;
  offerType: OfferType;
  mode: InventoryMode;
  unitsTotal: number | null;
  guestsPerUnit: number | null;
  minNights: number;
  updatedBy: string;
}) {
  const rows = await db()`
    WITH old AS (
      SELECT mode, units_total, guests_per_unit, min_nights FROM offer_inventory WHERE offer_slug = ${input.offerSlug}
    )
    INSERT INTO offer_inventory (offer_slug, offer_type, mode, units_total, guests_per_unit, min_nights, updated_by, updated_at)
    VALUES (${input.offerSlug}, ${input.offerType}, ${input.mode}, ${input.unitsTotal}, ${input.guestsPerUnit},
            ${input.minNights}, ${input.updatedBy}, now())
    ON CONFLICT (offer_slug) DO UPDATE
       SET offer_type = EXCLUDED.offer_type, mode = EXCLUDED.mode, units_total = EXCLUDED.units_total,
           guests_per_unit = EXCLUDED.guests_per_unit, min_nights = EXCLUDED.min_nights,
           updated_by = EXCLUDED.updated_by, updated_at = now()
    RETURNING (SELECT row_to_json(old) FROM old) AS previous
  `;
  return (rows[0] as { previous: Record<string, unknown> | null })?.previous ?? null;
}

export interface AvailabilityBlock {
  id: string;
  offer_slug: string;
  start_date: string;
  end_date: string;
  units: number | null;
  reason: string | null;
}

/** Fermetures en cours ou à venir. */
export async function listUpcomingBlocks(): Promise<AvailabilityBlock[]> {
  const rows = await db()`
    SELECT id, offer_slug, to_char(start_date, 'YYYY-MM-DD') AS start_date, to_char(end_date, 'YYYY-MM-DD') AS end_date,
           units, reason
      FROM availability_blocks
     WHERE end_date > (now() AT TIME ZONE 'Africa/Libreville')::date
     ORDER BY start_date, offer_slug
     LIMIT 200
  `;
  return rows as AvailabilityBlock[];
}

export async function insertBlock(input: {
  offerSlug: string;
  startDate: string;
  endDate: string;
  units: number | null;
  reason: string;
  createdBy: string;
}) {
  const rows = await db()`
    INSERT INTO availability_blocks (offer_slug, start_date, end_date, units, reason, created_by)
    VALUES (${input.offerSlug}, ${input.startDate}, ${input.endDate}, ${input.units}, ${input.reason || null}, ${input.createdBy})
    RETURNING id
  `;
  return (rows[0] as { id: string }).id;
}

export async function deleteBlock(id: string) {
  if (!isUuid(id)) return null;
  const rows = await db()`
    DELETE FROM availability_blocks WHERE id = ${id}
    RETURNING offer_slug, to_char(start_date, 'YYYY-MM-DD') AS start_date, to_char(end_date, 'YYYY-MM-DD') AS end_date, units
  `;
  return (rows[0] as Omit<AvailabilityBlock, "id" | "reason">) ?? null;
}
