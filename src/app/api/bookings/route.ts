import { after, NextResponse } from "next/server";
import { bookingSchema } from "@/lib/validation/schemas";
import { getCurrentUser } from "@/lib/auth/server";
import { recordReservation, type CapacityGuard } from "@/lib/db/reservations";
import { checkAvailability, getInventory, isManaged, periodFor, unitsFor } from "@/lib/availability/engine";
import { HOLD_HOURS, type OfferInventory } from "@/lib/availability/types";
import { generateReference } from "@/lib/db/contact";
import { notifyTeam } from "@/lib/notifications/team";
import { acknowledgeVisitor } from "@/lib/notifications/visitor";

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
  const guests = input.adults + input.children;

  // Disponibilité : vérifiée ici pour un message clair, puis revérifiée sous verrou à l'enregistrement.
  let inventory: OfferInventory | null;
  let capacity: CapacityGuard | undefined;
  try {
    inventory = await getInventory(input.offerSlug);
    if (inventory && inventory.offerType !== input.offerType) inventory = null;
    const check = await checkAvailability({
      offerSlug: input.offerSlug,
      startDate: input.startDate,
      endDate: input.endDate,
      guests,
      inventory,
    });
    if (check.status === "invalid" && check.reason !== "past_date") {
      return NextResponse.json({ ok: false, error: "invalid_period", reason: check.reason, minNights: check.minNights }, { status: 422 });
    }
    if (check.status === "unavailable") {
      return NextResponse.json({ ok: false, error: "unavailable", reason: check.reason }, { status: 409 });
    }
    if (isManaged(inventory)) {
      const period = periodFor(inventory.mode, input.startDate, input.endDate);
      capacity = { ...period, unitsTotal: inventory.unitsTotal };
    }
  } catch (error) {
    console.error("[bookings] vérification de disponibilité impossible", error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  const user = await getCurrentUser();
  let claimToken: string | null = null;
  try {
    let full: boolean | undefined;
    ({ claimToken, full } = await recordReservation(
      {
        reference,
        kind: "booking",
        offerSlug: input.offerSlug,
        units: unitsFor(inventory, guests),
        holdHours: HOLD_HOURS,
        source: input.source ?? "site",
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
      user?.id ?? null,
      capacity
    ));
    // Un autre client a pris la dernière place entre la vérification et l'enregistrement.
    if (full) return NextResponse.json({ ok: false, error: "unavailable", reason: "full" }, { status: 409 });
  } catch (error) {
    console.error("[bookings] enregistrement impossible", error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  const travellers = `${input.adults} adulte(s)${input.children ? `, ${input.children} enfant(s)` : ""}`;
  after(() =>
    Promise.all([
      notifyTeam({
        subject: `Nouvelle réservation : ${input.offerName}`,
        lines: [
          ["Référence", reference],
          ["Offre", input.offerName],
          ["Client", input.fullName],
          ["E-mail", input.email],
          ["Téléphone", input.phone],
          ["Arrivée", input.startDate],
          ["Départ", input.endDate ?? "—"],
          ["Voyageurs", travellers],
        ],
        adminPath: `/fr/admin/reservations/${encodeURIComponent(reference)}`,
        replyTo: input.email,
      }),
      acknowledgeVisitor({
        to: input.email,
        name: input.fullName,
        what: "votre demande de réservation",
        reference,
        lines: [
          ["Offre", input.offerName],
          ["Arrivée", input.startDate],
          ["Départ", input.endDate ?? "—"],
          ["Voyageurs", travellers],
        ],
      }),
    ])
  );

  return NextResponse.json({ ok: true, reference, signedIn: Boolean(user), claimToken });
}
