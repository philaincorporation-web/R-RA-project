import { CalendarDays, Hash, Wallet } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatPrice } from "@/lib/utils/format";
import { additionalOptions, paymentMethods } from "@/data/booking-options";
import { businessServices } from "@/data/business-services";
import type { Reservation } from "@/lib/db/reservations";
import type { AppLocale } from "@/lib/i18n/config";

const statusLabels: Record<string, { fr: string; en: string; tone: string }> = {
  pending: { fr: "En attente de confirmation", en: "Awaiting confirmation", tone: "bg-rera-gold-100 text-rera-gold-700 dark:bg-rera-gold-400/15 dark:text-rera-gold-300" },
  confirmed: { fr: "Confirmée", en: "Confirmed", tone: "bg-rera-emerald-100 text-rera-emerald-700 dark:bg-rera-emerald-400/15 dark:text-rera-emerald-300" },
  paid: { fr: "Payée", en: "Paid", tone: "bg-rera-emerald-100 text-rera-emerald-700 dark:bg-rera-emerald-400/15 dark:text-rera-emerald-300" },
  cancelled: { fr: "Annulée", en: "Cancelled", tone: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300" },
  completed: { fr: "Terminée", en: "Completed", tone: "bg-rera-navy-100 text-rera-navy-700 dark:bg-white/10 dark:text-rera-mist" },
  new: { fr: "Demande reçue", en: "Request received", tone: "bg-rera-gold-100 text-rera-gold-700 dark:bg-rera-gold-400/15 dark:text-rera-gold-300" },
  in_progress: { fr: "En cours de traitement", en: "In progress", tone: "bg-rera-lagoon-100 text-rera-lagoon-700 dark:bg-rera-lagoon-400/15 dark:text-rera-lagoon-200" },
  quote_sent: { fr: "Devis envoyé", en: "Quote sent", tone: "bg-rera-lagoon-100 text-rera-lagoon-700 dark:bg-rera-lagoon-400/15 dark:text-rera-lagoon-200" },
  accepted: { fr: "Acceptée", en: "Accepted", tone: "bg-rera-emerald-100 text-rera-emerald-700 dark:bg-rera-emerald-400/15 dark:text-rera-emerald-300" },
  refused: { fr: "Refusée", en: "Declined", tone: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300" },
};

export function StatusBadge({ status, locale }: { status: string; locale: AppLocale }) {
  const s = statusLabels[status] ?? statusLabels.pending;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", s.tone)}>
      {locale === "fr" ? s.fr : s.en}
    </span>
  );
}

export function kindLabel(r: Reservation, locale: AppLocale) {
  const fr = locale === "fr";
  if (r.kind === "business") return "RÈRA Business";
  const type = String(r.summary.offerType ?? "");
  const map: Record<string, [string, string]> = {
    package: ["Séjour", "Stay"],
    activity: ["Activité", "Activity"],
    accommodation: ["Hébergement", "Accommodation"],
  };
  const pair = map[type];
  return pair ? (fr ? pair[0] : pair[1]) : fr ? "Réservation" : "Booking";
}

export function dateRange(r: Reservation, locale: AppLocale) {
  if (!r.start_date) return "—";
  const start = formatDate(r.start_date, locale);
  return r.end_date ? `${start} → ${formatDate(r.end_date, locale)}` : start;
}

export function totalLabel(r: Reservation, locale: AppLocale) {
  if (r.kind === "business" || r.total_estimate == null) return locale === "fr" ? "Sur devis" : "On quote";
  return formatPrice(Number(r.total_estimate), r.currency ?? "XAF", locale);
}

/** Carte résumée affichée dans la liste de l'espace client. */
export function ReservationMeta({ r, locale }: { r: Reservation; locale: AppLocale }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-rera-navy-500 dark:text-rera-mist/60">
      <span className="flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5 text-rera-lagoon-500" />
        {dateRange(r, locale)}
      </span>
      <span className="flex items-center gap-1.5">
        <Wallet className="h-3.5 w-3.5 text-rera-lagoon-500" />
        {totalLabel(r, locale)}
      </span>
      <span className="flex items-center gap-1.5">
        <Hash className="h-3.5 w-3.5 text-rera-lagoon-500" />
        {r.reference}
      </span>
    </div>
  );
}

/** Lignes détaillées du récapitulatif (page détail, imprimable). */
export function summaryRows(r: Reservation, locale: AppLocale): [string, string][] {
  const fr = locale === "fr";
  const s = r.summary;
  const rows: [string, string][] = [];

  if (r.kind === "booking") {
    const options = (Array.isArray(s.options) ? (s.options as string[]) : [])
      .map((id) => additionalOptions.find((o) => o.id === id))
      .filter(Boolean)
      .map((o) => (fr ? o!.fr : o!.en));
    const payment = paymentMethods.find((m) => m.id === s.paymentMethod);
    rows.push(
      [fr ? "Offre" : "Offer", `${r.title} (${kindLabel(r, locale)})`],
      [fr ? "Dates" : "Dates", dateRange(r, locale)],
      [fr ? "Adultes" : "Adults", String(s.adults ?? "—")],
      [fr ? "Enfants" : "Children", String(s.children ?? 0)],
      [fr ? "Options" : "Options", options.length ? options.join(", ") : "—"],
      [fr ? "Moyen de paiement" : "Payment method", payment ? (fr ? payment.fr : payment.en) : "—"],
      [fr ? "Total estimé" : "Estimated total", totalLabel(r, locale)]
    );
    if (s.notes) rows.push([fr ? "Notes" : "Notes", String(s.notes)]);
  } else {
    const service = businessServices.find((b) => b.id === s.service);
    rows.push(
      [fr ? "Rubrique" : "Service", service ? (fr ? service.title.fr : service.title.en) : r.title],
      [fr ? "Date souhaitée" : "Preferred date", dateRange(r, locale)]
    );
    if (s.organization) rows.push([fr ? "Organisation" : "Organisation", String(s.organization)]);
    if (s.attendees) rows.push([fr ? "Participants" : "Participants", String(s.attendees)]);
    if (s.budget) rows.push([fr ? "Budget" : "Budget", String(s.budget)]);
    for (const d of Array.isArray(s.details) ? (s.details as { label: string; value: string }[]) : []) {
      if (d?.value) rows.push([d.label, d.value]);
    }
    if (s.message) rows.push([fr ? "Précisions complémentaires" : "Additional details", String(s.message)]);
  }

  rows.push(
    [fr ? "Nom" : "Name", r.full_name],
    ["E-mail", r.email],
    [fr ? "Téléphone" : "Phone", r.phone ?? "—"]
  );
  if (r.country) rows.push([fr ? "Pays" : "Country", r.country]);
  return rows;
}
