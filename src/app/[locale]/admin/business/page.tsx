import type { Metadata } from "next";
import { can, requireAdmin } from "@/lib/admin/server";
import { listAdminReservations } from "@/lib/admin/requests";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminStatusBadge, parsePage, RequestFiltersForm, RequestList, RequestPagination, RequestRow } from "@/components/admin/requests-ui";
import { dateRange } from "@/components/account/reservation-view";

export const metadata: Metadata = { title: "Demandes Business" };

type Search = { q?: string; status?: string; from?: string; to?: string; page?: string };

export default async function BusinessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Search>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const ctx = await requireAdmin(locale, "business.view");
  const base = `/${locale}/admin/business`;
  const { items, hasNext, page } = await listAdminReservations("business", {
    q: search.q,
    status: search.status,
    from: search.from,
    to: search.to,
    page: parsePage(search.page),
  });

  return (
    <>
      <AdminPageHeader
        title="Demandes Business"
        description={can(ctx, "business.manage") ? "Suivez les demandes de la première prise de contact au devis." : "Consultation des demandes (lecture seule)."}
      />
      <RequestFiltersForm action={base} kind="business" values={search} searchPlaceholder="Contact, e-mail, téléphone, référence, rubrique…" dateLabel="Date souhaitée" />
      <RequestList empty={items.length === 0}>
        {items.map((r) => (
          <RequestRow
            key={r.reference}
            href={`${base}/${encodeURIComponent(r.reference)}`}
            title={r.full_name}
            subtitle={[r.title, typeof r.summary.organization === "string" ? r.summary.organization : ""].filter(Boolean).join(" · ")}
            meta={`${dateRange(r, "fr")} · ${r.reference}`}
            badge={<AdminStatusBadge kind="business" status={r.status} />}
          />
        ))}
      </RequestList>
      <RequestPagination base={base} params={{ q: search.q, status: search.status, from: search.from, to: search.to }} page={page} hasNext={hasNext} />
    </>
  );
}
