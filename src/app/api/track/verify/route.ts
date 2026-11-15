import { NextResponse } from "next/server";
import { z } from "zod";
import { createAccessToken, normalizeReference, TRACK_COOKIE, verifyTrackingCode } from "@/lib/tracking/server";

/**
 * POST /api/track/verify { reference, code }
 * Vérifie le code reçu par e-mail ; en cas de succès, ouvre l'accès à la demande pendant 30 min.
 */
const schema = z.object({
  reference: z.string().trim().min(6).max(64),
  code: z.string().trim().min(6).max(12),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid" }, { status: 422 });

  try {
    const result = await verifyTrackingCode(parsed.data.reference, parsed.data.code);
    if (result !== "ok") {
      return NextResponse.json({ ok: false, error: result }, { status: result === "too_many" ? 429 : 400 });
    }
    const token = createAccessToken(parsed.data.reference);
    const response = NextResponse.json({ ok: true, reference: normalizeReference(parsed.data.reference) });
    response.cookies.set(TRACK_COOKIE, token.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: token.maxAge,
    });
    return response;
  } catch (error) {
    console.error("[track] vérification du code", error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
