import type { Metadata } from "next";
import Link from "next/link";
import { History } from "lucide-react";
import { listAudit, requireAdmin, type AuditEntry } from "@/lib/admin/server";
import { permissionLabel } from "@/lib/admin/permissions";
import { statusLabel, type RequestKind } from "@/lib/requests/status";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { adminButton } from "@/components/admin/styles";

export const metadata: Metadata = { title: "Journal" };

const PAGE_SIZE = 50;
const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Libreville" });

const s = (v: unknown) => (typeof v === "string" ? v : "");
const list = (v: unknown) => (Array.isArray(v) ? v.map((p) => permissionLabel(String(p))) : []);

function describeRequest(e: AuditEntry, kind: RequestKind, noun: string) {
  const d = e.details;
  const parts = [
    d.from || d.to ? `statut : ${statusLabel(kind, s(d.from))} → ${statusLabel(kind, s(d.to))}` : "",
    d.notesChanged ? "notes internes modifiées" : "",
  ].filter(Boolean);
  return `a mis à jour ${noun} ${e.target_id ?? ""}${parts.length ? ` (${parts.join(" ; ")})` : ""}`;
}

/** Phrase lisible pour chaque type d'action enregistrée. */
function describe(e: AuditEntry): string {
  const d = e.details;
  switch (e.action) {
    case "member.add":
      return `a ajouté ${s(d.email)} à l'équipe (rôle « ${s(d.role)} »)`;
    case "member.role":
      return `a changé le rôle de ${s(d.email)} : « ${s(d.from)} » → « ${s(d.to)} »`;
    case "member.remove":
      return `a retiré ${s(d.email)} de l'équipe`;
    case "member.bootstrap":
      return `a été nommé super admin (commande d'installation)`;
    case "role.create":
      return `a créé le rôle « ${s(d.name)} »`;
    case "role.update": {
      const parts = [
        list(d.added).length ? `ajouté : ${list(d.added).join(", ")}` : "",
        list(d.removed).length ? `retiré : ${list(d.removed).join(", ")}` : "",
      ].filter(Boolean);
      return `a modifié le rôle « ${s(d.name)} »${parts.length ? ` (${parts.join(" ; ")})` : ""}`;
    }
    case "role.delete":
      return `a supprimé le rôle « ${s(d.name)} »`;
    case "reservation.update":
      return describeRequest(e, "booking", "la réservation");
    case "business.update":
      return describeRequest(e, "business", "la demande Business");
    case "message.update":
      return describeRequest(e, "message", "le message");
    default:
      return e.action;
  }
}

export default async function ActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  await requireAdmin(locale, "audit.view");
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  // Une ligne de plus pour savoir s'il existe une page suivante.
  const rows = await listAudit(PAGE_SIZE + 1, (page - 1) * PAGE_SIZE);
  const entries = rows.slice(0, PAGE_SIZE);
  const base = `/${locale}/admin/activity`;

  return (
    <>
      <AdminPageHeader title="Journal" description="Toutes les modifications faites dans le back-office, de la plus récente à la plus ancienne." />

      <AdminCard className="p-0 sm:p-0">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center p-10 text-center text-sm text-rera-navy-500">
            <History className="h-8 w-8 text-rera-navy-300" />
            <p className="mt-3">Aucune activité pour le moment.</p>
          </div>
        ) : (
          <ul className="divide-y divide-rera-navy-100">
            {entries.map((e) => (
              <li key={e.id} className="flex flex-col gap-1 px-5 py-3.5 text-sm sm:flex-row sm:items-baseline sm:gap-4 sm:px-6">
                <time dateTime={new Date(e.created_at).toISOString()} className="shrink-0 text-xs text-rera-navy-400 sm:w-40">
                  {dateFmt.format(new Date(e.created_at))}
                </time>
                <p className="text-rera-navy-700">
                  <span className="font-semibold text-rera-navy-800">{e.actor_email ?? "Système"}</span> {describe(e)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      {page > 1 || rows.length > PAGE_SIZE ? (
        <div className="mt-4 flex justify-between">
          {page > 1 ? <Link href={`${base}?page=${page - 1}`} className={adminButton("secondary")}>← Plus récent</Link> : <span />}
          {rows.length > PAGE_SIZE ? <Link href={`${base}?page=${page + 1}`} className={adminButton("secondary")}>Plus ancien →</Link> : null}
        </div>
      ) : null}
    </>
  );
}
