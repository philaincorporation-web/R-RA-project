import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/primitives";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      <PageHero title={dict.footer.privacy} />
      <section className="bg-white py-16 dark:bg-rera-navy-800/40">
        <Container className="max-w-3xl">
          <p className="text-sm leading-relaxed text-rera-navy-600 dark:text-rera-mist/75">
            {locale === "fr"
              ? "RÈRA collecte uniquement les données nécessaires au traitement de vos réservations et demandes (nom, email, téléphone). Ces données sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers à des fins commerciales. Vous pouvez demander la suppression de vos données à tout moment en nous contactant."
              : "RÈRA only collects the data necessary to process your bookings and requests (name, email, phone). This data is stored securely and never shared with third parties for commercial purposes. You may request deletion of your data at any time by contacting us."}
          </p>
        </Container>
      </section>
    </>
  );
}
