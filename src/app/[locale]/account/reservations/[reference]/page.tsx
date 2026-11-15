import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { isValidLocale } from "@/lib/i18n/config";
import { getCurrentUser } from "@/lib/auth/server";
import { getUserReservation } from "@/lib/db/reservations";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/account/client-helpers";
import { kindLabel } from "@/components/account/reservation-view";
import { ReservationSummaryCard } from "@/components/account/reservation-summary";

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

            <ReservationSummaryCard r={r} locale={locale} />
          </div>
        </div>
      </section>
    </>
  );
}
