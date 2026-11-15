import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { isValidLocale } from "@/lib/i18n/config";
import { getReservationByReference, hasTrackingAccess, statusExplanation } from "@/lib/tracking/server";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/account/client-helpers";
import { kindLabel } from "@/components/account/reservation-view";
import { ReservationSummaryCard } from "@/components/account/reservation-summary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function TrackedReservationPage({ params }: { params: Promise<{ locale: string; reference: string }> }) {
  const { locale, reference: raw } = await params;
  if (!isValidLocale(locale)) notFound();
  const reference = decodeURIComponent(raw);

  // Accès uniquement après vérification du code reçu par e-mail (cookie signé, 30 min).
  if (!(await hasTrackingAccess(reference))) redirect(`/${locale}/track?ref=${encodeURIComponent(reference)}`);
  const r = await getReservationByReference(reference);
  if (!r) notFound();

  const fr = locale === "fr";
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
              <Button href={`/${locale}/track`} variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4" />
                {fr ? "Suivre une autre demande" : "Track another request"}
              </Button>
              <PrintButton label={fr ? "Imprimer / PDF" : "Print / PDF"} />
            </div>
            <ReservationSummaryCard r={r} locale={locale} explanation={statusExplanation(r.status, locale)} />
          </div>
        </div>
      </section>
    </>
  );
}
