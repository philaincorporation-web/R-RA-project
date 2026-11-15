import { NextResponse } from "next/server";
import { checkAvailability, getInventory } from "@/lib/availability/engine";

/**
 * GET /api/availability?offer=<slug>&type=<accommodation|activity|package>&start=AAAA-MM-JJ[&end=AAAA-MM-JJ]&guests=N
 * Consultation publique, en lecture seule. Indicatif : la disponibilité est revérifiée à l'envoi de la demande.
 */
export const dynamic = "force-dynamic";

const OFFER_TYPES = new Set(["accommodation", "activity", "package"]);
/** En dessous de ce seuil, on indique le nombre d'unités restantes (« Plus que 2 disponibles »). */
const SHOW_LEFT_BELOW = 3;

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const offer = (params.get("offer") ?? "").trim().slice(0, 120);
  const type = params.get("type") ?? "";
  const start = params.get("start") ?? "";
  const end = params.get("end") || null;
  const guests = Math.min(30, Math.max(1, Number.parseInt(params.get("guests") ?? "1", 10) || 1));

  if (!offer || !OFFER_TYPES.has(type) || !start) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  try {
    let inventory = await getInventory(offer);
    if (inventory && inventory.offerType !== type) inventory = null;
    const result = await checkAvailability({ offerSlug: offer, startDate: start, endDate: end, guests, inventory });
    return NextResponse.json(
      {
        ok: true,
        status: result.status,
        reason: result.reason ?? null,
        minNights: result.minNights ?? null,
        unitsLeft:
          result.status === "available" && result.unitsLeft !== null && result.unitsLeft <= SHOW_LEFT_BELOW
            ? result.unitsLeft
            : null,
        mode: result.mode,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[availability] vérification impossible", error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 503 });
  }
}
