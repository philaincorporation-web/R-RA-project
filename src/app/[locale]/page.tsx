import type { Metadata } from "next";
import { isValidLocale, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  getAccommodations,
  getActivities,
  getPackages,
  getTestimonials,
} from "@/lib/sheetdb/queries";
import { notFound } from "next/navigation";
import { PageBackground } from "@/components/layout/PageBackground";

import { Hero } from "@/components/hero/hero";
import { WhyPointeDenis } from "@/components/sections/why-pointe-denis";
import { PopularPackages } from "@/components/sections/popular-packages";
import { ActivitiesPreview } from "@/components/sections/activities-preview";
import { AccommodationPreview } from "@/components/sections/accommodation-preview";
import { HistorySection } from "@/components/sections/history-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { BusinessSection } from "@/components/sections/business-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { MapAccessSection } from "@/components/sections/map-access-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: AppLocale = isValidLocale(locale) ? locale : "fr";
  const dict = await getDictionary(safeLocale);
  return {
    title: dict.meta.defaultTitle,
    description: dict.meta.defaultDescription,
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const [packages, activities, accommodations, testimonials] =
    await Promise.all([
      getPackages(),
      getActivities(),
      getAccommodations(),
      getTestimonials(),
    ]);

  return (
    <>
      <PageBackground src="/images/bg-home.jpg" />

      <Hero locale={locale} dict={dict} />
      <WhyPointeDenis locale={locale} dict={dict} />
      <PopularPackages packages={packages} locale={locale} dict={dict} />
      <ActivitiesPreview activities={activities} locale={locale} dict={dict} />
      <AccommodationPreview
        items={accommodations}
        locale={locale}
        dict={dict}
      />
      <HistorySection locale={locale} dict={dict} />
      <GallerySection dict={dict} locale={locale} />
      <BusinessSection locale={locale} dict={dict} />
      <TestimonialsSection
        testimonials={testimonials}
        locale={locale}
        dict={dict}
      />
      <MapAccessSection locale={locale} dict={dict} />
      <FinalCtaSection locale={locale} dict={dict} />
    </>
  );
}