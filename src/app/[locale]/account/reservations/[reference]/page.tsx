import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { isValidLocale } from "@/lib/i18n/config";
import { getCurrentUser } from "@/lib/auth/server";
import { getUserReservation } from "@/lib/db/reservations";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/account/client-helpers";
import { kindLabel, StatusBadge, summaryRows } from "@/components/account/reservation-view";
import { formatDate } from "@/lib/utils/format";
import { siteConfig } from "@/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; reference: string }> }): Promise<Metadata> {
  const { locale, reference } = await params;
  return { title: `${locale === "en" ? "Booking" : "Réservation"} ${decodeURIComponent(reference)}`, robots: { index: false } };
}

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; reference: string }>;
}) {
  const { locale, reference } = await params;
  if (!isValidLocale(locale)) notFound();
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/account/sign-in`);

  // Seules les réservations appartenant à l'utilisateur connecté sont accessibles.
  const r = await getUserReservation(user.id, decodeURIComponent(reference));
  if (!r) notFound();

  const fr = locale === "fr";
  const rows = summaryRows(r, locale);

  return (
    <>
      <div className="print:hidden">
        <PageHero
          eyebrow={kindLabel(r, locale)}
          title={r.title}
          subtitle={fr ? `Référence ${r.reference}` : `Reference ${r.reference}`}
          backgroundImages={["/images/bg-home.jpg"]}
        />
      </div>

      <section className="bg-rera-mist py-16 dark:bg-rera-navy-900 print:bg-white print:py-0">
        <div className="container-rera">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <Button href={`/${locale}/account`} variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4" />
                {fr ? "Mon compte" : "My account"}
              </Button>
              <PrintButton label={fr ? "Imprimer / PDF" : "Print / PDF"} />
            </div>

            {/* Récapitulatif (aussi utilisé comme justificatif imprimable en cas de réclamation) */}
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
          </div>
        </div>
      </section>
    </>
  );
}
