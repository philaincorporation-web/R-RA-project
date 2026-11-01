import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isValidLocale, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getAccommodations, getActivities, getPackages } from "@/lib/sheetdb/queries";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/primitives";
import { BookingStepper } from "@/components/booking/booking-stepper";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: AppLocale = isValidLocale(locale) ? locale : "fr";
  const dict = await getDictionary(safeLocale);
  return { title: dict.pages.booking.title, description: dict.pages.booking.subtitle };
}

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ offer?: string; type?: string }>;
}) {
  const { locale } = await params;
  const { offer, type } = await searchParams;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const [packages, activities, accommodations] = await Promise.all([
    getPackages(),
    getActivities(),
    getAccommodations(),
  ]);

  return (
    <>
           <PageHero
        title={dict.pages.booking.title}
        subtitle={dict.pages.booking.subtitle}
        backgroundImages={["/reservation.jpg"]}
        overlayOpacity={0.5}
      />
        
      <section className="bg-white py-16 dark:bg-rera-navy-800/40">
        <Container>
          <BookingStepper
            locale={locale}
            dict={dict}
            packages={packages}
            activities={activities}
            accommodations={accommodations}
            initialSlug={offer}
            initialType={type}
          />
        </Container>
      </section>
    </>
  );
}
