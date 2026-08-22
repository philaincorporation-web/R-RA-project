import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { isValidLocale, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getAccommodationBySlug } from "@/lib/sheetdb/queries";
import { formatPrice, pick } from "@/lib/utils/format";
import { Container } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/aceternity/reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const safeLocale: AppLocale = isValidLocale(locale) ? locale : "fr";
  const item = await getAccommodationBySlug(slug);
  if (!item) return {};
  return { title: pick(item.name, safeLocale), description: pick(item.description, safeLocale) };
}

export default async function AccommodationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const item = await getAccommodationBySlug(slug);
  if (!item) notFound();

  return (
    <section className="pt-24">
      <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        <Image src="/images/bg-packages.jpg" alt={pick(item.name, locale)} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-rera-navy-900 via-rera-navy-900/40 to-transparent" />
        <Container className="absolute inset-x-0 bottom-8 text-white">
          <Reveal>
            <h1 className="font-heading text-3xl font-bold sm:text-5xl">{pick(item.name, locale)}</h1>
          </Reveal>
        </Container>
      </div>

      <Container className="py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-base leading-relaxed text-rera-navy-600 dark:text-rera-mist/80">
              {pick(item.description, locale)}
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-rera-navy-500 dark:text-rera-mist/60">
              <Users className="h-4 w-4 text-rera-lagoon-500" />
              {dict.accommodation.capacity}: {item.capacity}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {item.amenities.map((a) => (
                <span
                  key={pick(a, locale)}
                  className="rounded-full bg-rera-lagoon-50 px-3 py-1 text-xs font-medium text-rera-lagoon-700 dark:bg-white/10 dark:text-rera-lagoon-200"
                >
                  {pick(a, locale)}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="card-surface sticky top-28 rounded-xl2 p-6 shadow-premium">
              <p className="text-3xl font-bold text-rera-navy-800 dark:text-white">
                {formatPrice(item.price, item.currency, locale)}
                <span className="ml-1 text-sm font-normal text-rera-navy-400 dark:text-rera-mist/50">
                  {dict.accommodation.perNight}
                </span>
              </p>
              <Button href={`/${locale}/booking?offer=${item.slug}&type=accommodation`} className="mt-6 w-full">
                {dict.accommodation.cta}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
