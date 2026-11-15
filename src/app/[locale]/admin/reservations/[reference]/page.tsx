import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { can, requireAdmin } from "@/lib/admin/server";
import { getAdminReservation, getBookingForStatus } from "@/lib/admin/requests";
import { checkAvailability } from "@/lib/availability/engine";
import type { AvailabilityResult } from "@/lib/availability/types";
import { ReservationDetail } from "@/components/admin/reservation-detail";

export const metadata: Metadata = { title: "Réservation" };

/** Disponibilité de l'offre sur les dates de la demande, sans compter la demande elle-même. */
async function availabilityFor(reference: string): Promise<AvailabilityResult | null> {
  try {
    const booking = await getBookingForStatus(reference);
    if (!booking?.offer_slug || !booking.start_date) return null;
    return await checkAvailability({
      offerSlug: booking.offer_slug,
      startDate: booking.start_date,
      endDate: booking.end_date,
      guests: 1,
      units: booking.units,
      excludeReference: reference,
    });
  } catch (error) {
    console.error("[admin] disponibilité de la réservation", error);
    return null;
  }
}

export default async function ReservationPage({ params }: { params: Promise<{ locale: string; reference: string }> }) {
  const { locale, reference } = await params;
  const ctx = await requireAdmin(locale, "reservations.view");
  const ref = decodeURIComponent(reference);
  const [reservation, availability] = await Promise.all([getAdminReservation("booking", ref), availabilityFor(ref)]);
  if (!reservation) notFound();

  return (
    <ReservationDetail
      locale={locale}
      reservation={reservation}
      backHref={`/${locale}/admin/reservations`}
      backLabel="Réservations"
      canManage={can(ctx, "reservations.manage")}
      availability={availability}
    />
  );
}
