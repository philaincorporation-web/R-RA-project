import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, type AppLocale } from "@/lib/i18n/config";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/primitives";
import { LegalBento } from "@/components/legal/legal-bento";
import { termsContent } from "@/data/terms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: AppLocale = isValidLocale(locale) ? locale : "fr";
  const content = termsContent[safeLocale];
  return {
    title: content.title,
    description: content.subtitle,
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const content = termsContent[locale];

  return (
    <>
      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        subtitle={content.subtitle}
        backgroundImages={[termsContent.backgroundImage]}
        overlayOpacity={termsContent.overlayOpacity}
      />

      {/* Fond sombre type bento premium — identique aux pages Mentions légales / Confidentialité */}
      <section className="relative overflow-hidden bg-rera-navy-950 py-16 sm:py-20 dark:bg-rera-navy-950">
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
        </Container>
      </section>
    </>
  );
}
