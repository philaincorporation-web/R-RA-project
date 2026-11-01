import { NextResponse } from "next/server";
import { businessRequestSchema } from "@/lib/validation/schemas";
import { createBusinessRequest } from "@/lib/sheetdb/mutations";
import { getCurrentUser } from "@/lib/auth/server";
import { recordReservation } from "@/lib/db/reservations";
import { businessServices } from "@/data/business-services";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = businessRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_error", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const input = parsed.data;
  const result = await createBusinessRequest(input);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "sheetdb_error" }, { status: 502 });
  }

  // Historique pour l'espace client (un échec ici ne bloque pas la demande).
  const user = await getCurrentUser();
  let claimToken: string | null = null;
  try {
    const service = businessServices.find((s) => s.id === input.service);
    ({ claimToken } = await recordReservation(
      {
        reference: result.reference,
        kind: "business",
        fullName: input.contactName,
        email: input.email,
        phone: input.phone,
        title: service?.title.fr ?? input.service,
        startDate: input.preferredDate,
        summary: {
          service: input.service,
          organization: input.organization ?? "",
          attendees: input.attendees ?? null,
          budget: input.budget ?? "",
          details: input.details,
          message: input.message ?? "",
        },
      },
      user?.id ?? null
    ));
  } catch (error) {
    console.error("[business] enregistrement Postgres impossible", error);
  }

  return NextResponse.json({
    ok: true,
    reference: result.reference,
    signedIn: Boolean(user),
    claimToken,
  });
}
