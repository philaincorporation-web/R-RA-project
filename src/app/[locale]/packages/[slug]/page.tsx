import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, Clock } from "lucide-react";
import { isValidLocale, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getPackageBySlug, getPackages } from "@/lib/sheetdb/queries";
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
  const pkg = await getPackageBySlug(slug);
  if (!pkg) return {};
  return {
    title: pick(pkg.name, safeLocale),
    description: pick(pkg.description, safeLocale),
  };
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const pkg = await getPackageBySlug(slug);
  if (!pkg) notFound();

  const isCustom = pkg.durationDays === 0;

  return (
    <section className="pt-24">
      <div className="relative h-[45vh] min-h-[320px] w-full overflow-hidden">
        <Image src={pkg.image} alt={pick(pkg.name, locale)} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-rera-navy-900 via-rera-navy-900/40 to-transparent" />
        <Container className="absolute inset-x-0 bottom-8 text-white">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-rera-gold-400">
              {pick(pkg.tagline, locale)}
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold sm:text-5xl">{pick(pkg.name, locale)}</h1>
          </Reveal>
        </Container>
      </div>

      <Container className="py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-base leading-relaxed text-rera-navy-600 dark:text-rera-mist/80">
              {pick(pkg.description, locale)}
            </p>

            <div className="mt-8 flex items-center gap-2 text-sm text-rera-navy-500 dark:text-rera-mist/60">
              <Clock className="h-4 w-4 text-rera-lagoon-500" />
              {isCustom
                ? dict.packages.custom
                : `${pkg.durationDays} ${dict.packages.days} · ${pkg.nights} ${dict.packages.nights}`}
            </div>

            <h2 className="mt-10 text-xl font-semibold text-rera-navy-800 dark:text-white">
              {locale === "fr" ? "Ce qui est inclus" : "What's included"}
            </h2>
            <ul className="mt-4 space-y-3">
              {pkg.inclusions.map((inc) => (
                <li key={pick(inc, locale)} className="flex items-start gap-3 text-sm text-rera-navy-600 dark:text-rera-mist/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-rera-emerald-500" />
                  {pick(inc, locale)}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="card-surface sticky top-28 rounded-xl2 p-6 shadow-premium">
              <p className="text-xs uppercase tracking-wider text-rera-navy-400 dark:text-rera-mist/50">
                {isCustom ? "" : dict.packages.from}
              </p>
              <p className="text-3xl font-bold text-rera-navy-800 dark:text-white">
                {formatPrice(pkg.price, pkg.currency, locale)}
              </p>
              <Button href={`/${locale}/booking?offer=${pkg.slug}&type=package`} className="mt-6 w-full">
                {dict.packages.bookCta}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
