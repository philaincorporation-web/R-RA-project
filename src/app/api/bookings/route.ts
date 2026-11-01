import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/validation/schemas";
import { createBooking } from "@/lib/sheetdb/mutations";
import { getCurrentUser } from "@/lib/auth/server";
import { recordReservation } from "@/lib/db/reservations";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_error", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const input = parsed.data;
  const result = await createBooking(input);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "sheetdb_error" }, { status: 502 });
  }

  // Historique pour l'espace client. Un échec ici ne doit pas faire échouer la réservation
  // (elle est déjà enregistrée dans Google Sheets pour l'équipe).
  const user = await getCurrentUser();
  let claimToken: string | null = null;
  try {
    ({ claimToken } = await recordReservation(
      {
        reference: result.reference,
        kind: "booking",
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        country: input.country,
        title: input.offerName,
        startDate: input.startDate,
        endDate: input.endDate,
        totalEstimate: input.totalEstimate,
        currency: input.currency,
        summary: {
          offerType: input.offerType,
          offerSlug: input.offerSlug,
          adults: input.adults,
          children: input.children,
          options: input.options,
          paymentMethod: input.paymentMethod ?? null,
          notes: input.notes ?? "",
        },
      },
      user?.id ?? null
    ));
  } catch (error) {
    console.error("[bookings] enregistrement Postgres impossible", error);
  }

  return NextResponse.json({
    ok: true,
    reference: result.reference,
    signedIn: Boolean(user),
    claimToken,
  });
}
