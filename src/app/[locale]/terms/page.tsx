import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/primitives";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      <PageHero title={dict.footer.terms} />
      <section className="bg-white py-16 dark:bg-rera-navy-800/40">
        <Container className="max-w-3xl">
          <p className="text-sm leading-relaxed text-rera-navy-600 dark:text-rera-mist/75">
            {locale === "fr"
              ? "Les réservations effectuées sur RÈRA sont soumises à confirmation par notre équipe. Les conditions d'annulation, de remboursement et d'utilisation détaillées seront communiquées lors de la finalisation de votre réservation."
              : "Bookings made on RÈRA are subject to confirmation by our team. Detailed cancellation, refund and usage terms will be provided when finalizing your booking."}
          </p>
        </Container>
      </section>
    </>
  );
}
