import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { can, requireAdmin } from "@/lib/admin/server";
import { getContactMessage } from "@/lib/admin/requests";
import { MESSAGE_STATUSES, statusLabel } from "@/lib/requests/status";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { AdminStatusBadge } from "@/components/admin/requests-ui";
import { RequestEditor } from "@/components/admin/request-editor";

export const metadata: Metadata = { title: "Message" };

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Libreville" });

export default async function MessagePage({ params }: { params: Promise<{ locale: string; reference: string }> }) {
  const { locale, reference } = await params;
  const ctx = await requireAdmin(locale, "messages.view");
  const m = await getContactMessage(decodeURIComponent(reference));
  if (!m) notFound();

  return (
    <>
      <Link href={`/${locale}/admin/messages`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-rera-navy-500 hover:text-rera-navy-800">
        <ArrowLeft className="h-4 w-4" /> Messages
      </Link>
      <AdminPageHeader
        title={m.subject}
        description={`${m.reference} · reçu le ${dateFmt.format(new Date(m.created_at))}`}
        actions={<AdminStatusBadge kind="message" status={m.status} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AdminCard className="lg:col-span-2">
          <p className="font-semibold text-rera-navy-800">{m.full_name}</p>
          <a href={`mailto:${m.email}`} className="mt-1 inline-flex items-center gap-2 break-all text-sm text-rera-lagoon-700 hover:underline">
            <Mail className="h-4 w-4 shrink-0" /> {m.email}
          </a>
          <p className="mt-5 whitespace-pre-line break-words border-t border-rera-navy-100 pt-5 text-sm leading-relaxed text-rera-navy-700">{m.message}</p>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 font-heading text-lg font-semibold text-rera-navy-800">Traitement</h2>
          {can(ctx, "messages.manage") ? (
            <RequestEditor
              locale={locale}
              target="message"
              reference={m.reference}
              version={m.version}
              status={m.status}
              notes={m.internal_notes ?? ""}
              statuses={MESSAGE_STATUSES}
            />
          ) : (
            <div className="space-y-3 text-sm text-rera-navy-700">
              <p>Statut : <strong>{statusLabel("message", m.status)}</strong></p>
              <p className="whitespace-pre-line break-words">{m.internal_notes || "Aucune note interne."}</p>
            </div>
          )}
        </AdminCard>
      </div>
    </>
  );
}
