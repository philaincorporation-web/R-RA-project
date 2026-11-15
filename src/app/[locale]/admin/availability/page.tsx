import type { Metadata } from "next";
import { can, requireAdmin } from "@/lib/admin/server";
import { addDays, getUsage, isManaged, listInventory, todayLibreville } from "@/lib/availability/engine";
import { listUpcomingBlocks } from "@/lib/availability/admin";
import { listCatalogOffers, OFFER_TYPE_LABELS } from "@/lib/availability/catalog";
import { HOLD_HOURS, type OfferInventory } from "@/lib/availability/types";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { BlockForm, DeleteBlockButton, InventoryForm } from "@/components/admin/availability-forms";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Disponibilités" };

const DAYS = 14;
const dayFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", timeZone: "UTC" });
const longFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "UTC" });
const fmt = (iso: string) => longFmt.format(new Date(`${iso}T00:00:00Z`));

export default async function AvailabilityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const ctx = await requireAdmin(locale, "reservations.view");
  const canManage = can(ctx, "reservations.manage");

  const today = todayLibreville();
  const end = addDays(today, DAYS);
  const [offers, inventory, blocks] = await Promise.all([listCatalogOffers(), listInventory(), listUpcomingBlocks()]);
  const bySlug = new Map<string, OfferInventory>(inventory.map((i) => [i.offerSlug, i]));
  const names = new Map(offers.map((o) => [o.slug, o.name]));

  const managed = offers.filter((o) => isManaged(bySlug.get(o.slug) ?? null));
  const usages = await Promise.all(managed.map((o) => getUsage(o.slug, today, end)));
  const days = Array.from({ length: DAYS }, (_, i) => addDays(today, i));

  return (
    <>
      <AdminPageHeader
        title="Disponibilités"
        description={`Stock des offres, fermetures et occupation. Une offre sans stock renseigné reste « sur demande » : aucune disponibilité n'est annoncée aux clients. Une demande en attente bloque sa place pendant ${HOLD_HOURS} h si elle n'est pas traitée.`}
      />

      {/* Occupation des 14 prochains jours */}
      <AdminCard className="mb-6">
        <h2 className="mb-1 font-heading text-lg font-semibold text-rera-navy-800">Occupation des {DAYS} prochains jours</h2>
        <p className="mb-4 text-sm text-rera-navy-500">Unités libres / total, demandes en attente comprises. Hachuré : fermeture.</p>
        {managed.length === 0 ? (
          <p className="text-sm text-rera-navy-500">Aucune offre n&apos;a encore de stock renseigné. Commencez par les règles ci-dessous.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-1 text-xs">
              <thead>
                <tr>
                  <th className="w-40 text-left font-medium text-rera-navy-500">Offre</th>
                  {days.map((d) => (
                    <th key={d} className="font-medium capitalize text-rera-navy-500">{dayFmt.format(new Date(`${d}T00:00:00Z`))}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {managed.map((o, i) => {
                  const inv = bySlug.get(o.slug)!;
                  const total = inv.unitsTotal ?? 0;
                  return (
                    <tr key={o.slug}>
                      <td className="truncate pr-2 font-medium text-rera-navy-800" title={o.name}>{o.name}</td>
                      {usages[i].map((u) => {
                        const left = u.closed ? 0 : Math.max(0, total - u.firm - u.held - u.blocked);
                        const ratio = total > 0 ? left / total : 0;
                        return (
                          <td
                            key={u.date}
                            title={`${fmt(u.date)} — confirmées : ${u.firm}, en attente : ${u.held}, bloquées : ${u.blocked}${u.closed ? ", fermé" : ""}`}
                            className={cn(
                              "rounded-md py-2 text-center font-semibold",
                              u.closed
                                ? "bg-[repeating-linear-gradient(45deg,#fee2e2,#fee2e2_4px,#fff_4px,#fff_8px)] text-red-700"
                                : left === 0
                                ? "bg-red-100 text-red-700"
                                : ratio <= 0.34
                                ? "bg-rera-gold-100 text-rera-gold-800"
                                : "bg-rera-emerald-100 text-rera-emerald-700"
                            )}
                          >
                            {u.closed ? "—" : `${left}/${total}`}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Règles de stock par offre */}
        <div className="space-y-6 lg:col-span-2">
          {(["accommodation", "activity", "package"] as const).map((type) => {
            const list = offers.filter((o) => o.type === type);
            if (list.length === 0) return null;
            return (
              <AdminCard key={type}>
                <h2 className="mb-4 font-heading text-lg font-semibold text-rera-navy-800">{OFFER_TYPE_LABELS[type]}</h2>
                <div className="divide-y divide-rera-navy-100">
                  {list.map((o) => {
                    const inv = bySlug.get(o.slug);
                    return (
                      <div key={o.slug} className="py-5 first:pt-0 last:pb-0">
                        <p className="mb-3 font-semibold text-rera-navy-800">
                          {o.name} <span className="font-normal text-rera-navy-400">· {o.slug}</span>
                        </p>
                        <InventoryForm
                          locale={locale}
                          offer={o}
                          canManage={canManage}
                          initial={{
                            mode: inv?.mode ?? "on_request",
                            unitsTotal: inv?.unitsTotal ?? null,
                            guestsPerUnit: inv?.guestsPerUnit ?? null,
                            minNights: inv?.minNights ?? 1,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </AdminCard>
            );
          })}
        </div>

        {/* Fermetures */}
        <div className="space-y-6">
          {canManage ? (
            <AdminCard>
              <h2 className="mb-4 font-heading text-lg font-semibold text-rera-navy-800">Nouvelle fermeture</h2>
              <BlockForm
                locale={locale}
                today={today}
                offers={offers.map((o) => ({ slug: o.slug, name: o.name, group: OFFER_TYPE_LABELS[o.type] }))}
              />
            </AdminCard>
          ) : null}
          <AdminCard>
            <h2 className="mb-4 font-heading text-lg font-semibold text-rera-navy-800">Fermetures en cours et à venir</h2>
            {blocks.length === 0 ? (
              <p className="text-sm text-rera-navy-500">Aucune fermeture prévue.</p>
            ) : (
              <ul className="divide-y divide-rera-navy-100 text-sm">
                {blocks.map((b) => (
                  <li key={b.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-rera-navy-800">{names.get(b.offer_slug) ?? b.offer_slug}</p>
                      <p className="text-rera-navy-600">
                        {fmt(b.start_date)} → {fmt(addDays(b.end_date, -1))}
                      </p>
                      <p className="text-xs text-rera-navy-400">
                        {b.units === null ? "Fermeture totale" : `${b.units} unité(s) bloquée(s)`}
                        {b.reason ? ` · ${b.reason}` : ""}
                      </p>
                    </div>
                    {canManage ? <DeleteBlockButton locale={locale} id={b.id} /> : null}
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>
        </div>
      </div>
    </>
  );
}
