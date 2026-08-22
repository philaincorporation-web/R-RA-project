import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getAccommodations } from "@/lib/sheetdb/queries";
import { Container } from "@/components/ui/primitives";
import { PageHero } from "@/components/layout/page-hero";
import { AccommodationCard } from "@/components/accommodation/accommodation-card";
import { Reveal } from "@/components/ui/aceternity/reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: AppLocale = isValidLocale(locale) ? locale : "fr";
  const dict = await getDictionary(safeLocale);
  return { title: dict.pages.accommodation.title, description: dict.pages.accommodation.subtitle };
}

export default async function AccommodationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const items = await getAccommodations();

  return (
    <>
      <PageHero
        eyebrow={dict.accommodation.eyebrow}
        title={dict.pages.accommodation.title}
        subtitle={dict.pages.accommodation.subtitle}
      />
      <section className="bg-white py-20 dark:bg-rera-navy-800/40">
        <Container>
          <div className="space-y-6">
            {items.map((item, i) => (
              <Reveal key={item.id} index={i}>
                <AccommodationCard item={item} locale={locale} dict={dict} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
