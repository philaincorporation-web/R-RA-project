import Image from "next/image";
import type { Reservation } from "@/lib/db/reservations";
import type { AppLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/utils/format";
import { siteConfig } from "@/data";
import { StatusBadge, summaryRows } from "./reservation-view";

/**
 * Récapitulatif imprimable d'une demande (espace client et suivi sans compte).
 * Sert aussi de justificatif en cas de réclamation.
 */
export function ReservationSummaryCard({
  r,
  locale,
  explanation,
}: {
  r: Reservation;
  locale: AppLocale;
  /** Phrase expliquant le statut au client, affichée sous l'en-tête. */
  explanation?: string;
}) {
  const fr = locale === "fr";
  const rows = summaryRows(r, locale);
  return (
    <article className="card-surface rounded-xl2 p-6 shadow-premium sm:p-8 print:border-0 print:shadow-none">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-rera-navy-100/60 pb-5 dark:border-white/10">
        <div className="flex items-center gap-3">
          <Image src={siteConfig.images.logo} alt="RÈRA" width={44} height={44} className="rounded-full" />
          <div>
            <p className="font-heading text-lg font-bold text-rera-navy-800 dark:text-white">
              {fr ? "Récapitulatif de demande" : "Request summary"}
            </p>
            <p className="text-xs text-rera-navy-500 dark:text-rera-mist/60">
              {fr ? "Envoyée le" : "Sent on"} {formatDate(r.created_at, locale)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <StatusBadge status={r.status} locale={locale} />
          <p className="mt-2 font-mono text-xs font-semibold text-rera-navy-600 dark:text-rera-mist/80">{r.reference}</p>
        </div>
      </header>

      {explanation ? (
        <p className="mt-5 rounded-lg bg-rera-mist px-4 py-3 text-sm text-rera-navy-700 dark:bg-white/5 dark:text-rera-mist/85">{explanation}</p>
      ) : null}

      <dl className="mt-5 divide-y divide-rera-navy-100/60 text-sm dark:divide-white/10">
        {rows.map(([label, value], i) => (
          <div key={`${label}-${i}`} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="text-rera-navy-500 dark:text-rera-mist/60">{label}</dt>
            <dd className="whitespace-pre-line font-medium text-rera-navy-800 dark:text-white sm:col-span-2">{value}</dd>
          </div>
        ))}
      </dl>

      <footer className="mt-6 border-t border-rera-navy-100/60 pt-4 text-xs text-rera-navy-500 dark:border-white/10 dark:text-rera-mist/60">
        {fr
          ? `Pour toute question ou réclamation, contactez RÈRA (${siteConfig.contact.email} · ${siteConfig.contact.phone}) en indiquant la référence ${r.reference}. Le montant indiqué est une estimation, confirmée par notre équipe.`
          : `For any question or claim, contact RÈRA (${siteConfig.contact.email} · ${siteConfig.contact.phone}) quoting reference ${r.reference}. The amount shown is an estimate, confirmed by our team.`}
      </footer>
    </article>
  );
}
