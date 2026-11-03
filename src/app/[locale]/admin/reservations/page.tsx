import type { Metadata } from "next";
import { can, requireAdmin } from "@/lib/admin/server";
import { listAdminReservations } from "@/lib/admin/requests";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminStatusBadge, parsePage, RequestFiltersForm, RequestList, RequestPagination, RequestRow } from "@/components/admin/requests-ui";
import { dateRange, kindLabel, totalLabel } from "@/components/account/reservation-view";

export const metadata: Metadata = { title: "Réservations" };

const OFFER_TYPES = [
  { value: "package", label: "Séjour" },
  { value: "activity", label: "Activité" },
  { value: "accommodation", label: "Hébergement" },
];

type Search = { q?: string; status?: string; type?: string; from?: string; to?: string; page?: string };

export default async function ReservationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Search>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const ctx = await requireAdmin(locale, "reservations.view");
  const base = `/${locale}/admin/reservations`;
  const { items, hasNext, page } = await listAdminReservations("booking", {
    q: search.q,
    status: search.status,
    offerType: search.type,
    from: search.from,
    to: search.to,
    page: parsePage(search.page),
  });

  return (
    <>
      <AdminPageHeader
        title="Réservations"
        description={can(ctx, "reservations.manage") ? "Confirmez, suivez et annotez les réservations." : "Consultation des réservations (lecture seule)."}
      />
      <RequestFiltersForm action={base} kind="booking" values={search} searchPlaceholder="Nom, e-mail, téléphone, référence, offre…" dateLabel="Arrivée" offerTypes={OFFER_TYPES} />
      <RequestList empty={items.length === 0}>
        {items.map((r) => (
          <RequestRow
            key={r.reference}
            href={`${base}/${encodeURIComponent(r.reference)}`}
            title={r.full_name}
            subtitle={`${kindLabel(r, "fr")} · ${r.title}`}
            meta={`${dateRange(r, "fr")} · ${totalLabel(r, "fr")} · ${r.reference}`}
            badge={<AdminStatusBadge kind="booking" status={r.status} />}
          />
        ))}
      </RequestList>
      <RequestPagination base={base} params={{ q: search.q, status: search.status, type: search.type, from: search.from, to: search.to }} page={page} hasNext={hasNext} />
    </>
  );
}
