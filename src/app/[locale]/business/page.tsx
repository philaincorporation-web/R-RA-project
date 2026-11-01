import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { PageHero } from "@/components/layout/page-hero";
import { BusinessServices } from "@/components/business/business-services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: AppLocale = isValidLocale(locale) ? locale : "fr";
  const dict = await getDictionary(safeLocale);
  return {
    title: "RÈRA Business",
    description:
      dict.business?.subtitle ??
      (locale === "fr"
        ? "Séminaires, forums et événements d'exception."
        : "Seminars, forums and exceptional events."),
  };
}

export default async function BusinessPage({
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
        eyebrow="RÈRA Business"
        title={dict.business?.title ?? "RÈRA Business"}
        subtitle={
          dict.business?.subtitle ??
          (locale === "fr"
            ? "Séminaires, forums et événements d'exception."
            : "Seminars, forums and exceptional events.")
        }
        backgroundImages={[
          "/images/bg-business-1.png",
          "/images/bg-business-2.png",
          "/images/bg-business-3.png",
        ]}
      />

      <BusinessServices locale={locale} dict={dict} />
    </>
  );
}