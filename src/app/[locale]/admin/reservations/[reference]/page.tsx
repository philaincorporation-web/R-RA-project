import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { can, requireAdmin } from "@/lib/admin/server";
import { getAdminReservation } from "@/lib/admin/requests";
import { ReservationDetail } from "@/components/admin/reservation-detail";

export const metadata: Metadata = { title: "Réservation" };

export default async function ReservationPage({ params }: { params: Promise<{ locale: string; reference: string }> }) {
  const { locale, reference } = await params;
  const ctx = await requireAdmin(locale, "reservations.view");
  const reservation = await getAdminReservation("booking", decodeURIComponent(reference));
  if (!reservation) notFound();

  return (
    <ReservationDetail
      locale={locale}
      reservation={reservation}
      backHref={`/${locale}/admin/reservations`}
      backLabel="Réservations"
      canManage={can(ctx, "reservations.manage")}
    />
  );
}
