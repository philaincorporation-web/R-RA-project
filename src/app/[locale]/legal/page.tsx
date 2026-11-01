import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/primitives";
import { LegalBento } from "@/components/legal/legal-bento";
import { legalContent } from "@/data/legal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: AppLocale = isValidLocale(locale) ? locale : "fr";
  const content = legalContent[safeLocale];
  return {
    title: content.title,
    description: content.subtitle,
  };
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const content = legalContent[locale];

  return (
    <>
           <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        subtitle={content.subtitle}
        backgroundImages={[legalContent.backgroundImage]}
        overlayOpacity={legalContent.overlayOpacity}
      />

      {/* Fond sombre type bento premium */}
      <section className="relative overflow-hidden bg-rera-navy-950 py-16 sm:py-20 dark:bg-rera-navy-950">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-rera-lagoon-400/10 blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full bg-rera-gold-400/5 blur-[80px]"
          aria-hidden
        />

        <Container className="relative">
          <LegalBento cards={content.cards} />

          <p className="mt-12 text-center text-xs text-rera-mist/40">
            {locale === "fr"
              ? "Dernière mise à jour : à compléter — les informations ci-dessus sont fournies à titre indicatif."
              : "Last updated: to be completed — the information above is provided for guidance."}
          </p>
        </Container>
      </section>
    </>
  );
}