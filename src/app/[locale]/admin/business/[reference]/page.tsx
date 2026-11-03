import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { can, requireAdmin } from "@/lib/admin/server";
import { getAdminReservation } from "@/lib/admin/requests";
import { ReservationDetail } from "@/components/admin/reservation-detail";

export const metadata: Metadata = { title: "Demande Business" };

export default async function BusinessRequestPage({ params }: { params: Promise<{ locale: string; reference: string }> }) {
  const { locale, reference } = await params;
  const ctx = await requireAdmin(locale, "business.view");
  const reservation = await getAdminReservation("business", decodeURIComponent(reference));
  if (!reservation) notFound();

  return (
    <ReservationDetail
      locale={locale}
      reservation={reservation}
      backHref={`/${locale}/admin/business`}
      backLabel="Demandes Business"
      canManage={can(ctx, "business.manage")}
    />
  );
}
