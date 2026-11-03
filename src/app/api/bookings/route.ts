import { after, NextResponse } from "next/server";
import { bookingSchema } from "@/lib/validation/schemas";
import { getCurrentUser } from "@/lib/auth/server";
import { recordReservation } from "@/lib/db/reservations";
import { generateReference } from "@/lib/db/contact";
import { notifyTeam } from "@/lib/notifications/team";

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
  const reference = generateReference("RERA-BK");
  const user = await getCurrentUser();
  let claimToken: string | null = null;
  try {
    ({ claimToken } = await recordReservation(
      {
        reference,
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
    console.error("[bookings] enregistrement impossible", error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  after(() =>
    notifyTeam({
      subject: `Nouvelle réservation : ${input.offerName}`,
      lines: [
        ["Référence", reference],
        ["Offre", input.offerName],
        ["Client", input.fullName],
        ["E-mail", input.email],
        ["Téléphone", input.phone],
        ["Arrivée", input.startDate],
      ],
      adminPath: `/fr/admin/reservations/${encodeURIComponent(reference)}`,
    })
  );

  return NextResponse.json({ ok: true, reference, signedIn: Boolean(user), claimToken });
}
