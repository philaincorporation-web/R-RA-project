import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/primitives";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: AppLocale = isValidLocale(locale) ? locale : "fr";
  const dict = await getDictionary(safeLocale);
  return {
    title: dict.nav.discover ?? "Découvrir",
    description:
      locale === "fr"
        ? "Découvrez Pointe Denis, Gabon"
        : "Discover Pointe Denis, Gabon",
  };
}

export default async function DiscoverPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      <PageHero
        eyebrow={locale === "fr" ? "Pointe Denis" : "Pointe Denis"}
        title={dict.nav.discover ?? (locale === "fr" ? "Découvrir" : "Discover")}
        subtitle={
          locale === "fr"
            ? "Océan, nature et patrimoine au cœur du Gabon."
            : "Ocean, nature and heritage at the heart of Gabon."
        }
        backgroundImages={[
          "/images/bg-discover-1.jpg",
          "/images/bg-discover-2.jpg",
          "/images/bg-discover-3.jpg",
        ]}
      />

      <section className="bg-rera-mist py-20 dark:bg-rera-navy-900">
        <Container>
          <p className="max-w-2xl text-lg text-muted-foreground">
            {locale === "fr"
              ? "Pointe Denis est une destination unique face à Libreville. Explorez ses plages, sa forêt et son histoire."
              : "Pointe Denis is a unique destination facing Libreville. Explore its beaches, forest and history."}
          </p>
        </Container>
      </section>
    </>
  );
}