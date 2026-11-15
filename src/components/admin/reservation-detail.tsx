import Link from "next/link";
import { ArrowLeft, Bot, CalendarCheck2, CalendarX2, CircleHelp, FileSpreadsheet, Link2, Mail, Phone } from "lucide-react";
import type { AdminReservation } from "@/lib/admin/requests";
import type { AvailabilityResult } from "@/lib/availability/types";
import { statusesFor, normalizeStatus, statusLabel } from "@/lib/requests/status";
import { summaryRows } from "@/components/account/reservation-view";
import { AdminCard, AdminPageHeader } from "./page-header";
import { AdminStatusBadge } from "./requests-ui";
import { RequestEditor } from "./request-editor";

/** Disponibilité de l'offre sur les dates de la demande, du point de vue d'une confirmation. */
function AvailabilityPanel({ locale, availability: a }: { locale: string; availability: AvailabilityResult | null }) {
  const link = (
    <Link href={`/${locale}/admin/availability`} className="mt-3 inline-block text-sm font-medium text-rera-lagoon-700 hover:underline">
      Gérer les disponibilités →
    </Link>
  );
  let tone = "border-rera-navy-100 bg-rera-mist text-rera-navy-700";
  let Icon = CircleHelp;
  let title = "Disponibilité non vérifiable";
  let text = "Les dates ou l'offre de cette demande ne permettent pas de calculer la disponibilité.";

  if (a?.status === "on_request") {
    title = "Offre sur demande";
    text = "Le stock de cette offre n'est pas géré : vérifiez la disponibilité à la main avant de confirmer.";
  } else if (a && a.unitsLeftFirm !== null && a.unitsTotal !== null) {
    const held = Math.max(0, ...a.nights.map((n) => n.held));
    const fits = a.unitsLeftFirm >= a.unitsRequested && !a.nights.some((n) => n.closed);
    tone = fits ? "border-rera-emerald-200 bg-rera-emerald-50 text-rera-emerald-800" : "border-red-200 bg-red-50 text-red-800";
    Icon = fits ? CalendarCheck2 : CalendarX2;
    title = fits ? "Confirmation possible" : "Plus assez de place";
    text = `Demande : ${a.unitsRequested} ${a.mode === "daily" ? "place(s)" : "logement(s)"} · libre au plus juste : ${a.unitsLeftFirm} sur ${a.unitsTotal} (réservations confirmées et fermetures).`;
    if (held > 0) text += ` ${held} autre(s) unité(s) sont en attente de traitement sur ces dates.`;
  }

  return (
    <AdminCard>
      <h2 className="mb-3 font-heading text-lg font-semibold text-rera-navy-800">Disponibilité</h2>
      <div className={`rounded-lg border p-3 text-sm ${tone}`}>
        <p className="flex items-center gap-2 font-semibold">
          <Icon className="h-4 w-4 shrink-0" /> {title}
        </p>
        <p className="mt-1">{text}</p>
      </div>
      {link}
    </AdminCard>
  );
}

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Libreville" });

/** Fiche détaillée commune aux réservations et aux demandes Business. */
export function ReservationDetail({
  locale,
  reservation: r,
  backHref,
  backLabel,
  canManage,
  availability,
}: {
  locale: string;
  reservation: AdminReservation;
  backHref: string;
  backLabel: string;
  canManage: boolean;
  /** Réservations uniquement : disponibilité de l'offre sur les dates demandées (hors cette demande). */
  availability?: AvailabilityResult | null;
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
                notifyOption={kind === "booking"}
              />
            ) : (
              <div className="space-y-3 text-sm text-rera-navy-700">
                <p>Statut : <strong>{statusLabel(kind, r.status)}</strong></p>
                <p className="whitespace-pre-line break-words">{r.internal_notes || "Aucune note interne."}</p>
              </div>
            )}
          </AdminCard>

          {availability !== undefined ? <AvailabilityPanel locale={locale} availability={availability} /> : null}

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
              {r.source === "assistant" ? (
                <li className="flex items-center gap-2 font-medium text-rera-lagoon-700">
                  <Bot className="h-4 w-4 shrink-0" />
                  Transmise via l&apos;assistant IA
                </li>
              ) : null}
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
