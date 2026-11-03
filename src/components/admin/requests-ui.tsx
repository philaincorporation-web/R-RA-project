import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Inbox, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { normalizeStatus, statusesFor, statusLabel, type RequestKind } from "@/lib/requests/status";
import { adminButton, adminInput, adminLabel } from "./styles";

const TONES: Record<string, string> = {
  pending: "bg-rera-gold-100 text-rera-gold-800",
  new: "bg-rera-gold-100 text-rera-gold-800",
  confirmed: "bg-rera-emerald-100 text-rera-emerald-700",
  paid: "bg-rera-emerald-100 text-rera-emerald-700",
  accepted: "bg-rera-emerald-100 text-rera-emerald-700",
  handled: "bg-rera-emerald-100 text-rera-emerald-700",
  in_progress: "bg-rera-lagoon-100 text-rera-lagoon-700",
  quote_sent: "bg-rera-lagoon-100 text-rera-lagoon-700",
  completed: "bg-rera-navy-100 text-rera-navy-700",
  archived: "bg-rera-navy-100 text-rera-navy-700",
  cancelled: "bg-red-100 text-red-700",
  refused: "bg-red-100 text-red-700",
};

export function AdminStatusBadge({ kind, status }: { kind: RequestKind; status: string }) {
  return (
    <span className={cn("inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", TONES[normalizeStatus(kind, status)] ?? TONES.completed)}>
      {statusLabel(kind, status)}
    </span>
  );
}

/** Filtres en GET : l'URL reste partageable et tout fonctionne sans JavaScript. */
export function RequestFiltersForm({
  action,
  kind,
  values,
  searchPlaceholder,
  dateLabel,
  offerTypes,
}: {
  action: string;
  kind: RequestKind;
  values: { q?: string; status?: string; type?: string; from?: string; to?: string };
  searchPlaceholder: string;
  /** Sans libellé, les filtres de date ne sont pas affichés. */
  dateLabel?: string;
  offerTypes?: { value: string; label: string }[];
}) {
  return (
    <form action={action} method="get" className="mb-6 grid grid-cols-1 gap-3 rounded-xl2 border border-rera-navy-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
      <div className="sm:col-span-2">
        <label htmlFor="filter-q" className={adminLabel}>Recherche</label>
        <input id="filter-q" name="q" type="search" defaultValue={values.q ?? ""} placeholder={searchPlaceholder} className={adminInput} />
      </div>
      <div>
        <label htmlFor="filter-status" className={adminLabel}>Statut</label>
        <select id="filter-status" name="status" defaultValue={values.status ?? ""} className={adminInput}>
          <option value="">Tous</option>
          {statusesFor(kind).map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      {offerTypes ? (
        <div>
          <label htmlFor="filter-type" className={adminLabel}>Type d&apos;offre</label>
          <select id="filter-type" name="type" defaultValue={values.type ?? ""} className={adminInput}>
            <option value="">Tous</option>
            {offerTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      ) : null}
      {dateLabel ? (
        <>
          <div>
            <label htmlFor="filter-from" className={adminLabel}>{dateLabel} : du</label>
            <input id="filter-from" name="from" type="date" defaultValue={values.from ?? ""} className={adminInput} />
          </div>
          <div>
            <label htmlFor="filter-to" className={adminLabel}>au</label>
            <input id="filter-to" name="to" type="date" defaultValue={values.to ?? ""} className={adminInput} />
          </div>
        </>
      ) : null}
      <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
        <button type="submit" className={adminButton("primary")}>
          <Search className="h-4 w-4" />
          Filtrer
        </button>
        <Link href={action} className={adminButton("ghost")}>Réinitialiser</Link>
      </div>
    </form>
  );
}

export function RequestList({ empty, children }: { empty: boolean; children: ReactNode }) {
  if (empty) {
    return (
      <div className="flex flex-col items-center rounded-xl2 border border-rera-navy-100 bg-white p-10 text-center text-sm text-rera-navy-500 shadow-sm">
        <Inbox className="h-8 w-8 text-rera-navy-300" />
        <p className="mt-3">Aucun résultat.</p>
      </div>
    );
  }
  return <ul className="divide-y divide-rera-navy-100 overflow-hidden rounded-xl2 border border-rera-navy-100 bg-white shadow-sm">{children}</ul>;
}

export function RequestRow({
  href,
  title,
  subtitle,
  meta,
  badge,
}: {
  href: string;
  title: string;
  subtitle: string;
  meta: string;
  badge: ReactNode;
}) {
  return (
    <li>
      <Link href={href} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-rera-mist sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-rera-navy-800">{title}</p>
            {badge}
          </div>
          <p className="mt-0.5 truncate text-sm text-rera-navy-600">{subtitle}</p>
          <p className="mt-0.5 truncate text-xs text-rera-navy-400">{meta}</p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-rera-navy-300 transition-transform group-hover:translate-x-1" />
      </Link>
    </li>
  );
}

export function RequestPagination({
  base,
  params,
  page,
  hasNext,
}: {
  base: string;
  params: Record<string, string | undefined>;
  page: number;
  hasNext: boolean;
}) {
  if (page <= 1 && !hasNext) return null;
  const href = (target: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
    search.set("page", String(target));
    return `${base}?${search.toString()}`;
  };
  return (
    <div className="mt-4 flex justify-between">
      {page > 1 ? <Link href={href(page - 1)} className={adminButton("secondary")}>← Plus récent</Link> : <span />}
      {hasNext ? <Link href={href(page + 1)} className={adminButton("secondary")}>Plus ancien →</Link> : null}
    </div>
  );
}

export function parsePage(value?: string) {
  return Math.max(1, Number.parseInt(value ?? "1", 10) || 1);
}
