import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/aceternity/reveal";
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
    title: dict.pages.history.title,
    description: dict.pages.history.subtitle,
  };
}

export default async function HistoryPage({
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
        eyebrow={dict.history.eyebrow}
        title={dict.pages.history.title}
        subtitle={dict.pages.history.subtitle}
        backgroundImages={[
          "/images/bg-about-1.jpg",
          "/images/bg-about-2.jpg",
          "/images/bg-about-3.jpg",
        ]}
      />

      <section className="bg-white py-20 dark:bg-rera-navy-800/40">
        <Container className="max-w-3xl">
          <div className="space-y-10 border-l border-rera-navy-100 pl-6 dark:border-white/10">
            {dict.history.timeline.map((item, i) => (
              <Reveal key={item.title} index={i}>
                <div className="relative">
                  <span className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-rera-gold-gradient" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-rera-lagoon-600 dark:text-rera-lagoon-300">
                    {item.year}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-rera-navy-800 dark:text-white">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-rera-navy-500 dark:text-rera-mist/70">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <FinalCtaSection locale={locale} dict={dict} />
    </>
  );
}