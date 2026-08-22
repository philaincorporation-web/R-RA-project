import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getActivities } from "@/lib/sheetdb/queries";
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
    title: dict.pages?.activities?.title ?? dict.nav.activities,
    description: dict.pages?.activities?.subtitle ?? "",
  };
}

export default async function ActivitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const activities = await getActivities();

  return (
    <>
      <PageHero
        eyebrow={locale === "fr" ? "Expériences" : "Experiences"}
        title={dict.pages?.activities?.title ?? dict.nav.activities}
        subtitle={
          dict.pages?.activities?.subtitle ??
          (locale === "fr"
            ? "Vivez Pointe Denis sous toutes ses facettes."
            : "Experience Pointe Denis in every way.")
        }
        backgroundImages={[
          "/images/bg-activities-1.jpg",
          "/images/bg-activities-2.jpg",
          "/images/bg-activities-3.jpg",
        ]}
      />

      <section className="bg-rera-mist py-20 dark:bg-rera-navy-900">
      <Container>
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {activities.map((act) => {
      const title = act.name[locale];

      const description = act.description[locale];

      const duration = act.duration[locale];

      return (
        <article
          key={act.id}
          className="rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <h2 className="font-heading text-lg font-semibold">
            {title}
          </h2>

          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
            {description}
          </p>

          <p className="mt-3 text-sm font-medium">
            {act.price.toLocaleString(
              locale === "fr" ? "fr-FR" : "en-US"
            )}{" "}
            {act.currency} · {duration}
          </p>
        </article>
      );
    })}
  </div>
</Container>
      </section>
    </>
  );
}