import { after, NextResponse } from "next/server";
import { z } from "zod";
import { createTrackingCode } from "@/lib/tracking/server";
import { sendTrackingCode } from "@/lib/notifications/tracking";

/**
 * POST /api/track/request { reference, email, locale }
 * Envoie un code de suivi si la référence et l'e-mail correspondent.
 * Réponse identique dans tous les cas (sauf limite atteinte) : ne révèle pas si la demande existe.
 */
const schema = z.object({
  reference: z.string().trim().min(6).max(64),
  email: z.string().trim().email().max(200),
  locale: z.enum(["fr", "en"]).default("fr"),
});

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "validation_error" }, { status: 422 });
  const { reference, email, locale } = parsed.data;

  try {
    const result = await createTrackingCode({ reference, email, ip: clientIp(request) });
    if (result.outcome === "rate_limited") {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }
    if (result.outcome === "sent") {
      // Envoi après la réponse : même temps de réponse qu'une référence inconnue (pas d'indice par le délai).
      after(() => sendTrackingCode({ to: result.to, name: result.name, reference: reference.toUpperCase(), code: result.code, locale }));
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[track] demande de code", error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
