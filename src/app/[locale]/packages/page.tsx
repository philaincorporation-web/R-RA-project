import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getPackages } from "@/lib/sheetdb/queries";
import { Container } from "@/components/ui/primitives";
import { PageHero } from "@/components/layout/page-hero";
import { PackageCard } from "@/components/packages/package-card";
import { Reveal } from "@/components/ui/aceternity/reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: AppLocale = isValidLocale(locale) ? locale : "fr";
  const dict = await getDictionary(safeLocale);
  return {
    title: dict.pages.packages.title,
    description: dict.pages.packages.subtitle,
  };
}

export default async function PackagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const packages = await getPackages();

  return (
    <>
      <PageHero
        eyebrow={dict.packages.eyebrow}
        title={dict.pages.packages.title}
        subtitle={dict.pages.packages.subtitle}
        backgroundImages={[
          "/images/bg-packages-1.jpg",
          "/images/bg-packages-2.jpg",
          "/images/bg-packages-3.jpg",
        ]}
      />

      <section className="bg-rera-mist py-20 dark:bg-rera-navy-900">
        <Container>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg, i) => (
              <Reveal key={pkg.id} index={i % 3}>
                <PackageCard pkg={pkg} locale={locale} dict={dict} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}