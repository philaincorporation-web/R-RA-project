import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isValidLocale, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getActivityBySlug } from "@/lib/sheetdb/queries";
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
  const activity = await getActivityBySlug(slug);
  if (!activity) return {};
  return { title: pick(activity.name, safeLocale), description: pick(activity.description, safeLocale) };
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const activity = await getActivityBySlug(slug);
  if (!activity) notFound();

  return (
    <section>
      <div className="relative h-[50vh] min-h-[380px] w-full overflow-hidden">
        <Image src={activity.image} alt={pick(activity.name, locale)} sizes="100vw" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-rera-navy-900 via-rera-navy-900/40 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-rera-navy-900/70 to-transparent" />
        <Container className="absolute inset-x-0 bottom-8 text-white">
          <Reveal>
            <h1 className="font-heading text-3xl font-bold sm:text-5xl">{pick(activity.name, locale)}</h1>
          </Reveal>
        </Container>
      </div>

      <Container className="py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-base leading-relaxed text-rera-navy-600 dark:text-rera-mist/80">
              {pick(activity.description, locale)}
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-6 text-sm">
              <div>
                <dt className="text-rera-navy-400 dark:text-rera-mist/50">{dict.activities.duration}</dt>
                <dd className="mt-1 font-medium text-rera-navy-700 dark:text-rera-mist">
                  {pick(activity.duration, locale)}
                </dd>
              </div>
              <div>
                <dt className="text-rera-navy-400 dark:text-rera-mist/50">{dict.activities.availability}</dt>
                <dd className="mt-1 font-medium text-rera-navy-700 dark:text-rera-mist">
                  {pick(activity.availability, locale)}
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <div className="card-surface sticky top-28 rounded-xl2 p-6 shadow-premium">
              <p className="text-3xl font-bold text-rera-navy-800 dark:text-white">
                {formatPrice(activity.price, activity.currency, locale)}
              </p>
              <Button href={`/${locale}/booking?offer=${activity.slug}&type=activity`} className="mt-6 w-full">
                {dict.activities.bookCta}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
