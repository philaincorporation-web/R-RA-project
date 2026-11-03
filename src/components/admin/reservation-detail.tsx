import Link from "next/link";
import { ArrowLeft, FileSpreadsheet, Link2, Mail, Phone } from "lucide-react";
import type { AdminReservation } from "@/lib/admin/requests";
import { statusesFor, normalizeStatus, statusLabel } from "@/lib/requests/status";
import { summaryRows } from "@/components/account/reservation-view";
import { AdminCard, AdminPageHeader } from "./page-header";
import { AdminStatusBadge } from "./requests-ui";
import { RequestEditor } from "./request-editor";

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Libreville" });

/** Fiche détaillée commune aux réservations et aux demandes Business. */
export function ReservationDetail({
  locale,
  reservation: r,
  backHref,
  backLabel,
  canManage,
}: {
  locale: string;
  reservation: AdminReservation;
  backHref: string;
  backLabel: string;
  canManage: boolean;
}) {
  const kind = r.kind;
  const rows = summaryRows(r, "fr");
  return (
    <>
      <Link href={backHref} className="mb-4 inline-flex items-center gap-1.5 text-sm text-rera-navy-500 hover:text-rera-navy-800">
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </Link>
      <AdminPageHeader title={r.title} description={`${r.reference} · reçue le ${dateFmt.format(new Date(r.created_at))}`} actions={<AdminStatusBadge kind={kind} status={r.status} />} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AdminCard className="lg:col-span-2">
          <dl className="divide-y divide-rera-navy-100 text-sm">
            {rows.map(([label, value], i) => (
              <div key={`${label}-${i}`} className="grid grid-cols-1 gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-3 sm:gap-4">
                <dt className="text-rera-navy-500">{label}</dt>
                <dd className="whitespace-pre-line break-words font-medium text-rera-navy-800 sm:col-span-2">{value}</dd>
              </div>
            ))}
          </dl>
        </AdminCard>

        <div className="space-y-6">
          <AdminCard>
            <h2 className="mb-4 font-heading text-lg font-semibold text-rera-navy-800">Traitement</h2>
            {canManage ? (
              <RequestEditor
                locale={locale}
                target="reservation"
                reference={r.reference}
                version={r.version}
                status={normalizeStatus(kind, r.status)}
                notes={r.internal_notes ?? ""}
                statuses={statusesFor(kind)}
              />
            ) : (
              <div className="space-y-3 text-sm text-rera-navy-700">
                <p>Statut : <strong>{statusLabel(kind, r.status)}</strong></p>
                <p className="whitespace-pre-line break-words">{r.internal_notes || "Aucune note interne."}</p>
              </div>
            )}
          </AdminCard>

          <AdminCard>
            <h2 className="mb-3 font-heading text-lg font-semibold text-rera-navy-800">Contact</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`mailto:${r.email}`} className="flex items-center gap-2 break-all text-rera-lagoon-700 hover:underline">
                  <Mail className="h-4 w-4 shrink-0" /> {r.email}
                </a>
              </li>
              {r.phone ? (
                <li>
                  <a href={`tel:${r.phone.replace(/\s+/g, "")}`} className="flex items-center gap-2 text-rera-lagoon-700 hover:underline">
                    <Phone className="h-4 w-4 shrink-0" /> {r.phone}
                  </a>
                </li>
              ) : null}
              <li className="flex items-center gap-2 text-rera-navy-500">
                <Link2 className="h-4 w-4 shrink-0" />
                {r.user_id ? "Rattachée à un compte client" : "Sans compte client"}
              </li>
              {r.source === "sheets" ? (
                <li className="flex items-center gap-2 text-rera-navy-500">
                  <FileSpreadsheet className="h-4 w-4 shrink-0" />
                  Importée depuis Google Sheets
                </li>
              ) : null}
            </ul>
          </AdminCard>
        </div>
      </div>
    </>
  );
}
