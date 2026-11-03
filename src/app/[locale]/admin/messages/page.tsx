import type { Metadata } from "next";
import { can, requireAdmin } from "@/lib/admin/server";
import { listContactMessages } from "@/lib/admin/requests";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminStatusBadge, parsePage, RequestFiltersForm, RequestList, RequestPagination, RequestRow } from "@/components/admin/requests-ui";

export const metadata: Metadata = { title: "Messages" };

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Libreville" });

type Search = { q?: string; status?: string; page?: string };

export default async function MessagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Search>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const ctx = await requireAdmin(locale, "messages.view");
  const base = `/${locale}/admin/messages`;
  const { items, hasNext, page } = await listContactMessages({
    q: search.q,
    status: search.status,
    page: parsePage(search.page),
  });

  return (
    <>
      <AdminPageHeader
        title="Messages de contact"
        description={can(ctx, "messages.manage") ? "Les messages envoyés depuis le formulaire de contact du site." : "Consultation des messages (lecture seule)."}
      />
      <RequestFiltersForm action={base} kind="message" values={search} searchPlaceholder="Nom, e-mail, sujet, référence…" />
      <RequestList empty={items.length === 0}>
        {items.map((m) => (
          <RequestRow
            key={m.reference}
            href={`${base}/${encodeURIComponent(m.reference)}`}
            title={m.full_name}
            subtitle={m.subject}
            meta={`${dateFmt.format(new Date(m.created_at))} · ${m.email}`}
            badge={<AdminStatusBadge kind="message" status={m.status} />}
          />
        ))}
      </RequestList>
      <RequestPagination base={base} params={{ q: search.q, status: search.status }} page={page} hasNext={hasNext} />
    </>
  );
}
